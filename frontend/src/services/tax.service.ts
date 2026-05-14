import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";
import { getResponseData } from "./response.helper";

export interface Tax {
  id: string;
  name: string;
  rate: number;
  description?: string;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const taxService = {
  async list() {
    const response = await axiosInstance.get(API_ENDPOINTS.TAXES.LIST, { params: { limit: 100 } });
    return getResponseData(response) as { items: Tax[]; total: number };
  },

  async createTax(data: { name: string; rate: number; description?: string; is_active?: boolean }) {
    const response = await axiosInstance.post(API_ENDPOINTS.TAXES.LIST, data);
    return getResponseData(response);
  },

  async updateTax(id: string, data: Partial<{ name: string; rate: number; description?: string; is_active?: boolean }>) {
    const response = await axiosInstance.patch(API_ENDPOINTS.TAXES.BY_ID(id), data);
    return getResponseData(response);
  },

  async deleteTax(id: string) {
    const response = await axiosInstance.delete(API_ENDPOINTS.TAXES.BY_ID(id));
    return getResponseData(response);
  },
};
