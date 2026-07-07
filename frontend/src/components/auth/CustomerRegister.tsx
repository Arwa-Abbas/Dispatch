import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { CustomerRegisterData } from '../../types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface CustomerRegisterProps {
  onBack: () => void;
}

const CustomerRegister: React.FC<CustomerRegisterProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<CustomerRegisterData>({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Pakistan',
    date_of_birth: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.full_name || formData.full_name.length < 2) {
      setError('Full name must be at least 2 characters');
      return;
    }

    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.phone || formData.phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!formData.address || formData.address.length < 5) {
      setError('Address must be at least 5 characters');
      return;
    }

    if (!formData.city || formData.city.length < 2) {
      setError('City must be at least 2 characters');
      return;
    }

    if (!formData.state || formData.state.length < 2) {
      setError('State must be at least 2 characters');
      return;
    }

    if (!formData.postal_code || formData.postal_code.length < 3) {
      setError('Postal code must be at least 3 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register.customer(formData);
      // Show success message and redirect to login
      navigate('/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        type="button"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to role selection
      </button>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Create Customer Account</h2>
        <p className="mt-1 text-sm text-gray-600">Start sending packages with Dispatch</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} method="post" autoComplete="on">
        {error && (
          <div className="rounded-md bg-red-50 p-3 border border-red-200">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cust-full-name" className="block text-sm font-medium text-gray-700">Full Name *</label>
            <input
              id="cust-full-name"
              type="text"
              name="full_name"
              autoComplete="name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="cust-email" className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              id="cust-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="john@example.com"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cust-password" className="block text-sm font-medium text-gray-700">Password *</label>
            <input
              id="cust-password"
              type="password"
              name="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Min 6 characters"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="cust-confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password *</label>
            <input
              id="cust-confirm-password"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Confirm password"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="cust-phone" className="block text-sm font-medium text-gray-700">Phone Number *</label>
          <input
            id="cust-phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="+92 300 1234567"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="cust-address" className="block text-sm font-medium text-gray-700">Street Address *</label>
          <input
            id="cust-address"
            type="text"
            name="address"
            autoComplete="street-address"
            required
            value={formData.address}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="House #, Street, Area"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="cust-city" className="block text-sm font-medium text-gray-700">City *</label>
            <input
              id="cust-city"
              type="text"
              name="city"
              autoComplete="address-level2"
              required
              value={formData.city}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Karachi"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="cust-state" className="block text-sm font-medium text-gray-700">State *</label>
            <input
              id="cust-state"
              type="text"
              name="state"
              autoComplete="address-level1"
              required
              value={formData.state}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Sindh"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="cust-postal" className="block text-sm font-medium text-gray-700">Postal Code *</label>
            <input
              id="cust-postal"
              type="text"
              name="postal_code"
              autoComplete="postal-code"
              required
              value={formData.postal_code}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="75000"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth (Optional)</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account...' : 'Create Customer Account'}
        </button>
      </form>
    </div>
  );
};

export default CustomerRegister;