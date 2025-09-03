import { api } from '../utils/api';
import type { Fruit, FruitFormData, FruitStats } from '../../pages/fruits/types';

// Fruit API functions following the same pattern as staffApi
export const fruitApi = {
  // Get all fruits with optional filters
  getFruits: async (filters?: { search?: string }): Promise<{ success: boolean; data: Fruit[] }> => {
    const queryParams = new URLSearchParams();
    
    if (filters?.search) queryParams.append('search', filters.search);
    
    const endpoint = `/fruits${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get<{ success: boolean; data: Fruit[] }>(endpoint, { requireAuth: true });
  },

  // Get single fruit by ID
  getFruitById: async (id: number): Promise<{ success: boolean; data: Fruit }> => {
    return api.get(`/fruits/${id}`, { requireAuth: true });
  },

  // Create new fruit
  createFruit: async (fruitData: FruitFormData): Promise<{ success: boolean; data: Fruit; message: string }> => {
    return api.post('/fruits', fruitData, { requireAuth: true });
  },

  // Update existing fruit
  updateFruit: async (id: number, fruitData: Partial<FruitFormData>): Promise<{ success: boolean; data: Fruit; message: string }> => {
    return api.put(`/fruits/${id}`, fruitData, { requireAuth: true });
  },

  // Delete fruit
  deleteFruit: async (id: number): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/fruits/${id}`, { requireAuth: true });
  },

  // Get fruit statistics
  getFruitStats: async (): Promise<{
    success: boolean;
    data: {
      overview: {
        total_fruits: number;
      };
      delivery_stats: Array<{
        fruit_name: string;
        delivery_count: number;
        total_weight_kg: number;
        total_value: number;
        last_delivery_date: string;
      }>;
      oil_extraction_stats: Array<{
        fruit_name: string;
        extraction_count: number;
        total_input_kg: number;
        total_oil_extracted_l: number;
        avg_yield_percent: number;
      }>;
    };
  }> => {
    return api.get('/fruits/stats', { requireAuth: true });
  }
};

export default fruitApi;
