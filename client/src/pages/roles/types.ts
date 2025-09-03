// Types for Roles Management

export interface Role {
  role_name: string;
  base_daily_rate: number;
  created_at?: string;
}

export interface RoleFormData {
  role_name: string;
  base_daily_rate: number;
}
