import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/api';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  BellIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Notification {
  id: number;
  user_id: number;
  shipment_id?: number;
  type: string;
  title: string;
  message: string;
  status: string;
  is_read: boolean;
  created_at: string;
  sent_at?: string;
  read_at?: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const url = filter === 'unread' 
        ? '/notifications?unread_only=true&limit=50' 
        : '/notifications?limit=50';
      const response = await api.get(url);
      console.log('Notifications fetched:', response.data);
      setNotifications(response.data);
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      toast.error(error.detail || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/count');
      console.log('Unread count:', response.data);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error: any) {
      toast.error(error.detail || 'Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error: any) {
      toast.error(error.detail || 'Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string, title: string) => {
    if (title.includes('Delivered')) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    } else if (title.includes('Failed')) {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    } else if (title.includes('Assigned') || title.includes('Assignment')) {
      return <UserIcon className="h-5 w-5 text-blue-500" />;
    } else if (title.includes('Picked Up') || title.includes('Transit')) {
      return <TruckIcon className="h-5 w-5 text-purple-500" />;
    } else if (title.includes('Pending') || title.includes('Created')) {
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
    return <BellIcon className="h-5 w-5 text-primary-500" />;
  };

  const getStatusColor = (isRead: boolean) => {
    return isRead ? 'bg-white' : 'bg-primary-50 border-l-4 border-primary-500';
  };

  // Handle notification click - automatically mark as read and navigate
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to shipment if it exists
    if (notification.shipment_id) {
      navigate(`/dashboard/shipment/${notification.shipment_id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your shipment status</p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
              {unreadCount} unread
            </span>
          )}
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Mark all as read
          </button>
          <button
            onClick={fetchNotifications}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'unread'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
          <p className="text-gray-600 mt-2">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer ${getStatusColor(
                notification.is_read
              )}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {getNotificationIcon(notification.type, notification.title)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`text-sm font-medium ${
                        notification.is_read ? 'text-gray-600' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        notification.is_read ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0 ml-4">
                      {!notification.is_read ? (
                        <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                      ) : (
                        <span className="text-xs text-gray-400">Read</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;