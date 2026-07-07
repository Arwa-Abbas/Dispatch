import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/api';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, TruckIcon } from '@heroicons/react/24/outline';

const TrackShipment: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/shipments/track/${trackingNumber}`);
      if (response.data) {
        navigate(`/dashboard/shipment/${response.data.id}`);
      }
    } catch (error: any) {
      toast.error(error.detail || 'Shipment not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Track Shipment</h1>
        <p className="text-gray-600">Enter your tracking number to check the status</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number (e.g., DSP-ABC12345)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Example: DSP-ABC12345
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span>{loading ? 'Searching...' : 'Track Shipment'}</span>
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600">
            Don't have a tracking number?{' '}
            <button
              onClick={() => navigate('/dashboard/my-shipments')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all your shipments
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackShipment;