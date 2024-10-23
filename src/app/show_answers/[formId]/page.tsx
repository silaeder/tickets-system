'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../components/navbar';

type Answer = {
  id: number;
  user: {
    name: string;
    surname: string;
  };
  answers: Record<string, any>;
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

export default function ShowAnswers() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [replyTo, setReplyTo] = useState<{ answerId: number; indices: number[] } | null>(null);
  const params = useParams();
  const formId = params.formId as string;

  useEffect(() => {
    if (formId) {
      fetchAnswers();
    }
  }, [formId]);

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

  const updateStatus = async (answerId: number, newStatus: Partial<Answer['status']>, newComment: string) => {
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
    }
  };

  const getStatusText = (status: Answer['status']) => {
    if (status.approved) return 'Одобрено';
    if (status.waiting) return 'Ожидает проверки';
    if (status.edits_required) return 'Требуются правки';
    return 'Отказано';
  };

  const getStatusColor = (status: Answer['status']) => {
    if (status.approved) return 'bg-green-200';
    if (status.waiting) return 'bg-yellow-200';
    if (status.edits_required) return 'bg-orange-200';
    return 'bg-red-200';
  };

  const renderComments = (comments: Comment[] | null, answerId: number, indices: number[] = []) => {
    if (!comments) return null;
    return comments.map((comment, index) => (
      <div key={index} className={`ml-4 mt-2 p-2 rounded-lg ${replyTo && replyTo.answerId === answerId && JSON.stringify(replyTo.indices) === JSON.stringify([...indices, index]) ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
        <p><strong className="text-blue-600">{comment.sender}:</strong> {comment.text}</p>
        <p className="text-xs text-gray-500 mt-1">{new Date(comment.timestamp).toLocaleString()}</p>
        <button
          className="text-blue-500 hover:text-blue-700 text-sm mr-2 mt-1 transition-colors duration-200"
          onClick={() => setReplyTo({ answerId, indices: [...indices, index] })}
        >
          Ответить
        </button>
        {replyTo && replyTo.answerId === answerId && JSON.stringify(replyTo.indices) === JSON.stringify([...indices, index]) && (
          <button
            className="text-red-500 hover:text-red-700 text-sm transition-colors duration-200"
            onClick={() => setReplyTo(null)}
          >
            Отменить ответ
          </button>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-4 mt-2">
            {renderComments(comment.replies, answerId, [...indices, index])}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Ответы на форму</h1>
        {error && <p className="text-red-500 mb-4 p-3 bg-red-100 rounded">{error}</p>}
        {answers.map((answer) => (
          <div key={answer.id} className="bg-white rounded-lg p-6 shadow-lg mb-6 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">
              {answer.user.name} {answer.user.surname}
            </h2>
            <div className={`${getStatusColor(answer.status)} px-3 py-1 rounded-full inline-block mb-3 text-sm font-medium`}>
              {getStatusText(answer.status)}
            </div>
            <div className="mb-2">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder={replyTo ? "Отвечаете на комментарий..." : "Оставить комментарий..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
            <div className="mb-4 space-x-2">
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all duration-200 ease-in-out"
                onClick={() => updateStatus(answer.id, { approved: true, waiting: false, edits_required: false }, comment)}
              >
                Одобрить
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-all duration-200 ease-in-out"
                onClick={() => updateStatus(answer.id, { approved: false, waiting: true, edits_required: false }, comment)}
              >
                Ожидает проверки
              </button>
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-all duration-200 ease-in-out"
                onClick={() => updateStatus(answer.id, { approved: false, waiting: false, edits_required: true }, comment)}
              >
                Требуются правки
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-all duration-200 ease-in-out"
                onClick={() => updateStatus(answer.id, { approved: false, waiting: false, edits_required: false }, comment)}
              >
                Отказать
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              {Object.entries(answer.answers).map(([key, value]) => (
                <p key={key} className="mb-2">
                  <strong className="text-gray-700">{key}:</strong> <span className="text-gray-600">{value.toString()}</span>
                </p>
              ))}
            </div>
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Комментарии:</h3>
              {renderComments(answer.status.comments, answer.id)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}