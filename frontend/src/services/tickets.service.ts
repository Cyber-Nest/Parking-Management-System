import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";
import { getResponseData } from "./response.helper";

export type TicketStatus = "unpaid" | "paid" | "cancelled" | "disputed" | "resolved";

export interface TicketListParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: TicketStatus;
  officer_id?: string;
  from?: string; // yyyy-mm-dd or datetime string (backend forwards to SQL)
  to?: string;
}

export const getTicketSummary = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.TICKETS.SUMMARY);
  return getResponseData(response);
};

export const listTickets = async (params: TicketListParams = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.TICKETS.LIST, { params });
  return getResponseData(response);
};

