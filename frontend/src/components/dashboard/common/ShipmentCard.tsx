import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TruckIcon, MapPinIcon, EyeIcon } from '@heroicons/react/24/outline';

interface ShipmentCardProps {
  shipment: {
    id: number;
    tracking_number: string;
    status: string;
    receiver_name: string;
    pickup_address: string;
    delivery_address: string;
    weight: number;
    package_type: string;
    created_at: string;
  };
}

const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment }) => {
  const navigate = useNavigate();

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

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <TruckIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{shipment.tracking_number}</p>
            <p className="text-sm text-gray-600">To: {shipment.receiver_name}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shipment.status)}`}>
          {shipment.status.replace('_', ' ')}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div className="flex items-start">
          <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-gray-600">Pickup:</span>
            <span className="ml-1 text-gray-900 truncate">{shipment.pickup_address}</span>
          </div>
        </div>
        <div className="flex items-start">
          <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-gray-600">Delivery:</span>
            <span className="ml-1 text-gray-900 truncate">{shipment.delivery_address}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600">Weight: <span className="font-medium text-gray-900">{shipment.weight} kg</span></span>
          <span className="text-gray-600">Type: <span className="font-medium text-gray-900">{shipment.package_type}</span></span>
          <span className="text-gray-600">Created: <span className="font-medium text-gray-900">{new Date(shipment.created_at).toLocaleDateString()}</span></span>
        </div>
        <button
          onClick={() => navigate(`/dashboard/shipment/${shipment.id}`)}
          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
          title="View Details"
        >
          <EyeIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ShipmentCard;