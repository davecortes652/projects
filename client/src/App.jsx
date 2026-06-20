import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import DoctorManagement from './pages/admin/DoctorManagement';
import SidebarLayout from './components/layout/SidebarLayout';

// ─── Placeholder for doctor / staff / patient (replace later) ───────────────
const ComingSoon = ({ role, label }) => (
  <SidebarLayout>
    <div style={{ textAlign: 'center', padding: '4rem 2rem', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
        {{ doctor: '🩺', staff: '📋', patient: '👤' }[role] || '📊'}
      </div>
      <h2 style={{ fontSize: '22px', color: '#111827', marginBottom: '0.5rem' }}>{label} Dashboard</h2>
      <p style={{ color: '#6B7280', fontSize: '14px' }}>This module is coming soon.</p>
    </div>
  </SidebarLayout>
);

const Unauthorized = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
    <h1 style={{ fontSize: '22px', color: '#111827', marginBottom: '0.5rem' }}>Access denied</h1>
    <p style={{ color: '#6b7280' }}>You don't have permission to view this page.</p>
    <a href="/login" style={{ marginTop: '1.5rem', color: '#1e40af', textDecoration: 'none', fontWeight: '500' }}>← Back to login</a>
  </div>
);

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const routes = { admin: '/dashboard/admin', doctor: '/dashboard/doctor', staff: '/dashboard/staff', patient: '/dashboard/patient' };
  return <Navigate to={routes[user?.role] || '/login'} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/admin/users" element={
            <ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>
          } />
          <Route path="/dashboard/admin/doctors" element={
            <ProtectedRoute roles={['admin']}><DoctorManagement /></ProtectedRoute>
          } />

          {/* Doctor */}
          <Route path="/dashboard/doctor" element={
            <ProtectedRoute roles={['doctor']}>
              <ComingSoon role="doctor" label="Doctor" />
            </ProtectedRoute>
          } />

          {/* Staff */}
          <Route path="/dashboard/staff" element={
            <ProtectedRoute roles={['staff']}>
              <ComingSoon role="staff" label="Staff" />
            </ProtectedRoute>
          } />

          {/* Patient */}
          <Route path="/dashboard/patient" element={
            <ProtectedRoute roles={['patient']}>
              <ComingSoon role="patient" label="Patient" />
            </ProtectedRoute>
          } />

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
