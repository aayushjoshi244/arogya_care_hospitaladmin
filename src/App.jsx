import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RegisterHospital from './pages/RegisterHospital';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Scheduling from './pages/Scheduling';
import LiveBoard from './pages/LiveBoard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import LabTests from './pages/LabTests';
import Medicines from './pages/Medicines';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, requireVerification = true }) => {
  const { user, isLoading, hospitalStatus, isRegistered, hospLoading } = useAuth();

  if (isLoading || hospLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-sm text-slate-500 font-medium mt-3">Verifying compliance credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireVerification) {
    if (!isRegistered) {
      return <Navigate to="/register-hospital" replace />;
    }
  } else {
    // Onboarding pages (register-hospital)
    if (isRegistered) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/register-hospital" element={
            <ProtectedRoute requireVerification={false}>
              <RegisterHospital />
            </ProtectedRoute>
          } />

          <Route path="/" element={
            <ProtectedRoute requireVerification={true}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="scheduling" element={<Scheduling />} />
            <Route path="live-board" element={<LiveBoard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="lab-tests" element={<LabTests />} />
            <Route path="medicines" element={<Medicines />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
