import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../api/api';
import { useNavigate } from 'react-router-dom';
import { 
  TruckIcon, 
  ClipboardDocumentListIcon, 
  PlusCircleIcon, 
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface ShipmentStats {
  total: number;
  inTransit: number;
  delivered: number;
  pending: number;
  cancelled: number;
}

interface RecentShipment {
  id: number;
  tracking_number: string;
  status: string;
  created_at: string;
  receiver_name: string;
}

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ShipmentStats>({
    total: 0,
    inTransit: 0,
    delivered: 0,
    pending: 0,
    cancelled: 0,
  });
  const [recentShipments, setRecentShipments] = useState<RecentShipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/shipments');
      const shipments = response.data;
      
      // Calculate stats
      const stats = {
        total: shipments.length,
        inTransit: shipments.filter((s: any) => 
          ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status)
        ).length,
        delivered: shipments.filter((s: any) => s.status === 'DELIVERED').length,
        pending: shipments.filter((s: any) => 
          ['PENDING', 'ASSIGNED'].includes(s.status)
        ).length,
        cancelled: shipments.filter((s: any) => 
          ['CANCELLED', 'FAILED'].includes(s.status)
        ).length,
      };
      setStats(stats);
      
      // Get recent shipments (last 5)
      const recent = shipments
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentShipments(recent);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  const statCards = [
    { label: 'Total Shipments', value: stats.total, icon: TruckIcon, color: 'bg-blue-500' },
    { label: 'In Transit', value: stats.inTransit, icon: ClockIcon, color: 'bg-purple-500' },
    { label: 'Delivered', value: stats.delivered, icon: CheckCircleIcon, color: 'bg-green-500' },
    { label: 'Pending', value: stats.pending, icon: ClipboardDocumentListIcon, color: 'bg-yellow-500' },
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
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name}!</h1>
        <p className="text-gray-600">Here's what's happening with your shipments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard/create-shipment')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>Create New Shipment</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/my-shipments')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ClipboardDocumentListIcon className="h-5 w-5" />
              <span>View All Shipments</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
          {recentShipments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600">No shipments yet</p>
              <button
                onClick={() => navigate('/dashboard/create-shipment')}
                className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Create your first shipment →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentShipments.map((shipment) => (
                <div 
                  key={shipment.id} 
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 px-2 rounded-lg transition-colors"
                  onClick={() => navigate(`/dashboard/shipment/${shipment.id}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{shipment.tracking_number}</p>
                    <p className="text-xs text-gray-600">To: {shipment.receiver_name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shipment.status)}`}>
                      {shipment.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;