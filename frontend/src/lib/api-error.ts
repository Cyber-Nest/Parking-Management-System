import { isAxiosError } from "axios";

export const getApiErrorMessage = (error: unknown, fallback = "Request failed"): string => {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  return fallback;
};
