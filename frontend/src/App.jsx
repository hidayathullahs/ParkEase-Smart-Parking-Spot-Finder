import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// User Pages
import Home from './pages/Home';
import ParkingDetails from './pages/ParkingDetails';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import History from './pages/History';
import Wallet from './pages/Wallet';
import Tickets from './pages/Tickets';
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
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'PROVIDER') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/find" replace />;
  }

  return children;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard if they try to access unauthorized pages
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'PROVIDER') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/find" replace />;
  }

  // Wrap protected content in Layout
  return <Layout>{children}</Layout>;
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

      {/* User Routes (Driver) */}
      <Route path="/find" element={<ProtectedRoute allowedRoles={['USER']}><Home /></ProtectedRoute>} />
      <Route path="/parking/:id" element={<ProtectedRoute allowedRoles={['USER']}><ParkingDetails /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute allowedRoles={['USER']}><MyBookings /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={['USER', 'PROVIDER', 'ADMIN']}><Profile /></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute allowedRoles={['USER']}><Favorites /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute allowedRoles={['USER']}><History /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute allowedRoles={['USER']}><Wallet /></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute allowedRoles={['USER']}><Tickets /></ProtectedRoute>} />
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

export default App;
