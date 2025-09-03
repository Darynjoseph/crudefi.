// Updated Fruit Delivery Types for Normalized Database Structure

export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_info?: string;
  location?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Fruit {
  fruit_id: number;
  fruit_name: string;
  created_at: string;
  updated_at: string;
}

export interface FruitDelivery {
  id: number;
  date: string; // ISO date string
  supplier_id: number;
  supplier_name: string; // from JOIN with suppliers table
  supplier_contact?: string;
  vehicle_number?: string;
  fruit_id: number;
  fruit_type: string; // from JOIN with fruits table (fruit_name)
  weight_kg: number; // normalized column name
  price_per_kg: number; // in KES
  total_cost: number; // calculated: weight_kg * price_per_kg
  ticket_number?: string;
  approved_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDeliveryRequest {
  date: string;
  supplier_id: number;
  supplier_contact?: string;
  vehicle_number?: string;
  fruit_id: number;
  weight_kg: number;
  price_per_kg: number;
  ticket_number?: string;
  approved_by?: string;
  notes?: string;
}

export interface UpdateDeliveryRequest extends Partial<CreateDeliveryRequest> {
  id: number;
}

export interface DeliveryFilters {
  supplier_name?: string;
  dateFrom?: string;
  dateTo?: string;
  fruit_type?: string;
  search?: string;
}

export interface DeliveryResponse {
  success: boolean;
  data: FruitDelivery[];
  total: number;
}

export interface SupplierResponse {
  success: boolean;
  data: Supplier[];
  total: number;
}

export interface FruitResponse {
  success: boolean;
  data: Fruit[];
  total: number;
}

export interface DeliveryStatsResponse {
  success: boolean;
  data: {
    overview: {
      total_deliveries: number;
      total_weight: number;
      total_cost: number;
      average_cost_per_kg: number;
      deliveries_today: number;
      deliveries_this_week: number;
    };
    supplierStats: Array<{
      supplier_name: string;
      delivery_count: number;
      total_weight: number;
      total_value: number;
    }>;
    fruitStats: Array<{
      fruit_name: string;
      delivery_count: number;
      total_weight: number;
      total_value: number;
    }>;
  };
}

export interface CreateSupplierRequest {
  supplier_name: string;
  contact_info?: string;
  location?: string;
  status?: 'active' | 'inactive';
}

export interface CreateFruitRequest {
  fruit_name: string;
}
