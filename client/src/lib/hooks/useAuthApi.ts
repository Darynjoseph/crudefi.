import { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi, ApiError } from '../utils/api';

interface UseAuthApiReturn {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; role?: string }) => Promise<void>;
  refreshToken: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useAuthApi = (): UseAuthApiReturn => {
  const { login: authLogin, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(credentials);
      
      if (response.success && response.token && response.user) {
        authLogin({
          user: response.user,
          token: response.token,
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred';
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authLogin]);

  const register = useCallback(async (userData: { name: string; email: string; password: string; role?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.register(userData);
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred';
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.refreshToken();
      
      if (response.success && response.token) {
        // Update token in localStorage
        localStorage.setItem('token', response.token);
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : err instanceof Error 
        ? err.message 
        : 'Token refresh failed';
      
      setError(errorMessage);
      // If token refresh fails, logout the user
      logout();
      throw err;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  return {
    login,
    register,
    refreshToken,
    loading,
    error,
    clearError,
  };
};