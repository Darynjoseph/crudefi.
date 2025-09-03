# Authentication System Guide

This guide explains how to use the role-based authentication system in your React application.

## Overview

The authentication system consists of:

- **AuthContext**: Global authentication state management
- **PrivateRoute**: Protected route wrapper with role-based access
- **useAuth**: Hook for accessing authentication state
- **API utilities**: Helper functions for authenticated API calls

## Quick Start

### 1. Basic Setup

The app is already wrapped with `AuthProvider` in `App.tsx`. The authentication context is available throughout your application.

### 2. Using Authentication in Components

```tsx
import { useAuth } from "../contexts/AuthContext";

const MyComponent = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Your role: {user?.role}</p>

      {hasRole("admin") && <button>Admin Only Action</button>}

      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### 3. Login Implementation

```tsx
import { useAuthApi } from "../hooks/useAuthApi";
import { useNavigate, useLocation } from "react-router-dom";

const LoginForm = () => {
  const { login, loading, error, clearError } = useAuthApi();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password });

      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by useAuthApi hook
      console.error("Login failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* Your form fields */}
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};
```

### 4. Protected Routes

```tsx
// In your routes file
import PrivateRoute, { AdminRoute, ManagerRoute } from '../components/PrivateRoute';

// Basic protected route
{
  path: '/dashboard',
  element: <PrivateRoute><Dashboard /></PrivateRoute>
}

// Role-specific routes
{
  path: '/admin',
  element: <AdminRoute><AdminPanel /></AdminRoute>
}

// Multiple roles allowed
{
  path: '/reports',
  element: (
    <PrivateRoute requiredRole={['admin', 'manager']}>
      <Reports />
    </PrivateRoute>
  )
}
```

### 5. Making API Calls

```tsx
import { api } from "../utils/api";

// GET request (automatically includes auth token)
const fetchData = async () => {
  try {
    const data = await api.get("/petty-cash");
    return data;
  } catch (error) {
    console.error("API Error:", error);
  }
};

// POST request
const createRecord = async (recordData: any) => {
  try {
    const result = await api.post("/petty-cash", recordData);
    return result;
  } catch (error) {
    console.error("Create failed:", error);
  }
};
```

## Role System

### Available Roles

- **admin**: Full access to all resources
- **manager**: Most resources with limited admin functions
- **staff**: Basic CRUD operations on most resources
- **viewer**: Read-only access

### Role Checking

```tsx
const { user, hasRole, hasAnyRole } = useAuth();

// Check specific role
if (hasRole("admin")) {
  // Admin only code
}

// Check multiple roles
if (hasRole(["admin", "manager"])) {
  // Admin or manager code
}

// Check if user has any of the roles
if (hasAnyRole(["admin", "manager"])) {
  // Admin or manager code
}
```

## Components Reference

### AuthContext

```tsx
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: { user: User; token: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string | string[]) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}
```

### PrivateRoute Props

```tsx
interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
  requireAuth?: boolean;
}
```

### Convenience Route Components

```tsx
<AdminRoute>        // admin only
<ManagerRoute>      // admin, manager
<StaffRoute>        // admin, manager, staff
<ViewerRoute>       // all roles
```

## Error Handling

The system handles various error scenarios:

1. **Unauthenticated access**: Redirects to `/login`
2. **Insufficient permissions**: Redirects to `/unauthorized`
3. **Token expiration**: Automatic logout and redirect to login
4. **API errors**: Proper error messages and status codes

## Development Tips

1. **Testing with different roles**: Modify the user role in localStorage or use the mock user middleware in development
2. **Debugging auth state**: Use the `AuthStatus` component to display current auth state
3. **API testing**: All API calls automatically include the auth token
4. **Route protection**: Use the appropriate route wrapper based on required permissions

## Security Notes

1. **Token storage**: JWTs are stored in localStorage (consider httpOnly cookies for production)
2. **Role validation**: Always validate permissions on the backend
3. **Token refresh**: Implement token refresh for long-running sessions
4. **Logout cleanup**: All auth data is cleared on logout

## Migration from Old System

If you have existing authentication code:

1. Replace direct localStorage access with `useAuth` hook
2. Update route protection to use `PrivateRoute` components
3. Replace manual token handling with the `api` utility functions
4. Update role checking logic to use the new role hierarchy system
