'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Field = {
  type: string;
  label: string;
  options?: string[];
  required: boolean;
};

export default function FormRenderer() {
  const params = useParams();
  const id = params.id as string;
  const [fields, setFields] = useState<Field[]>([]);
  const [name, setName] = useState<String>("");
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (id) {
      fetch(`/api/get_form/${id}`)
        .then((response) => response.json())
        .then((data) => {
            setFields(data.fields)
            setName(data.name)
        })
        .catch((error) => console.error('Error fetching form:', error));
    }
  }, [id]);

  const handleChange = (name: string, value: any) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/save_answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId: id, answers: formData }),
    });

    if (response.ok) {
      alert('Answers saved successfully');
    } else {
      alert('Failed to save answers');
    }
  };

  return (
    <div className='flex flex-col items-center'>
        <div className='pt-3 container'>
            <h1 className='text-2xl mb-2'>Форма {name}</h1>
            <form onSubmit={handleSubmit}>
            {fields.map((field, index) => (
                <div key={index} className="mb-4">
                <label className="block text-lg font-bold">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'text' && (
                    <input
                    type="text"
                    required={field.required}
                    onChange={(e) => handleChange(field.label, e.target.value)}
                    className="border-black border-2 mb-2 rounded-md px-1 outline-none w-full"
                    />
                )}
                {field.type === 'textarea' && (
                    <textarea
                    required={field.required}
                    onChange={(e) => handleChange(field.label, e.target.value)}
                    className="border-black border-2 mb-2 rounded-md px-1 outline-none w-full"
                    />
                )}
                {field.type === 'checkbox' && (
                    <input
                    type="checkbox"
                    onChange={(e) => handleChange(field.label, e.target.checked)}
                    className="mr-2"
                    />
                )}
                {field.type === 'radio' && field.options && (
                    <div>
                    {field.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="block">
                        <input
                            type="radio"
                            name={field.label}
                            value={option}
                            onChange={(e) => handleChange(field.label, e.target.value)}
                            className="mr-2"
                        />
                        {option}
                        </label>
                    ))}
                    </div>
                )}
                </div>
            ))}
            <button type="submit" className="bg-blue-200 rounded-md py-2 px-4">
                Отправить
            </button>
            </form>
        </div>
    </div>
  );
}