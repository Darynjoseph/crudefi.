import { api } from '../utils/api';
import type { Staff, StaffFormData, StaffFilters, StaffStats } from '../../pages/staff/types';

// Staff API functions following the same pattern as deliveryApi
export const staffApi = {
  // Get all staff with optional filters
  getStaff: async (filters?: StaffFilters): Promise<{ success: boolean; data: Staff[] }> => {
    const queryParams = new URLSearchParams();
    
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    
    const endpoint = `/staff${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get<{ success: boolean; data: Staff[] }>(endpoint, { requireAuth: true });
  },

  // Get single staff member by ID
  getStaffById: async (id: number): Promise<{ success: boolean; data: Staff }> => {
    return api.get(`/staff/${id}`, { requireAuth: true });
  },

  // Create new staff member
  createStaff: async (staffData: StaffFormData): Promise<{ success: boolean; data: Staff; message: string }> => {
    return api.post('/staff', staffData, { requireAuth: true });
  },

  // Update existing staff member
  updateStaff: async (id: number, staffData: StaffFormData): Promise<{ success: boolean; data: Staff; message: string }> => {
    return api.put(`/staff/${id}`, staffData, { requireAuth: true });
  },

  // Delete staff member
  deleteStaff: async (id: number): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/staff/${id}`, { requireAuth: true });
  },

  // Get staff statistics
  getStaffStats: async (): Promise<{
    success: boolean;
    data: StaffStats;
  }> => {
    return api.get('/staff/stats', { requireAuth: true });
  },

  // Check if staff can be deleted (no active shifts or salary records)
  canDeleteStaff: async (id: number): Promise<{ success: boolean; data: { canDelete: boolean; reason?: string } }> => {
    return api.get(`/staff/${id}/can-delete`, { requireAuth: true });
  }
};

export default staffApi;
