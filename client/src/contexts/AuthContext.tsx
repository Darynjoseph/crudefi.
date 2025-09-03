import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define user interface
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
}

// Define auth context interface
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

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } else {
        // DEVELOPMENT MODE: Auto-login with mock user (remove in production)
        // This matches the mock user configured in your backend
        const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
        
        if (isDevelopment) {
          console.log('🔧 Development mode: Auto-authenticating with mock user');
          const mockUser: User = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: 'admin' // This should match your backend mock user role
          };
          const mockToken = 'mock-development-token';
          
          setUser(mockUser);
          setToken(mockToken);
          
          // Store in localStorage for consistency
          localStorage.setItem('user', JSON.stringify(mockUser));
          localStorage.setItem('token', mockToken);
        }
      }
    } catch (error) {
      console.error('Error parsing stored auth data:', error);
      // Clear corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = ({ user: userData, token: userToken }: { user: User; token: string }) => {
    try {
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Optional: Clear all localStorage items related to the app
    // localStorage.clear();
  };

  // Check if user is authenticated
  const isAuthenticated = !!(user && token);

  // Check if user has specific role(s)
  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Context value
  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Role-based utility functions for convenience
export const UserRoles = {
  ADMIN: 'admin' as const,
  MANAGER: 'manager' as const,
  STAFF: 'staff' as const,
  VIEWER: 'viewer' as const,
};

// Permission helpers
export const RoleHierarchy = {
  admin: ['admin', 'manager', 'staff', 'viewer'],
  manager: ['manager', 'staff', 'viewer'],
  staff: ['staff', 'viewer'],
  viewer: ['viewer'],
};

export const checkPermission = (userRole: string, requiredRole: string): boolean => {
  const userPermissions = RoleHierarchy[userRole as keyof typeof RoleHierarchy] || [];
  return userPermissions.includes(requiredRole);
};