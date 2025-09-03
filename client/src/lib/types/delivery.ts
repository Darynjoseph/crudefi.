// Fruit Delivery Types for CrudeFi System (Updated to match backend schema)

export interface FruitDelivery {
  id: number;
  date: string; // ISO date string
  supplier_name: string;
  supplier_contact?: string;
  vehicle_number?: string;
  fruit_type: string;
  weight: number; // in kg
  price_per_kg: number; // in KES
  total_cost?: number; // calculated: weight * price_per_kg
  ticket_number?: string;
  approved_by?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDeliveryRequest {
  date: string;
  supplier_name: string;
  supplier_contact?: string;
  vehicle_number?: string;
  fruit_type: string;
  weight: number;
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
  page?: number;
  limit?: number;
}

// Common fruit suppliers for dropdown (realistic Kenyan fruit suppliers)
export const FRUIT_SUPPLIERS = [
  'Kakuzi PLC',
  'Del Monte Kenya',
  'Flamingo Horticulture',
  'Finlays Horticulture',
  'Molo River Farm',
  'Kirinyaga Farmers',
  'Murang\'a Fruit Coop',
  'Machakos Suppliers',
  'Kiambu Fresh Produce',
  'Nyeri Highland Farms',
  'Kisii Fruit Growers',
  'Meru Agricultural Coop',
  'Local Market Vendors',
  'Wholesale Distributors',
] as const;

// Common fruit types in Kenya
export const FRUIT_TYPES = [
  'Avocado',
  'Mango',
  'Banana',
  'Orange',
  'Passion Fruit',
  'Pineapple',
  'Papaya',
  'Watermelon',
  'Guava',
  'Lemon',
  'Lime',
  'Coconut',
  'Apple',
  'Grapes',
  'Mixed Fruits',
] as const;

export type FruitSupplier = typeof FRUIT_SUPPLIERS[number];
export type FruitType = typeof FRUIT_TYPES[number];