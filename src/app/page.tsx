'use client';

import { useEffect, useState } from 'react';
import Navbar from './components/navbar';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type Form = {
  id: number;
  name: string;
};

type Comment = {
  sender: string;
  text: string;
  timestamp: string;
  replies: Comment[];
};

type CompletedForm = {
  id: number;
  formId: number;
  form: { name: string };
  status: {
    approved: boolean;
    waiting: boolean;
    edits_required: boolean;
    comments: Comment[];
  };
};

export default function Home() {
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [completedForms, setCompletedForms] = useState<CompletedForm[]>([]);
  const [selectedFormComments, setSelectedFormComments] = useState<Comment[] | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [replyTo, setReplyTo] = useState<number[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/get_user_forms');
      if (response.ok) {
        const data = await response.json();
        setAvailableForms(data.availableForms);
        setCompletedForms(data.completedForms);
        setLoading(false);
        return data.completedForms;
      } else {
        console.error('Failed to fetch forms');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      setLoading(false);
    }
  };

  const getStatusText = (status: CompletedForm['status']) => {
    if (status.approved) return 'Одобрено';
    if (status.waiting) return 'Ожидает проверки';
    if (status.edits_required) return 'Требуются правки';
    return 'Отказано';
  };

  const getStatusColor = (status: CompletedForm['status']) => {
    if (status.approved) return 'bg-green-200 text-green-800';
    if (status.waiting) return 'bg-yellow-200 text-yellow-800';
    if (status.edits_required) return 'bg-orange-200 text-orange-800';
    return 'bg-red-200 text-red-800';
  };

  const handleReply = async () => {
    if (!selectedFormId || !replyTo || !replyText.trim()) return;

    try {
      const response = await fetch(`/api/reply_comment/${selectedFormId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyTo: { indices: replyTo }, replyText }),
      });

      if (response.ok) {
        const completedForms2: CompletedForm[] = await fetchForms();
        const updatedForm = completedForms2.find(form => form.id === selectedFormId);
        if (updatedForm) {
          setSelectedFormComments(updatedForm.status.comments);
        }
        setReplyText('');
        setReplyTo(null);
      } else {
        console.error('Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const renderComments = (comments: Comment[], indices: number[] = []) => {
    return comments.map((comment, index) => {
      const currentIndices = [...indices, index];
      const isReplying = JSON.stringify(currentIndices) === JSON.stringify(replyTo);
      
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className={`mb-4 p-4 rounded-lg transition-all duration-300 ease-in-out ${isReplying ? 'bg-[#397698] bg-opacity-10 border-l-4 border-[#397698]' : 'bg-white shadow-lg hover:shadow-xl border border-gray-200'}`}
        >
          <p className="font-semibold text-gray-800">{comment.sender}</p>
          <pre className="mt-2 text-gray-700 whitespace-pre-wrap font-sans">{comment.text}</pre>
          <div className="flex items-center mt-3">
            <p className="text-sm text-gray-500">{new Date(comment.timestamp).toLocaleString()}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`ml-4 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${isReplying ? 'bg-[#397698] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setReplyTo(currentIndices)}
            >
              {isReplying ? 'Отвечаете' : 'Ответить'}
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
              {renderComments(comment.replies, currentIndices)}
            </motion.div>
          )}
        </motion.div>
      );
    });
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

      <main className="container mx-auto px-4 py-6">
        <AnimatePresence>
          {availableForms.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="mb-16"
            >
              <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">Доступные заявки</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {availableForms.map((form) => (
                  <div
                    key={form.id}
                    className="bg-white rounded-lg p-6 shadow-lg transition-all duration-200 ease-in-out"
                  >
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">{form.name}</h2>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full flex"
                    >
                      <Link href={`/form_renderer/${form.id}`} className="inline-block bg-[#397698] text-white px-6 py-3 rounded-full hover:bg-[#2c5a75] transition-all duration-200 ease-in-out text-center w-full">
                        Заполнить форму
                      </Link>
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {completedForms.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">Отправленные заявки</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {completedForms.map((form) => (
                  <div
                    key={form.id}
                    className="bg-white rounded-lg p-6 shadow-lg transition-all duration-200 ease-in-out"
                  >
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">{form.form.name}</h2>
                    <div className={`${getStatusColor(form.status)} px-4 py-2 rounded-full inline-block text-sm font-medium mb-4 transition-all duration-200 ease-in-out`}>
                      {getStatusText(form.status)}
                    </div>
                    <div className="flex flex-col space-y-3">
                      {form.status.comments && form.status.comments.length > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-full transition-colors duration-200 ease-in-out"
                          onClick={() => {
                            setSelectedFormComments(form.status.comments);
                            setSelectedFormId(form.id);
                          }}
                        >
                          Комментарии ({form.status.comments.length})
                        </motion.button>
                      )}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full flex"
                      >
                        <Link 
                          href={`/edit_answer/${form.id}`}
                          className="w-full bg-[#397698] hover:bg-[#2c5a75] text-white font-medium py-2 px-4 rounded-full text-center transition-colors duration-200 ease-in-out"
                        >
                          Редактировать ответы
                        </Link>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full flex"
                      >
                        <Link 
                          href={`/form_renderer/${form.formId}`}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-full text-center transition-all duration-200 ease-in-out"
                        >
                          Отправить еще одну заявку
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedFormComments && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between rounded-t-lg items-center">
                  <h3 className="text-2xl font-semibold text-gray-800">Комментарии</h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200 ease-in-out"
                    onClick={() => {
                      setSelectedFormComments(null);
                      setSelectedFormId(null);
                      setReplyTo(null);
                      setReplyText('');
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow">
                  <AnimatePresence initial={false}>
                    {renderComments(selectedFormComments)}
                  </AnimatePresence>
                </div>
                
                {replyTo && (
                  <div className="sticky bg-white w-full bottom-0 p-6 border-t rounded-b-lg shadow-lg">
                    <div className="flex flex-col">
                      <textarea
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397698] transition-all duration-200 ease-in-out min-h-[100px] resize-none mb-3"
                        placeholder="Напишите ответ..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex space-x-3">
                        <button
                          className="flex-1 bg-[#397698] hover:bg-[#2c5a75] text-white px-6 py-3 rounded-full transition-all duration-200 ease-in-out"
                          onClick={handleReply}
                        >
                          Отправить
                        </button>
                        <button
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-full transition-all duration-200 ease-in-out"
                          onClick={() => {
                            setReplyTo(null);
                            setReplyText('');
                          }}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}