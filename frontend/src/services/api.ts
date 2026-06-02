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
    PRINT: (id: string) => `/admin/tickets/${id}/print`,
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

  PARKING_ZONES: {
    LIST: "/admin/parking-zones",
    BY_ID: (id: string) => `/admin/parking-zones/${id}`,
  },
  PARKING_LOTS: {
    LIST: "/admin/parking-lots",
    BY_ID: (id: string) => `/admin/parking-lots/${id}`,
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

  CUSTOMER: {
    PARKING_ZONE: (id: string) => `/customer/parking-zones/${id}`,
    PAYMENT_INTENT: "/customer/payment-intents",
    BOOKINGS: "/customer/bookings",
    BOOKING_BY_ID: (id: string) => `/customer/bookings/${id}`,
    BOOKING_BY_REFERENCE: (reference: string) => `/customer/bookings/reference/${reference}`,
    BOOKING_EXTEND: (id: string) => `/customer/bookings/${id}/extend`,
    PENALTY: (id: string) => `/customer/penalties/${id}`,
    PENALTY_RECEIPT: (id: string) => `/customer/penalties/${id}/receipt`,
    PENALTY_PAY: (id: string) => `/customer/penalties/${id}/pay`,
    PENALTY_DISPUTE: (id: string) => `/customer/penalties/${id}/dispute`,
    INVOICE: (id: string) => `/customer/invoices/${id}`,
    INVOICE_DOWNLOAD: (id: string) => `/customer/invoices/${id}/download`,
    CONFIG: "/customer/config",
  },

  MEDIA: {
    UPLOAD: "/media/upload",
  },

  OFFICER: {
    DASHBOARD: "/officer/dashboard",
    SCAN: "/officer/scan",
    TICKETS: "/officer/tickets",
    TICKET_BY_ID: (id: string) => `/officer/tickets/${id}`,
    TICKET_PRINT: (id: string) => `/officer/tickets/${id}/print`,
    TICKET_PAY: (id: string) => `/officer/tickets/${id}/pay`,
    TICKET_EVIDENCE: (id: string) => `/officer/tickets/${id}/evidence`,
    TICKET_REVIEW: (id: string) => `/officer/tickets/${id}/review`,
    SESSIONS: "/officer/sessions",
    EVIDENCE: "/officer/evidence",
    EVIDENCE_BY_ID: (id: string) => `/officer/evidence/${id}`,
    PHOTOS: "/officer/photos",
    MANUAL_ENTRY: "/officer/manual-entry",
    VEHICLE_HISTORY: (plate: string) => `/officer/vehicles/${encodeURIComponent(plate)}/history`,
    SYNC: "/officer/sync",
    PROFILE: "/officer/me/profile",
    SETTINGS: "/officer/me/settings",
    SHIFT: "/officer/me/shift",
    SHIFT_START: "/officer/me/shift/start",
    SHIFT_END: "/officer/me/shift/end",
    OFFLINE_RECORDS: "/officer/offline-records",
    OFFLINE_SYNC: "/officer/offline-records/sync",
  },

  OFFICER_AUTH: {
    LOGIN: "/officer/auth/login",
    FORGOT_PASSWORD: "/officer/auth/forgot-password",
    RESET_PASSWORD: "/officer/auth/reset-password",
    REFRESH: "/officer/auth/refresh",
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
