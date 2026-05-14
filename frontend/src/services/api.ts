export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/admin/auth/login",
    LOGOUT: "/admin/auth/logout",
    REFRESH: "/admin/auth/refresh",
    ME: "/admin/auth/me",
  },

  OFFICERS: {
    LIST: "/admin/officers",
    SUMMARY: "/admin/officers/summary",
  },

  TICKETS: {
    LIST: "/admin/tickets",
    SUMMARY: "/admin/tickets/summary",
  },

  PAYMENTS: {
    LIST: "/admin/payments",
    SUMMARY: "/admin/payments/summary",
  },

  PARKING_PLANS: {
    LIST: "/admin/parking-plans",
  },

  REPORTS: {
    GET: (type: string) => `/admin/reports/${type}`,
    EXPORT: (type: string) => `/admin/reports/${type}/export`,
  },

  SESSIONS: {
    LIST: "/admin/sessions",
    SUMMARY: "/admin/sessions/summary",
  },
};