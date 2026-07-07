import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/api';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface Shipment {
  id: number;
  tracking_number: string;
  status: string;
  customer_id: number;
  driver_id: number;
  receiver_name: string;
  pickup_address: any;
  delivery_address: any;
  weight: number;
  package_type: string;
  created_at: string;
  updated_at: string;
}

const AllShipments: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllShipments();
  }, []);

  const fetchAllShipments = async () => {
    try {
      const response = await api.get('/shipments');
      setShipments(response.data);
    } catch (error) {
      toast.error('Failed to load shipments');
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
      FAILED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'FAILED':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <TruckIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch = 
      shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.receiver_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || shipment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusOptions = ['ALL', 'PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'];

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
        <h1 className="text-2xl font-bold text-gray-900">All Shipments</h1>
        <p className="text-gray-600">View and manage all shipments in the system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{shipments.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {shipments.filter(s => s.status === 'PENDING' || s.status === 'ASSIGNED').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">In Transit</p>
          <p className="text-2xl font-bold text-purple-600">
            {shipments.filter(s => ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status)).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Delivered</p>
          <p className="text-2xl font-bold text-green-600">
            {shipments.filter(s => s.status === 'DELIVERED').length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tracking number or receiver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status === 'ALL' ? 'All Status' : status.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredShipments.length === 0 ? (
          <div className="text-center py-12">
            <TruckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No shipments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(shipment.status)}
                        <span className="font-medium text-gray-900">{shipment.tracking_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{shipment.receiver_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shipment.status)}`}>
                        {shipment.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {shipment.driver_id ? `Driver #${shipment.driver_id}` : (
                        <span className="text-yellow-600">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{shipment.weight} kg</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/dashboard/shipment/${shipment.id}`)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllShipments;