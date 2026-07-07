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
import toast from 'react-hot-toast';

interface Delivery {
  id: number;
  tracking_number: string;
  status: string;
  pickup_address: {
    street: string;
    city: string;
    state: string;
  };
  delivery_address: {
    street: string;
    city: string;
    state: string;
  };
  receiver_name: string;
  receiver_phone: string;
  weight: number;
  created_at: string;
  sender_name: string;
  sender_phone: string;
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
      setLoading(true);
      console.log('Fetching driver shipments...');
      const response = await api.get('/driver/shipments');
      console.log('Driver shipments response:', response.data);
      setDeliveries(response.data);
    } catch (error: any) {
      console.error('Failed to fetch deliveries:', error);
      toast.error(error.detail || 'Failed to load deliveries');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'CANCELLED':
      case 'FAILED':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-600" />;
      case 'ASSIGNED':
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <TruckIcon className="h-5 w-5 text-purple-600" />;
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = steps.indexOf(status);
    return steps.map((step, index) => ({
      step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const activeDeliveries = deliveries.filter(d => !['DELIVERED', 'CANCELLED', 'FAILED'].includes(d.status));
  const completedDeliveries = deliveries.filter(d => d.status === 'DELIVERED');

  const stats = [
    { 
      label: 'Total Deliveries', 
      value: deliveries.length, 
      icon: TruckIcon, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'In Progress', 
      value: activeDeliveries.length, 
      icon: ClockIcon, 
      color: 'bg-yellow-500' 
    },
    { 
      label: 'Completed', 
      value: completedDeliveries.length, 
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

      {/* Active Deliveries */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Deliveries ({activeDeliveries.length})
          </h2>
          <button
            onClick={fetchDeliveries}
            className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="text-center py-12">
            <TruckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No active deliveries</p>
            <p className="text-sm text-gray-500 mt-1">Check back later for new assignments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/dashboard/delivery/${delivery.id}`)}
              >
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-50 rounded-lg">
                        {getStatusIcon(delivery.status)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">{delivery.tracking_number}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                            {delivery.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">To: {delivery.receiver_name}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-gray-600">{delivery.weight} kg</span>
                      <button 
                        className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/delivery/${delivery.id}`);
                        }}
                      >
                        Update Status
                      </button>
                    </div>
                  </div>

                  {/* Status Progress Bar */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      {getStatusSteps(delivery.status).map((step, index) => (
                        <div key={step.step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                              {step.completed ? (
                                <CheckCircleIcon className="h-5 w-5" />
                              ) : (
                                <span className="text-xs">{index + 1}</span>
                              )}
                            </div>
                            <span className={`text-xs mt-1 ${
                              step.current ? 'text-primary-600 font-medium' : 'text-gray-500'
                            }`}>
                              {step.step.replace('_', ' ')}
                            </span>
                          </div>
                          {index < getStatusSteps(delivery.status).length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 ${
                              step.completed ? 'bg-green-500' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Deliveries Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Completed Deliveries</h3>
            <p className="text-sm text-gray-600">Total: {completedDeliveries.length}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/delivery-history')}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View All →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;