import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";

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
  return response.data;
};

export const listOfficers = async (params: OfficerListParams = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.OFFICERS.LIST, { params });
  return response.data;
};

