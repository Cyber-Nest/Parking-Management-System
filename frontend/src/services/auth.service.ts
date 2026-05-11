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

export const refreshAccessToken = async (refreshToken: string) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });

  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);

  return response.data;
};

export const logoutUser = async (refreshToken: string) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });

  return response.data;
};
