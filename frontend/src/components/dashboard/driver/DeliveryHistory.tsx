import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/api';
import toast from 'react-hot-toast';
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface Delivery {
  id: number;
  tracking_number: string;
  status: string;
  receiver_name: string;
  pickup_address: string;
  delivery_address: string;
  weight: number;
  delivered_at: string;
  created_at: string;
}

const DeliveryHistory: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeliveryHistory();
  }, []);

  const fetchDeliveryHistory = async () => {
    try {
      const response = await api.get('/shipments');
      // Filter only delivered shipments for this driver
      const delivered = response.data.filter(
        (s: any) => s.status === 'DELIVERED' || s.status === 'CANCELLED' || s.status === 'FAILED'
      );
      setDeliveries(delivered);
    } catch (error) {
      toast.error('Failed to load delivery history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'CANCELLED':
      case 'FAILED':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Delivery History</h1>
        <p className="text-gray-600">View all your completed deliveries</p>
      </div>

      {deliveries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <TruckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No delivery history</h3>
          <p className="text-gray-600 mt-2">You haven't completed any deliveries yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {deliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/dashboard/delivery/${delivery.id}`)}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    {getStatusIcon(delivery.status)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{delivery.tracking_number}</p>
                    <p className="text-sm text-gray-600">To: {delivery.receiver_name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                    {delivery.status}
                  </span>
                  <span className="text-sm text-gray-600">
                    {delivery.delivered_at 
                      ? new Date(delivery.delivered_at).toLocaleDateString()
                      : new Date(delivery.created_at).toLocaleDateString()
                    }
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/delivery/${delivery.id}`);
                    }}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Weight:</span>
                  <span className="ml-2 font-medium text-gray-900">{delivery.weight} kg</span>
                </div>
                <div>
                  <span className="text-gray-600">Pickup:</span>
                  <span className="ml-2 font-medium text-gray-900 truncate">{delivery.pickup_address}</span>
                </div>
                <div>
                  <span className="text-gray-600">Delivery:</span>
                  <span className="ml-2 font-medium text-gray-900 truncate">{delivery.delivery_address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryHistory;