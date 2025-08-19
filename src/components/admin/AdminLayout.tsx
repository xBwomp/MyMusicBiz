import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  UserCheck,
  Home,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { userProfile, isAdmin, loading } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <UserCheck className="h-16 w-16 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            You need administrator privileges to access this area. Please contact your system administrator.
          </p>
          {userProfile && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
              <p><strong>Current Role:</strong> {userProfile.role}</p>
              <p><strong>Email:</strong> {userProfile.email}</p>
              <p className="mt-2 text-xs text-gray-500">
                To become an admin, update your role in the Firestore console or ask an existing admin to promote you.
              </p>
            </div>
          )}
          <button
            onClick={() => window.location.href = '/'}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const navigation = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'programs', name: 'Programs & Classes', icon: BookOpen },
    { id: 'schedules', name: 'Schedules', icon: Calendar },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'families', name: 'Families', icon: Users },
    { id: 'teachers', name: 'Teachers', icon: GraduationCap },
    { id: 'enrollments', name: 'Enrollments', icon: UserCheck },
    { id: 'finances', name: 'Finances', icon: DollarSign },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <img
              src="/hunicker-logo.svg"
              alt="Hunicker Institute"
              className="h-8 w-8 object-contain"
            />
            <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === item.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src={userProfile?.photoURL || 'https://via.placeholder.com/32'}
              alt={userProfile?.displayName || 'Admin'}
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {userProfile?.displayName}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {userProfile?.role}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-0">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 capitalize">
              {navigation.find(item => item.id === activeTab)?.name || 'Admin Panel'}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome back, {userProfile?.displayName?.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;