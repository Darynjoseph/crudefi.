import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
  requireAuth?: boolean;
}

const PrivateRoute = ({ 
  children, 
  requiredRole, 
  redirectTo = '/login',
  requireAuth = true
}: PrivateRouteProps) => {
  const { isAuthenticated, user, isLoading, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being initialized
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Store the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirements if specified
  if (requiredRole && user) {
    if (!hasRole(requiredRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default PrivateRoute;

// Convenience components for specific roles
export const AdminRoute = ({ children }: { children: ReactNode }) => (
  <PrivateRoute requiredRole="admin">
    {children}
  </PrivateRoute>
);

export const ManagerRoute = ({ children }: { children: ReactNode }) => (
  <PrivateRoute requiredRole={['admin', 'manager']}>
    {children}
  </PrivateRoute>
);

export const StaffRoute = ({ children }: { children: ReactNode }) => (
  <PrivateRoute requiredRole={['admin', 'manager', 'staff']}>
    {children}
  </PrivateRoute>
);

export const ViewerRoute = ({ children }: { children: ReactNode }) => (
  <PrivateRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
    {children}
  </PrivateRoute>
);