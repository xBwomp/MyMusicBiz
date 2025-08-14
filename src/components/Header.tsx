import React, { useState } from 'react';
import { Music, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoginModal from './auth/LoginModal';
import UserMenu from './auth/UserMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, loading } = useAuth();

  const navigation = [
    { name: 'Home', href: '#home' },
    { name: 'Programs', href: '#programs' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <img 
              src="https://scontent-atl3-1.xx.fbcdn.net/v/t39.30808-6/446998267_390822577278912_1249827645745068948_n.png?_nc_cat=106&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=y-u-Mz78OY4Q7kNvwHueQVa&_nc_oc=Adm6ExywDwIP8-gKSfykLIL42D5xY5uVvehSe4QT41D9UWN-XfZ1_Qnolpj_87Zd3dQ&_nc_zt=23&_nc_ht=scontent-atl3-1.xx&_nc_gid=zz9Di8SNbHNxiofU_GGUiQ&oh=00_AfXZYd-shHv1jZIgu3EIoWL9TcCarVEPc6-f-C6gvGoKzA&oe=689D9B83"
              alt="Hunicker Institute Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900">Hunicker Institute: Band and Beyond</span>
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
              <>
                <a
                  href="/admin"
                  className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
                >
                  Admin
                </a>
                <UserMenu />
              </>
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
                      href="/admin"
                      className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </a>
                    <UserMenu />
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