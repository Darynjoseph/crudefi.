// Oil Extraction Logs Types for Normalized Database Structure

export interface OilExtractionLog {
  id: number;
  date: string; // ISO date string
  fruit_id: number;
  fruit_type: string; // from JOIN with fruits table (fruit_name)
  input_quantity_kg: number;
  oil_extracted_l: number;
  supplied_oil_l: number;
  waste_kg: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Calculated fields
  yield_percent: number;
  efficiency_percent: number;
}

export interface CreateOilLogRequest {
  date: string;
  fruit_id: number;
  input_quantity_kg: number;
  oil_extracted_l: number;
  supplied_oil_l: number;
  waste_kg: number;
  notes?: string;
  created_by?: string;
}

export interface UpdateOilLogRequest extends Partial<CreateOilLogRequest> {
  id: number;
}

export interface OilLogFilters {
  fruit_type?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface OilLogResponse {
  success: boolean;
  data: OilExtractionLog[];
  total: number;
}

export interface OilLogStatsResponse {
  success: boolean;
  data: {
    overview: {
      totalExtractions: number;
      totalInputKg: number;
      totalOilExtractedL: number;
      totalSuppliedOilL: number;
      totalWasteKg: number;
      avgYieldPercent: number;
      avgEfficiencyPercent: number;
      extractionsToday: number;
      extractionsThisWeek: number;
    };
    fruitStats: Array<{
      fruit_name: string;
      extraction_count: number;
      total_input_kg: number;
      total_oil_extracted_l: number;
      avg_yield_percent: number;
    }>;
  };
}
