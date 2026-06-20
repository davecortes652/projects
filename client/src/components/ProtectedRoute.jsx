import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 * @param {string[]} roles - allowed roles (empty = any authenticated user)
 *
 * Usage:
 *   <ProtectedRoute>...</ProtectedRoute>                     // any logged-in user
 *   <ProtectedRoute roles={['admin']}>...</ProtectedRoute>   // admin only
 *   <ProtectedRoute roles={['admin','staff']}>...</ProtectedRoute>
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Still checking token on mount
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  // Not logged in → redirect to login, remember where they were
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
