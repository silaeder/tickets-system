'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
                <Link href='/register' className=' text-blue-500 hover:underline mb-2'>Зарегистрироваться</Link>
                <button className="bg-blue-200 hover:bg-blue-300 rounded-md py-2 transition-all ease-in-out duration-300" type="submit">
                    Войти
                </button>
            </form>
        </div>
    );
}