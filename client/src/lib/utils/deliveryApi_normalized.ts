import { api } from './api';
import { 
  FruitDelivery, 
  CreateDeliveryRequest, 
  UpdateDeliveryRequest, 
  DeliveryFilters,
  DeliveryResponse,
  DeliveryStatsResponse,
  Supplier,
  Fruit,
  SupplierResponse,
  FruitResponse,
  CreateSupplierRequest,
  CreateFruitRequest
} from '../types/delivery_normalized';

// Fruit Delivery API functions (updated for normalized structure)
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
  getDeliveryStats: async (): Promise<DeliveryStatsResponse> => {
    return api.get('/fruit-deliveries/stats', { requireAuth: true });
  },

  // Get suppliers for dropdown
  getDeliverySuppliers: async (): Promise<{ success: boolean; data: Array<{ supplier_id: number; supplier_name: string }> }> => {
    return api.get('/fruit-deliveries/suppliers', { requireAuth: true });
  },

  // Get fruits for dropdown
  getDeliveryFruits: async (): Promise<{ success: boolean; data: Array<{ fruit_id: number; fruit_name: string }> }> => {
    return api.get('/fruit-deliveries/fruits', { requireAuth: true });
  }
};

// Supplier API functions
export const supplierApi = {
  // Get all suppliers
  getSuppliers: async (filters?: { status?: string; search?: string }): Promise<SupplierResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.search) queryParams.append('search', filters.search);
    
    const endpoint = `/suppliers${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get<SupplierResponse>(endpoint, { requireAuth: true });
  },

  // Get single supplier by ID
  getSupplier: async (id: number): Promise<{ success: boolean; data: Supplier }> => {
    return api.get(`/suppliers/${id}`, { requireAuth: true });
  },

  // Create new supplier
  createSupplier: async (supplier: CreateSupplierRequest): Promise<{ success: boolean; data: Supplier; message: string }> => {
    return api.post('/suppliers', supplier, { requireAuth: true });
  },

  // Update existing supplier
  updateSupplier: async (id: number, supplier: Partial<CreateSupplierRequest>): Promise<{ success: boolean; data: Supplier; message: string }> => {
    return api.put(`/suppliers/${id}`, supplier, { requireAuth: true });
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

// Fruit API functions
export const fruitApi = {
  // Get all fruits
  getFruits: async (filters?: { search?: string }): Promise<FruitResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters?.search) queryParams.append('search', filters.search);
    
    const endpoint = `/fruits${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get<FruitResponse>(endpoint, { requireAuth: true });
  },

  // Get single fruit by ID
  getFruit: async (id: number): Promise<{ success: boolean; data: Fruit }> => {
    return api.get(`/fruits/${id}`, { requireAuth: true });
  },

  // Create new fruit
  createFruit: async (fruit: CreateFruitRequest): Promise<{ success: boolean; data: Fruit; message: string }> => {
    return api.post('/fruits', fruit, { requireAuth: true });
  },

  // Update existing fruit
  updateFruit: async (id: number, fruit: Partial<CreateFruitRequest>): Promise<{ success: boolean; data: Fruit; message: string }> => {
    return api.put(`/fruits/${id}`, fruit, { requireAuth: true });
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
