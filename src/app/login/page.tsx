'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
    
        if (response.ok) {
            router.push('/');
        } else {
            console.error('Login failed');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <form className="flex flex-col" onSubmit={handleSubmit}>
                <h1 className="text-4xl text-center mb-2">Вход</h1>
                <input
                    className="border-black border-2 mb-2 rounded-md px-2 py-1 outline-none"
                    type="text"
                    placeholder="Эл. почта"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className="border-black border-2 mb-2 px-2 py-1 rounded-md outline-none"
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <a href='/register' className=' text-blue-700 mb-2 hover:text-blue-900'>Зарегистрироваться</a>
                <button className="bg-blue-200 rounded-md py-2" type="submit">
                    Войти
                </button>
            </form>
        </div>
    );
}