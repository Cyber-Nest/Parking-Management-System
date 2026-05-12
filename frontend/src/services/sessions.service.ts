import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";
import { getResponseData } from "./response.helper";

export type SessionStatus = "active" | "expired" | "extended" | "cancelled";

export interface SessionListParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: SessionStatus;
  from?: string;
  to?: string;
}

export const getSessionSummary = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.SESSIONS.SUMMARY);
  return getResponseData(response);
};

export const listSessions = async (params: SessionListParams = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SESSIONS.LIST, { params });
  return getResponseData(response);
};

