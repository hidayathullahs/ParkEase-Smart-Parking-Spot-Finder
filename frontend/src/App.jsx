import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Driver Layout & Dashboard
import DriverLayout from './layouts/DriverLayout';
import DriverDashboard from './dashboards/driver/DriverDashboard';
import MyBookings from './dashboards/driver/MyBookings';
import Tickets from './dashboards/driver/Tickets';
import History from './dashboards/driver/History';
import Profile from './dashboards/driver/Profile';

import Wallet from './pages/Wallet'; // Keep wallet in pages if not generic? Or move it too? Assuming specific for now.
import Favorites from './pages/Favorites';
import Home from './pages/Home'; // "Find Parking"
import ParkingDetails from './pages/ParkingDetails';
import Notifications from './pages/Notifications';

// Provider Pages
import OwnerDashboard from './pages/OwnerDashboard';
import AddParking from './pages/AddParking';
import ProviderScan from './pages/ProviderScan';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';

// --- Route Guards ---

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'PROVIDER') return <Navigate to="/owner" replace />;
    return <Navigate to="/driver" replace />;
  }
  return children;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'PROVIDER') return <Navigate to="/owner" replace />;
    return <Navigate to="/driver" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* Driver Routes (Nested Layout) */}
      <Route path="/driver" element={<DriverLayout />}>
        <Route index element={<DriverDashboard />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="history" element={<History />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Legacy/Top-level Routes accessed by Driver */}
      <Route path="/find" element={<ProtectedRoute allowedRoles={['USER']}><Home /></ProtectedRoute>} />
      <Route path="/parking/:id" element={<ProtectedRoute allowedRoles={['USER']}><ParkingDetails /></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute allowedRoles={['USER']}><Favorites /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute allowedRoles={['USER', 'PROVIDER', 'ADMIN']}><Notifications /></ProtectedRoute>} />

      {/* Provider Routes (Space Owner) */}
      <Route path="/owner/dashboard" element={<ProtectedRoute allowedRoles={['PROVIDER']}><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/owner/add-parking" element={<ProtectedRoute allowedRoles={['PROVIDER']}><AddParking /></ProtectedRoute>} />
      <Route path="/owner/scan" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderScan /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppWithToaster() {
  return (
    <>
      <App />
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default AppWithToaster;
