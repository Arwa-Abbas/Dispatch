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
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalUsers: number;
  totalShipments: number;
  totalDrivers: number;
  deliveredCount: number;
  pendingCount: number;
  assignedCount: number;
  inTransitCount: number;
  cancelledCount: number;
  monthlyShipments: number;
  weeklyShipments: number;
  todayShipments: number;
  deliveryRate: number;
  customersCount: number;
  activeDrivers: number;
}

interface RecentShipment {
  id: number;
  tracking_number: string;
  status: string;
  receiver_name: string;
  created_at: string;
  customer_id: number;
  driver_id?: number;
  weight: number;
  pickup_address: {
    city: string;
    state: string;
  };
  delivery_address: {
    city: string;
    state: string;
  };
}

interface RecentUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
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
    assignedCount: 0,
    inTransitCount: 0,
    cancelledCount: 0,
    monthlyShipments: 0,
    weeklyShipments: 0,
    todayShipments: 0,
    deliveryRate: 0,
    customersCount: 0,
    activeDrivers: 0,
  });
  const [recentShipments, setRecentShipments] = useState<RecentShipment[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, shipmentsRes] = await Promise.all([
        api.get('/users'),
        api.get('/shipments'),
      ]);

      const users = usersRes.data;
      const shipments = shipmentsRes.data;

      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const todayShipments = shipments.filter((s: any) => 
        new Date(s.created_at) >= today
      ).length;

      const weeklyShipments = shipments.filter((s: any) => 
        new Date(s.created_at) >= oneWeekAgo
      ).length;

      const monthlyShipments = shipments.filter((s: any) => 
        new Date(s.created_at) >= oneMonthAgo
      ).length;

      const deliveredCount = shipments.filter((s: any) => s.status === 'DELIVERED').length;
      const pendingCount = shipments.filter((s: any) => 
        s.status === 'PENDING' && !s.driver_id
      ).length;
      const assignedCount = shipments.filter((s: any) => 
        s.status === 'ASSIGNED' && s.driver_id
      ).length;
      const inTransitCount = shipments.filter((s: any) => 
        ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status)
      ).length;
      const cancelledCount = shipments.filter((s: any) => 
        ['CANCELLED', 'FAILED'].includes(s.status)
      ).length;
      
      const totalShipments = shipments.length;
      const deliveryRate = totalShipments > 0 ? (deliveredCount / totalShipments) * 100 : 0;
      
      const totalUsers = users.length;
      const totalDrivers = users.filter((u: any) => u.role === 'DRIVER').length;
      const activeDrivers = users.filter((u: any) => u.role === 'DRIVER' && u.is_active).length;
      const customersCount = users.filter((u: any) => u.role === 'CUSTOMER').length;

      setStats({
        totalUsers,
        totalShipments,
        totalDrivers,
        deliveredCount,
        pendingCount,
        assignedCount,
        inTransitCount,
        cancelledCount,
        monthlyShipments,
        weeklyShipments,
        todayShipments,
        deliveryRate,
        customersCount,
        activeDrivers,
      });

      // Get recent shipments (last 5)
      const recent = shipments
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentShipments(recent);

      // Get recent users (last 5) - EXCLUDE ADMIN USERS
      const recentUsersList = users
        .filter((u: any) => u.role !== 'ADMIN') // Filter out admin users
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentUsers(recentUsersList);

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

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-700',
      DRIVER: 'bg-blue-100 text-blue-700',
      CUSTOMER: 'bg-green-100 text-green-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats.totalUsers, 
      icon: UsersIcon, 
      color: 'bg-blue-500',
      subtext: `${stats.customersCount} customers, ${stats.activeDrivers} active drivers`
    },
    { 
      label: 'Total Shipments', 
      value: stats.totalShipments, 
      icon: ClipboardDocumentListIcon, 
      color: 'bg-purple-500',
      subtext: `${stats.monthlyShipments} this month`
    },
    { 
      label: 'Active Drivers', 
      value: stats.activeDrivers, 
      icon: UserGroupIcon, 
      color: 'bg-green-500',
      subtext: `Out of ${stats.totalDrivers} total drivers`
    },
    { 
      label: 'Delivery Rate', 
      value: `${Math.round(stats.deliveryRate)}%`, 
      icon: CheckCircleIcon, 
      color: 'bg-emerald-500',
      subtext: `${stats.deliveredCount} delivered`
    },
  ];

  const statusCards = [
    { 
      label: 'Pending', 
      value: stats.pendingCount, 
      icon: ClockIcon, 
      color: 'bg-yellow-500',
      description: 'Waiting for driver assignment'
    },
    { 
      label: 'Assigned', 
      value: stats.assignedCount, 
      icon: UserGroupIcon, 
      color: 'bg-blue-500',
      description: 'Driver assigned, not picked up'
    },
    { 
      label: 'In Transit', 
      value: stats.inTransitCount, 
      icon: TruckIcon, 
      color: 'bg-indigo-500',
      description: 'On the way to destination'
    },
    { 
      label: 'Delivered', 
      value: stats.deliveredCount, 
      icon: CheckCircleIcon, 
      color: 'bg-green-500',
      description: 'Successfully delivered'
    },
    { 
      label: 'Cancelled/Failed', 
      value: stats.cancelledCount, 
      icon: XCircleIcon, 
      color: 'bg-red-500',
      description: 'Cancelled or failed deliveries'
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
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">System overview and analytics</p>
        </div>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              timeRange === 'today' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              timeRange === 'week' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              timeRange === 'month' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Today's Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Today's Shipments</p>
              <p className="text-3xl font-bold mt-1">{stats.todayShipments}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <CalendarIcon className="h-6 w-6" />
            </div>
          </div>
          <p className="text-primary-200 text-xs mt-2">
            {stats.todayShipments > 0 ? 'New shipments today' : 'No shipments today'}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">This Week</p>
              <p className="text-3xl font-bold mt-1">{stats.weeklyShipments}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6" />
            </div>
          </div>
          <p className="text-green-200 text-xs mt-2">
            {stats.weeklyShipments > stats.monthlyShipments / 4 ? 'Above average' : 'Below average'}
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">This Month</p>
              <p className="text-3xl font-bold mt-1">{stats.monthlyShipments}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <ChartBarIcon className="h-6 w-6" />
            </div>
          </div>
          <p className="text-purple-200 text-xs mt-2">
            Total shipments this month
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Delivery Rate</p>
              <p className="text-3xl font-bold mt-1">{Math.round(stats.deliveryRate)}%</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
          </div>
          <p className="text-orange-200 text-xs mt-2">
            {stats.deliveryRate >= 80 ? 'Excellent performance' : 'Needs improvement'}
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                {stat.subtext && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statusCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{card.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-700 mt-2">{card.label}</p>
            <p className="text-xs text-gray-500 mt-1">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipment Status Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Delivered</span>
                <span className="font-medium text-gray-900">{stats.deliveredCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 rounded-full h-2.5 transition-all duration-500" 
                  style={{ width: `${stats.totalShipments > 0 ? (stats.deliveredCount / stats.totalShipments) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">In Transit</span>
                <span className="font-medium text-gray-900">{stats.inTransitCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-purple-500 rounded-full h-2.5 transition-all duration-500" 
                  style={{ width: `${stats.totalShipments > 0 ? (stats.inTransitCount / stats.totalShipments) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Assigned</span>
                <span className="font-medium text-gray-900">{stats.assignedCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 rounded-full h-2.5 transition-all duration-500" 
                  style={{ width: `${stats.totalShipments > 0 ? (stats.assignedCount / stats.totalShipments) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Pending</span>
                <span className="font-medium text-gray-900">{stats.pendingCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-yellow-500 rounded-full h-2.5 transition-all duration-500" 
                  style={{ width: `${stats.totalShipments > 0 ? (stats.pendingCount / stats.totalShipments) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Cancelled/Failed</span>
                <span className="font-medium text-gray-900">{stats.cancelledCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-red-500 rounded-full h-2.5 transition-all duration-500" 
                  style={{ width: `${stats.totalShipments > 0 ? (stats.cancelledCount / stats.totalShipments) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Total Shipments: {stats.totalShipments} | 
              Delivery Rate: {Math.round(stats.deliveryRate)}%
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-blue-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-700">{stats.totalUsers}</p>
              <div className="flex items-center text-xs text-blue-500 mt-1">
                <UserIcon className="h-3 w-3 mr-1" />
                <span>{stats.customersCount} customers</span>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <p className="text-sm text-green-600">Active Drivers</p>
              <p className="text-2xl font-bold text-green-700">{stats.activeDrivers}</p>
              <div className="flex items-center text-xs text-green-500 mt-1">
                <UserGroupIcon className="h-3 w-3 mr-1" />
                <span>Out of {stats.totalDrivers} total</span>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <p className="text-sm text-purple-600">Total Shipments</p>
              <p className="text-2xl font-bold text-purple-700">{stats.totalShipments}</p>
              <div className="flex items-center text-xs text-purple-500 mt-1">
                <CalendarIcon className="h-3 w-3 mr-1" />
                <span>{stats.monthlyShipments} this month</span>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pendingCount}</p>
              <div className="flex items-center text-xs text-yellow-500 mt-1">
                <ClockIcon className="h-3 w-3 mr-1" />
                <span>Need driver assignment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Shipments */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Shipments</h3>
            <button
              onClick={() => navigate('/dashboard/all-shipments')}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              View All →
            </button>
          </div>
          {recentShipments.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No shipments yet</p>
          ) : (
            <div className="space-y-3">
              {recentShipments.map((shipment) => (
                <div 
                  key={shipment.id} 
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/dashboard/shipment/${shipment.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 text-sm">{shipment.tracking_number}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(shipment.status)}`}>
                        {shipment.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">To: {shipment.receiver_name}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      <span>{shipment.pickup_address?.city} → {shipment.delivery_address?.city}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{shipment.weight} kg</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users - Excluding Admin */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            <button
              onClick={() => navigate('/dashboard/users')}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              View All →
            </button>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No users yet</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {user.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{user.full_name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
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

export default AdminDashboard;