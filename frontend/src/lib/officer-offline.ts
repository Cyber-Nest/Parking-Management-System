import {
  officerPortalService,
  type OfficerDeviceSettings,
  type OfficerOfflineRecord,
} from "@/services/officer-portal.service";

export type OfflineRecordType = OfficerOfflineRecord["type"];

export interface OfflineRecord {
  id: string;
  type: OfflineRecordType;
  title: string;
  subtitle: string;
  payload: Record<string, unknown>;
  createdAt: string;
  status: "pending" | "syncing" | "failed" | "synced";
  errorMessage?: string | null;
}

export interface SyncSettings {
  autoSync: boolean;
  wifiOnly: boolean;
  backgroundSync: boolean;
  syncIntervalMinutes: number;
  lastSyncAt: string | null;
}

const LOCAL_QUEUE_KEY = "officerOfflineQueueFallback";

function mapRecord(row: OfficerOfflineRecord): OfflineRecord {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    subtitle: row.subtitle,
    payload: row.payload,
    createdAt: row.createdAt,
    status: row.status as OfflineRecord["status"],
    errorMessage: row.errorMessage,
  };
}

function readLocalFallback(): OfflineRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalFallback(records: OfflineRecord[]) {
  localStorage.setItem(LOCAL_QUEUE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event("officer-offline-changed"));
}

export function notifyOfflineChanged() {
  window.dispatchEvent(new Event("officer-offline-changed"));
}

export async function fetchOfflineQueue(): Promise<OfflineRecord[]> {
  try {
    const rows = await officerPortalService.listOfflineRecords();
    writeLocalFallback([]);
    return rows.map(mapRecord);
  } catch {
    return readLocalFallback();
  }
}

export async function enqueueOfflineRecord(input: {
  type: OfflineRecordType;
  title: string;
  subtitle?: string;
  payload: Record<string, unknown>;
}): Promise<OfflineRecord> {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    const created = await officerPortalService.createOfflineRecord({
      ...input,
      clientId,
    });
    notifyOfflineChanged();
    return mapRecord(created);
  } catch {
    const local: OfflineRecord = {
      id: clientId,
      type: input.type,
      title: input.title,
      subtitle: input.subtitle ?? "",
      payload: input.payload,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    writeLocalFallback([...readLocalFallback(), local]);
    return local;
  }
}

export async function removeOfflineRecord(id: string): Promise<void> {
  try {
    await officerPortalService.deleteOfflineRecord(id);
  } catch {
    writeLocalFallback(readLocalFallback().filter((r) => r.id !== id));
  }
  notifyOfflineChanged();
}

export async function syncOfflineQueue(): Promise<{
  succeeded: number;
  failed: number;
}> {
  try {
    const result = await officerPortalService.syncOfflineRecords();
    writeLocalFallback([]);
    notifyOfflineChanged();
    return { succeeded: result.succeeded, failed: result.failed };
  } catch {
    const fallback = readLocalFallback();
    if (!fallback.length) throw new Error("Sync failed");
    const ticketPayloads = fallback.filter((r) => r.type === "ticket").map((r) => r.payload);
    if (ticketPayloads.length) {
      const { syncOfflineTickets } = await import("@/services/offline.service");
      await syncOfflineTickets(ticketPayloads);
    }
    writeLocalFallback(fallback.filter((r) => r.type !== "ticket"));
    notifyOfflineChanged();
    return { succeeded: ticketPayloads.length, failed: fallback.length - ticketPayloads.length };
  }
}

export async function getPendingCount(): Promise<number> {
  try {
    const shift = await officerPortalService.getShift();
    return shift.pendingOfflineCount;
  } catch {
    return readLocalFallback().filter((r) => r.status === "pending" || r.status === "failed").length;
  }
}

export function getPendingByType(records: OfflineRecord[]) {
  const queue = records.filter((r) => r.status !== "syncing" && r.status !== "synced");
  return {
    tickets: queue.filter((r) => r.type === "ticket").length,
    evidence: queue.filter((r) => r.type === "evidence").length,
    payments: queue.filter((r) => r.type === "payment").length,
    other: queue.filter((r) => r.type === "other").length,
    total: queue.length,
  };
}

export async function loadSyncSettings(): Promise<SyncSettings> {
  try {
    const settings = await officerPortalService.getSettings();
    const sync = settings.sync ?? {};
    return {
      autoSync: sync.autoSync ?? true,
      wifiOnly: sync.wifiOnly ?? false,
      backgroundSync: sync.backgroundSync ?? true,
      syncIntervalMinutes: sync.syncIntervalMinutes ?? 15,
      lastSyncAt: sync.lastSyncAt ?? null,
    };
  } catch {
    return {
      autoSync: true,
      wifiOnly: false,
      backgroundSync: true,
      syncIntervalMinutes: 15,
      lastSyncAt: null,
    };
  }
}

export async function saveSyncSettings(patch: Partial<SyncSettings>): Promise<SyncSettings> {
  const current: OfficerDeviceSettings = await officerPortalService.getSettings().catch(() => ({}));
  const next: SyncSettings = {
    autoSync: patch.autoSync ?? current.sync?.autoSync ?? true,
    wifiOnly: patch.wifiOnly ?? current.sync?.wifiOnly ?? false,
    backgroundSync: patch.backgroundSync ?? current.sync?.backgroundSync ?? true,
    syncIntervalMinutes: patch.syncIntervalMinutes ?? current.sync?.syncIntervalMinutes ?? 15,
    lastSyncAt: patch.lastSyncAt ?? current.sync?.lastSyncAt ?? null,
  };
  await officerPortalService.saveSettings({
    ...current,
    sync: next,
  });
  return next;
}

/** @deprecated use loadSyncSettings */
export function getSyncSettings(): SyncSettings {
  return {
    autoSync: true,
    wifiOnly: false,
    backgroundSync: true,
    syncIntervalMinutes: 15,
    lastSyncAt: null,
  };
}

/** @deprecated use saveSyncSettings */
export function saveSyncSettingsLegacy(settings: SyncSettings) {
  void saveSyncSettings(settings);
}
