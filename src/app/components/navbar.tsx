'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        setUser(null);
        router.push('/login');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-800 p-2">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          Tickets System
        </Link>

        <button
          className="lg:hidden text-white"
          onClick={toggleMenu}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`w-full lg:w-auto ${isMenuOpen ? 'block' : 'hidden'} lg:flex lg:items-center lg:justify-center mt-4 lg:mt-0 lg:flex-grow`}>
          <div className='flex flex-col lg:flex-row lg:gap-6'>
            <Link 
              href="/" 
              className={`text-white hover:text-blue-200 mb-2 lg:mb-0 ${pathname === '/' ? 'underline underline-offset-2 decoration-2' : ''}`}
            >
              Главная
            </Link>

            <Link 
              href="/form_constructor" 
              className={`text-white hover:text-blue-200 mb-2 lg:mb-0 ${pathname === '/form_constructor' ? 'underline underline-offset-2 decoration-2' : ''}`}
            >
              Конструктор форм
            </Link>

            <Link 
              href="/my_forms" 
              className={`text-white hover:text-blue-200 mb-2 lg:mb-0 ${pathname === '/my_forms' ? 'underline underline-offset-2 decoration-2' : ''}`}
            >
              Мои формы
            </Link>
          </div>
          
          {isMenuOpen ? <>
            <div className="mt-4 lg:mt-0">
              {user ? (
                <>
                  <span className="text-white mr-4 block lg:inline mb-2 lg:mb-0">Привет, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-100 transition-all ease-in-out duration-300 w-full lg:w-auto"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {router.push("/login")}}
                  className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-100 transition-all ease-in-out duration-300 w-full lg:w-auto"
                >
                  Войти
                </button>
              )}
            </div>
          </> : <></>}
        </div>

        <div className="hidden lg:block mt-4 lg:mt-0">
          {user ? (
            <>
              <span className="text-white mr-4 inline">Привет, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-100 transition-all ease-in-out duration-300"
              >
                Выйти
              </button>
            </>
          ) : (
            <button
              onClick={() => {router.push("/login")}}
              className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-100 transition-all ease-in-out duration-300"
            >
              Войти
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}