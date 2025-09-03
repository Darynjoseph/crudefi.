import { api } from '../utils/api';

// Types for assets API
export interface Asset {
  asset_id: number;
  asset_name: string;
  asset_code?: string;
  purchase_date: string;
  cost: number;
  useful_life_years: number;
  depreciation_method: string;
  status: string;
  total_depreciation?: number;
  book_value?: number;
  created_at: string;
  updated_at?: string;
}

export interface AssetFilters {
  status?: string;
  search?: string;
}

// Asset API functions
export const assetApi = {
  // Get all assets with filtering
  getAssets: async (filters?: AssetFilters): Promise<{ success: boolean; data: Asset[]; total: number }> => {
    const queryParams = new URLSearchParams();

    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.search) queryParams.append('search', filters.search);

    const endpoint = `/assets${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get<{ success: boolean; data: Asset[]; total: number }>(endpoint, { requireAuth: true });
  },

  // Get single asset
  getAssetById: async (id: number): Promise<{ success: boolean; data: Asset }> => {
    return api.get<{ success: boolean; data: Asset }>(`/assets/${id}`, { requireAuth: true });
  },

  // Create new asset
  createAsset: async (assetData: Omit<Asset, 'asset_id' | 'total_depreciation' | 'book_value' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data: Asset; message: string }> => {
    return api.post<{ success: boolean; data: Asset; message: string }>('/assets', assetData, { requireAuth: true });
  },

  // Update asset
  updateAsset: async (id: number, assetData: Partial<Omit<Asset, 'asset_id' | 'total_depreciation' | 'book_value' | 'created_at' | 'updated_at'>>): Promise<{ success: boolean; data: Asset; message: string }> => {
    return api.put<{ success: boolean; data: Asset; message: string }>(`/assets/${id}`, assetData, { requireAuth: true });
  },

  // Delete asset
  deleteAsset: async (id: number): Promise<{ success: boolean; message: string }> => {
    return api.delete<{ success: boolean; message: string }>(`/assets/${id}`, { requireAuth: true });
  },

  // Get asset statistics
  getAssetStats: async (): Promise<{
    success: boolean;
    data: {
      totalAssets: number;
      activeAssets: number;
      disposedAssets: number;
      totalCost: number;
      totalBookValue: number;
      totalDepreciation: number;
    };
  }> => {
    return api.get<{
      success: boolean;
      data: {
        totalAssets: number;
        activeAssets: number;
        disposedAssets: number;
        totalCost: number;
        totalBookValue: number;
        totalDepreciation: number;
      };
    }>('/assets/stats', { requireAuth: true });
  },

  // Calculate depreciation for a specific asset
  calculateDepreciation: async (id: number, period?: string): Promise<{
    success: boolean;
    data: {
      asset_id: number;
      asset_name: string;
      cost: number;
      total_depreciation: number;
      book_value: number;
      suggested_depreciation: number;
      period: string;
      years_elapsed: number;
      remaining_value: number;
    };
  }> => {
    const endpoint = period ? `/assets/${id}/depreciation?period=${period}` : `/assets/${id}/depreciation`;
    return api.get<{
      success: boolean;
      data: {
        asset_id: number;
        asset_name: string;
        cost: number;
        total_depreciation: number;
        book_value: number;
        suggested_depreciation: number;
        period: string;
        years_elapsed: number;
        remaining_value: number;
      };
    }>(endpoint, { requireAuth: true });
  }
};

export default assetApi;
