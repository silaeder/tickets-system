'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../components/navbar';
import { motion, AnimatePresence } from 'framer-motion';

type Field = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  description?: string;
  options?: string[];
  requirementCondition?: {
    dependsOn: string;
    value: string;
  };
};

export default function EditForm() {
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string;

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setIsAdmin(userData.is_admin);
        if (!userData.is_admin) {
          router.push('/');
        } else {
          fetchForm();
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      router.push('/login');
    }
  };

  // Move fetchForm call into checkAdminStatus success case
  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/get_form/${formId}`);
      if (response.ok) {
        const data = await response.json();
        setFormName(data.name);
        setFields(data.fields);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch form');
        if (response.status === 403) {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Error fetching form:', error);
      setError('An error occurred while fetching the form');
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    const newField: Field = {
      id: `field_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      description: ''
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const addOption = (index: number) => {
    const newFields = [...fields];
    const currentOptions = newFields[index].options || [];
    newFields[index].options = [...currentOptions, ''];
    setFields(newFields);
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const newFields = [...fields];
    if (newFields[fieldIndex].options) {
      newFields[fieldIndex].options![optionIndex] = value;
      setFields(newFields);
    }
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const newFields = [...fields];
    if (newFields[fieldIndex].options) {
      newFields[fieldIndex].options = newFields[fieldIndex].options!.filter((_, i) => i !== optionIndex);
      setFields(newFields);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`/api/update_form/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          fields: fields
        }),
      });

      if (response.ok) {
        router.push('/my_forms');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update form');
      }
    } catch (error) {
      console.error('Error updating form:', error);
      setError('An error occurred while updating the form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center items-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-24 w-24 border-t-2 border-b-2 border-[#397698]"
        />
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">
      <Navbar />
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-2 py-4"
      >
        <h1 className="text-4xl font-bold mb-4 text-center text-gray-800 shadow-text">
          Редактировать форму
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
          >
            <input
              type="text"
              placeholder="Название формы"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#397698] focus:border-transparent transition-all duration-200"
              required
            />
          </motion.div>

          <AnimatePresence>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Название поля"
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#397698] focus:border-transparent transition-all duration-200"
                    required
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#397698] focus:border-transparent transition-all duration-200 appearance-none bg-white"
                    style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem"}}
                  >
                    <option value="text">Текст</option>
                    <option value="number">Число</option>
                    <option value="select">Выбор</option>
                    <option value="checkbox">Чекбокс</option>
                    <option value="textarea">Текстовая область</option>
                  </select>
                </div>

                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Описание поля"
                    value={field.description || ''}
                    onChange={(e) => updateField(index, { description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#397698] focus:border-transparent transition-all duration-200"
                  />
                </div>

                {field.type === 'select' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3"
                  >
                    <AnimatePresence>
                      {field.options?.map((option, optionIndex) => (
                        <motion.div
                          key={optionIndex}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center mt-2"
                        >
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#397698] focus:border-transparent transition-all duration-200 flex-grow"
                            placeholder={`Опция ${optionIndex + 1}`}
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => removeOption(index, optionIndex)}
                            className="ml-2 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-200 text-sm"
                          >
                            Удалить
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => addOption(index)}
                      className="mt-2 bg-[#397698] text-white px-4 py-2 rounded-md hover:bg-[#2c5a75] transition-colors duration-200 text-sm"
                    >
                      Добавить опцию
                    </motion.button>
                  </motion.div>
                )}

                <div className="mt-3">
                  <select
                    value={field.requirementCondition?.dependsOn || ''}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        const { requirementCondition, ...rest } = field;
                        updateField(index, rest);
                      } else {
                        updateField(index, {
                          requirementCondition: {
                            dependsOn: e.target.value,
                            value: field.requirementCondition?.value || ''
                          }
                        });
                      }
                    }}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#397698] focus:border-transparent transition-all duration-200 appearance-none bg-white mr-2"
                    style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem"}}
                  >
                    <option value="">Условие обязательности</option>
                    {fields.slice(0, index).map(f => (
                      <option key={f.id} value={f.id}>
                        Обязательно если {f.label} равно:
                      </option>
                    ))}
                  </select>

                  {field.requirementCondition && (
                    <input
                      type="text"
                      placeholder="Значение для обязательности"
                      value={field.requirementCondition.value}
                      onChange={(e) => updateField(index, {
                        requirementCondition: {
                          dependsOn: field.requirementCondition?.dependsOn || '',
                          value: e.target.value
                        }
                      })}
                      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#397698] focus:border-transparent transition-all duration-200"
                    />
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`block w-5 h-5 rounded border-2 transition-colors duration-200 ${field.required ? 'bg-[#397698] border-[#397698]' : 'bg-white border-gray-300'}`}>
                        {field.required && (
                          <svg className="w-3 h-3 text-white absolute left-1 top-1" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-gray-700">Обязательное поле</span>
                  </label>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => removeField(index)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-200 text-sm"
                  >
                    Удалить поле
                  </motion.button>
                </div>
                </motion.div>
            ))}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-2 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={addField}
              className="bg-[#397698] text-white px-4 py-2 rounded-md hover:bg-[#2c5a75] transition-colors duration-200 text-base font-semibold"
            >
              Добавить поле
            </motion.button>
            <motion.button
              whileHover={{ scale: submitting ? 1 : 1.05 }}
              whileTap={{ scale: submitting ? 1 : 0.95 }}
              type="submit"
              disabled={submitting}
              className="text-white px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors duration-200 text-base font-semibold flex items-center justify-center gap-2 min-w-[160px]"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Сохранение...</span>
                </>
              ) : (
                'Сохранить изменения'
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}