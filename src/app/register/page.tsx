'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [surname, setSurname] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataProcessingConsent, setDataProcessingConsent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, second_name: secondName, surname }),
      });
    
      if (response.ok) {
        router.push('/');
      } else {
        toast.error('Пользователь с такой эл. почтой уже существует.', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      }
    } catch (error) {
      toast.error('Произошла ошибка при регистрации.', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#e8eff4] to-[#f9f3e2]"
    >
      <ToastContainer />
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <form className="bg-white shadow-2xl rounded-lg px-10 pt-8 pb-10" onSubmit={handleSubmit}>
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl font-bold text-center text-gray-800 mb-8"
          >
            Регистрация
          </motion.h1>
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6"
          >
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Эл. почта</label>
            <input
              required
              id="email"
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#397698] focus:border-transparent transition duration-300"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </motion.div>
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-6"
          >
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Пароль</label>
            <input
              required
              id="password"
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#397698] focus:border-transparent transition duration-300"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </motion.div>
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-6"
          >
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Имя</label>
            <input
              required
              id="name"
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#397698] focus:border-transparent transition duration-300"
              type="text"
              placeholder="Иван"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </motion.div>
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mb-6"
          >
            <label htmlFor="secondName" className="block text-gray-700 text-sm font-bold mb-2">Отчество</label>
            <input
              required
              id="secondName"
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#397698] focus:border-transparent transition duration-300"
              type="text"
              placeholder="Иванович"
              value={secondName}
              onChange={(e) => setSecondName(e.target.value)}
            />
          </motion.div>
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-8"
          >
            <label htmlFor="surname" className="block text-gray-700 text-sm font-bold mb-2">Фамилия</label>
            <input
              required
              id="surname"
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#397698] focus:border-transparent transition duration-300"
              type="text"
              placeholder="Иванов"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.85 }}
            className="mb-8"
          >
            <label className="flex items-start cursor-pointer">
              <div className="relative flex items-center h-5">
                <input
                  required
                  type="checkbox"
                  checked={dataProcessingConsent}
                  onChange={(e) => setDataProcessingConsent(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded transition-colors duration-200 ${
                  dataProcessingConsent 
                    ? 'bg-[#397698] border-[#397698]' 
                    : 'bg-white border-gray-300'
                } flex items-center justify-center`}>
                  {dataProcessingConsent && (
                    <svg 
                      className="w-3 h-3 text-white" 
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
              <span className="ml-2 text-sm text-gray-700">
                Я согласен на{' '}
                <a 
                  href="https://docs.google.com/document/d/1p0JU-NzR7xG8mAYKTe723ODUhaUmuS7zp6s5Jt76AdU/edit?tab=t.0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#397698] hover:text-[#2c5a75] underline"
                >
                  обработку персональных данных
                </a>
              </span>
            </label>
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex items-center justify-between mb-8"
          >
            <Link href="/login" className="text-[#397698] hover:text-[#2c5a75] font-semibold transition duration-300">
              Уже есть аккаунт? Войти
            </Link>
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="flex items-center justify-center"
          >
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              className="bg-[#397698] hover:bg-[#2c5a75] text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 ease-in-out flex items-center justify-center gap-2 min-w-[180px]"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Регистрация...</span>
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}