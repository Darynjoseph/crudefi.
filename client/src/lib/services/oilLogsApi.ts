import { api } from '../utils/api';

// Oil Logs API functions following the same pattern as staffApi
export const oilLogsApi = {
  // Get all oil extraction logs with optional filters
  getOilLogs: async (filters?: { fruit_type?: string; dateFrom?: string; dateTo?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    
    if (filters?.fruit_type) queryParams.append('fruit_type', filters.fruit_type);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.search) queryParams.append('search', filters.search);
    
    const endpoint = `/oil-extraction${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get<{ success: boolean; data: any[] }>(endpoint, { requireAuth: true });
  },

  // Get single oil log by ID
  getOilLogById: async (id: number) => {
    return api.get(`/oil-extraction/${id}`, { requireAuth: true });
  },

  // Create new oil log
  createOilLog: async (logData: any) => {
    return api.post('/oil-extraction', logData, { requireAuth: true });
  },

  // Update existing oil log
  updateOilLog: async (id: number, logData: any) => {
    return api.put(`/oil-extraction/${id}`, logData, { requireAuth: true });
  },

  // Delete oil log
  deleteOilLog: async (id: number) => {
    return api.delete(`/oil-extraction/${id}`, { requireAuth: true });
  },

  // Get oil extraction statistics
  getOilLogStats: async () => {
    return api.get('/oil-extraction/stats', { requireAuth: true });
  }
};

export default oilLogsApi;
