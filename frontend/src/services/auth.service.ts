import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";

interface LoginPayload {
  email: string;
  password: string;
}

export const loginUser = async (payload: LoginPayload) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, payload);

  return response.data;
};

export const logoutUser = async () => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);

  return response.data;
};
