import { api } from '../utils/api';
import type { Supplier, SupplierFormData, SupplierStats } from '../../pages/suppliers/types';

// Supplier API functions following the same pattern as staffApi
export const supplierApi = {
  // Get all suppliers with optional filters
  getSuppliers: async (filters?: { status?: string; search?: string }): Promise<{ success: boolean; data: Supplier[] }> => {
    const queryParams = new URLSearchParams();
    
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.search) queryParams.append('search', filters.search);
    
    const endpoint = `/suppliers${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get<{ success: boolean; data: Supplier[] }>(endpoint, { requireAuth: true });
  },

  // Get single supplier by ID
  getSupplierById: async (id: number): Promise<{ success: boolean; data: Supplier }> => {
    return api.get(`/suppliers/${id}`, { requireAuth: true });
  },

  // Create new supplier
  createSupplier: async (supplierData: SupplierFormData): Promise<{ success: boolean; data: Supplier; message: string }> => {
    return api.post('/suppliers', supplierData, { requireAuth: true });
  },

  // Update existing supplier
  updateSupplier: async (id: number, supplierData: Partial<SupplierFormData>): Promise<{ success: boolean; data: Supplier; message: string }> => {
    return api.put(`/suppliers/${id}`, supplierData, { requireAuth: true });
  },

  // Delete supplier
  deleteSupplier: async (id: number): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/suppliers/${id}`, { requireAuth: true });
  },

  // Get supplier statistics
  getSupplierStats: async (): Promise<{
    success: boolean;
    data: {
      overview: {
        total_suppliers: number;
        active_suppliers: number;
        inactive_suppliers: number;
      };
      top_suppliers: Array<{
        supplier_name: string;
        delivery_count: number;
        total_value: number;
        last_delivery_date: string;
      }>;
    };
  }> => {
    return api.get('/suppliers/stats', { requireAuth: true });
  }
};

export default supplierApi;
