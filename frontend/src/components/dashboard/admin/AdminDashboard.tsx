import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../api/api';
import { useNavigate } from 'react-router-dom';
import {
  UsersIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalUsers: number;
  totalShipments: number;
  totalDrivers: number;
  deliveredCount: number;
  pendingCount: number;
  inTransitCount: number;
  cancelledCount: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalShipments: 0,
    totalDrivers: 0,
    deliveredCount: 0,
    pendingCount: 0,
    inTransitCount: 0,
    cancelledCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentShipments, setRecentShipments] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, shipmentsRes] = await Promise.all([
        api.get('/users'),
        api.get('/shipments'),
      ]);

      const users = usersRes.data;
      const shipments = shipmentsRes.data;

      setStats({
        totalUsers: users.length,
        totalShipments: shipments.length,
        totalDrivers: users.filter((u: any) => u.role === 'DRIVER').length,
        deliveredCount: shipments.filter((s: any) => s.status === 'DELIVERED').length,
        pendingCount: shipments.filter((s: any) => 
          ['PENDING', 'ASSIGNED'].includes(s.status)
        ).length,
        inTransitCount: shipments.filter((s: any) => 
          ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status)
        ).length,
        cancelledCount: shipments.filter((s: any) => 
          ['CANCELLED', 'FAILED'].includes(s.status)
        ).length,
      });

      // Get recent shipments
      const recent = shipments
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentShipments(recent);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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
    { label: 'Total Users', value: stats.totalUsers, icon: UsersIcon, color: 'bg-blue-500' },
    { label: 'Total Shipments', value: stats.totalShipments, icon: ClipboardDocumentListIcon, color: 'bg-purple-500' },
    { label: 'Active Drivers', value: stats.totalDrivers, icon: UserGroupIcon, color: 'bg-green-500' },
    { label: 'Delivered', value: stats.deliveredCount, icon: CheckCircleIcon, color: 'bg-green-600' },
    { label: 'Pending', value: stats.pendingCount, icon: ClockIcon, color: 'bg-yellow-500' },
    { label: 'In Transit', value: stats.inTransitCount, icon: TruckIcon, color: 'bg-indigo-500' },
    { label: 'Cancelled/Failed', value: stats.cancelledCount, icon: XCircleIcon, color: 'bg-red-500' },
  ];

  const quickActions = [
    { label: 'Manage Users', path: '/dashboard/users', icon: UsersIcon, color: 'text-blue-600' },
    { label: 'View All Shipments', path: '/dashboard/all-shipments', icon: ClipboardDocumentListIcon, color: 'text-purple-600' },
    { label: 'Assign Driver', path: '/dashboard/assign-driver', icon: UserGroupIcon, color: 'text-green-600' },
    { label: 'View Analytics', path: '/dashboard/admin', icon: ChartBarIcon, color: 'text-indigo-600' },
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
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name}! 📊</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
            >
              <action.icon className={`h-6 w-6 ${action.color}`} />
              <span className="font-medium text-gray-900">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Shipments</h3>
          {recentShipments.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No shipments yet</p>
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
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shipment.status)}`}>
                    {shipment.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate('/dashboard/all-shipments')}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View All →
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">System Status</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users</span>
              <span className="font-medium text-gray-900">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Drivers</span>
              <span className="font-medium text-gray-900">{stats.totalDrivers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Deliveries</span>
              <span className="font-medium text-gray-900">{stats.totalShipments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Delivery Rate</span>
              <span className="font-medium text-gray-900">
                {stats.totalShipments > 0 
                  ? `${Math.round((stats.deliveredCount / stats.totalShipments) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;