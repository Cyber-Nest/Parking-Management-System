import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";
import { getResponseData } from "./response.helper";

export interface RoleRow {
  id: string;
  name: string;
  description?: string | null;
  permissions: unknown;
  created_at?: string;
  updated_at?: string;
}

export const roleService = {
  async list(params: { page?: number; limit?: number; q?: string } = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.ROLES.LIST, {
      params: { limit: 100, page: 1, ...params },
    });
    return getResponseData(response) as {
      items: RoleRow[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  },

  async createRole(data: { name: string; description?: string; permissions?: unknown }) {
    const response = await axiosInstance.post(API_ENDPOINTS.ROLES.LIST, data);
    return getResponseData(response);
  },

  async updateRole(id: string, data: Partial<{ name: string; description: string; permissions: unknown }>) {
    const response = await axiosInstance.patch(API_ENDPOINTS.ROLES.BY_ID(id), data);
    return getResponseData(response);
  },

  async deleteRole(id: string) {
    const response = await axiosInstance.delete(API_ENDPOINTS.ROLES.BY_ID(id));
    return getResponseData(response);
  },
};
