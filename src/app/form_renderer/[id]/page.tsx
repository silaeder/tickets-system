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
  options?: string[];
  visibilityCondition?: {
    dependsOn: string;
    value: string;
  };
};

export default function FormRenderer() {
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    fetchForm();
  }, []);

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/get_form/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormName(data.name);
        setFields(data.fields);
      }
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/save_answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: params.id,
          answers: values
        }),
      });

      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const isFieldVisible = (field: Field): boolean => {
    if (!field.visibilityCondition) return true;
    
    const { dependsOn, value } = field.visibilityCondition;
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
          {formName}
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
              isFieldVisible(field) && (
                <motion.div 
                  key={field.id} 
                  className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block mb-2 font-semibold text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.type === 'select' ? (
                    <div className="relative">
                      <select
                        value={values[field.id] || ''}
                        onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white text-sm"
                        required={field.required}
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
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={values[field.id] === 'true'}
                        onChange={(e) => setValues({ ...values, [field.id]: e.target.checked.toString() })}
                        required={field.required}
                        className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Да</span>
                    </label>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={values[field.id] || ''}
                      onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      required={field.required}
                      rows={4}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={values[field.id] || ''}
                      onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required={field.required}
                    />
                  )}
                </motion.div>
              )
            ))}
          </AnimatePresence>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              type="submit"
              className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Отправить
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  );
}