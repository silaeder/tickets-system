'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Field = {
  type: string;
  label: string;
  options: string[];
  required: boolean;
  requiredIf?: { field: string; value: string } | null;
};

export default function FormConstructor() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setIsAdmin(userData.is_admin);
          if (!userData.is_admin) {
            router.push('/');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      }
    };

    checkAdminStatus();
  }, [router]);

  if (!isAdmin) {
    return null;
  }

  const addField = (type: string) => {
    if (type === 'radio') {
      setFields([...fields, { type, label: '', options: [''], required: false, requiredIf: null }]);
    } else {
      setFields([...fields, { type, label: '', options: [], required: false, requiredIf: null }]);
    }
  };

  const handleFieldChange = (index: number, key: keyof Field, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const addOption = (fieldIndex: number) => {
    const newFields = [...fields];
    newFields[fieldIndex].options.push('');
    setFields(newFields);
  };

  const handleOptionChange = (fieldIndex: number, optionIndex: number, value: string) => {
    const newFields = [...fields];
    newFields[fieldIndex].options[optionIndex] = value;
    setFields(newFields);
  };

  const deleteOption = (fieldIndex: number, optionIndex: number) => {
    const newFields = [...fields];
    if (newFields[fieldIndex].options.length > 1) {
      newFields[fieldIndex].options.splice(optionIndex, 1);
      setFields(newFields);
    }
  };

  const handleSave = async () => {
    const formattedFields = fields.map(field => ({
      ...field,
      requiredIf: field.requiredIf && field.requiredIf.field && field.requiredIf.value
        ? field.requiredIf
        : null
    }));

    const response = await fetch('/api/save_form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formName, fields: formattedFields }),
    });

    if (response.ok) {
      toast.success('Форма успешно сохранена', {
        position: "bottom-right",
        autoClose: 5000,
        theme: "colored",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      toast.error('Не удалось сохранить форму', {
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
  };

  const deleteField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const handleRequiredIfChange = (index: number, field: string, value: string) => {
    const newFields = [...fields];
    newFields[index].requiredIf = field ? { field, value } : null;
    setFields(newFields);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <ToastContainer />

      <div className="container mx-auto px-4 py-8">
        <div className="lg:flex lg:space-x-8">
          <div className="lg:w-1/4 mb-8 lg:mb-0">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Добавить поле</h2>
              <div className="flex flex-col space-y-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out" onClick={() => addField('text')}>Поле ввода строки</button>
                <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out" onClick={() => addField('textarea')}>Поле ввода текста</button>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out" onClick={() => addField('checkbox')}>Флажок</button>
                <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out" onClick={() => addField('radio')}>Поле выбора</button>
              </div>
            </div>
          </div>

          <div className="lg:w-3/4">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h1 className="text-3xl font-bold mb-6 text-gray-800">Конструктор формы</h1>
              
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Название формы"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              {fields.map((field, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg mb-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {field.type === 'text' ? "Поле ввода строки" : 
                       field.type === 'textarea' ? "Поле ввода текста" : 
                       field.type === 'checkbox' ? "Флажок" : 
                       field.type === 'radio' ? "Поле выбора" : ""}
                    </h2>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md transition duration-300 ease-in-out"
                      onClick={() => deleteField(index)}
                    >
                      Удалить
                    </button>
                  </div>

                  <input
                    className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    type="text"
                    placeholder="Название"
                    value={field.label}
                    onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                  />

                  <div className="flex items-center mb-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        id={`req-${index}`}
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2 text-gray-700">Обязательное поле</span>
                    </label>
                  </div>

                  {(field.type === 'checkbox' || field.type === 'radio') && (
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Сделать другое поле обязательным при выборе:</label>
                      <div className="relative">
                        <select
                          className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition duration-150 ease-in-out"
                          value={field.requiredIf?.field || ''}
                          onChange={(e) => handleRequiredIfChange(index, e.target.value, field.type === 'checkbox' ? 'true' : field.requiredIf?.value || '')}
                        >
                          <option value="">Выберите поле</option>
                          {fields.map((f, i) => (
                            i !== index && <option key={i} value={f.label}>{f.label}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>
                      {field.requiredIf?.field && field.type === 'radio' && (
                        <div className="relative mt-2">
                          <label className="block text-gray-700 mb-2">Обязательно если:</label>
                          <select
                            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition duration-150 ease-in-out"
                            value={field.requiredIf.value}
                            onChange={(e) => handleRequiredIfChange(index, field.requiredIf!.field, e.target.value)}
                          >
                            {field.options.map((option, optionIndex) => (
                              <option key={optionIndex} value={option}>{option}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {field.type === 'radio' && (
                    <div className="space-y-2">
                      {field.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center">
                          <input
                            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            placeholder="Опция"
                            value={option}
                            onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                          />
                          {field.options.length > 1 && (
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-r-md transition duration-300 ease-in-out"
                              onClick={() => deleteOption(index, optionIndex)}
                            >
                              Удалить
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                        onClick={() => addOption(index)}
                      >
                        Добавить опцию
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <button 
                onClick={handleSave} 
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-md transition duration-300 ease-in-out"
              >
                Сохранить форму
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}