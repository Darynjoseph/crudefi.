import { api } from './api';
import { 
  FruitDelivery, 
  CreateDeliveryRequest, 
  UpdateDeliveryRequest, 
  DeliveryFilters,
  DeliveryResponse 
} from '../types/delivery';

// Fruit Delivery API functions
export const deliveryApi = {
  // Get all deliveries with optional filters
  getDeliveries: async (filters?: DeliveryFilters): Promise<DeliveryResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters?.supplier_name) queryParams.append('supplier_name', filters.supplier_name);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.fruit_type) queryParams.append('fruit_type', filters.fruit_type);
    if (filters?.search) queryParams.append('search', filters.search);
    
    const endpoint = `/fruit-deliveries${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get<DeliveryResponse>(endpoint, { requireAuth: true });
  },

  // Get single delivery by ID
  getDelivery: async (id: number): Promise<{ success: boolean; data: FruitDelivery }> => {
    return api.get(`/fruit-deliveries/${id}`, { requireAuth: true });
  },

  // Create new delivery
  createDelivery: async (delivery: CreateDeliveryRequest): Promise<{ success: boolean; data: FruitDelivery; message: string }> => {
    return api.post('/fruit-deliveries', delivery, { requireAuth: true });
  },

  // Update existing delivery
  updateDelivery: async (delivery: UpdateDeliveryRequest): Promise<{ success: boolean; data: FruitDelivery; message: string }> => {
    return api.put(`/fruit-deliveries/${delivery.id}`, delivery, { requireAuth: true });
  },

  // Delete delivery
  deleteDelivery: async (id: number): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/fruit-deliveries/${id}`, { requireAuth: true });
  },

  // Get delivery statistics
  getDeliveryStats: async (): Promise<{
    success: boolean;
    data: {
      totalDeliveries: number;
      totalWeight: number;
      totalCost: number;
      averageCostPerKg: number;
      deliveriesToday: number;
      deliveriesThisWeek: number;
    }
  }> => {
    return api.get('/fruit-deliveries/stats', { requireAuth: true });
  }
};