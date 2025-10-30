import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiHome, FiFileText, FiLogOut, FiPlus } from 'react-icons/fi';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; is_admin: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white/70 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-xl font-semibold text-gray-800 transition-colors"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="rounded border-2"
                    priority
                  />
                </motion.div>
                <span>Конференция Силаэдр</span>
              </Link>
            </motion.div>
          </div>

          {!isLoading && (
            <>
              <div className="hidden sm:flex sm:items-center sm:space-x-4">
                {user?.is_admin && (
                  <>
                    <NavLink href="/" isActive={pathname === '/'}>
                      <FiHome className="h-4 w-4 mr-2" />
                      Главная
                    </NavLink>

                    <NavLink href="/my_forms" isActive={pathname === '/my_forms'}>
                      <FiFileText className="h-4 w-4 mr-2" />
                      Мои формы
                    </NavLink>

                    <NavLink href="/form_constructor" isActive={pathname === '/form_constructor'}>
                      <FiPlus className="h-4 w-4 mr-2" />
                      Создать форму
                    </NavLink>
                  </>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-color"
                >
                  <FiLogOut className="h-4 w-4 mr-2" />
                  Выйти
                </motion.button>
              </div>

              <div className="flex items-center sm:hidden">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 backdrop-blur-lg"
                >
                  {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
                </motion.button>
              </div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && !isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden bg-white/70 backdrop-blur-lg"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              {user?.is_admin && (
                <>
                  <MobileNavLink href="/" icon={<FiHome />} isActive={pathname === '/'}>
                    Главная
                  </MobileNavLink>
                  <MobileNavLink href="/my_forms" icon={<FiFileText />} isActive={pathname === '/my_forms'}>
                    Мои формы
                  </MobileNavLink>
                  <MobileNavLink 
                    href="/form_constructor" 
                    icon={<FiPlus />} 
                    isActive={pathname === '/form_constructor'}
                  >
                    Создать форму
                  </MobileNavLink>
                </>
              )}
              <MobileNavLink href="#" icon={<FiLogOut />} onClick={handleLogout}>
                Выйти
              </MobileNavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

const NavLink = ({ 
  href, 
  children, 
  isActive 
}: { 
  href: string; 
  children: React.ReactNode;
  isActive: boolean;
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Link href={href} className="relative">
      <div
        className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          isActive 
            ? 'text-white bg-gradient-to-r from-blue-500 to-indigo-500' 
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
        }`}
      >
        {children}
      </div>
    </Link>
  </motion.div>
);

const MobileNavLink = ({ 
  href, 
  children, 
  icon,
  onClick,
  isActive
}: { 
  href: string; 
  children: React.ReactNode; 
  icon: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
        isActive 
          ? 'text-white bg-gradient-to-r from-blue-500 to-indigo-500' 
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
      }`}
    >
      <span className="mr-3">{icon}</span>
      {children}
    </Link>
  </motion.div>
);