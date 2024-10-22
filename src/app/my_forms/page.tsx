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
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Мои формы</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div key={form.id} className="border rounded-lg p-4 shadow-md">
                <h2 className="text-xl font-semibold mb-2">{form.name}</h2>
                <div className="flex flex-col space-y-2">
                <Link href={`/form_renderer/${form.id}`} className="text-blue-500 hover:underline">
                    Ссылка на прохождение
                </Link>
                <Link href={`/show_answers/${form.id}`} className="text-green-500 hover:underline">
                    Просмотреть ответы
                </Link>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}