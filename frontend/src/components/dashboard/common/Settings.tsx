import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { BellIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-5 w-5 text-primary-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
                <p className="text-sm text-gray-600">Your account details and status</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-2">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <p className="font-medium text-gray-900">Role</p>
              <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
                {user?.role || 'CUSTOMER'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <p className="font-medium text-gray-900">Account Status</p>
              <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
                {user?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <p className="font-medium text-gray-900">Email Verified</p>
              <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
                {user?.is_verified ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <p className="font-medium text-gray-900">Joined</p>
              <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-3">
              <BellIcon className="h-5 w-5 text-primary-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
                <p className="text-sm text-gray-600">Manage basic notification preferences</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-2">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive alerts for shipment updates</p>
              </div>
              <button
                onClick={() => setNotificationsEnabled((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  notificationsEnabled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-3">
              <LockClosedIcon className="h-5 w-5 text-primary-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                <p className="text-sm text-gray-600">Reset your password when needed</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <button className="px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;