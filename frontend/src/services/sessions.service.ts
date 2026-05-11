import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";

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
  return response.data;
};

export const listSessions = async (params: SessionListParams = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SESSIONS.LIST, { params });
  return response.data;
};

