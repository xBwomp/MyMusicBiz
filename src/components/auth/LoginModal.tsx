import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4">
      <div className="absolute top-[70%] left-1/2 transform -translate-x-1/2 translate-y-[25%] bg-white rounded-2xl shadow-2xl max-w-md max-h-[90vh] overflow-y-auto w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center space-y-6">
          <div className="space-y-2">
            <img
              src="/hunicker-logo.svg"
              alt="Hunicker Institute Logo"
              className="h-16 w-16 mx-auto object-contain"
            />
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your music learning dashboard</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:border-indigo-300 hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center justify-center space-x-3 shadow-sm hover:shadow-md group"
            >
              <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <span>Continue with Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Secure authentication powered by Firebase</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
            <p>Your data is protected with enterprise-grade security.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;