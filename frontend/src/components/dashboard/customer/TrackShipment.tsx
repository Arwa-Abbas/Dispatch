import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/api';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  TruckIcon, 
  UserIcon, 
  MapPinIcon, 
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PhoneIcon,
  IdentificationIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface ShipmentDetail {
  id: number;
  tracking_number: string;
  status: string;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  pickup_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
  };
  delivery_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
  };
  weight: number;
  package_type: string;
  created_at: string;
  updated_at: string;
  delivered_at?: string;
  driver_id?: number;
}

interface DriverDetails {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  vehicle_number: string;
  license_number: string;
  experience_years: number;
  rating: number;
  total_deliveries: number;
  status: string;
}

const TrackShipment: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [driverDetails, setDriverDetails] = useState<DriverDetails | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTrackingNumber = trackingNumber.trim().toUpperCase();
    if (!cleanTrackingNumber) {
      toast.error('Please enter a tracking number');
      return;
    }

    setLoading(true);
    setError('');
    setShipment(null);
    setDriverDetails(null);

    try {
      // Get shipment by tracking number
      const response = await api.get(`/shipments/track/${cleanTrackingNumber}`);
      
      if (response.data) {
        setShipment(response.data);
        
        // Fetch driver details if driver_id exists
        if (response.data.driver_id) {
          try {
            console.log('Fetching driver details for ID:', response.data.driver_id);
            const driverResponse = await api.get(`/driver/profile/${response.data.driver_id}`);
            console.log('Driver details:', driverResponse.data);
            setDriverDetails(driverResponse.data);
          } catch (err: any) {
            console.error('Error fetching driver details:', err);
            // Don't show error to user, just don't display driver info
          }
        }
        toast.success('Shipment found!');
      }
    } catch (error: any) {
      console.error('Error tracking shipment:', error);
      if (error.response?.status === 404) {
        setError('Shipment not found. Please check the tracking number and try again.');
      } else {
        setError(error.detail || 'Failed to track shipment. Please try again.');
      }
      toast.error(error.detail || 'Shipment not found');
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
        return <CheckCircleIcon className="h-8 w-8 text-green-600" />;
      case 'FAILED':
        return <XCircleIcon className="h-8 w-8 text-red-600" />;
      case 'PENDING':
        return <ClockIcon className="h-8 w-8 text-yellow-600" />;
      default:
        return <TruckIcon className="h-8 w-8 text-blue-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'Delivered';
      case 'FAILED':
        return 'Delivery Failed';
      case 'ASSIGNED':
        return 'Waiting for Pickup';
      case 'PICKED_UP':
        return 'Picked Up';
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      case 'PENDING':
        return 'Pending';
      default:
        return status.replace('_', ' ');
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = steps.indexOf(status);
    return steps.map((step, index) => ({
      step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const getDriverStatusText = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'Delivery Completed';
      case 'FAILED':
        return 'Delivery Failed';
      case 'ASSIGNED':
        return 'Waiting for Pickup';
      case 'PICKED_UP':
        return 'Picked Up';
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      default:
        return 'On the Way';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Track Shipment</h1>
        <p className="text-gray-600">Enter your tracking number to check the status</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Number
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                placeholder="Enter tracking number (e.g., DSP-ABC12345)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span>{loading ? 'Searching...' : 'Track'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Example: DSP-ABC12345
            </p>
          </div>
        </form>

        {/* Quick tip */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            You can find your tracking number in the shipment confirmation email or in your 
            <button 
              onClick={() => navigate('/dashboard/my-shipments')}
              className="text-primary-600 hover:text-primary-700 font-medium ml-1"
            >
              My Shipments
            </button>
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <XCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Shipment Not Found</p>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => navigate('/dashboard/my-shipments')}
                className="mt-2 text-sm text-red-700 font-medium hover:text-red-800 underline"
              >
                View all your shipments →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipment Details */}
      {shipment && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                {getStatusIcon(shipment.status)}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{shipment.tracking_number}</h2>
                  <p className="text-gray-600">To: {shipment.receiver_name}</p>
                </div>
              </div>
              <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(shipment.status)}`}>
                {getStatusText(shipment.status)}
              </span>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipment Progress</h3>
            <div className="flex items-center justify-between">
              {getStatusSteps(shipment.status).map((step, index) => (
                <div key={step.step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center ${
                      step.current ? 'text-primary-600 font-medium' : 'text-gray-500'
                    }`}>
                      {step.step.replace('_', ' ')}
                    </span>
                  </div>
                  {index < getStatusSteps(shipment.status).length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            {shipment.delivered_at && (
              <p className="text-sm text-green-600 mt-4 text-center">
                Delivered on {new Date(shipment.delivered_at).toLocaleString()}
              </p>
            )}
          </div>

          {/* Shipment Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sender & Receiver */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipment Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Sender</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{shipment.sender_name}</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{shipment.sender_phone}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <span className="text-gray-900">
                        {shipment.pickup_address?.street}<br />
                        {shipment.pickup_address?.city}, {shipment.pickup_address?.state}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Receiver</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{shipment.receiver_name}</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{shipment.receiver_phone}</span>
                    </div>
                    <div className="flex items-start">
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

            {/* Package Info & Driver */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Information</h3>
                <div className="grid grid-cols-2 gap-4">
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
                    <p className="font-semibold text-gray-900">{getStatusText(shipment.status)}</p>
                  </div>
                </div>
              </div>

              {/* Driver Info - if assigned */}
              {shipment.driver_id && driverDetails && (
                <div className="bg-blue-50 rounded-xl shadow-sm p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TruckIcon className="h-5 w-5 text-blue-600 mr-2" />
                    Driver Information
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Driver Name */}
                    <div className="flex items-center space-x-2 text-sm">
                      <UserIcon className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-gray-900">{driverDetails.full_name}</span>
                    </div>
                    
                    {/* Driver Phone */}
                    <div className="flex items-center space-x-2 text-sm">
                      <PhoneIcon className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-700">{driverDetails.phone}</span>
                    </div>
                    
                    {/* Vehicle Info */}
                    <div className="flex items-center space-x-2 text-sm">
                      <TruckIcon className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-700">
                        {driverDetails.vehicle_type} • {driverDetails.vehicle_number}
                      </span>
                    </div>
                    
                    {/* License Number */}
                    <div className="flex items-center space-x-2 text-sm">
                      <IdentificationIcon className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-700">License: {driverDetails.license_number}</span>
                    </div>
                    
                    {/* Experience */}
                    <div className="flex items-center space-x-2 text-sm">
                      <CogIcon className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-700">{driverDetails.experience_years} years experience</span>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        shipment.status === 'DELIVERED' 
                          ? 'bg-green-100 text-green-700' 
                          : shipment.status === 'FAILED'
                            ? 'bg-red-100 text-red-700'
                            : shipment.status === 'ASSIGNED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                      }`}>
                        {shipment.status === 'DELIVERED' 
                          ? 'Delivery Completed' 
                          : shipment.status === 'FAILED'
                            ? 'Delivery Failed'
                            : shipment.status === 'ASSIGNED'
                              ? 'Waiting for Pickup'
                              : 'On the Way'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* No Driver Assigned */}
              {shipment.driver_id && !driverDetails && (
                <div className="bg-yellow-50 rounded-xl shadow-sm p-6 border border-yellow-100">
                  <p className="text-sm text-yellow-700">
                    Driver is being assigned to your shipment. You'll see driver details soon.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/dashboard/my-shipments')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View All Shipments
            </button>
            <button
              onClick={() => {
                setShipment(null);
                setDriverDetails(null);
                setTrackingNumber('');
                setError('');
              }}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Track Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackShipment;