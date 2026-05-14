import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";
import { getResponseData } from "./response.helper";

export interface PortalUserRow {
  id: string;
  username: string;
  email: string;
  role_id: string;
  role_name?: string | null;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export const userService = {
  async list(params: { page?: number; limit?: number; q?: string } = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.USERS.LIST, {
      params: { limit: 100, page: 1, ...params },
    });
    return getResponseData(response) as {
      items: PortalUserRow[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  },

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    role_id: string;
    is_active?: boolean;
  }) {
    const response = await axiosInstance.post(API_ENDPOINTS.USERS.LIST, data);
    return getResponseData(response);
  },

  async updateUser(
    id: string,
    data: Partial<{
      username: string;
      email: string;
      role_id: string;
      is_active: boolean;
    }>,
  ) {
    const response = await axiosInstance.patch(API_ENDPOINTS.USERS.BY_ID(id), data);
    return getResponseData(response);
  },

  async deleteUser(id: string) {
    const response = await axiosInstance.delete(API_ENDPOINTS.USERS.BY_ID(id));
    return getResponseData(response);
  },
};
