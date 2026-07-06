import React from 'react';
import { UserIcon, TruckIcon } from '@heroicons/react/24/outline';

interface RoleSelectionProps {
  onSelectRole: (role: 'CUSTOMER' | 'DRIVER') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary-100 rounded-full">
            <TruckIcon className="h-12 w-12 text-primary-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Join Dispatch</h2>
        <p className="mt-2 text-gray-600">Choose how you want to use Dispatch</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          onClick={() => onSelectRole('CUSTOMER')}
          className="group relative flex flex-col items-center p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-lg transition-all duration-200"
        >
          <div className="p-3 bg-primary-100 rounded-full group-hover:bg-primary-200 transition-colors">
            <UserIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Customer</h3>
          <p className="mt-1 text-sm text-gray-500 text-center">Send packages & track deliveries in real-time</p>
          <div className="mt-4 text-primary-600 font-medium group-hover:text-primary-700">
            Create Account →
          </div>
        </button>

        <button
          onClick={() => onSelectRole('DRIVER')}
          className="group relative flex flex-col items-center p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-lg transition-all duration-200"
        >
          <div className="p-3 bg-primary-100 rounded-full group-hover:bg-primary-200 transition-colors">
            <TruckIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Driver</h3>
          <p className="mt-1 text-sm text-gray-500 text-center">Deliver packages & earn money</p>
          <div className="mt-4 text-primary-600 font-medium group-hover:text-primary-700">
            Join as Driver →
          </div>
        </button>
      </div>

      <div className="text-center border-t border-gray-200 pt-6">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button 
            onClick={() => window.location.href = '/login'}
            className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;