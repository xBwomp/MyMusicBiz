import React, { useState } from 'react';
import { Bell, Lock, User, Mail, Phone, Save } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

const LearnerSettings = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    enrollmentUpdates: true,
    paymentReminders: true,
    scheduleChanges: true,
    newsletter: false,
  });

  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleProfileChange = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log('Saving settings:', { notifications, profile });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and notification settings</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <User className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => handleProfileChange('displayName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Email address cannot be changed. Contact support if needed.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => handleNotificationChange('email', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">SMS Notifications</h3>
              <p className="text-sm text-gray-600">Receive notifications via text message</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={(e) => handleNotificationChange('sms', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Notification Types</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Enrollment Updates</h4>
                  <p className="text-xs text-gray-600">Class enrollments, waitlist changes, etc.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.enrollmentUpdates}
                  onChange={(e) => handleNotificationChange('enrollmentUpdates', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Payment Reminders</h4>
                  <p className="text-xs text-gray-600">Upcoming payments and overdue notices</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.paymentReminders}
                  onChange={(e) => handleNotificationChange('paymentReminders', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Schedule Changes</h4>
                  <p className="text-xs text-gray-600">Class time changes, cancellations, etc.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.scheduleChanges}
                  onChange={(e) => handleNotificationChange('scheduleChanges', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Newsletter</h4>
                  <p className="text-xs text-gray-600">Monthly updates and announcements</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.newsletter}
                  onChange={(e) => handleNotificationChange('newsletter', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Lock className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Security</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Enable 2FA
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};

export default LearnerSettings;