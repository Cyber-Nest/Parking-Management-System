import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";

export interface ParkingPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  created_at?: string;
  updated_at?: string;
}

export const listParkingPlans = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.PARKING_PLANS.LIST);
  return response.data;
};

export const createParkingPlan = async (payload: { name: string; price: number; duration: number }) => {
  const response = await axiosInstance.post(API_ENDPOINTS.PARKING_PLANS.LIST, payload);
  return response.data;
};

export const updateParkingPlan = async (
  id: string,
  payload: { name?: string; price?: number; duration?: number }
) => {
  const response = await axiosInstance.patch(`${API_ENDPOINTS.PARKING_PLANS.LIST}/${id}`, payload);
  return response.data;
};

export const deleteParkingPlan = async (id: string) => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.PARKING_PLANS.LIST}/${id}`);
  return response.data;
};

