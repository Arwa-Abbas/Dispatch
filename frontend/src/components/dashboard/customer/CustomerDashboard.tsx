import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { TruckIcon, ClipboardDocumentListIcon, PlusCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Shipments', value: '12', icon: TruckIcon, color: 'bg-blue-500' },
    { label: 'In Transit', value: '3', icon: CheckCircleIcon, color: 'bg-yellow-500' },
    { label: 'Delivered', value: '8', icon: CheckCircleIcon, color: 'bg-green-500' },
    { label: 'Pending', value: '1', icon: ClipboardDocumentListIcon, color: 'bg-purple-500' },
  ];

  const recentShipments = [
    { id: 1, tracking: 'DSP-ABC123', status: 'In Transit', date: '2024-01-15' },
    { id: 2, tracking: 'DSP-DEF456', status: 'Delivered', date: '2024-01-14' },
    { id: 3, tracking: 'DSP-GHI789', status: 'Pending', date: '2024-01-13' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name}! 👋</h1>
        <p className="text-gray-600">Here's what's happening with your shipments</p>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <PlusCircleIcon className="h-5 w-5" />
              <span>Create New Shipment</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <ClipboardDocumentListIcon className="h-5 w-5" />
              <span>Track Shipment</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
          <div className="space-y-3">
            {recentShipments.map((shipment) => (
              <div key={shipment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{shipment.tracking}</p>
                  <p className="text-xs text-gray-600">{shipment.date}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  shipment.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                  shipment.status === 'In Transit' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {shipment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;