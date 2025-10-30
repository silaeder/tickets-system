'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../components/navbar';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    fieldId: '',
    fieldValue: '',
  });
  const [availableFields, setAvailableFields] = useState<Array<{ id: string, label: string }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const itemsPerPage = 12;
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  useEffect(() => {
    if (formId) {
      fetchAnswers();
    }
  }, [formId]);

  useEffect(() => {
    if (answers.length > 0) {
      // Add user fields first, then form fields
      const userFields = [
        { id: 'user.name', label: 'Имя' },
        { id: 'user.surname', label: 'Фамилия' },
        { id: 'user.second_name', label: 'Отчество' },
      ];

      const formFields = answers[0].form.form_description.map(f => ({ id: f.id, label: f.label }));

      setAvailableFields([...userFields, ...formFields]);
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
      // Status filter
      if (filters.status) {
        if (filters.status === 'approved' && !answer.status.approved) return false;
        if (filters.status === 'waiting' && !answer.status.waiting) return false;
        if (filters.status === 'edits_required' && !answer.status.edits_required) return false;
        if (filters.status === 'rejected' && (answer.status.approved || answer.status.waiting || answer.status.edits_required)) return false;
      }

      // Field filter (user fields + form fields)
      if (filters.fieldId && filters.fieldValue) {
        let fieldValue = '';

        // Handle user fields
        if (filters.fieldId === 'user.name') {
          fieldValue = answer.user.name.toLowerCase();
        } else if (filters.fieldId === 'user.surname') {
          fieldValue = answer.user.surname.toLowerCase();
        } else if (filters.fieldId === 'user.second_name') {
          fieldValue = answer.user.second_name.toLowerCase();
        } else {
          // Handle form fields
          fieldValue = answer.answers[filters.fieldId]?.toString().toLowerCase() || '';
        }

        if (!fieldValue.includes(filters.fieldValue.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredAnswers = filterAnswers(answers);
  const totalPages = Math.ceil(filteredAnswers.length / itemsPerPage);
  const paginatedAnswers = filteredAnswers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      fieldId: '',
      fieldValue: '',
    });
    setCurrentPage(1);
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



  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#2D384B] mb-2">Ответы на форму</h1>
              <p className="text-gray-600">
                Показано {paginatedAnswers.length} из {filteredAnswers.length} ответов
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Фильтры</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#397698] text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg shadow-lg hover:bg-[#2c5a73] transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
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
                    <span className="hidden sm:inline">Экспорт в Excel</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`${sidebarOpen ? 'block' : 'hidden'
              } lg:block w-full lg:w-80 flex-shrink-0`}
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#2D384B]">Фильтры</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#397698] focus:border-transparent transition-colors"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#397698] focus:border-transparent transition-colors"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#397698] focus:border-transparent transition-colors"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#397698] focus:border-transparent transition-colors"
                      disabled={!filters.fieldId}
                    />
                  )}
                </div>

                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium"
                >
                  Очистить фильтры
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
              >
                {error}
              </motion.div>
            )}

            {/* Cards Grid */}
            <AnimatePresence mode="wait">
              {filteredAnswers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="bg-white rounded-lg shadow-lg p-12">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Ответы не найдены</h3>
                    <p className="text-gray-500">Попробуйте изменить фильтры поиска</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-3 gap-6 mb-8"
                >
                  {paginatedAnswers.map((answer, index) => (
                    <motion.div
                      key={answer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="relative bg-white rounded-lg p-6 shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105 transition-shadow duration-200 border border-gray-100"
                      onClick={() => router.push(`/show_answers/${formId}/${answer.id}`)}
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-[#2D384B] mb-3 line-clamp-2">
                          {answer.user.surname} {answer.user.name} {answer.user.second_name}
                        </h3>
                        <motion.span
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.1 }}
                          className={`${getStatusColor(answer.status)} px-3 py-1 rounded-full text-xs font-medium inline-block`}
                        >
                          {getStatusText(answer.status)}
                        </motion.span>
                      </div>

                      {/* Comments badge overlapping bottom right */}
                      {answer.status.comments && answer.status.comments.length > 0 && (
                        <div className="absolute bottom-2 right-2 flex items-center bg-blue-50 text-blue-700 border-blue-300 px-2 py-1 rounded-full">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-xs font-medium">{answer.status.comments.length}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center space-x-2 mt-8"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${currentPage === page
                          ? 'bg-[#397698] text-white shadow-lg'
                          : 'bg-white shadow-md hover:shadow-lg hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return (
                      <span key={page} className="px-2 py-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}