import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";
import { getResponseData } from "./response.helper";

export interface ParkingPlan {
  id: string;
  name: string;
  type?: string;
  price: number;
  tax?: number;
  duration: number;
  status?: "Active" | "Inactive" | string;
  parking_lot_id?: string | null;
  parking_lot_name?: string | null;
  updatedDate?: string;
  updatedTime?: string;
  created_at?: string;
  updated_at?: string;
}

export const listParkingPlans = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.PARKING_PLANS.LIST);
  return getResponseData(response);
};

export const createParkingPlan = async (payload: {
  name: string;
  price: number;
  duration: number;
  plan_type?: string;
  tax_percent?: number;
  status?: string;
  parking_lot_id?: string | null;
}) => {
  const response = await axiosInstance.post(API_ENDPOINTS.PARKING_PLANS.LIST, payload);
  return getResponseData(response);
};

export const updateParkingPlan = async (
  id: string,
  payload: {
    name?: string;
    price?: number;
    duration?: number;
    plan_type?: string;
    tax_percent?: number;
    status?: string;
    parking_lot_id?: string | null;
  },
) => {
  const response = await axiosInstance.patch(`${API_ENDPOINTS.PARKING_PLANS.LIST}/${id}`, payload);
  return getResponseData(response);
};

export const deleteParkingPlan = async (id: string) => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.PARKING_PLANS.LIST}/${id}`);
  return getResponseData(response);
};

