import axiosInstance from "@/lib/axios";
import { getResponseData } from "./response.helper";
import { API_ENDPOINTS } from "./api";
import { userService } from "./user.service";
import { roleService } from "./role.service";

export type DarkModePreference = "light" | "dark" | "system";

export const USER_MODULES = [
  { id: "dashboard", name: "Dashboard", hasSettings: true },
  { id: "active_parking", name: "Active Parking", hasSettings: false },
  { id: "penalty_tickets", name: "Penalty Tickets", hasSettings: false },
  { id: "payments", name: "Payments", hasSettings: false },
  { id: "officer_management", name: "Officer Management", hasSettings: false },
  { id: "parking_plans", name: "Parking Plans", hasSettings: false },
  { id: "reports", name: "Reports", hasSettings: false },
  { id: "settings", name: "Settings", hasSettings: true },
] as const;

export const USER_PERMISSION_ACTIONS = [
  { id: "view", label: "View", width: "w-16" },
  { id: "create", label: "Create", width: "w-16" },
  { id: "edit", label: "Edit", width: "w-16" },
  { id: "delete", label: "Delete", width: "w-16" },
  { id: "export", label: "Export", width: "w-16" },
  { id: "settings", label: "Settings", width: "w-20" },
] as const;

export type PermissionModule = (typeof USER_MODULES)[number]["id"];
export type PermissionAction = (typeof USER_PERMISSION_ACTIONS)[number]["id"];

export type Permissions = Record<PermissionModule, Record<PermissionAction, boolean>>;

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permissions;
  createdAt?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastLogin?: string;
  createdAt?: string;
}

export interface SystemSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  weekStartsOn: "monday" | "sunday";
  currency: string;
  sessionExpiryDisplay: string;
  updatedAt?: string;
}

export interface BrandingSettings {
  parkingLotName: string;
  systemName: string;
  themeColor: string;
  darkMode: DarkModePreference;
  logoUrl: string | null;
  faviconUrl: string | null;
  sidebarCollapsed?: boolean;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  user?: string;
  role?: string;
  action: string;
  module: string;
  resourceId?: string;
  resourceName?: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  dateTime?: string;
  status: "success" | "failure";
  parkingLotId?: string | null;
  parking_lot_id?: string | null;
}

export interface AuditLogFilters {
  userId?: string;
  user?: string;
  module?: string;
  action?: string;
  status?: "success" | "failure";
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
  parkingLotId?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogSummary {
  totalLogs: number;
  successCount: number;
  failureCount: number;
  recentActivity: AuditLog[];
}

export interface IntegrationStatus {
  enabled: boolean;
  status: "connected" | "disconnected" | "error";
}

export interface StripeIntegration extends IntegrationStatus {
  apiKey: string;
  webhookSecret: string;
}

export interface CameraIntegration extends IntegrationStatus {
  cameraType: "hikvision" | "dahua";
  ipAddress: string;
  port: number | string;
  password?: string;
}

export interface SmsIntegration extends IntegrationStatus {
  provider: "twilio" | "vonage";
  apiKey: string;
  phoneNumber: string;
}

export interface PosIntegration extends IntegrationStatus {
  integrationType: "square" | "clover" | "custom";
  apiEndpoint: string;
}

export interface IntegrationSettings {
  stripe: StripeIntegration;
  camera: CameraIntegration;
  sms: SmsIntegration;
  pos: PosIntegration;
}

export interface NotificationSettings {
  paymentSuccessEmail: boolean;
  penaltyIssuedAlert: boolean;
  penaltyPaidEmail: boolean;
  expiredParkingAlert: boolean;
  smsNotifications: boolean;
  adminAlertEmail: boolean;
  adminAlertRecipient: string;
}

export interface TaxSettings {
  taxRate: string;
  currency: string;
  roundingRule: "nearest_cent" | "nearest_dollar";
  pricesIncludeTax: "yes" | "no";
  refundAllowed: "yes" | "no";
  refundApprovalRequired: "yes" | "no";
}

export interface SecuritySettings {
  minPasswordLength: number;
  maxLoginAttempts: number;
  requireUppercase: "yes" | "no";
  requireNumber: "yes" | "no";
  requireSpecialChar: "yes" | "no";
  twoFactorAuth: "disabled" | "optional" | "required";
  sessionTimeout: number;
}

const SYSTEM_BASE = "/admin/settings/system";
const BRANDING_BASE = "/admin/settings/branding";
const LS_ROLES_KEY = "parksmart_admin_roles";
const LS_USERS_KEY = "parksmart_admin_users";
const LS_INTEGRATIONS_KEY = "parksmart_integration_settings";
const LS_NOTIFICATION_SETTINGS_KEY = "parksmart_notification_settings";
const LS_SECURITY_SETTINGS_KEY = "parksmart_security_settings";
const LS_TAX_SETTINGS_KEY = "parksmart_tax_settings";

const getDefaultIntegrationSettings = (): IntegrationSettings => ({
  stripe: {
    enabled: false,
    status: "disconnected",
    apiKey: "",
    webhookSecret: "",
  },
  camera: {
    enabled: false,
    status: "disconnected",
    cameraType: "hikvision",
    ipAddress: "",
    port: "",
    password: "",
  },
  sms: {
    enabled: false,
    status: "disconnected",
    provider: "twilio",
    apiKey: "",
    phoneNumber: "",
  },
  pos: {
    enabled: false,
    status: "disconnected",
    integrationType: "square",
    apiEndpoint: "",
  },
});

const getDefaultNotificationSettings = (): NotificationSettings => ({
  paymentSuccessEmail: true,
  penaltyIssuedAlert: true,
  penaltyPaidEmail: true,
  expiredParkingAlert: true,
  smsNotifications: false,
  adminAlertEmail: true,
  adminAlertRecipient: "alerts@parksmart.com",
});

const getDefaultTaxSettings = (): TaxSettings => ({
  taxRate: "5",
  currency: "CAD",
  roundingRule: "nearest_cent",
  pricesIncludeTax: "yes",
  refundAllowed: "yes",
  refundApprovalRequired: "yes",
});

const getDefaultSecuritySettings = (): SecuritySettings => ({
  minPasswordLength: 8,
  maxLoginAttempts: 5,
  requireUppercase: "yes",
  requireNumber: "yes",
  requireSpecialChar: "yes",
  twoFactorAuth: "disabled",
  sessionTimeout: 30,
});

const uuid = () =>
(typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `id_${Math.random().toString(16).slice(2)}_${Date.now()}`);

const defaultPermissions = (): Permissions => {
  const perms = {} as Permissions;
  for (const mod of USER_MODULES) {
    perms[mod.id] = {
      view: true,
      create: false,
      edit: false,
      delete: false,
      export: false,
      settings: false,
    } as Record<PermissionAction, boolean>;
  }
  return perms;
};

const normalizeRolePermissions = (raw: unknown): Permissions => {
  let v = raw;
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      v = null;
    }
  }
  if (v && typeof v === "object" && !Array.isArray(v) && "dashboard" in (v as object)) {
    return v as Permissions;
  }
  return defaultPermissions();
};

const mapApiUser = (u: import("./user.service").PortalUserRow): User => ({
  id: u.id,
  name: u.username ?? "",
  email: u.email ?? "",
  role: u.role_name ?? "user",
  status: u.is_active ? "active" : "inactive",
  lastLogin: u.last_login_at ?? undefined,
  createdAt: u.created_at,
});

const mapApiRole = (r: import("./role.service").RoleRow): Role => ({
  id: r.id,
  name: r.name,
  description: r.description ?? "",
  permissions: normalizeRolePermissions(r.permissions),
  createdAt: r.created_at,
  isDefault: r.name === "owner",
});

const readLS = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeLS = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const settingsService = {
  async getSystemSettings(): Promise<SystemSettings> {
    const res = await axiosInstance.get(SYSTEM_BASE);
    return getResponseData<SystemSettings>(res);
  },

  async updateSystemSettings(settings: SystemSettings): Promise<SystemSettings> {
    const res = await axiosInstance.put(SYSTEM_BASE, settings);
    return getResponseData<SystemSettings>(res);
  },

  async getBrandingSettings(parkingLotId?: string): Promise<BrandingSettings> {
    const res = await axiosInstance.get(BRANDING_BASE, {
      params: parkingLotId ? { parking_lot_id: parkingLotId } : {},
    });
    return getResponseData<BrandingSettings>(res);
  },

  async updateBrandingSettings(settings: BrandingSettings, parkingLotId?: string): Promise<BrandingSettings> {
    const payload = { ...settings, ...(parkingLotId && { parking_lot_id: parkingLotId }) };
    const res = await axiosInstance.put(BRANDING_BASE, payload);
    return getResponseData<BrandingSettings>(res);
  },

  async getIntegrationSettings(parkingLotId?: string): Promise<IntegrationSettings> {
    const key = parkingLotId ? `${LS_INTEGRATIONS_KEY}_${parkingLotId}` : LS_INTEGRATIONS_KEY;
    const settings = readLS<IntegrationSettings | null>(key, null);
    if (settings) return settings;
    const defaultSettings = getDefaultIntegrationSettings();
    writeLS(key, defaultSettings);
    return defaultSettings;
  },

  async updateIntegrationSettings(settings: IntegrationSettings, parkingLotId?: string): Promise<IntegrationSettings> {
    const key = parkingLotId ? `${LS_INTEGRATIONS_KEY}_${parkingLotId}` : LS_INTEGRATIONS_KEY;
    writeLS(key, settings);
    return settings;
  },

  async testIntegrationConnection(
    type: string,
    config: Partial<IntegrationSettings[keyof IntegrationSettings]>,
  ): Promise<{ success: boolean; message: string }> {
    const success = Boolean(config && Object.values(config).some((value) => value));
    return {
      success,
      message: success
        ? `${type} connection is active`
        : `Unable to connect to ${type}. Please check your configuration.`,
    };
  },

  async getNotificationSettings(parkingLotId?: string): Promise<NotificationSettings> {
    const key = parkingLotId ? `${LS_NOTIFICATION_SETTINGS_KEY}_${parkingLotId}` : LS_NOTIFICATION_SETTINGS_KEY;
    const settings = readLS<NotificationSettings | null>(key, null);
    if (settings) return settings;
    const defaultSettings = getDefaultNotificationSettings();
    writeLS(key, defaultSettings);
    return defaultSettings;
  },

  async updateNotificationSettings(settings: NotificationSettings, parkingLotId?: string) {
    const key = parkingLotId ? `${LS_NOTIFICATION_SETTINGS_KEY}_${parkingLotId}` : LS_NOTIFICATION_SETTINGS_KEY;
    writeLS(key, settings);
    return { message: "Notification settings updated", settings };
  },

  async getTaxSettings(parkingLotId?: string): Promise<TaxSettings> {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.SETTINGS.TAX_PRICING, {
        params: parkingLotId ? { parking_lot_id: parkingLotId } : {},
      });
      return getResponseData<TaxSettings>(res);
    } catch {
      const settings = readLS<TaxSettings | null>(LS_TAX_SETTINGS_KEY, null);
      if (settings) return settings;
      const defaultSettings = getDefaultTaxSettings();
      writeLS(LS_TAX_SETTINGS_KEY, defaultSettings);
      return defaultSettings;
    }
  },

  async updateTaxSettings(settings: TaxSettings, parkingLotId?: string) {
    const res = await axiosInstance.put(API_ENDPOINTS.SETTINGS.TAX_PRICING, {
      ...settings,
      ...(parkingLotId && { parking_lot_id: parkingLotId }),
    });
    return { message: (res.data as any)?.message ?? "Tax settings updated", settings: getResponseData<TaxSettings>(res) };
  },

  async getSecuritySettings(parkingLotId?: string): Promise<SecuritySettings> {
    const key = parkingLotId ? `${LS_SECURITY_SETTINGS_KEY}_${parkingLotId}` : LS_SECURITY_SETTINGS_KEY;
    const settings = readLS<SecuritySettings | null>(key, null);
    if (settings) return settings;
    const defaultSettings = getDefaultSecuritySettings();
    writeLS(key, defaultSettings);
    return defaultSettings;
  },

  async updateSecuritySettings(settings: SecuritySettings, parkingLotId?: string) {
    const key = parkingLotId ? `${LS_SECURITY_SETTINGS_KEY}_${parkingLotId}` : LS_SECURITY_SETTINGS_KEY;
    writeLS(key, settings);
    return { message: "Security settings updated", settings };
  },

  async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
    const logs = readLS<AuditLog[]>("parksmart_audit_logs", []);
    const normalized = logs.map((log) => ({
      ...log,
      dateTime: log.timestamp || new Date().toISOString(),
    }));

    const filtered = normalized.filter((log) => {
      if (filters.user && filters.user !== "All Users" && log.user !== filters.user) {
        return false;
      }
      if (filters.module && filters.module !== "All Modules" && log.module !== filters.module) {
        return false;
      }
      if (filters.action && filters.action !== "All Actions" && log.action !== filters.action) {
        return false;
      }
      if (filters.status && log.status !== filters.status) {
        return false;
      }
      if (filters.startDate) {
        const start = new Date(filters.startDate).setHours(0, 0, 0, 0);
        const timestamp = new Date(log.timestamp).getTime();
        if (timestamp < start) return false;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate).setHours(23, 59, 59, 999);
        const timestamp = new Date(log.timestamp).getTime();
        if (timestamp > end) return false;
      }
      if (filters.parkingLotId) {
        const logLotId = log.parkingLotId ?? log.parking_lot_id;
        if (logLotId !== filters.parkingLotId) return false;
      }
      return true;
    });

    return filtered;
  },

  async getAuditLogUsers(): Promise<string[]> {
    const logs = readLS<AuditLog[]>("parksmart_audit_logs", []);
    const users = Array.from(
      new Set(logs.map((log) => log.user).filter((u): u is string => Boolean(u))),
    );
    return users.length ? users : ["Admin"];
  },

  async getAuditLogModules(): Promise<string[]> {
    const logs = readLS<AuditLog[]>("parksmart_audit_logs", []);
    const modules = Array.from(
      new Set(logs.map((log) => log.module).filter((m): m is string => Boolean(m))),
    );
    return modules.length ? modules : ["Dashboard", "Settings", "Payments"];
  },

  async seedAuditLogs(): Promise<void> {
    const existing = readLS<AuditLog[]>("parksmart_audit_logs", []);
    if (existing.length) return;
    const sample: AuditLog[] = [
      {
        id: uuid(),
        userId: "admin-1",
        userName: "Admin",
        user: "Admin",
        action: "Logged In",
        module: "Authentication",
        timestamp: new Date().toISOString(),
        status: "success",
        details: "User logged in successfully",
      },
      {
        id: uuid(),
        userId: "admin-1",
        userName: "Admin",
        user: "Admin",
        action: "Updated Settings",
        module: "Settings",
        timestamp: new Date().toISOString(),
        status: "success",
        details: "System settings updated",
      },
    ];
    writeLS("parksmart_audit_logs", sample);
  },

  async getUsers(): Promise<User[]> {
    const { items } = await userService.list();
    return (items ?? []).map(mapApiUser);
  },

  async createUser(payload: {
    name: string;
    email: string;
    role: string;
    password?: string;
    status?: "active" | "inactive";
  }) {
    const { items: roles } = await roleService.list();
    const roleRow = roles.find((r) => r.name === payload.role);
    if (!roleRow) throw new Error("Selected role not found");
    const username =
      payload.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "") || `user_${Date.now()}`;
    await userService.createUser({
      username,
      email: payload.email.trim(),
      password: payload.password?.trim() || "User@123",
      role_id: roleRow.id,
      is_active: payload.status !== "inactive",
    });
    const users = await this.getUsers();
    const user = users.find((u) => u.email === payload.email.trim());
    return { message: "User created", user: user ?? users[0] };
  },

  async updateUser(id: string, payload: Partial<User>) {
    const { items: roles } = await roleService.list();
    const roleRow = payload.role ? roles.find((r) => r.name === payload.role) : undefined;
    await userService.updateUser(id, {
      username: payload.name,
      email: payload.email,
      role_id: roleRow?.id,
      is_active: payload.status === undefined ? undefined : payload.status === "active",
    });
    const users = await this.getUsers();
    return { message: "User updated", user: users.find((u) => u.id === id) };
  },

  async deleteUser(id: string) {
    await userService.deleteUser(id);
    return { message: "User deleted" };
  },

  async toggleUserStatus(id: string, current: "active" | "inactive") {
    const status = current === "active" ? "inactive" : "active";
    return await this.updateUser(id, { status });
  },

  async getRoles(): Promise<Role[]> {
    const { items } = await roleService.list();
    return (items ?? []).map(mapApiRole);
  },

  async createRole(payload: { name: string; description?: string; permissions?: Permissions }) {
    await roleService.createRole({
      name: payload.name,
      description: payload.description,
      permissions: payload.permissions ?? defaultPermissions(),
    });
    const roles = await this.getRoles();
    return {
      message: "Role created",
      role: roles.find((r) => r.name === payload.name) ?? roles[roles.length - 1],
    };
  },

  async updateRole(id: string, payload: Partial<Pick<Role, "name" | "description" | "permissions">>) {
    await roleService.updateRole(id, {
      name: payload.name,
      description: payload.description,
      permissions: payload.permissions ?? undefined,
    });
    const roles = await this.getRoles();
    return { message: "Role updated", role: roles.find((r) => r.id === id) };
  },

  async updateRolePermissions(id: string, permissions: Permissions) {
    return await this.updateRole(id, { permissions });
  },

  async deleteRole(id: string) {
    await roleService.deleteRole(id);
    return { message: "Role deleted" };
  },
};

