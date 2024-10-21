'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [surname, setSurname] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, second_name: secondName, surname }),
    });

    if (response.ok) {
      router.push('/login');
    } else {
      console.error('Registration failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <h1 className="text-4xl text-center mb-2">Регистрация</h1>
        <input
          className="border-black border-2 mb-2 rounded-md px-1 outline-none"
          type="text"
          placeholder="Эл. почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border-black border-2 mb-2 px-1 rounded-md outline-none"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="border-black border-2 mb-2 rounded-md px-1 outline-none"
          type="text"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border-black border-2 mb-2 rounded-md px-1 outline-none"
          type="text"
          placeholder="Отчество"
          value={secondName}
          onChange={(e) => setSecondName(e.target.value)}
        />
        <input
          className="border-black border-2 mb-2 rounded-md px-1 outline-none"
          type="text"
          placeholder="Фамилия"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
        />
        <a href='/login' className=' text-blue-700 mb-2 hover:text-blue-900'>Войти</a>
        <button className="bg-blue-200 rounded-md py-2" type="submit">
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}