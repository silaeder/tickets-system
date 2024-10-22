'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/app/components/navbar';

type Answer = {
  id: number;
  answers: Record<string, any>;
  user: {
    name: string;
    surname: string;
  };
  status: {
    id: number;
    approved: boolean;
    waiting: boolean;
    edits_required: boolean;
  };
};

export default function ShowAnswers() {
  const params = useParams();
  const formId = params.formId as string;
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnswers();
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

  const updateStatus = async (answerId: number, newStatus: Partial<Answer['status']>) => {
    try {
      const response = await fetch(`/api/get_form_answers/${formId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answerId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        fetchAnswers(); // Refresh the answers after updating
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
    if (status.edits_required) return 'bg-red-200';
    return 'bg-red-300';
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Ответы на форму</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {answers.map((answer) => (
          <div key={answer.id} className="border rounded-lg p-4 shadow-md mb-4">
            <h2 className="text-xl font-semibold mb-2">
              {answer.user.name} {answer.user.surname}
            </h2>
            <div className={`${getStatusColor(answer.status)} px-2 py-1 rounded-full inline-block mb-2`}>
              {getStatusText(answer.status)}
            </div>
            <div className="mb-2">
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mr-2 transition-all ease-in-out duration-300"
                onClick={() => updateStatus(answer.id, { approved: true, waiting: false, edits_required: false })}
              >
                Одобрить
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2 transition-all ease-in-out duration-300"
                onClick={() => updateStatus(answer.id, { approved: false, waiting: true, edits_required: false })}
              >
                Ожидает проверки
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded mr-2 transition-all ease-in-out duration-300"
                onClick={() => updateStatus(answer.id, { approved: false, waiting: false, edits_required: true })}
              >
                Требуются правки
              </button>
              <button
                className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded transition-all ease-in-out duration-300"
                onClick={() => updateStatus(answer.id, { approved: false, waiting: false, edits_required: false })}
              >
                Отказать
              </button>
            </div>
            <div>
              {Object.entries(answer.answers).map(([key, value]) => (
                <p key={key} className="mb-1">
                  <strong>{key}:</strong> {value.toString()}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}