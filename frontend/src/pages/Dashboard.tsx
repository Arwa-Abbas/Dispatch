import React from 'react';
import { useAuth } from '../hooks/useAuth';
import CustomerDashboard from '../components/dashboard/CustomerDashboard';
import DriverDashboard from '../components/dashboard/DriverDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'DRIVER':
        return <DriverDashboard />;
      case 'CUSTOMER':
        return <CustomerDashboard />;
      default:
        return <CustomerDashboard />;
    }
  };

  return <div>{renderDashboard()}</div>;
};

export default Dashboard;