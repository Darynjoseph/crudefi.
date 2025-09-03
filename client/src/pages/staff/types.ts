// Staff Management Types

export interface Staff {
  staff_id: number;
  full_name: string;
  national_id: string;
  phone_number?: string;
  created_at?: string;
}

export interface StaffFormData {
  full_name: string;
  national_id: string;
  phone_number?: string;
}

export interface StaffFilters {
  search?: string;
  sortBy?: 'full_name' | 'national_id' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface StaffStats {
  totalStaff: number;
  activeShifts: number;
  newThisMonth: number;
}
