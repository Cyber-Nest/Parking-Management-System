import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";

export type PaymentStatus = "pending" | "success" | "failed" | "refunded";
export type PaymentType = "parking" | "penalty" | "extension";
export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "apple_pay"
  | "visa"
  | "mastercard"
  | "amex";

export interface PaymentListParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: PaymentStatus;
  payment_method?: PaymentMethod;
  payment_type?: PaymentType;
  from?: string;
  to?: string;
}

export const getPaymentSummary = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.SUMMARY);
  return response.data;
};

export const listPayments = async (params: PaymentListParams = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.LIST, { params });
  return response.data;
};

