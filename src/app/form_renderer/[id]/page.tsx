'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/app/components/navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Field = {
  type: string;
  label: string;
  options: string[];
  required: boolean;
  requiredIf?: { field: string; value: string } | null;
  dependentFields?: { field: string; value: string }[];
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
    setFormData((prevData) => {
      const newData = { ...prevData, [name]: value };
      return newData;
    });
  };

  const isFieldRequired = (field: Field) => {
    if (field.required) return true;
    return false;
  };

  const isFieldVisible = (field: Field) => {
    // Find any field that has this field as a dependent
    const controllingField = fields.find(f => 
      f.requiredIf && f.requiredIf.field === field.label
    );

    if (!controllingField) return true;

    if (controllingField.requiredIf?.value == "true" && formData[controllingField.label] == true) {
      return true;
    }

    // Check if the controlling field's value matches the condition
    return formData[controllingField.label] === controllingField.requiredIf?.value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const missingRequiredFields = fields.filter(field => {
      const isRequired = isFieldRequired(field);
      const isVisible = isFieldVisible(field);
      const value = formData[field.label];
      return isVisible && isRequired && (value === undefined || value === '' || value === null);
    });

    if (missingRequiredFields.length > 0) {
      toast.error('Пожалуйста, заполните все обязательные поля', {
        position: "bottom-right",
        theme: "colored",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    try {
      const response = await fetch('/api/save_answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: id, answers: formData }),
      });

      if (response.ok) {
        toast.success('Ответы успешно сохранены', {
          position: "bottom-right",
          theme: "colored",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error('Не удалось сохранить ответы', {
          position: "bottom-right",
          theme: "colored",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error('Error saving answers:', error);
      toast.error('Произошла ошибка при сохранении ответов', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <ToastContainer />

      <div className='container mx-auto px-4 py-8'>
          <h1 className='text-3xl font-bold mb-6 text-gray-800'>{name}</h1>
          <div className="bg-white shadow-md rounded-lg p-6">
              <form onSubmit={handleSubmit}>
              {fields.map((field, index) => (
                  isFieldVisible(field) && (
                    <div key={index} className="mb-6">
                      <label className="block text-lg font-semibold text-gray-700 mb-2">
                          {field.label}
                          {isFieldRequired(field) && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.type === 'text' && (
                          <input
                          type="text"
                          required={isFieldRequired(field)}
                          onChange={(e) => handleChange(field.label, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all duration-200 focus:ring-blue-500"
                          />
                      )}
                      {field.type === 'textarea' && (
                          <textarea
                          required={isFieldRequired(field)}
                          onChange={(e) => handleChange(field.label, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          />
                      )}
                      {field.type === 'checkbox' && (
                          <div className="flex items-center">
                            <input
                            type="checkbox"
                            onChange={(e) => handleChange(field.label, e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-gray-700">Да</span>
                          </div>
                      )}
                      {field.type === 'radio' && field.options && (
                          <div className="space-y-2">
                          {field.options.map((option, optionIndex) => (
                              <label key={optionIndex} className="flex items-center">
                              <input
                                  type="radio"
                                  name={field.label}
                                  value={option}
                                  required={isFieldRequired(field)}
                                  onChange={(e) => handleChange(field.label, e.target.value)}
                                  className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-gray-700">{option}</span>
                              </label>
                          ))}
                          </div>
                      )}
                    </div>
                  )
              ))}
              <button 
                type="submit" 
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              >
                  Отправить
              </button>
              </form>
          </div>
      </div>
    </div>
  );
}