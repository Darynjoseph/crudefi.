import { api } from '../utils/api';

// Types for expense categories API
export interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

// Expense Category API functions
export const expenseCategoryApi = {
  // Get all expense categories
  getCategories: async (): Promise<{ success: boolean; data: ExpenseCategory[] }> => {
    return api.get<{ success: boolean; data: ExpenseCategory[] }>('/expense-categories', { requireAuth: true });
  },

  // Create new expense category
  createCategory: async (categoryData: Omit<ExpenseCategory, 'category_id' | 'created_at'>): Promise<{ success: boolean; data: ExpenseCategory; message: string }> => {
    return api.post<{ success: boolean; data: ExpenseCategory; message: string }>('/expense-categories', categoryData, { requireAuth: true });
  },

  // Update expense category
  updateCategory: async (id: number, categoryData: Omit<ExpenseCategory, 'category_id' | 'created_at'>): Promise<{ success: boolean; data: ExpenseCategory; message: string }> => {
    return api.put<{ success: boolean; data: ExpenseCategory; message: string }>(`/expense-categories/${id}`, categoryData, { requireAuth: true });
  },

  // Delete expense category
  deleteCategory: async (id: number): Promise<{ success: boolean; message: string }> => {
    return api.delete<{ success: boolean; message: string }>(`/expense-categories/${id}`, { requireAuth: true });
  }
};

export default expenseCategoryApi;
