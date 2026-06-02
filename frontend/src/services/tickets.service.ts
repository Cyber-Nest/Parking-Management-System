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
  parking_lot_id?: string;
}

export const getTicketSummary = async (params: Pick<TicketListParams, "parking_lot_id"> = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.TICKETS.SUMMARY, { params });
  return getResponseData(response);
};

export const listTickets = async (params: TicketListParams = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.TICKETS.LIST, { params });
  return getResponseData(response);
};

export const getTicketById = async (id: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.TICKETS.BY_ID(id));
  return getResponseData(response);
};

/** Server-backed payload for penalty ticket reprint (GET …/print). */
export const getTicketPrint = async (id: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.TICKETS.PRINT(id));
  return getResponseData(response);
};

export const updateTicket = async (
  id: string,
  payload: Partial<{
    license_plate: string;
    amount: number;
    reason: string;
    due_date: string | null;
    location_name: string | null;
  }>,
) => {
  const response = await axiosInstance.patch(API_ENDPOINTS.TICKETS.BY_ID(id), payload);
  return getResponseData(response);
};

export const markTicketPaid = async (
  id: string,
  payload?: { payment_method?: string; transaction_ref?: string },
) => {
  const response = await axiosInstance.patch(API_ENDPOINTS.TICKETS.MARK_PAID(id), payload ?? {});
  return getResponseData(response);
};

export const cancelTicket = async (id: string) => {
  const response = await axiosInstance.patch(API_ENDPOINTS.TICKETS.CANCEL(id), {});
  return getResponseData(response);
};

export const addTicketNote = async (id: string, note: string) => {
  const response = await axiosInstance.patch(API_ENDPOINTS.TICKETS.NOTE(id), { note });
  return getResponseData(response);
};

