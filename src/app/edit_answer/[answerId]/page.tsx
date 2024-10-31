'use client';

import { useEffect, useState } from 'react';
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

export default function EditAnswer() {
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const params = useParams();
  const router = useRouter();
  const answerId = params.answerId as string;

  useEffect(() => {
    if (answerId) {
      fetchAnswer();
    }
  }, [answerId]);

  const fetchAnswer = async () => {
    try {
      const response = await fetch(`/api/get_answer/${answerId}`);
      if (response.ok) {
        const data = await response.json();
        setFormName(data.form.name);
        setFields(data.form.form_description);
        setValues(data.answers);
      }
    } catch (error) {
      console.error('Error fetching answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/update_answer/${answerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: values }),
      });

      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error updating answer:', error);
    } finally {
      setSaving(false);
    }
  };

  const isFieldRequired = (field: Field): boolean => {
    if (!field.requirementCondition) return field.required;
    
    const { dependsOn, value } = field.requirementCondition;
    return values[dependsOn] === value;
  };

  if (loading) {
    return (
      <motion.div 
        className="flex justify-center items-center h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <motion.h1 
          className="text-4xl font-bold mb-8 text-center text-gray-800 shadow-text"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Редактирование ответа: {formName}
        </motion.h1>
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-8 max-w-2xl mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence>
            {fields.map((field) => (
              <motion.div 
                key={field.id} 
                className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4">
                  <label className="block font-semibold text-gray-700">
                    {field.label}
                    {isFieldRequired(field) && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.description && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-gray-500 mt-1"
                    >
                      {field.description}
                    </motion.p>
                  )}
                </div>

                {field.type === 'select' ? (
                  <div className="relative">
                    <select
                      value={values[field.id] || ''}
                      onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white text-sm focus:outline-none"
                      required={isFieldRequired(field)}
                    >
                      <option value="">Выберите опцию</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                ) : field.type === 'checkbox' ? (
                  <label className="inline-flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={values[field.id] === 'true'}
                        onChange={(e) => setValues({ ...values, [field.id]: e.target.checked.toString() })}
                        required={isFieldRequired(field)}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 border-2 rounded-md transition-all duration-200 ${
                        values[field.id] === 'true' 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'bg-white border-gray-300'
                      }`}>
                        {values[field.id] === 'true' && (
                          <svg 
                            className="w-5 h-5 text-white" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700">Да</span>
                  </label>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={values[field.id] || ''}
                    onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none focus:outline-none"
                    required={isFieldRequired(field)}
                    rows={4}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={values[field.id] || ''}
                    onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:outline-none"
                    required={isFieldRequired(field)}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              type="submit"
              disabled={saving}
              className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Сохранение...</span>
                </>
              ) : (
                'Сохранить ответы'
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  );
}