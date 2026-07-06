import React, { useState } from 'react';
import RoleSelection from './RoleSelection';
import CustomerRegister from './CustomerRegister';
import DriverRegister from './DriverRegister';
import { TruckIcon } from '@heroicons/react/24/outline';

const Register: React.FC = () => {
  const [step, setStep] = useState<'role' | 'customer' | 'driver'>('role');

  const handleRoleSelect = (role: 'CUSTOMER' | 'DRIVER') => {
    setStep(role === 'CUSTOMER' ? 'customer' : 'driver');
  };

  const handleBack = () => {
    setStep('role');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-600 rounded-xl shadow-lg">
              <TruckIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Dispatch</h1>
          <p className="mt-1 text-gray-600">Delivery Management System</p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8">
          {step === 'role' && <RoleSelection onSelectRole={handleRoleSelect} />}
          {step === 'customer' && <CustomerRegister onBack={handleBack} />}
          {step === 'driver' && <DriverRegister onBack={handleBack} />}
        </div>
      </div>
    </div>
  );
};

export default Register;