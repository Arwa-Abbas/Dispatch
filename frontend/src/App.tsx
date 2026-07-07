import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/dashboard/layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import NotFound from './pages/NotFound';
import { useAuth } from './hooks/useAuth';

// Dashboard Components
import CustomerDashboard from './components/dashboard/customer/CustomerDashboard';
import CreateShipment from './components/dashboard/customer/CreateShipment';
import MyShipments from './components/dashboard/customer/MyShipments';
import ShipmentDetails from './components/dashboard/customer/ShipmentDetails';
import TrackShipment from './components/dashboard/customer/TrackShipment';
import DriverDashboard from './components/dashboard/driver/DriverDashboard';
import AssignedShipments from './components/dashboard/driver/AssignedShipments';
import DeliveryDetails from './components/dashboard/driver/DeliveryDetails';
import DeliveryHistory from './components/dashboard/driver/DeliveryHistory';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';
import ManageUsers from './components/dashboard/admin/ManageUsers';
import AllShipments from './components/dashboard/admin/AllShipments';
import AssignDriver from './components/dashboard/admin/AssignDriver';
import ProfileSettings from './components/dashboard/common/ProfileSettings';
import Settings from './components/dashboard/common/Settings';
import Support from './components/dashboard/common/Support';
import Notifications from './components/dashboard/common/Notifications';

// Role-based dashboard component
const RoleBasedDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }
  
  if (user?.role === 'DRIVER') {
    return <DriverDashboard />;
  }
  
  return <CustomerDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard index - shows role-specific dashboard */}
              <Route index element={<RoleBasedDashboard />} />
              
              {/* Customer Routes */}
              <Route path="create-shipment" element={<CreateShipment />} />
              <Route path="my-shipments" element={<MyShipments />} />
              <Route path="shipment/:id" element={<ShipmentDetails />} />
              <Route path="track" element={<TrackShipment />} />
              
              {/* Driver Routes */}
              <Route path="assigned-shipments" element={<AssignedShipments />} />
              <Route path="delivery/:id" element={<DeliveryDetails />} />
              <Route path="delivery-history" element={<DeliveryHistory />} />
              
              {/* Admin Routes */}
              <Route path="users" element={<ManageUsers />} />
              <Route path="all-shipments" element={<AllShipments />} />
              <Route path="assign-driver" element={<AssignDriver />} />
              
              {/* Common Routes - All users */}
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="settings" element={<Settings />} />
              <Route path="support" element={<Support />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;