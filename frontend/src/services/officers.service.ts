import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";
import { getResponseData } from "./response.helper";

export type OfficerStatusUi = "ACTIVE" | "DISABLED";
export type OfficerRoleUi = "OFFICER" | "SUPERVISOR";

export interface OfficerListParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: OfficerStatusUi;
  role?: OfficerRoleUi;
}

export interface CreateOfficerPayload {
  full_name: string;
  email: string;
  phone?: string;
  role: OfficerRoleUi;
  badge_number?: string;
  password?: string;
}

export interface UpdateOfficerPayload {
  full_name?: string;
  phone?: string;
  role?: OfficerRoleUi;
  badge_number?: string;
}

export const getOfficerSummary = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.OFFICERS.SUMMARY);
  return getResponseData(response);
};

export const listOfficers = async (params: OfficerListParams = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.OFFICERS.LIST, { params });
  return getResponseData(response);
};

export const createOfficer = async (payload: CreateOfficerPayload) => {
  const response = await axiosInstance.post(API_ENDPOINTS.OFFICERS.LIST, payload);
  return getResponseData(response);
};

export const updateOfficer = async (id: string, payload: UpdateOfficerPayload) => {
  const response = await axiosInstance.patch(`${API_ENDPOINTS.OFFICERS.LIST}/${id}`, payload);
  return getResponseData(response);
};

export const deleteOfficer = async (id: string) => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.OFFICERS.LIST}/${id}`);
  return getResponseData(response);
};

