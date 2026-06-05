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
  parking_lot_id?: string;
}

export const getSessionSummary = async (params: Pick<SessionListParams, "parking_lot_id"> = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SESSIONS.SUMMARY, { params });
  return getResponseData(response);
};

export const listSessions = async (params: SessionListParams = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SESSIONS.LIST, { params });
  return getResponseData(response);
};

export const cancelSession = async (id: string, reason?: string) => {
  const response = await axiosInstance.patch(API_ENDPOINTS.SESSIONS.CANCEL(id), { reason });
  return getResponseData(response);
};

