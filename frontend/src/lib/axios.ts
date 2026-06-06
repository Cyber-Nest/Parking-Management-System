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
  // Path based on selected role
  const isOfficerPath =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/officer");
  const tokenName = isOfficerPath ? "officer_token" : "Admin_token";
  const token = getTokenValue(tokenName);
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
      const currentPath = window.location.pathname;
      const isOfficerPath = currentPath.startsWith("/officer");

      if (isOfficerPath) {
        window.localStorage.removeItem("officer_token");
        window.localStorage.removeItem("officer_refreshToken");
        document.cookie = "officer_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "officer_refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } else {
        window.localStorage.removeItem("Admin_token");
        window.localStorage.removeItem("Admin_refreshToken");
        document.cookie = "Admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "Admin_refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }

      const isAuthPath = ["/admin/login", "/officer/login", "/officer/forgot-password", "/officer/reset-password"].includes(currentPath);
      // Only redirect for admin/officer routes, not for customer routes
      const isCustomerRoute = currentPath.includes("/payment") || currentPath.includes("/vehicle-details") || currentPath.includes("/booking") || currentPath.includes("/extend") || currentPath.includes("/penalty");
      if (!isAuthPath && !isCustomerRoute) {
        window.location.href = isOfficerPath ? "/officer/login" : "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
