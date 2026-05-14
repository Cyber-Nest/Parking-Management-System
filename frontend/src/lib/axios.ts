import axios, { type AxiosRequestHeaders } from "axios";

const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[$()*+.?[\\\]^{|}-]/g, "\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
};

export const getTokenValue = (name: string): string | undefined => {
  const cookieValue = getCookie(name);
  if (cookieValue) return cookieValue;

  if (typeof window !== "undefined") {
    return window.localStorage.getItem(name) ?? undefined;
  }

  return undefined;
};

const resolveApiBaseURL = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    return "/api";
  }
  return "http://127.0.0.1:5000/api";
};

const axiosInstance = axios.create({
  baseURL: resolveApiBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getTokenValue("token");
  if (token) {
    config.headers = {
      ...(config.headers as AxiosRequestHeaders),
      Authorization: `Bearer ${token}`,
    } as AxiosRequestHeaders;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("refreshToken");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;