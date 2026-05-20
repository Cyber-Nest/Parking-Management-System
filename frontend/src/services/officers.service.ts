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

export const getOfficerSummary = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.OFFICERS.SUMMARY);
  return getResponseData(response);
};

export const listOfficers = async (params: OfficerListParams = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.OFFICERS.LIST, { params });
  return getResponseData(response);
};

export const getOfficerById = async (id: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.OFFICERS.BY_ID(id));
  return getResponseData(response);
};

export const createOfficer = async (payload: {
  full_name: string;
  email: string;
  phone?: string;
  role: OfficerRoleUi;
  badge_number?: string;
  password?: string;
}) => {
  const response = await axiosInstance.post(API_ENDPOINTS.OFFICERS.LIST, payload);
  return getResponseData(response);
};

export const updateOfficer = async (
  id: string,
  payload: { full_name?: string; phone?: string; role?: OfficerRoleUi; badge_number?: string },
) => {
  const response = await axiosInstance.patch(API_ENDPOINTS.OFFICERS.BY_ID(id), payload);
  return getResponseData(response);
};

export const setOfficerStatus = async (id: string, status: OfficerStatusUi) => {
  const response = await axiosInstance.patch(API_ENDPOINTS.OFFICERS.SET_STATUS(id), { status });
  return getResponseData(response);
};

export const setOfficerDisabled = async (id: string, status: OfficerStatusUi) => {
  const response = await axiosInstance.patch(`${API_ENDPOINTS.OFFICERS.BY_ID(id)}/status`, { status });
  return getResponseData(response);
};

