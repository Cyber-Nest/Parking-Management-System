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
    BY_ID: (id: string) => `/admin/officers/${id}`,
    SET_STATUS: (id: string) => `/admin/officers/${id}/status`,
  },

  TICKETS: {
    LIST: "/admin/tickets",
    SUMMARY: "/admin/tickets/summary",
    BY_ID: (id: string) => `/admin/tickets/${id}`,
    MARK_PAID: (id: string) => `/admin/tickets/${id}/mark-paid`,
    CANCEL: (id: string) => `/admin/tickets/${id}/cancel`,
    NOTE: (id: string) => `/admin/tickets/${id}/note`,
  },

  PAYMENTS: {
    LIST: "/admin/payments",
    SUMMARY: "/admin/payments/summary",
    BY_ID: (id: string) => `/admin/payments/${id}`,
    RECEIPT: (id: string) => `/admin/payments/${id}/receipt`,
  },

  PARKING_PLANS: {
    LIST: "/admin/parking-plans",
    BY_ID: (id: string) => `/admin/parking-plans/${id}`,
  },

  PENALTY_RULES: {
    LIST: "/admin/penalty-rules",
    BY_ID: (id: string) => `/admin/penalty-rules/${id}`,
  },

  TAXES: {
    LIST: "/admin/taxes",
    BY_ID: (id: string) => `/admin/taxes/${id}`,
  },

  PRICINGS: {
    LIST: "/admin/pricings",
    BY_ID: (id: string) => `/admin/pricings/${id}`,
  },

  USERS: {
    LIST: "/admin/users",
    BY_ID: (id: string) => `/admin/users/${id}`,
  },

  ROLES: {
    LIST: "/admin/roles",
    BY_ID: (id: string) => `/admin/roles/${id}`,
  },

  REPORTS: {
    GET: (type: string) => `/admin/reports/${type}`,
    EXPORT: (type: string) => `/admin/reports/${type}/export`,
  },

  SESSIONS: {
    LIST: "/admin/sessions",
    SUMMARY: "/admin/sessions/summary",
  },

  SETTINGS: {
    TAX_PRICING: "/admin/settings/tax-pricing",
    ADMIN_USERS: "/admin/settings/admin-users",
    ADMIN_USER: (id: string) => `/admin/settings/admin-users/${id}`,
    ROLES: "/admin/settings/roles",
    ROLE_PERMISSIONS: (id: string) => `/admin/settings/roles/${id}/permissions`,
  },
};