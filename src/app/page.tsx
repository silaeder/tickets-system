'use client';

import { useEffect, useState } from 'react';
import Navbar from './components/navbar';

type FormStatus = {
  id: number;
  formId: number;
  form: { name: string };
  status: {
    approved: boolean;
    waiting: boolean;
    edits_required: boolean;
  };
};

export default function Home() {
  const [forms, setForms] = useState<FormStatus[]>([]);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/get_user_forms');
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      } else {
        console.error('Failed to fetch forms');
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  };

  const getStatusText = (status: FormStatus['status']) => {
    if (status.approved) return 'Одобрено';
    if (status.waiting) return 'Ожидает проверки';
    if (status.edits_required) return 'Требуются правки';
    if (!status.approved) return 'Отказано';
    return 'Неизвестный статус';
  };

  const getStatusColor = (status: FormStatus['status']) => {
    if (status.approved) return 'bg-green-200';
    if (status.waiting) return 'bg-yellow-200';
    if (status.edits_required) return 'bg-red-200';
    if (!status.approved) return 'bg-red-300'
    return 'bg-gray-200';
  };

  return (
    <div>
      <Navbar />

      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Отправленные формы</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div key={form.id} className="border rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-semibold mb-2">{form.form.name}</h2>
              <div className={`${getStatusColor(form.status)} px-2 py-1 rounded-full inline-block`}>
                {getStatusText(form.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}