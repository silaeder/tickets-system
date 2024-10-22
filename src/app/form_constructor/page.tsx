'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar';

export default function FormConstructor() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState<{ type: string; label: string; options: string[]; required: boolean }[]>([]);
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
      setFields([...fields, { type, label: '', options: [''], required: false }]);
    } else {
      setFields([...fields, { type, label: '', options: [], required: false }]);
    }
  };

  const handleFieldChange = (index: number, key: keyof typeof fields[number], value: string | boolean) => {
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
    const response = await fetch('/api/save_form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formName, fields }),
    });

    if (response.ok) {
      alert('Form saved successfully');
    } else {
      alert('Failed to save form');
    }
  };

  const deleteField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  return (
    <div>
      <Navbar />

      <div className='p-2 flex flex-col md:flex-row'>
        <div className='w-full md:w-1/3 md:pr-4 mb-4 md:mb-0'>
          <h1 className='text-2xl mb-2 font-bold'>Конструктор формы</h1>
          <input
            type="text"
            placeholder="Название формы"
            className='border-black border-2 mb-2 rounded-md px-2 py-1 outline-none w-full'
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <div className='flex flex-row md:flex-col w-full'>
            <button className='bg-blue-200 hover:bg-blue-300 rounded-md py-2 px-2 mb-2 mr-2 md:mr-0 transition-all ease-in-out duration-300 flex-1 md:flex-none' onClick={() => addField('text')}>Добавить поле ввода строки</button>
            <button className='bg-blue-200 hover:bg-blue-300 rounded-md py-2 px-2 mb-2 mr-2 md:mr-0 transition-all ease-in-out duration-300 flex-1 md:flex-none' onClick={() => addField('textarea')}>Добавить поле ввода текста</button>
            <button className='bg-blue-200 hover:bg-blue-300 rounded-md py-2 px-2 mb-2 mr-2 md:mr-0 transition-all ease-in-out duration-300 flex-1 md:flex-none' onClick={() => addField('checkbox')}>Добавить флажок</button>
            <button className='bg-blue-200 hover:bg-blue-300 rounded-md py-2 px-2 mb-2 transition-all ease-in-out duration-300 flex-1 md:flex-none' onClick={() => addField('radio')}>Добавить поле выбора</button>
          </div>
        </div>
        <div className='w-full md:w-2/3'>
          {fields.map((field, index) => (
            <div key={index} className="mb-4">
              <div className='flex justify-between items-center mb-2'>
                <p className='font-bold'>{field.type === 'text' ? "Поле ввода строки" : field.type === 'textarea' ? "Поле ввода текста" : field.type === 'checkbox' ? "Флажок" : field.type === 'radio' ? "Поле выбора" : ""}</p>
              
                <button
                  className="bg-red-200 hover:bg-red-300 rounded-md py-1 px-2 transition-all ease-in-out duration-300"
                  onClick={() => deleteField(index)}
                >
                  Удалить
                </button>
              </div>

              <input
                className='border-black border-2 mb-2 rounded-md px-2 py-1 outline-none w-full'
                type="text"
                placeholder="Название"
                value={field.label}
                onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
              />
              <div className="flex items-center mb-2">
                <input
                  id={`req-${index}`}
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor={`req-${index}`}>Обязательное поле</label>
              </div>
              {field.type === 'radio' && (
                <div className="ml-4">
                  {field.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center mb-2">
                      <input
                        className='border-black border-2 rounded-md px-2 py-1 outline-none mr-2 w-full'
                        type="text"
                        placeholder="Опция"
                        value={option}
                        onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                      />
                      {field.options.length > 1 && (
                        <button
                          className="bg-red-200 hover:bg-red-300 rounded-md py-1 px-2 ml-2 transition-all ease-in-out duration-300"
                          onClick={() => deleteOption(index, optionIndex)}
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    className="bg-purple-200 hover:bg-purple-300 rounded-md py-1 px-2 transition-all ease-in-out duration-300"
                    onClick={() => addOption(index)}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          ))}
          <button onClick={handleSave} className='bg-green-200 hover:bg-green-300 rounded-md py-2 px-4 transition-all ease-in-out duration-300'>Сохранить</button>
        </div>
      </div>
    </div>
  );
}