import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../api/api';
import {
  HomeIcon,
  TruckIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  UsersIcon,
  ChartBarIcon,
  QueueListIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  DocumentTextIcon,
  BellIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface MenuItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [previousCount, setPreviousCount] = useState(0);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/notifications/count');
        const newCount = response.data.count;
        
        // Show toast notification when new notifications arrive
        if (newCount > previousCount && previousCount > 0) {
          toast.success(`You have ${newCount - previousCount} new notification(s)`);
        } else if (newCount > 0 && previousCount === 0) {
          toast.success(`You have ${newCount} new notification(s)`);
        }
        
        setPreviousCount(newCount);
        setUnreadCount(newCount);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    // Poll every 15 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [previousCount]);

  // Also fetch when user changes or when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const fetchUnreadCount = async () => {
          try {
            const response = await api.get('/notifications/count');
            setUnreadCount(response.data.count);
          } catch (error) {
            console.error('Failed to fetch unread count:', error);
          }
        };
        fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  // Get menu items based on role
  const getMenuItems = (): MenuItem[] => {
    const role = user?.role || 'CUSTOMER';

    if (role === 'ADMIN') {
      return [
        { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
        { path: '/dashboard/users', icon: UsersIcon, label: 'Manage Users' },
        { path: '/dashboard/all-shipments', icon: QueueListIcon, label: 'All Shipments' },
        { path: '/dashboard/assign-driver', icon: UserGroupIcon, label: 'Assign Driver' },
      ];
    }

    if (role === 'DRIVER') {
      return [
        { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
        { path: '/dashboard/assigned-shipments', icon: TruckIcon, label: 'My Deliveries' },
        { path: '/dashboard/delivery-history', icon: DocumentTextIcon, label: 'History' },
        { path: '/dashboard/profile', icon: UserIcon, label: 'Profile' },
        { path: '/dashboard/settings', icon: Cog6ToothIcon, label: 'Settings' },
      ];
    }

    return [
      { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
      { path: '/dashboard/create-shipment', icon: PlusCircleIcon, label: 'Create Shipment' },
      { path: '/dashboard/my-shipments', icon: ClipboardDocumentListIcon, label: 'My Shipments' },
      { path: '/dashboard/track', icon: MapPinIcon, label: 'Track Shipment' },
      { path: '/dashboard/profile', icon: UserIcon, label: 'Profile' },
      { path: '/dashboard/settings', icon: Cog6ToothIcon, label: 'Settings' },
    ];
  };

  const menuItems = getMenuItems();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const getUserInitials = () => {
    if (!user?.full_name) return 'U';
    const names = user.full_name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? (
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col h-full ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{ width: isOpen ? '16rem' : '5rem' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link 
            to="/" 
            className={`flex items-center space-x-2 transition-all duration-300 ${
              !isOpen ? 'lg:justify-center lg:space-x-0' : ''
            }`}
            onClick={closeSidebar}
          >
            <div className="p-2 bg-primary-600 rounded-lg flex-shrink-0">
              <TruckIcon className="h-6 w-6 text-white" />
            </div>
            <span className={`text-xl font-bold text-gray-800 transition-all duration-300 ${
              !isOpen ? 'lg:hidden' : ''
            }`}>
              Dispatch
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar size"
          >
            {isOpen ? (
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            ) : (
              <Bars3Icon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className={`p-4 border-b border-gray-200 bg-primary-50 transition-all duration-300 ${
          !isOpen ? 'lg:px-2' : ''
        }`}>
          <div className={`flex items-center ${!isOpen ? 'lg:justify-center' : ''} space-x-3`}>
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-lg">
                {getUserInitials()}
              </span>
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-300 ${
              !isOpen ? 'lg:hidden' : ''
            }`}>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                {user?.role || 'Customer'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative ${
                      active
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                    } ${!isOpen ? 'lg:justify-center lg:space-x-0' : ''}`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${
                      active ? 'text-white' : 'text-gray-500 group-hover:text-primary-600'
                    }`} />
                    <span className={`font-medium transition-all duration-300 ${
                      !isOpen ? 'lg:hidden' : ''
                    }`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`ml-auto bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full ${
                        !isOpen ? 'lg:hidden' : ''
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {!isOpen && (
                      <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity hidden lg:block whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            className={`flex items-center space-x-3 w-full px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors ${
              !isOpen ? 'lg:justify-center lg:space-x-0' : ''
            }`}
            onClick={() => {
              closeSidebar();
              navigate('/dashboard/notifications');
            }}
          >
            <BellIcon className={`h-5 w-5 flex-shrink-0 text-gray-500 ${
              !isOpen ? 'lg:mr-0' : ''
            }`} />
            <span className={`font-medium transition-all duration-300 ${
              !isOpen ? 'lg:hidden' : ''
            }`}>
              Notifications
            </span>
            <span className={`ml-auto ${
              unreadCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
            } text-xs font-medium px-2 py-0.5 rounded-full ${
              !isOpen ? 'lg:hidden' : ''
            }`}>
              {unreadCount}
            </span>
          </button>

          <button
            className={`flex items-center space-x-3 w-full px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors mt-1 ${
              !isOpen ? 'lg:justify-center lg:space-x-0' : ''
            }`}
            onClick={() => {
              closeSidebar();
              navigate('/dashboard/support');
            }}
          >
            <ChatBubbleLeftRightIcon className={`h-5 w-5 flex-shrink-0 text-gray-500 ${
              !isOpen ? 'lg:mr-0' : ''
            }`} />
            <span className={`font-medium transition-all duration-300 ${
              !isOpen ? 'lg:hidden' : ''
            }`}>
              Support
            </span>
          </button>

          <button
            className={`flex items-center space-x-3 w-full px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors mt-1 ${
              !isOpen ? 'lg:justify-center lg:space-x-0' : ''
            }`}
            onClick={() => {
              closeSidebar();
              navigate('/');
            }}
          >
            <HomeIcon className={`h-5 w-5 flex-shrink-0 text-gray-500 ${
              !isOpen ? 'lg:mr-0' : ''
            }`} />
            <span className={`font-medium transition-all duration-300 ${
              !isOpen ? 'lg:hidden' : ''
            }`}>
              Home
            </span>
          </button>

          <button
            onClick={handleLogout}
            className={`flex items-center space-x-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2 ${
              !isOpen ? 'lg:justify-center lg:space-x-0' : ''
            }`}
          >
            <ArrowRightOnRectangleIcon className={`h-5 w-5 flex-shrink-0 ${
              !isOpen ? 'lg:mr-0' : ''
            }`} />
            <span className={`font-medium transition-all duration-300 ${
              !isOpen ? 'lg:hidden' : ''
            }`}>
              Logout
            </span>
          </button>
        </div>

        <div className={`px-4 py-2 border-t border-gray-200 text-center ${
          !isOpen ? 'lg:hidden' : ''
        }`}>
        </div>
      </div>
    </>
  );
};

export default Sidebar;