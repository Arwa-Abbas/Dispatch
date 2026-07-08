import React, { useState, useEffect } from 'react';
import { api } from '../../../api/api';
import toast from 'react-hot-toast';
import {
  UserGroupIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  UserIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Shipment {
  id: number;
  tracking_number: string;
  status: string;
  receiver_name: string;
  pickup_address: any;
  delivery_address: any;
  weight: number;
  created_at: string;
}

interface Driver {
  id: number;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  vehicle_type?: string;
  vehicle_number?: string;
  is_active: boolean;
}

const AssignDriver: React.FC = () => {
  const [pendingShipments, setPendingShipments] = useState<Shipment[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<number | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching pending shipments and drivers...');
      
      // Fetch pending shipments using the dedicated endpoint
      const [shipmentsRes, usersRes] = await Promise.all([
        api.get('/shipments/pending'),
        api.get('/users'),
      ]);
      
      console.log('Pending shipments:', shipmentsRes.data);
      console.log('All users:', usersRes.data);
      
      // Set pending shipments
      setPendingShipments(shipmentsRes.data);
      
      // Filter drivers (only active drivers)
      const drivers = usersRes.data.filter(
        (u: Driver) => u.role === 'DRIVER' && u.is_active === true
      );
      setAvailableDrivers(drivers);
      
      console.log('Available drivers:', drivers);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(error.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedShipment || !selectedDriver) {
      toast.error('Please select both a shipment and a driver');
      return;
    }

    setAssigning(true);
    try {
      const response = await api.put(`/shipments/${selectedShipment}/assign?driver_id=${selectedDriver}`);
      console.log('Assign response:', response.data);
      
      toast.success('Driver assigned successfully!');
      setSelectedShipment(null);
      setSelectedDriver(null);
      
      // Refresh the data
      await fetchData();
    } catch (error: any) {
      console.error('Error assigning driver:', error);
      toast.error(error.response?.data?.detail || 'Failed to assign driver');
    } finally {
      setAssigning(false);
    }
  };

  const filteredDrivers = availableDrivers.filter((driver) =>
    driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      ASSIGNED: 'bg-blue-100 text-blue-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assign Driver</h1>
          <p className="text-gray-600">Assign drivers to pending shipments</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Shipments */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TruckIcon className="h-5 w-5 mr-2 text-primary-600" />
            Pending Shipments ({pendingShipments.length})
          </h3>
          {pendingShipments.length === 0 ? (
            <div className="text-center py-8">
              <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No pending shipments</p>
              <p className="text-sm text-gray-500 mt-1">All shipments have been assigned</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedShipment === shipment.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedShipment(shipment.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{shipment.tracking_number}</p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(shipment.status)}`}>
                          {shipment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">To: {shipment.receiver_name}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span>{shipment.weight} kg</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(shipment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {selectedShipment === shipment.id && (
                      <CheckIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Drivers */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2 text-primary-600" />
            Available Drivers ({availableDrivers.length})
          </h3>
          
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {filteredDrivers.length === 0 ? (
            <div className="text-center py-8">
              <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">
                {searchTerm ? 'No drivers match your search' : 'No available drivers'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDriver === driver.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedDriver(driver.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{driver.full_name}</p>
                          <p className="text-sm text-gray-600">{driver.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                        {driver.vehicle_type && (
                          <span>{driver.vehicle_type}</span>
                        )}
                        {driver.vehicle_number && (
                          <span>#{driver.vehicle_number}</span>
                        )}
                      </div>
                    </div>
                    {selectedDriver === driver.id && (
                      <CheckIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assign Button */}
      <div className="flex justify-between items-center">
        <div>
          {selectedShipment && selectedDriver && (
            <p className="text-sm text-green-600">
              Ready to assign{' '}
              <strong>{pendingShipments.find(s => s.id === selectedShipment)?.tracking_number}</strong> to{' '}
              <strong>{availableDrivers.find(d => d.id === selectedDriver)?.full_name}</strong>
            </p>
          )}
        </div>
        <button
          onClick={handleAssignDriver}
          disabled={!selectedShipment || !selectedDriver || assigning}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <UserGroupIcon className="h-5 w-5" />
          <span>{assigning ? 'Assigning...' : 'Assign Driver'}</span>
        </button>
      </div>
    </div>
  );
};

export default AssignDriver;