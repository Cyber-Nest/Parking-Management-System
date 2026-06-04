import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";
import { getResponseData } from "./response.helper";

export interface Tax {
  id: string;
  name: string;
  rate: number;
  type?: 'percentage' | 'fixed';
  description?: string;
  is_active?: boolean;
  isActive?: boolean;
  parking_lot_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const taxService = {
  async list(parkingLotId?: string) {
    const params: Record<string, any> = { limit: 100 };
    if (parkingLotId) params.parking_lot_id = parkingLotId;
    const response = await axiosInstance.get(API_ENDPOINTS.TAXES.LIST, { params });
    return getResponseData(response) as { items: Tax[]; total: number };
  },

  async createTax(data: { name: string; rate: number; type?: 'percentage' | 'fixed'; description?: string; is_active?: boolean }, parkingLotId?: string) {
    const payload = { ...data, ...(parkingLotId && { parking_lot_id: parkingLotId }) };
    const response = await axiosInstance.post(API_ENDPOINTS.TAXES.LIST, payload);
    return getResponseData(response);
  },

  async updateTax(id: string, data: Partial<{ name: string; rate: number; type?: 'percentage' | 'fixed'; description?: string; is_active?: boolean }>, parkingLotId?: string) {
    const payload = { ...data, ...(parkingLotId && { parking_lot_id: parkingLotId }) };
    const response = await axiosInstance.patch(API_ENDPOINTS.TAXES.BY_ID(id), payload);
    return getResponseData(response);
  },

  async deleteTax(id: string) {
    const response = await axiosInstance.delete(API_ENDPOINTS.TAXES.BY_ID(id));
    return getResponseData(response);
  },
};
