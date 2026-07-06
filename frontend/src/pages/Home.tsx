import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TruckIcon, UserIcon, ClipboardDocumentListIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary-600 rounded-2xl shadow-xl">
                <TruckIcon className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Dispatch
              <span className="block text-primary-600">Delivery Management</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Streamline your deliveries with real-time tracking, driver assignment, and automated notifications.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-600 text-base font-medium rounded-lg text-primary-600 bg-white hover:bg-primary-50 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Everything You Need</h2>
          <p className="mt-2 text-gray-600">Powerful features to manage your deliveries efficiently</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="p-3 bg-primary-100 rounded-lg w-fit mb-4">
              <UserIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Role-Based Access</h3>
            <p className="text-gray-600">Customers, drivers, and admins each have dedicated dashboards and permissions.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="p-3 bg-primary-100 rounded-lg w-fit mb-4">
              <ClipboardDocumentListIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
            <p className="text-gray-600">Track your shipments in real-time from pickup to delivery with status updates.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="p-3 bg-primary-100 rounded-lg w-fit mb-4">
              <CheckCircleIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Automated Notifications</h3>
            <p className="text-gray-600">Get instant email and SMS notifications when your shipment status changes.</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white">500+</div>
              <div className="mt-1 text-primary-100">Shipments Delivered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">50+</div>
              <div className="mt-1 text-primary-100">Active Drivers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">1000+</div>
              <div className="mt-1 text-primary-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">98%</div>
              <div className="mt-1 text-primary-100">On-time Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;