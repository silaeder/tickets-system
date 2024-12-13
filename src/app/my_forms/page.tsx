'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Form = {
  id: number;
  name: string;
  closed: boolean;
};

export default function MyForms() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingForm, setTogglingForm] = useState<number | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get_user_created_forms');
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      } else {
        console.error('Failed to fetch forms');
        toast.error('Не удалось загрузить формы');
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Ошибка при загрузке форм');
    } finally {
      setLoading(false);
    }
  };

  const toggleFormStatus = async (formId: number, currentStatus: boolean) => {
    setTogglingForm(formId);
    try {
      const response = await fetch(`/api/toggle_form_status/${formId}`);
      
      if (response.ok) {
        // Optimistically update the form status
        setForms(forms.map(form => 
          form.id === formId ? { ...form, closed: !currentStatus } : form
        ));
        toast.success(`Форма ${currentStatus ? 'открыта' : 'закрыта'}`);
      } else {
        toast.error('Не удалось изменить статус формы');
      }
    } catch (error) {
      console.error('Error toggling form status:', error);
      toast.error('Ошибка при изменении статуса формы');
    } finally {
      setTogglingForm(null);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center items-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-24 w-24 border-t-2 border-b-2 border-[#397698]"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200"
    >
      <Navbar />
      <ToastContainer position="bottom-right" />
      <main className="container mx-auto px-4 py-6">
        <AnimatePresence>
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">Мои формы</h1>
            {forms.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="text-center bg-white rounded-lg p-8 shadow-md"
              >
                <p className="text-xl text-gray-600 mb-4">У вас пока нет созданных форм.</p>
                <Link href="/form_constructor" className="inline-block bg-[#397698] text-white px-6 py-3 rounded-full hover:bg-[#2c5a75] transition-all duration-300 ease-in-out">
                  Создать новую форму
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold text-gray-800">{form.name}</h2>
                      <motion.button
                        whileHover={{ scale: togglingForm === form.id ? 1 : 1.05 }}
                        whileTap={{ scale: togglingForm === form.id ? 1 : 0.95 }}
                        onClick={() => toggleFormStatus(form.id, form.closed)}
                        disabled={togglingForm === form.id}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-color duration-200 ${
                          form.closed 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } ${togglingForm === form.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {togglingForm === form.id ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Обновление...
                          </span>
                        ) : (
                          form.closed ? 'Открыть форму' : 'Закрыть форму'
                        )}
                      </motion.button>
                    </div>
                    <div className="flex flex-col space-y-3">
                      <Link href={`/form_renderer/${form.id}`} className="text-[#397698] hover:text-[#2c5a75] font-medium transition-colors duration-300 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        Ссылка на прохождение
                      </Link>
                      <Link href={`/show_answers/${form.id}`} className="text-green-600 hover:text-green-700 font-medium transition-colors duration-300 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        Просмотреть ответы
                      </Link>
                      <Link href={`/edit_form/${form.id}`} className="text-orange-500 hover:text-orange-600 font-medium transition-colors duration-300 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-12 12a2 2 0 01-2.828 0 2 2 0 010-2.828l12-12z" />
                          <path d="M16.414 6.414l-7.586 7.586a1 1 0 11-1.414-1.414l7.586-7.586a1 1 0 011.414 1.414z" />
                        </svg>
                        Редактировать форму
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </main>
    </motion.div>
  );
}