'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']); // 6-digit code
  const [isCodeInvalid, setIsCodeInvalid] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/forgot_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStep('code');
        toast.success('Код подтверждения отправлен на вашу почту', {
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
      } else {
        toast.error('Пользователь с такой почтой не найден', {
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
      console.error('Error:', error);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeString = code.join('');
    try {
      const response = await fetch('/api/verify_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codeString }),
      });

      if (response.ok) {
        setIsCodeInvalid(false);
        setStep('reset');
      } else {
        setIsCodeInvalid(true);
        toast.error('Неверный код подтверждения', {
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
      console.error('Error:', error);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle pasted content
      const pastedChars = value.split('').slice(0, 6);
      const newCode = [...code];
      pastedChars.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);
      setIsCodeInvalid(false);
      
      // Focus last input or next empty input
      const nextEmptyIndex = newCode.findIndex((digit, i) => !digit && i >= index);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        document.getElementById(`code-${nextEmptyIndex}`)?.focus();
      } else {
        document.getElementById(`code-5`)?.focus();
      }
    } else {
      // Handle single character input
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      setIsCodeInvalid(false);

      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают', {
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
      return;
    }

    try {
      const response = await fetch('/api/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.join(''), newPassword }),
      });

      if (response.ok) {
        toast.success('Пароль успешно изменен', {
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
        router.push('/login');
      } else {
        toast.error('Ошибка при смене пароля', {
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
      console.error('Error:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100"
    >
      <ToastContainer />
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <form 
          className="bg-white shadow-2xl rounded-lg px-10 pt-8 pb-10"
          onSubmit={
            step === 'email' 
              ? handleEmailSubmit 
              : step === 'code' 
                ? handleCodeSubmit 
                : handlePasswordReset
          }
        >
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl font-bold text-center text-gray-800 mb-8"
          >
            Восстановление пароля
          </motion.h1>

          {step === 'email' && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-6"
            >
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                placeholder="your@email.com"
              />
            </motion.div>
          )}

          {step === 'code' && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-6"
            >
              <label className="block text-gray-700 text-sm font-bold mb-4">
                Код подтверждения
              </label>
              <div className="flex justify-between gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      handleCodeChange(index, pastedText);
                    }}
                    className={`w-10 h-10 text-center text-xl font-bold rounded-md border-2 
                      ${isCodeInvalid 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 focus:border-blue-500'} 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300
                      shadow-sm hover:shadow-md`}
                    required
                  />
                ))}
              </div>
              {isCodeInvalid && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-2 text-center"
                >
                  Неверный код подтверждения
                </motion.p>
              )}
            </motion.div>
          )}

          {step === 'reset' && (
            <>
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-6"
              >
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Новый пароль
                </label>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ${newPassword && confirmPassword && newPassword !== confirmPassword ? 'border-red-500 bg-red-50' : ''}`}
                  placeholder="••••••••"
                />
              </motion.div>

              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mb-6"
              >
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Подтвердите пароль
                </label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ${newPassword && confirmPassword && newPassword !== confirmPassword ? 'border-red-500 bg-red-50' : ''}`}
                  placeholder="••••••••"
                />
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    Пароли не совпадают
                  </motion.p>
                )}
              </motion.div>
            </>
          )}

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center justify-between mb-6"
          >
            <Link href="/login" className="text-blue-500 hover:text-blue-700 font-semibold transition duration-300">
              Вернуться к входу
            </Link>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-center justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
              type="submit"
            >
              {step === 'email' 
                ? 'Отправить код' 
                : step === 'code' 
                  ? 'Подтвердить код' 
                  : 'Сменить пароль'}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}