import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Protects routes that require authentication and optionally specific roles
 *
 * @param {Object} props
 * @param {React.Component} props.element - Component to render if authorized
 * @param {String|Array} props.allowedRoles - Single role or array of allowed roles (optional)
 */
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles) {
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesArray.includes(user?.role)) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page.</p>
          <p>Your role: {user?.role}</p>
          <a href="/" style={{ color: '#007bff', cursor: 'pointer' }}>
            Go back to home
          </a>
        </div>
      );
    }
  }

  // All checks passed - render component
  return element;
};

export default ProtectedRoute;
