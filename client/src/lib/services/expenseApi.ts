import { api } from '../utils/api';

// Types for expense API
export interface ExpenseData {
  expense_date: string;
  type_id: number;
  amount?: number;
  description?: string;
  notes?: string;
  approved_by?: string;
  status?: 'pending' | 'approved' | 'rejected';
  line_items?: any[];
  trips?: any[];
  fuel?: any[];
  payroll?: any[];
  depreciation?: any[];
}

export interface ExpenseFilters {
  type_id?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  search?: string;
}

export interface ExpenseStats {
  totalExpenses: number;
  approvedExpenses: number;
  pendingExpenses: number;
  expensesThisMonth: number;
  totalAmount: number;
  approvedAmount: number;
}

// Expense API functions following the same pattern as staffApi and deliveryApi
export const expenseApi = {
  // Get all expenses with optional filters
  getExpenses: async (filters?: ExpenseFilters): Promise<{ success: boolean; data: any[]; total: number }> => {
    const queryParams = new URLSearchParams();
    
    if (filters?.type_id) queryParams.append('type_id', filters.type_id.toString());
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.search) queryParams.append('search', filters.search);
    
    const endpoint = `/expenses${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get<{ success: boolean; data: any[]; total: number }>(endpoint, { requireAuth: true });
  },

  // Get single expense by ID
  getExpenseById: async (id: number): Promise<{ success: boolean; data: any }> => {
    return api.get(`/expenses/${id}`, { requireAuth: true });
  },

  // Create new expense
  createExpense: async (expenseData: ExpenseData): Promise<{ success: boolean; data: any; message: string }> => {
    return api.post('/expenses', expenseData, { requireAuth: true });
  },

  // Update existing expense
  updateExpense: async (id: number, expenseData: ExpenseData): Promise<{ success: boolean; data: any; message: string }> => {
    return api.put(`/expenses/${id}`, expenseData, { requireAuth: true });
  },

  // Delete expense
  deleteExpense: async (id: number): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/expenses/${id}`, { requireAuth: true });
  },

  // Get expense statistics
  getExpenseStats: async (): Promise<{
    success: boolean;
    data: ExpenseStats;
  }> => {
    return api.get('/expenses/stats', { requireAuth: true });
  }
};

export default expenseApi;
