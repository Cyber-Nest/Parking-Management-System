import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from './api';

interface LoginPayload {
  email: string;
  password: string;
}

export const loginOfficer = async (payload: LoginPayload) => {
  const response = await axiosInstance.post(API_ENDPOINTS.OFFICER_AUTH.LOGIN, payload);
  return response.data;
};

export const forgotOfficerPassword = async (email: string) => {
  const response = await axiosInstance.post(API_ENDPOINTS.OFFICER_AUTH.FORGOT_PASSWORD, { email });
  return response.data;
};

export const resetOfficerPassword = async (token: string, officerId: string, newPassword: string) => {
  const response = await axiosInstance.post(API_ENDPOINTS.OFFICER_AUTH.RESET_PASSWORD, { token, officerId, newPassword });
  return response.data;
};

export const refreshOfficerAccessToken = async (refreshToken: string) => {
  const response = await axiosInstance.post(API_ENDPOINTS.OFFICER_AUTH.REFRESH, { refreshToken });
  return response.data;
};
