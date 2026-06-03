import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";
import { getResponseData } from "./response.helper";

export interface Pricing {
  id: string;
  name: string;
  base_price: number;
  additional_fees?: number;
  tax_id?: string | null;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const pricingService = {
  async list(parkingLotId?: string) {
    const params: Record<string, any> = { limit: 100 };
    if (parkingLotId) params.parking_lot_id = parkingLotId;
    const response = await axiosInstance.get(API_ENDPOINTS.PRICINGS.LIST, { params });
    return getResponseData(response) as { items: Pricing[]; total: number };
  },

  async createPricing(data: {
    name: string;
    base_price: number;
    additional_fees?: number;
    tax_id?: string | null;
    is_active?: boolean;
  }, parkingLotId?: string) {
    const payload = { ...data, ...(parkingLotId && { parking_lot_id: parkingLotId }) };
    const response = await axiosInstance.post(API_ENDPOINTS.PRICINGS.LIST, payload);
    return getResponseData(response);
  },

  async updatePricing(
    id: string,
    data: Partial<{
      name: string;
      base_price: number;
      additional_fees?: number;
      tax_id?: string | null;
      is_active?: boolean;
    }>,
    parkingLotId?: string,
  ) {
    const payload = { ...data, ...(parkingLotId && { parking_lot_id: parkingLotId }) };
    const response = await axiosInstance.patch(API_ENDPOINTS.PRICINGS.BY_ID(id), payload);
    return getResponseData(response);
  },

  async deletePricing(id: string) {
    const response = await axiosInstance.delete(API_ENDPOINTS.PRICINGS.BY_ID(id));
    return getResponseData(response);
  },
};
