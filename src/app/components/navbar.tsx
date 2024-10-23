'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

type User = {
  name: string;
  is_admin: boolean;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
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
    <nav className="bg-gradient-to-r from-blue-800 to-blue-600 shadow-lg">
      <div className="container mx-auto flex flex-wrap justify-between items-center py-4 px-6">
        <Link href="/" className="text-white text-2xl font-bold hover:text-blue-200 transition-colors duration-300">
          Tickets System
        </Link>

        <button
          className="lg:hidden text-white hover:text-blue-200 transition-colors duration-300"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`w-full lg:w-auto ${isMenuOpen ? 'block' : 'hidden'} lg:flex lg:items-center lg:justify-center mt-4 lg:mt-0 lg:flex-grow`}>
          <div className='flex flex-col lg:flex-row lg:gap-6'>
            <Link 
              href="/" 
              className={`text-white hover:text-blue-200 mb-2 lg:mb-0 transition-colors duration-300 ${pathname === '/' ? 'font-semibold border-b-2 border-white' : ''}`}
            >
              Главная
            </Link>

            {user && user.is_admin && (
              <Link 
                href="/form_constructor" 
                className={`text-white hover:text-blue-200 mb-2 lg:mb-0 transition-colors duration-300 ${pathname === '/form_constructor' ? 'font-semibold border-b-2 border-white' : ''}`}
              >
                Создать форму
              </Link>
            )}

            {user && user.is_admin && (
              <Link 
                href="/my_forms" 
                className={`text-white hover:text-blue-200 mb-2 lg:mb-0 transition-colors duration-300 ${pathname === '/my_forms' ? 'font-semibold border-b-2 border-white' : ''}`}
              >
                Мои формы
              </Link>
            )}
          </div>
          
          {isMenuOpen ? <>
            <div className="mt-4 lg:mt-0">
              {user ? (
                <>
                  <span className="text-white mr-4 block lg:inline mb-2 lg:mb-0">Привет, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-white text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full lg:w-auto"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {router.push("/login")}}
                  className="bg-white text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full lg:w-auto"
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
                className="bg-white text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Выйти
              </button>
            </>
          ) : (
            <button
              onClick={() => {router.push("/login")}}
              className="bg-white text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Войти
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}