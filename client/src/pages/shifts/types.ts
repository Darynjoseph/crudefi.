// src/pages/shifts/types.ts

export interface Shift {
  shift_id?: number;
  staff_id: number;
  staff_name?: string;
  role: string; 
  date?: string;
  login_time?: string;
  logout_time?: string;
  shift_status?: 'Open' | 'Closed';
  actual_hours?: number;
  deduction_reason?: string;
  created_by?: number;
  closed_by?: number;
  national_id?: string;
  phone_number?: string;
  base_daily_rate?: number;
}

export interface Staff {
  staff_id: number;
  full_name: string;
  national_id: string;
  phone_number: string;
  base_daily_rate: number;
}

export interface OpenShiftRequest {
  staff_id: number;
  manager_id: number;
  login_time?: string;
  role: string; 
}

export interface CloseShiftRequest {
  manager_id: number;
  logout_time?: string;
  deduction_reason?: string;
}

export interface ShiftFilters {
  date?: string;
  status?: 'Open' | 'Closed';
  role?: string;
  staff_name?: string;
  search?: string;
}

export interface ShiftStats {
  totalShifts: number;
  activeShifts: number;
  shiftsToday: number;
  averageHours: number;
  totalHours: number;
}

export const SHIFT_ROLES = [
  'Manager',
  'Supervisor',
  'Machine Operator',
  'Quality Controller',
  'Cleaner',
  'Security Guard',
  'General Worker'
] as const;

export type ShiftRole = typeof SHIFT_ROLES[number];