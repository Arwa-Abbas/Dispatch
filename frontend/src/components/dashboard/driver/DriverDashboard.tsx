import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../api/api';
import { useNavigate } from 'react-router-dom';
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Delivery {
  id: number;
  tracking_number: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  receiver_name: string;
  receiver_phone: string;
  weight: number;
  created_at: string;
}

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/shipments');
      // Filter only assigned deliveries for this driver
      const assignedDeliveries = response.data.filter(
        (d: any) => d.driver_id === user?.id
      );
      setDeliveries(assignedDeliveries);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      ASSIGNED: 'bg-blue-100 text-blue-700',
      PICKED_UP: 'bg-indigo-100 text-indigo-700',
      IN_TRANSIT: 'bg-purple-100 text-purple-700',
      OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const stats = [
    { 
      label: 'Total Deliveries', 
      value: deliveries.length, 
      icon: TruckIcon, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'In Progress', 
      value: deliveries.filter(d => !['DELIVERED', 'CANCELLED', 'FAILED'].includes(d.status)).length, 
      icon: ClockIcon, 
      color: 'bg-yellow-500' 
    },
    { 
      label: 'Completed', 
      value: deliveries.filter(d => d.status === 'DELIVERED').length, 
      icon: CheckCircleIcon, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Pending Pickup', 
      value: deliveries.filter(d => d.status === 'ASSIGNED').length, 
      icon: ExclamationCircleIcon, 
      color: 'bg-red-500' 
    },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name}! 🚚</h1>
        <p className="text-gray-600">Here's your delivery overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current Deliveries */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Deliveries</h2>
        {deliveries.filter(d => !['DELIVERED', 'CANCELLED', 'FAILED'].includes(d.status)).length === 0 ? (
          <div className="text-center py-8">
            <TruckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No active deliveries</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries
              .filter(d => !['DELIVERED', 'CANCELLED', 'FAILED'].includes(d.status))
              .map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/dashboard/delivery/${delivery.id}`)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-900">{delivery.tracking_number}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                        {delivery.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>{delivery.pickup_address} → {delivery.delivery_address}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span>To: {delivery.receiver_name}</span>
                      <span className="mx-2">•</span>
                      <span>{delivery.weight} kg</span>
                    </div>
                  </div>
                  <button 
                    className="mt-2 sm:mt-0 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/delivery/${delivery.id}`);
                    }}
                  >
                    Update Status
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/dashboard/assigned-shipments')}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <ArrowPathIcon className="h-5 w-5 text-primary-600" />
          <span>View All Assignments</span>
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <ArrowPathIcon className="h-5 w-5 text-primary-600" />
          <span>Refresh Status</span>
        </button>
      </div>
    </div>
  );
};

export default DriverDashboard;