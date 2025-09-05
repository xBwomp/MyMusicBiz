import React, { useState } from 'react';
import { LogOut, Settings, BookOpen, Calendar, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const { userProfile } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        <img
          src={user.photoURL || 'https://via.placeholder.com/32'}
          alt={user.displayName || 'User'}
          className="h-8 w-8 rounded-full object-cover"
        />
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {user.displayName?.split(' ')[0] || 'User'}
        </span>
        {userProfile?.role && (
          <span className="hidden md:block text-xs text-gray-500">
            ({userProfile.role})
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <img
                  src={user.photoURL || 'https://via.placeholder.com/40'}
                  alt={user.displayName || 'User'}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium text-gray-900">{user.displayName}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
            </div>

            <div className="py-2">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                <User className="h-4 w-4" />
                <span>See Profile</span>
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                <BookOpen className="h-4 w-4" />
                <span>My Lessons</span>
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                <Calendar className="h-4 w-4" />
                <span>Schedule</span>
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              {userProfile?.role === 'admin' && (
                <button 
                  onClick={() => {
                    window.location.href = '/admin';
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>

            <div className="border-t border-gray-100 py-2">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;