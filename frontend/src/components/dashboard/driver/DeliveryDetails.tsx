import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../api/api';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  TruckIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface ShipmentDetail {
  id: number;
  tracking_number: string;
  status: string;
  sender_name: string;
  sender_phone: string;
  pickup_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
  };
  receiver_name: string;
  receiver_phone: string;
  delivery_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
  };
  weight: number;
  package_type: string;
  description: string;
  notes: string;
  created_at: string;
  updated_at: string;
  delivered_at?: string;
}

interface HistoryEntry {
  id: number;
  status: string;
  timestamp: string;
  remarks: string;
  updated_by: number;
}

const DeliveryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const statusOptions = [
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'FAILED', label: 'Delivery Failed' },
  ];

  useEffect(() => {
    if (id) {
      fetchDeliveryDetails(parseInt(id));
    }
  }, [id]);

  const fetchDeliveryDetails = async (shipmentId: number) => {
    try {
      const [shipmentRes, historyRes] = await Promise.all([
        api.get(`/driver/shipments/${shipmentId}`),
        api.get(`/shipments/${shipmentId}/history`),
      ]);
      setShipment(shipmentRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      toast.error('Failed to load delivery details');
      navigate('/dashboard/assigned-shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    setUpdating(true);
    try {
      await api.put(
        `/driver/shipments/${shipment?.id}/status?status=${selectedStatus}&remarks=${statusNote || 'Status updated'}`
      );
      toast.success('Status updated successfully!');
      setSelectedStatus('');
      setStatusNote('');
      fetchDeliveryDetails(shipment!.id);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdating(false);
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
        return <CheckCircleIcon className="h-8 w-8 text-green-600" />;
      case 'CANCELLED':
      case 'FAILED':
        return <XCircleIcon className="h-8 w-8 text-red-600" />;
      case 'ASSIGNED':
        return <ClockIcon className="h-8 w-8 text-blue-600" />;
      default:
        return <TruckIcon className="h-8 w-8 text-purple-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!shipment) {
    return <div>Delivery not found</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/dashboard/assigned-shipments')}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to My Deliveries
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            {getStatusIcon(shipment.status)}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{shipment.tracking_number}</h1>
              <p className="text-gray-600">To: {shipment.receiver_name}</p>
            </div>
          </div>
          <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(shipment.status)}`}>
            {shipment.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Pickup</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{shipment.sender_name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{shipment.sender_phone}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <span className="text-gray-900">
                      {shipment.pickup_address?.street}<br />
                      {shipment.pickup_address?.city}, {shipment.pickup_address?.state}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Delivery</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{shipment.receiver_name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{shipment.receiver_phone}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <span className="text-gray-900">
                      {shipment.delivery_address?.street}<br />
                      {shipment.delivery_address?.city}, {shipment.delivery_address?.state}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Package Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Weight</p>
                <p className="font-semibold text-gray-900">{shipment.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Package Type</p>
                <p className="font-semibold text-gray-900">{shipment.package_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-semibold text-gray-900">{new Date(shipment.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-gray-900">{shipment.status.replace('_', ' ')}</p>
              </div>
            </div>
            {shipment.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-900 mt-1">{shipment.description}</p>
              </div>
            )}
            {shipment.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Special Instructions</p>
                <p className="text-gray-900 mt-1">{shipment.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Status Update */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
            {shipment.status === 'DELIVERED' || shipment.status === 'CANCELLED' ? (
              <div className="text-center py-4">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600">This delivery is completed</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={updating}
                  >
                    <option value="">Select status...</option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add a note about this update..."
                    disabled={updating}
                  />
                </div>
                <button
                  onClick={handleStatusUpdate}
                  disabled={!selectedStatus || updating}
                  className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            )}
          </div>

          {/* Tracking History */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking History</h3>
            {history.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No history yet</p>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {history.map((entry, index) => (
                  <div key={entry.id} className="relative pl-6 pb-4 last:pb-0">
                    {index < history.length - 1 && (
                      <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                    <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 ${
                      entry.status === 'DELIVERED' ? 'bg-green-500 border-green-500' :
                      entry.status === 'CANCELLED' || entry.status === 'FAILED' ? 'bg-red-500 border-red-500' :
                      'bg-blue-500 border-blue-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {entry.status.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      {entry.remarks && (
                        <p className="text-xs text-gray-500 mt-1">{entry.remarks}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetails;