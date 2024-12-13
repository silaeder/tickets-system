'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../components/navbar';
import { motion, AnimatePresence } from 'framer-motion';
import MDEditor from '@uiw/react-md-editor';

type Answer = {
  id: number;
  user: {
    name: string;
    surname: string;
    second_name: string;
  };
  answers: Record<string, any>;
  form: {
    form_description: {
      id: string;
      label: string;
      type: string;
      required: boolean;
      options?: string[];
    }[];
  };
  status: {
    approved: boolean;
    waiting: boolean;
    edits_required: boolean;
    comments: Comment[] | null;
  };
};

type Comment = {
  sender: string;
  text: string;
  timestamp: string;
  replies: Comment[] | null;
};

type Filters = {
  status: string;
  fieldId: string;
  fieldValue: string;
};

export default function ShowAnswers() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [replyTo, setReplyTo] = useState<{ answerId: number; indices: number[] } | null>(null);
  const [updatingAnswerId, setUpdatingAnswerId] = useState<number | null>(null);
  const [loadingButtonType, setLoadingButtonType] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    fieldId: '',
    fieldValue: '',
  });
  const [availableFields, setAvailableFields] = useState<Array<{id: string, label: string}>>([]);
  const params = useParams();
  const formId = params.formId as string;

  useEffect(() => {
    if (formId) {
      fetchAnswers();
    }
  }, [formId]);

  useEffect(() => {
    if (answers.length > 0) {
      const fields = answers[0].form.form_description;
      setAvailableFields(fields.map(f => ({ id: f.id, label: f.label })));
    }
  }, [answers]);

  const fetchAnswers = async () => {
    try {
      const response = await fetch(`/api/get_form_answers/${formId}`);
      if (response.ok) {
        const data = await response.json();
        setAnswers(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch answers');
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
      setError('An error occurred while fetching answers');
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/export_answers/${formId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `form_answers_${formId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to export answers');
      }
    } catch (error) {
      console.error('Error exporting answers:', error);
      setError('An error occurred while exporting answers');
    } finally {
      setIsExporting(false);
    }
  };

  const filterAnswers = (answers: Answer[]) => {
    return answers.filter(answer => {
      if (filters.status) {
        if (filters.status === 'approved' && !answer.status.approved) return false;
        if (filters.status === 'waiting' && !answer.status.waiting) return false;
        if (filters.status === 'edits_required' && !answer.status.edits_required) return false;
        if (filters.status === 'rejected' && (answer.status.approved || answer.status.waiting || answer.status.edits_required)) return false;
      }

      if (filters.fieldId && filters.fieldValue) {
        const fieldValue = answer.answers[filters.fieldId]?.toString().toLowerCase();
        if (!fieldValue || !fieldValue.includes(filters.fieldValue.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  };

  const updateStatus = async (answerId: number, newStatus: Partial<Answer['status']>, newComment: string, buttonType: string) => {
    setUpdatingAnswerId(answerId);
    setLoadingButtonType(buttonType);
    try {
      const response = await fetch(`/api/get_form_answers/${formId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answerId,
          status: newStatus,
          comment: newComment,
          replyTo: replyTo,
        }),
      });

      if (response.ok) {
        fetchAnswers();
        setComment('');
        setReplyTo(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('An error occurred while updating status');
    } finally {
      setUpdatingAnswerId(null);
      setLoadingButtonType(null);
    }
  };

  const getStatusText = (status: Answer['status']) => {
    if (status.approved) return 'Одобрено';
    if (status.waiting) return 'Ожидает проверки';
    if (status.edits_required) return 'Требуются правки';
    return 'Отказано';
  };

  const getStatusColor = (status: Answer['status']) => {
    if (status.approved) return 'bg-green-200 text-green-800';
    if (status.waiting) return 'bg-yellow-200 text-yellow-800';
    if (status.edits_required) return 'bg-orange-200 text-orange-800';
    return 'bg-red-200 text-red-800';
  };

  const renderComments = (comments: Comment[] | null, answerId: number, indices: number[] = []) => {
    if (!comments) return null;
    return comments.map((comment, index) => {
      const currentIndices = [...indices, index];
      const isReplying = JSON.stringify(currentIndices) === JSON.stringify(replyTo?.indices) && answerId === replyTo?.answerId;
      
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className={`mb-4 p-4 rounded-lg transition-all duration-300 ease-in-out ${isReplying ? 'bg-[#397698]/20 border-l-4 border-[#397698]' : 'bg-white shadow-lg hover:shadow-xl border border-gray-200'}`}
        >
          <p className="font-semibold text-gray-800">{comment.sender}</p>
          <div className="mt-2 text-gray-700 whitespace-pre-wrap" data-color-mode="light">
            <MDEditor.Markdown source={comment.text} style={{ backgroundColor: 'transparent' }} />
          </div>
          <div className="flex items-center mt-3">
            <p className="text-sm text-gray-500">{new Date(comment.timestamp).toLocaleString()}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`ml-4 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none ${isReplying ? 'bg-[#397698] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setReplyTo(isReplying ? null : { answerId, indices: currentIndices })}
              disabled={updatingAnswerId !== null}
            >
              {isReplying ? 'Отменить ответ' : 'Ответить'}
            </motion.button>
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="ml-6 mt-4 border-l-2 border-gray-300 pl-4"
            >
              {renderComments(comment.replies, answerId, currentIndices)}
            </motion.div>
          )}
        </motion.div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#2D384B]">Ответы на форму</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#397698] text-white px-6 py-3 rounded-lg shadow-lg hover:bg-[#2c5a73] transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
            onClick={exportToExcel}
            disabled={isExporting || answers.length === 0}
          >
            {isExporting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Экспорт в Excel</span>
              </>
            )}
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 bg-white p-6 rounded-lg shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#397698] focus:border-transparent"
              >
                <option value="">Все статусы</option>
                <option value="approved">Одобрено</option>
                <option value="waiting">Ожидает проверки</option>
                <option value="edits_required">Требуются правки</option>
                <option value="rejected">Отказано</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Поле для фильтрации
              </label>
              <select
                value={filters.fieldId}
                onChange={(e) => setFilters({ ...filters, fieldId: e.target.value, fieldValue: '' })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#397698] focus:border-transparent"
              >
                <option value="">Выберите поле</option>
                {availableFields.map(field => (
                  <option key={field.id} value={field.id}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Значение поля
              </label>
              {filters.fieldId && answers[0]?.form.form_description.find(f => f.id === filters.fieldId)?.type === 'checkbox' ? (
                <select
                  value={filters.fieldValue}
                  onChange={(e) => setFilters({ ...filters, fieldValue: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#397698] focus:border-transparent"
                >
                  <option value="">Все значения</option>
                  <option value="true">Да</option>
                  <option value="false">Нет</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={filters.fieldValue}
                  onChange={(e) => setFilters({ ...filters, fieldValue: e.target.value })}
                  placeholder="Введите значение для поиска"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#397698] focus:border-transparent"
                />
              )}
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-red-500 mb-6 p-4 bg-red-100 rounded-lg shadow"
          >
            {error}
          </motion.p>
        )}
        <AnimatePresence>
          {filterAnswers(answers).map((answer) => (
            <motion.div
              key={answer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg p-6 shadow-lg mb-8 hover:shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-[#2D384B]">
                  {answer.user.surname} {answer.user.name} {answer.user.second_name}
                </h2>
                <motion.span
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.1 }}
                  className={`${getStatusColor(answer.status)} px-4 py-2 rounded-full text-sm font-medium`}
                >
                  {getStatusText(answer.status)}
                </motion.span>
              </div>
              <div className="mb-4" data-color-mode="light">
                <MDEditor
                  value={comment}
                  onChange={(value) => setComment(value || '')}
                  preview="edit"
                  height={200}
                  className="w-full"
                />
              </div>
              <div className="mb-6 flex flex-wrap gap-5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex-grow relative focus:outline-none"
                  onClick={() => updateStatus(answer.id, { approved: true, waiting: false, edits_required: false }, comment, 'approve')}
                  disabled={updatingAnswerId !== null}
                >
                  {updatingAnswerId === answer.id && loadingButtonType === 'approve' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                    />
                  ) : (
                    'Одобрить'
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex-grow relative focus:outline-none"
                  onClick={() => updateStatus(answer.id, { approved: false, waiting: true, edits_required: false }, comment, 'waiting')}
                  disabled={updatingAnswerId !== null}
                >
                  {updatingAnswerId === answer.id && loadingButtonType === 'waiting' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                    />
                  ) : (
                    'Ожидает проверки'
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex-grow relative focus:outline-none"
                  onClick={() => updateStatus(answer.id, { approved: false, waiting: false, edits_required: true }, comment, 'edits')}
                  disabled={updatingAnswerId !== null}
                >
                  {updatingAnswerId === answer.id && loadingButtonType === 'edits' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                    />
                  ) : (
                    'Требуются правки'
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex-grow relative focus:outline-none"
                  onClick={() => updateStatus(answer.id, { approved: false, waiting: false, edits_required: false }, comment, 'reject')}
                  disabled={updatingAnswerId !== null}
                >
                  {updatingAnswerId === answer.id && loadingButtonType === 'reject' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                    />
                  ) : (
                    'Отказать'
                  )}
                </motion.button>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-[#F5F7F9] p-4 rounded-lg shadow-inner"
              >
                {Object.entries(answer.answers).map(([fieldId, value]) => {
                  const field = answer.form.form_description.find(f => f.id === fieldId);
                  return (
                    <div key={fieldId} className="mb-4 bg-white rounded-lg p-3 shadow-sm">
                      <div className="inline-block bg-[#397698] text-white px-3 py-1 rounded-md text-sm mb-2">
                        {field?.label || fieldId}
                      </div>
                      <pre className="text-[#4A5567] whitespace-pre-wrap font-sans">
                        {field?.type === 'checkbox' ? (value === 'true' ? 'Да' : 'Нет') : value.toString()}
                      </pre>
                    </div>
                  );
                })}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="mt-6"
              >
                <h3 className="font-semibold text-xl mb-3 text-[#2D384B]">Комментарии:</h3>
                <AnimatePresence>
                  {renderComments(answer.status.comments, answer.id)}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}