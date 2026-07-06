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

const DeliveryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shipment, setShipment] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    if (id) {
      fetchDeliveryDetails(parseInt(id));
    }
  }, [id]);

  const fetchDeliveryDetails = async (shipmentId: number) => {
    try {
      const [shipmentRes, historyRes] = await Promise.all([
        api.get(`/shipments/${shipmentId}`),
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

  const handleStatusUpdate = async (newStatus: string) => {
    if (!shipment) return;
    
    try {
      setUpdating(true);
      await api.put(`/shipments/${shipment.id}/status?status=${newStatus}&remarks=${statusNote || 'Status updated'}`);
      toast.success('Status updated successfully!');
      fetchDeliveryDetails(shipment.id);
      setStatusNote('');
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

  const statusOptions = [
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'FAILED', label: 'Delivery Failed' },
  ];

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
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/assigned-shipments')}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Assigned Shipments
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <TruckIcon className="h-8 w-8 text-primary-600" />
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
        {/* Delivery Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sender & Receiver */}
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
                      {shipment.pickup_address}<br />
                      {shipment.pickup_city}, {shipment.pickup_state}
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
                      {shipment.delivery_address}<br />
                      {shipment.delivery_city}, {shipment.delivery_state}
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
          </div>
        </div>

        {/* Status Update */}
        <div className="lg:col-span-1 space-y-6">
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
                    onChange={(e) => handleStatusUpdate(e.target.value)}
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
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add a note about this update..."
                    disabled={updating}
                  />
                </div>
                {updating && (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-medium text-gray-900">{new Date(shipment.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Update</span>
                <span className="font-medium text-gray-900">{new Date(shipment.updated_at).toLocaleDateString()}</span>
              </div>
              {shipment.delivered_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivered</span>
                  <span className="font-medium text-gray-900">{new Date(shipment.delivered_at).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status Updates</span>
                <span className="font-medium text-gray-900">{history.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetails;