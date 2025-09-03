import { api } from './api';
import {
  OilExtractionLog,
  CreateOilLogRequest,
  UpdateOilLogRequest,
  OilLogFilters,
  OilLogResponse,
  OilLogStatsResponse
} from '../types/oil_logs_normalized';

// Oil Extraction Logs API functions (updated for normalized structure)
export const oilLogsApi = {
  // Get all oil logs with optional filters
  getOilLogs: async (filters?: OilLogFilters): Promise<OilLogResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters?.fruit_type) queryParams.append('fruit_type', filters.fruit_type);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.search) queryParams.append('search', filters.search);
    
    const endpoint = `/oil-extraction${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get<OilLogResponse>(endpoint, { requireAuth: true });
  },

  // Get single oil log by ID
  getOilLog: async (id: number): Promise<{ success: boolean; data: OilExtractionLog }> => {
    return api.get(`/oil-extraction/${id}`, { requireAuth: true });
  },

  // Create new oil log
  createOilLog: async (oilLog: CreateOilLogRequest): Promise<{ 
    success: boolean; 
    data: OilExtractionLog; 
    message: string;
    warnings?: string[];
  }> => {
    return api.post('/oil-extraction', oilLog, { requireAuth: true });
  },

  // Update existing oil log
  updateOilLog: async (oilLog: UpdateOilLogRequest): Promise<{ 
    success: boolean; 
    data: OilExtractionLog; 
    message: string 
  }> => {
    return api.put(`/oil-extraction/${oilLog.id}`, oilLog, { requireAuth: true });
  },

  // Delete oil log
  deleteOilLog: async (id: number): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/oil-extraction/${id}`, { requireAuth: true });
  },

  // Get oil log statistics
  getOilLogStats: async (): Promise<OilLogStatsResponse> => {
    return api.get('/oil-extraction/stats', { requireAuth: true });
  },

  // Get fruits for dropdown
  getOilLogFruits: async (): Promise<{ 
    success: boolean; 
    data: Array<{ fruit_id: number; fruit_name: string }> 
  }> => {
    return api.get('/oil-extraction/fruits', { requireAuth: true });
  }
};
