import axiosInstance from "@/lib/axios";
import { getResponseData } from "./response.helper";

export interface OfficerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  badgeNumber: string | null;
  role: string;
  status: string;
  assignedZone: string;
  lastLoginAt: string | null;
}

export interface OfficerShiftState {
  onDuty: boolean;
  shift: {
    id: string;
    startedAt: string;
    endedAt: string | null;
    status: string;
  } | null;
  onDutySecondsToday: number;
  pendingOfflineCount: number;
}

export interface OfficerOfflineRecord {
  id: string;
  type: "ticket" | "evidence" | "payment" | "other";
  title: string;
  subtitle: string;
  payload: Record<string, unknown>;
  status: string;
  errorMessage?: string | null;
  createdAt: string;
  syncedAt?: string | null;
}

export interface OfficerDeviceSettings {
  printer?: Record<string, unknown>;
  camera?: Record<string, unknown>;
  sync?: {
    autoSync?: boolean;
    wifiOnly?: boolean;
    backgroundSync?: boolean;
    syncIntervalMinutes?: number;
    lastSyncAt?: string | null;
  };
  gps?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
}

const unwrap = <T>(response: { data: unknown }) => getResponseData<T>(response as never);

export const officerPortalService = {
  async getProfile(): Promise<OfficerProfile> {
    return unwrap(await axiosInstance.get("/officer/me/profile"));
  },

  async updateProfile(body: { phone?: string; assignedZone?: string }): Promise<OfficerProfile> {
    return unwrap(await axiosInstance.patch("/officer/me/profile", body));
  },

  async getSettings(): Promise<OfficerDeviceSettings> {
    return unwrap(await axiosInstance.get("/officer/me/settings"));
  },

  async saveSettings(settings: OfficerDeviceSettings): Promise<OfficerDeviceSettings> {
    return unwrap(await axiosInstance.put("/officer/me/settings", settings));
  },

  async getShift(): Promise<OfficerShiftState> {
    return unwrap(await axiosInstance.get("/officer/me/shift"));
  },

  async startShift(): Promise<OfficerShiftState> {
    return unwrap(await axiosInstance.post("/officer/me/shift/start"));
  },

  async endShift(): Promise<OfficerShiftState> {
    return unwrap(await axiosInstance.post("/officer/me/shift/end"));
  },

  async listOfflineRecords(): Promise<OfficerOfflineRecord[]> {
    return unwrap(await axiosInstance.get("/officer/offline-records"));
  },

  async createOfflineRecord(body: {
    type: OfficerOfflineRecord["type"];
    title: string;
    subtitle?: string;
    payload: Record<string, unknown>;
    clientId?: string;
  }): Promise<OfficerOfflineRecord> {
    return unwrap(await axiosInstance.post("/officer/offline-records", body));
  },

  async deleteOfflineRecord(id: string): Promise<void> {
    await axiosInstance.delete(`/officer/offline-records/${id}`);
  },

  async syncOfflineRecords(): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
    lastSyncAt?: string;
  }> {
    return unwrap(await axiosInstance.post("/officer/offline-records/sync"));
  },
};

export function formatDutyDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDutyShort(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
