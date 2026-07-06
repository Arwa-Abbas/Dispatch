import React, { useState, useEffect } from 'react';
import { api } from '../../../api/api';
import toast from 'react-hot-toast';
import {
  UserGroupIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Shipment {
  id: number;
  tracking_number: string;
  status: string;
  receiver_name: string;
  pickup_address: string;
  delivery_address: string;
  weight: number;
}

interface Driver {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  vehicle_number: string;
  status: string;
}

const AssignDriver: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<number | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shipmentsRes, driversRes] = await Promise.all([
        api.get('/shipments'),
        api.get('/users?role=DRIVER'),
      ]);
      
      // Filter pending shipments
      const pendingShipments = shipmentsRes.data.filter(
        (s: Shipment) => s.status === 'PENDING'
      );
      setShipments(pendingShipments);
      
      // Filter drivers
      const availableDrivers = driversRes.data.filter(
        (d: Driver) => d.role === 'DRIVER' && d.is_active
      );
      setDrivers(availableDrivers);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedShipment || !selectedDriver) {
      toast.error('Please select both a shipment and a driver');
      return;
    }

    try {
      await api.put(`/shipments/${selectedShipment}/assign`, null, {
        params: { driver_id: selectedDriver }
      });
      toast.success('Driver assigned successfully!');
      setSelectedShipment(null);
      setSelectedDriver(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign driver');
    }
  };

  const filteredDrivers = drivers.filter((driver) =>
    driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Assign Driver</h1>
        <p className="text-gray-600">Assign drivers to pending shipments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Shipments */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Shipments</h3>
          {shipments.length === 0 ? (
            <div className="text-center py-8">
              <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No pending shipments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shipments.map((shipment) => (
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
                    <div>
                      <p className="font-medium text-gray-900">{shipment.tracking_number}</p>
                      <p className="text-sm text-gray-600">To: {shipment.receiver_name}</p>
                      <p className="text-sm text-gray-600">{shipment.weight} kg</p>
                    </div>
                    {selectedShipment === shipment.id && (
                      <CheckIcon className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Drivers */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Drivers</h3>
          
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
              <p className="text-gray-600">No available drivers</p>
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
                    <div>
                      <p className="font-medium text-gray-900">{driver.full_name}</p>
                      <p className="text-sm text-gray-600">{driver.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{driver.vehicle_type}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{driver.vehicle_number}</span>
                      </div>
                    </div>
                    {selectedDriver === driver.id && (
                      <CheckIcon className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assign Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAssignDriver}
          disabled={!selectedShipment || !selectedDriver}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <UserGroupIcon className="h-5 w-5" />
          <span>Assign Driver</span>
        </button>
      </div>
    </div>
  );
};

export default AssignDriver;