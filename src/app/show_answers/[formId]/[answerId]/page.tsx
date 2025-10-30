'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/navbar';
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

export default function AnswerDetails() {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [replyTo, setReplyTo] = useState<{ answerId: number; indices: number[] } | null>(null);
  const [updatingAnswerId, setUpdatingAnswerId] = useState<number | null>(null);
  const [loadingButtonType, setLoadingButtonType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;
  const answerId = params.answerId as string;

  useEffect(() => {
    if (formId && answerId) {
      fetchAnswer();
    }
  }, [formId, answerId]);

  const fetchAnswer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/get_answer/${answerId}`);
      if (response.ok) {
        const data = await response.json();
        setAnswer(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch answer');
      }
    } catch (error) {
      console.error('Error fetching answer:', error);
      setError('An error occurred while fetching answer');
    } finally {
      setLoading(false);
    }
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
        fetchAnswer();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F9]">
        <Navbar />
        <div className="container mx-auto p-6 flex justify-center items-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#397698] border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (error || !answer) {
    return (
      <div className="min-h-screen bg-[#F5F7F9]">
        <Navbar />
        <div className="container mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
          >
            {error || 'Ответ не найден'}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-4 lg:p-6"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-[#2D384B]">
                {answer.user.surname} {answer.user.name} {answer.user.second_name}
              </h1>
              <p className="text-gray-600 mt-1">ID ответа: {answer.id}</p>
            </div>
          </div>
          
          <motion.span
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
            className={`${getStatusColor(answer.status)} px-4 py-2 rounded-full text-sm font-medium`}
          >
            {getStatusText(answer.status)}
          </motion.span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form Answers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-[#2D384B] mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-[#397698]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ответы на форму
            </h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {Object.entries(answer.answers).map(([fieldId, value]) => {
                const field = answer.form.form_description.find(f => f.id === fieldId);
                return (
                  <div key={fieldId} className="bg-[#F5F7F9] rounded-lg p-4">
                    <div className="inline-block bg-[#397698] text-white px-3 py-1 rounded-md text-sm mb-3">
                      {field?.label || fieldId}
                    </div>
                    <div className="text-[#4A5567] whitespace-pre-wrap font-sans bg-white rounded-md p-3 border">
                      {field?.type === 'checkbox' ? (value === 'true' ? 'Да' : 'Нет') : value.toString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column - Comments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-lg p-6 shadow-lg"
          >
            <h3 className="font-semibold text-xl mb-6 text-[#2D384B] flex items-center">
              <svg className="w-6 h-6 mr-2 text-[#397698]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Комментарии и статус
            </h3>
            
            {/* Status change notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800">Как изменить статус</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Напишите комментарий, затем нажмите кнопку статуса ниже.
                  </p>
                </div>
              </div>
            </div>

            {/* Comment input */}
            <div className="mb-6" data-color-mode="light">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Добавить комментарий {comment.trim() && <span className="text-green-600">(готов к отправке)</span>}
              </label>
              <MDEditor
                value={comment}
                onChange={(value) => setComment(value || '')}
                preview="edit"
                height={150}
                className="w-full"
              />
              
              {/* Status buttons */}
              <div className="mt-4">
                {!comment.trim() && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Сначала добавьте комментарий выше
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <motion.button
                    whileHover={{ scale: comment.trim() ? 1.02 : 1 }}
                    whileTap={{ scale: comment.trim() ? 0.98 : 1 }}
                    transition={{ duration: 0.1 }}
                    className={`px-4 py-3 rounded-lg transition-all duration-200 relative focus:outline-none text-sm font-medium ${
                      comment.trim() 
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => comment.trim() && updateStatus(answer.id, { approved: true, waiting: false, edits_required: false }, comment, 'approve')}
                    disabled={updatingAnswerId !== null || !comment.trim()}
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
                    whileHover={{ scale: comment.trim() ? 1.02 : 1 }}
                    whileTap={{ scale: comment.trim() ? 0.98 : 1 }}
                    transition={{ duration: 0.1 }}
                    className={`px-4 py-3 rounded-lg transition-all duration-200 relative focus:outline-none text-sm font-medium ${
                      comment.trim() 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => comment.trim() && updateStatus(answer.id, { approved: false, waiting: true, edits_required: false }, comment, 'waiting')}
                    disabled={updatingAnswerId !== null || !comment.trim()}
                  >
                    {updatingAnswerId === answer.id && loadingButtonType === 'waiting' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                      />
                    ) : (
                      'На проверке'
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: comment.trim() ? 1.02 : 1 }}
                    whileTap={{ scale: comment.trim() ? 0.98 : 1 }}
                    transition={{ duration: 0.1 }}
                    className={`px-4 py-3 rounded-lg transition-all duration-200 relative focus:outline-none text-sm font-medium ${
                      comment.trim() 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => comment.trim() && updateStatus(answer.id, { approved: false, waiting: false, edits_required: true }, comment, 'edits')}
                    disabled={updatingAnswerId !== null || !comment.trim()}
                  >
                    {updatingAnswerId === answer.id && loadingButtonType === 'edits' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                      />
                    ) : (
                      'Нужны правки'
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: comment.trim() ? 1.02 : 1 }}
                    whileTap={{ scale: comment.trim() ? 0.98 : 1 }}
                    transition={{ duration: 0.1 }}
                    className={`px-4 py-3 rounded-lg transition-all duration-200 relative focus:outline-none text-sm font-medium ${
                      comment.trim() 
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => comment.trim() && updateStatus(answer.id, { approved: false, waiting: false, edits_required: false }, comment, 'reject')}
                    disabled={updatingAnswerId !== null || !comment.trim()}
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
              </div>
            </div>

            {/* Existing comments */}
            <div className="border-t pt-6">
              <h4 className="font-medium text-lg mb-4 text-[#2D384B]">История комментариев</h4>
              <div className="max-h-[40vh] overflow-y-auto pr-2">
                <AnimatePresence>
                  {renderComments(answer.status.comments, answer.id)}
                </AnimatePresence>

                {(!answer.status.comments || answer.status.comments.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>Комментариев пока нет</p>
                    <p className="text-sm mt-1">Добавьте первый комментарий выше</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}