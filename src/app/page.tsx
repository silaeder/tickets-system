'use client';

import { useEffect, useState } from 'react';
import Navbar from './components/navbar';
import Link from 'next/link';

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
        return data.completedForms;
      } else {
        console.error('Failed to fetch forms');
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  };

  const getStatusText = (status: CompletedForm['status']) => {
    if (status.approved) return 'Одобрено';
    if (status.waiting) return 'Ожидает проверки';
    if (status.edits_required) return 'Требуются правки';
    return 'Отказано';
  };

  const getStatusColor = (status: CompletedForm['status']) => {
    if (status.approved) return 'bg-green-200';
    if (status.waiting) return 'bg-yellow-200';
    if (status.edits_required) return 'bg-orange-200';
    return 'bg-red-200';
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
        <div key={index} className={`mb-4 p-3 rounded-lg ${isReplying ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
          <p className="font-semibold text-gray-800">{comment.sender}</p>
          <p className="mt-1 text-gray-700">{comment.text}</p>
          <div className="flex items-center mt-2">
            <p className="text-sm text-gray-500">{new Date(comment.timestamp).toLocaleString()}</p>
            <button
              className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
              onClick={() => setReplyTo(currentIndices)}
            >
              {isReplying ? 'Отвечаете' : 'Ответить'}
            </button>
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-4 mt-3 border-l-2 border-gray-200 pl-3">
              {renderComments(comment.replies, currentIndices)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Доступные формы</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableForms.map((form) => (
              <div key={form.id} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">{form.name}</h2>
                <Link href={`/form_renderer/${form.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                  Заполнить форму
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Отправленные формы</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedForms.map((form) => (
              <div key={form.id} className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">{form.form.name}</h2>
                <div className={`${getStatusColor(form.status)} px-3 py-1 rounded-full inline-block text-sm font-medium mr-3`}>
                  {getStatusText(form.status)}
                </div>
                {form.status.comments && form.status.comments.length > 0 && (
                  <button
                    className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => {
                      setSelectedFormComments(form.status.comments);
                      setSelectedFormId(form.id);
                    }}
                  >
                    Комментарии
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {selectedFormComments && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] flex flex-col shadow-xl">
              <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between rounded-t-lg items-center">
                <h3 className="text-xl font-semibold text-gray-800">Комментарии</h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
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
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto flex-grow">
                {renderComments(selectedFormComments)}
              </div>
              
              {replyTo && (
                <div className="sticky bottom-0 bg-white p-4 border-t rounded-b-lg">
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder="Напишите ответ..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r transition-colors duration-300"
                      onClick={handleReply}
                    >
                      Отправить
                    </button>
                    <button
                      className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition-colors duration-300"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyText('');
                      }}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}