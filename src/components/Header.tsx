import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import LoginModal from './auth/LoginModal';
import UserMenu from './auth/UserMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const { userProfile } = useAdmin();

  const navigation = [
    { name: 'Home', href: '#home' },
    { name: 'Programs', href: '#programs' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200">
            <img
              src="/hunicker-logo.svg"
              alt="Hunicker Institute Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900">Hunicker Institute: Band and Beyond</span>
            </a>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : user ? (
              <UserMenu />
            ) : (
              <>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
                >
                  Login
                </button>
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>
                ) : user ? (
                  <>
                    <a
                      href="/"
                      className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </a>
                    {userProfile?.role === 'admin' && (
                      <a
                        href="/admin"
                        className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </a>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-left text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="text-left text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => setIsLoginModalOpen(true)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium text-left"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
      </div>
    </header>
  );
};

export default Header;