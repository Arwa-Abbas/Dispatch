import React from 'react';
import { BellIcon, CheckCircleIcon, TruckIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const Notifications: React.FC = () => {
  // Mock notifications - will be replaced with real data later
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Shipment Delivered',
      message: 'Your shipment DSP-ABC12345 has been delivered successfully',
      time: '2 hours ago',
      icon: CheckCircleIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      id: 2,
      type: 'info',
      title: 'Shipment In Transit',
      message: 'Your shipment DSP-DEF67890 is currently in transit',
      time: '5 hours ago',
      icon: TruckIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      id: 3,
      type: 'warning',
      title: 'Shipment Assigned',
      message: 'A driver has been assigned to your shipment DSP-GHI54321',
      time: '1 day ago',
      icon: ClockIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">Stay updated with your shipment status</p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
          <p className="text-gray-600 mt-2">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`${notification.bgColor} rounded-xl p-4 border border-gray-100 flex items-start space-x-4`}
              >
                <div className={`p-2 rounded-full ${notification.bgColor}`}>
                  <Icon className={`h-5 w-5 ${notification.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;