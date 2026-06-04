import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";
import { getResponseData } from "./response.helper";

export type PaymentStatus = "pending" | "success" | "failed" | "refunded";
export type PaymentType = "parking" | "penalty" | "extension";
export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "apple_pay"
  | "visa"
  | "mastercard"
  | "amex"
  | "cash";

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "amex", label: "Amex" },
  { value: "apple_pay", label: "Apple Pay" },
];

export interface PaymentListParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: PaymentStatus;
  payment_method?: PaymentMethod;
  payment_type?: PaymentType;
  from?: string;
  to?: string;
  parking_lot_id?: string;
}

export const getPaymentSummary = async (params: Pick<PaymentListParams, "parking_lot_id"> = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.SUMMARY, { params });
  return getResponseData(response);
};

export const listPayments = async (params: PaymentListParams = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.LIST, { params });
  return getResponseData(response);
};

export const getPaymentById = async (id: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.BY_ID(id));
  return getResponseData(response);
};

export const getPaymentReceipt = async (id: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.RECEIPT(id));
  return getResponseData(response);
};

