// src/lib/services/salaryApi.ts

import { api } from '../utils/api';

export interface SalaryRecord {
  salary_id: number;
  shift_id: number;
  staff_id: number;
  staff_name: string;
  role: string;
  role_rate: number;
  hourly_rate: number;
  total_hours: number;
  deduction_reason?: string;
  total_amount: number;
  payment_status: 'Pending' | 'Paid';
  created_at: string;
}

export interface MonthlyReportFilters {
  month?: string;
  year?: string;
  staff_id?: number;
  role?: string;
  payment_status?: 'Pending' | 'Paid';
}

export const salaryApi = {
  // Get all salary records
  async getAllSalaryRecords(): Promise<{ success: boolean; data: SalaryRecord[] }> {
    return api.get<{ success: boolean; data: SalaryRecord[] }>('/salary');
  },

  // Get salary record by ID
  async getSalaryById(salaryId: number): Promise<{ success: boolean; data: SalaryRecord }> {
    return api.get<{ success: boolean; data: SalaryRecord }>(`/salary/${salaryId}`);
  },

  // Mark salary as paid
  async markSalaryAsPaid(salaryId: number): Promise<{ success: boolean; message: string }> {
    return api.put<{ success: boolean; message: string }>(`/salary/${salaryId}/pay`, {});
  },

  // Get monthly salary report
  async getMonthlyReport(filters?: MonthlyReportFilters): Promise<{ success: boolean; data: SalaryRecord[] }> {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month);
    if (filters?.year) params.append('year', filters.year);
    if (filters?.staff_id) params.append('staff_id', filters.staff_id.toString());
    if (filters?.role) params.append('role', filters.role);
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    
    const endpoint = `/salary/report${params.toString() ? `?${params.toString()}` : ''}`;
    return api.get<{ success: boolean; data: SalaryRecord[] }>(endpoint);
  },

  // Get salary statistics
  async getSalaryStats(): Promise<{ success: boolean; data: any }> {
    return api.get<{ success: boolean; data: any }>('/salary/stats');
  }
};
