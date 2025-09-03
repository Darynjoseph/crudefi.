// API utility for making authenticated requests

// Add this declaration if not already present in your project (e.g., in a global.d.ts file)
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  // add other env variables here if needed
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
}

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Make authenticated API requests
export const apiRequest = async <T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const { requireAuth = false, ...requestOptions } = options;
  
  // Build URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(requestOptions.headers as Record<string, string>),
  };
  
  // Add authorization header if required
  if (requireAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  try {
    console.log('🌐 API Request:', {
      method: requestOptions.method || 'GET',
      url,
      headers,
      body: requestOptions.body
    });
    
    const response = await fetch(url, {
      ...requestOptions,
      headers,
    });
    
    console.log('📡 API Response Status:', response.status, response.statusText);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    console.log('📦 API Response Data:', data);
    
    // Handle error responses
    if (!response.ok) {
      console.error('❌ API Error Response:', {
        status: response.status,
        data
      });
      
      // Handle specific error cases
      let errorMessage = data?.message || `HTTP error ${response.status}`;
      
      if (response.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        // Clear invalid token
        localStorage.removeItem('token');
      } else if (response.status === 403) {
        errorMessage = 'You don\'t have permission to perform this action.';
      } else if (response.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      throw new ApiError(response.status, errorMessage, data);
    }
    
    return data;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    throw new ApiError(0, 'Network error or server unavailable');
  }
};

// Convenience methods for common HTTP verbs
export const api = {
  get: <T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  put: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  patch: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  delete: <T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Auth-specific API calls
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return api.post('/auth/login', credentials, { requireAuth: false });
  },
  
  register: async (userData: { name: string; email: string; password: string; role?: string }) => {
    return api.post('/auth/register', userData, { requireAuth: false });
  },
  
  getProfile: async () => {
    return api.get('/auth/profile', { requireAuth: false });
  },
  
  refreshToken: async () => {
    return api.post('/auth/refresh', {}, { requireAuth: false });
  },
};

export { ApiError };