import { api } from '../utils/api';

// Types for expense types API
export interface ExpenseType {
  type_id: number;
  type_name: string;
  category_id: number;
  category_name: string;
  description?: string;
  created_at: string;
}

export interface ExpenseTypeFilters {
  category_id?: number;
  search?: string;
}

// Expense Type API functions
export const expenseTypeApi = {
  // Get all expense types with filtering
  getExpenseTypes: async (filters?: ExpenseTypeFilters): Promise<{ success: boolean; data: ExpenseType[]; total: number }> => {
    const queryParams = new URLSearchParams();

    if (filters?.category_id) queryParams.append('category_id', filters.category_id.toString());
    if (filters?.search) queryParams.append('search', filters.search);

    const endpoint = `/expense-types${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get<{ success: boolean; data: ExpenseType[]; total: number }>(endpoint, { requireAuth: true });
  },

  // Get single expense type
  getExpenseTypeById: async (id: number): Promise<{ success: boolean; data: ExpenseType }> => {
    return api.get<{ success: boolean; data: ExpenseType }>(`/expense-types/${id}`, { requireAuth: true });
  },

  // Create new expense type
  createExpenseType: async (expenseTypeData: Partial<ExpenseType>): Promise<{ success: boolean; data: ExpenseType; message: string }> => {
    return api.post<{ success: boolean; data: ExpenseType; message: string }>('/expense-types', expenseTypeData, { requireAuth: true });
  },

  // Update expense type
  updateExpenseType: async (id: number, expenseTypeData: Partial<ExpenseType>): Promise<{ success: boolean; data: ExpenseType; message: string }> => {
    return api.put<{ success: boolean; data: ExpenseType; message: string }>(`/expense-types/${id}`, expenseTypeData, { requireAuth: true });
  },

  // Delete expense type
  deleteExpenseType: async (id: number): Promise<{ success: boolean; message: string }> => {
    return api.delete<{ success: boolean; message: string }>(`/expense-types/${id}`, { requireAuth: true });
  },

  // Get expense type statistics
  getExpenseTypeStats: async (): Promise<{
    success: boolean;
    data: {
      totalTypes: number;
      categoriesUsed: number;
      totalExpensesUsingTypes: number;
    };
  }> => {
    return api.get<{
      success: boolean;
      data: {
        totalTypes: number;
        categoriesUsed: number;
        totalExpensesUsingTypes: number;
      };
    }>('/expense-types/stats', { requireAuth: true });
  }
};

export default expenseTypeApi;
