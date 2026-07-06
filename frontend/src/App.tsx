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

// Dashboard Components
import CustomerDashboard from './components/dashboard/customer/CustomerDashboard';
import CreateShipment from './components/dashboard/customer/CreateShipment';
import MyShipments from './components/dashboard/customer/MyShipments';
import ShipmentDetails from './components/dashboard/customer/ShipmentDetails';
import DriverDashboard from './components/dashboard/driver/DriverDashboard';
import AssignedShipments from './components/dashboard/driver/AssignedShipments';
import DeliveryDetails from './components/dashboard/driver/DeliveryDetails';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';
import ManageUsers from './components/dashboard/admin/ManageUsers';
import AllShipments from './components/dashboard/admin/AllShipments';
import AssignDriver from './components/dashboard/admin/AssignDriver';
import ProfileSettings from './components/dashboard/common/ProfileSettings';

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
              <Route index element={<CustomerDashboard />} />
              
              {/* Customer Routes */}
              <Route path="create-shipment" element={<CreateShipment />} />
              <Route path="my-shipments" element={<MyShipments />} />
              <Route path="shipment/:id" element={<ShipmentDetails />} />
              
              {/* Driver Routes */}
              <Route path="driver" element={<DriverDashboard />} />
              <Route path="assigned-shipments" element={<AssignedShipments />} />
              <Route path="delivery/:id" element={<DeliveryDetails />} />
              
              {/* Admin Routes */}
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="all-shipments" element={<AllShipments />} />
              <Route path="assign-driver" element={<AssignDriver />} />
              
              {/* Common Routes */}
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="settings" element={<ProfileSettings />} />
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