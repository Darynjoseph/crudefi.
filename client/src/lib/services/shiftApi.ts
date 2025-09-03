// src/lib/services/shiftApi.ts

import { api } from '../utils/api';
import type { 
  Shift, 
  Staff, 
  ShiftFilters, 
  OpenShiftRequest, 
  CloseShiftRequest, 
  ShiftStats 
} from '../../pages/shifts/types';

export const shiftApi = {
  // Get all shifts with filtering
  async getShifts(filters?: ShiftFilters): Promise<{ success: boolean; data: Shift[] }> {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.staff_name) params.append('staff_name', filters.staff_name);
    
    const endpoint = `/shifts${params.toString() ? `?${params.toString()}` : ''}`;
    return api.get<{ success: boolean; data: Shift[] }>(endpoint, { requireAuth: true });
  },

  // Get shift statistics
  async getShiftStats(): Promise<{ success: boolean; data: ShiftStats }> {
    return api.get<{ success: boolean; data: ShiftStats }>('/shifts/stats', { requireAuth: true });
  },

  // Get all staff members
  async getStaff(): Promise<{ success: boolean; data: Staff[] }> {
    return api.get<{ success: boolean; data: Staff[] }>('/staff', { requireAuth: true });
  },

  // Open a new shift
  async openShift(data: OpenShiftRequest): Promise<{ success: boolean; message: string; data?: Shift }> {
    return api.post<{ success: boolean; message: string; data?: Shift }>('/shifts/open', data, { requireAuth: true });
  },

  // Close a shift
  async closeShift(shiftId: number, data: CloseShiftRequest): Promise<{ success: boolean; message: string; data?: any }> {
    return api.put<{ success: boolean; message: string; data?: any }>(`/shifts/close/${shiftId}`, data, { requireAuth: true });
  },
};