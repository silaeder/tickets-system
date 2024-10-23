'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import Link from 'next/link';

type Form = {
  id: number;
  name: string;
};

export default function MyForms() {
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/get_user_created_forms');
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Мои формы</h1>
        {forms.length === 0 ? (
          <p className="text-xl text-gray-600">У вас пока нет созданных форм.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div key={form.id} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">{form.name}</h2>
                <div className="flex flex-col space-y-3">
                  <Link href={`/form_renderer/${form.id}`} className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300">
                    Ссылка на прохождение
                  </Link>
                  <Link href={`/show_answers/${form.id}`} className="text-green-600 hover:text-green-800 font-medium transition-colors duration-300">
                    Просмотреть ответы
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}