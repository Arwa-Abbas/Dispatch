import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../api/api';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TruckIcon,
  IdentificationIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  date_of_birth: string;
  // Driver specific fields
  license_number?: string;
  vehicle_type?: string;
  vehicle_number?: string;
  experience_years?: number;
}

const ProfileSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    date_of_birth: '',
    license_number: '',
    vehicle_type: '',
    vehicle_number: '',
    experience_years: 0,
  });
  const [error, setError] = useState('');

  const isDriver = user?.role === 'DRIVER';
  const isCustomer = user?.role === 'CUSTOMER';

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users/profile');
      const data = response.data;
      console.log('Profile data:', data);
      
      setFormData({
        full_name: data.full_name || user?.full_name || '',
        email: data.email || user?.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        postal_code: data.postal_code || '',
        country: data.country || 'Pakistan',
        date_of_birth: data.date_of_birth || '',
        license_number: data.license_number || '',
        vehicle_type: data.vehicle_type || '',
        vehicle_number: data.vehicle_number || '',
        experience_years: data.experience_years || 0,
      });
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile data');
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experience_years' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build update data with proper null/empty handling
      const updateData: any = {
        full_name: formData.full_name || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postal_code: formData.postal_code || undefined,
        country: formData.country || 'Pakistan',
        date_of_birth: formData.date_of_birth || null,
      };

      // Add driver fields if user is a driver
      if (isDriver) {
        updateData.license_number = formData.license_number || undefined;
        updateData.vehicle_type = formData.vehicle_type || undefined;
        updateData.vehicle_number = formData.vehicle_number || undefined;
        updateData.experience_years = formData.experience_years || 0;
      }

      // Remove undefined values (they won't be sent)
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.log('Sending update data:', updateData);

      const response = await api.put('/users/profile', updateData);
      console.log('Update response:', response.data);
      
      // Update user in context
      if (user) {
        const updatedUser = {
          ...user,
          full_name: formData.full_name,
        };
        updateUser(updatedUser);
      }
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Refresh profile data
      await fetchUserProfile();
    } catch (error: any) {
      console.error('Update error:', error);
      let errorMsg = 'Failed to update profile';
      
      if (error.detail) {
        if (Array.isArray(error.detail)) {
          // Handle validation errors
          errorMsg = error.detail.map((err: any) => err.msg || err.message).join(', ');
        } else {
          errorMsg = error.detail;
        }
      } else if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMsg = error.response.data.detail.map((err: any) => err.msg || err.message).join(', ');
        } else {
          errorMsg = error.response.data.detail;
        }
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.full_name) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your personal details and contact information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 relative">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-primary-600">
                {formData.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{formData.full_name || 'User'}</h2>
              <p className="text-primary-100">{user?.role || 'Customer'}</p>
              {isDriver && formData.vehicle_type && (
                <p className="text-primary-200 text-sm mt-1">
                  {formData.vehicle_type} • {formData.vehicle_number}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Profile Form */}
        <div className="p-6">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-semibold text-gray-900">{user?.role || 'CUSTOMER'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-sm text-gray-500">Account Status</p>
              <p className="font-semibold text-gray-900">{user?.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-sm text-gray-500">Joined</p>
              <p className="font-semibold text-gray-900">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      placeholder="Your email"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email verification will be available soon</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>

              {/* Customer specific fields */}
              {isCustomer && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                        placeholder="House #, Street, Area"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                        placeholder="Karachi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                        placeholder="Sindh"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                        placeholder="75000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Driver specific fields */}
              {isDriver && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                      <div className="relative">
                        <IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="license_number"
                          value={formData.license_number}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                          placeholder="DL-123456"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                      <div className="relative">
                        <CogIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          name="experience_years"
                          min="0"
                          value={formData.experience_years}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                      <div className="relative">
                        <TruckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="vehicle_type"
                          value={formData.vehicle_type}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                          placeholder="Car, Bike, Van, Truck"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                      <div className="relative">
                        <IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="vehicle_number"
                          value={formData.vehicle_number}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                          placeholder="ABC-123"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end space-x-3 border-t border-gray-200 pt-6">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchUserProfile();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <XMarkIcon className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <CheckIcon className="h-5 w-5" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <PencilIcon className="h-5 w-5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;