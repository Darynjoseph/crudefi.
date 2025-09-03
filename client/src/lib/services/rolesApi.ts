// src/lib/services/rolesApi.ts

import { api } from '../utils/api';

export interface Role {
  role_name: string;
  base_daily_rate: number;
}

export interface CreateRoleData {
  role_name: string;
  base_daily_rate: number;
}

export interface UpdateRoleData {
  base_daily_rate: number;
}

export const rolesApi = {
  // Get all roles
  async getAllRoles(): Promise<Role[]> {
    return api.get<Role[]>('/roles', { requireAuth: true });
  },

  // Get role by name
  async getRoleByName(roleName: string): Promise<Role> {
    return api.get<Role>(`/roles/${roleName}`, { requireAuth: true });
  },

  // Create new role
  async createRole(data: CreateRoleData): Promise<Role> {
    return api.post<Role>('/roles', data, { requireAuth: true });
  },

  // Update role
  async updateRole(roleName: string, data: UpdateRoleData): Promise<Role> {
    return api.put<Role>(`/roles/${roleName}`, data, { requireAuth: true });
  },

  // Delete role
  async deleteRole(roleName: string): Promise<void> {
    await api.delete<void>(`/roles/${roleName}`, { requireAuth: true });
  },

  // Get role statistics
  async getRoleStats(): Promise<any> {
    return api.get<any>('/roles/stats', { requireAuth: true });
  }
};
