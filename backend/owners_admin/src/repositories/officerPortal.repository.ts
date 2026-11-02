import crypto from "crypto";
import { getMongoDatabase } from "../config/mongodb";

export type OfflineRecordType = "ticket" | "evidence" | "payment" | "other";
export type OfflineRecordStatus = "pending" | "syncing" | "synced" | "failed";
export interface OfficerProfileRow { id: string; full_name: string; email: string; phone: string | null; badge_number: string | null; role: string; status: string; assigned_zone: string | null; last_login_at: Date | null; parking_lot_id: string | null; lot_name: string | null }
export interface OfficerShiftRow { id: string; officer_id: string; started_at: Date; ended_at: Date | null; status: "active" | "ended" }
export interface OfficerOfflineRow { id: string; officer_id: string; record_type: OfflineRecordType; title: string; subtitle: string | null; payload_json: string; status: OfflineRecordStatus; error_message: string | null; client_id: string | null; created_at: Date; synced_at: Date | null }

const DEFAULT_SETTINGS = {
  printer: { selectedPrinter: "bixolon", paperSize: "80mm", density: "Normal", autoCut: true, printBeep: true, printBarcode: true },
  camera: { resolution: "1920x1080", watermark: true, autoTimestamp: true, compression: "medium" },
  sync: { autoSync: true, wifiOnly: false, backgroundSync: true, syncIntervalMinutes: 15, lastSyncAt: null as string | null },
  gps: { mode: "High Accuracy", updateFrequency: "Every 15 Seconds" },
  preferences: { language: "English", autoLock: true, dateTimeFormat: "May 20, 2025 10:30 AM", timeZone: "(UTC-04:00) Toronto" },
};

type MongoDoc = { _id: string; [key: string]: unknown };
const db = () => getMongoDatabase();
const mapById = <T extends { id: string }>(document: MongoDoc): T => {
  const { _id, ...rest } = document;
  return { ...rest, id: _id } as T;
};
const dayStart = () => { const now = new Date(); return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); };

export class OfficerPortalRepository {
  async findOfficerById(id: string): Promise<OfficerProfileRow | null> {
    const officer = await db().collection<MongoDoc>("officers").findOne({ _id: id });
    if (!officer) return null;
    const lots = db().collection<{ _id: string; lot_name: string; created_at: Date }>("parking_lots");
    const [assignedLot, firstLot] = await Promise.all([
      officer.parking_lot_id ? lots.findOne({ _id: String(officer.parking_lot_id) }) : null,
      lots.find().sort({ created_at: 1, _id: 1 }).limit(1).next(),
    ]);
    const lot = assignedLot ?? firstLot;
    return {
      id: officer._id,
      full_name: String(officer.full_name ?? ""),
      email: String(officer.email ?? ""),
      phone: (officer.phone as string | null | undefined) ?? null,
      badge_number: (officer.badge_number as string | null | undefined) ?? null,
      role: String(officer.role ?? "OFFICER"),
      status: String(officer.status ?? "active"),
      assigned_zone: (officer.assigned_zone as string | null | undefined) ?? null,
      last_login_at: (officer.last_login_at as Date | null | undefined) ?? null,
      parking_lot_id: String(officer.parking_lot_id ?? lot?._id ?? "") || null,
      lot_name: lot?.lot_name ?? null,
    };
  }

  async updateOfficerProfile(id: string, patch: { phone?: string; assigned_zone?: string }): Promise<void> {
    const fields: Record<string, unknown> = {};
    if (patch.phone !== undefined) fields.phone = patch.phone;
    if (patch.assigned_zone !== undefined) fields.assigned_zone = patch.assigned_zone;
    if (Object.keys(fields).length) await db().collection<MongoDoc>("officers").updateOne({ _id: id }, { $set: fields });
  }

  async getSettings(officerId: string): Promise<Record<string, unknown>> {
    const document = await db().collection<MongoDoc>("officer_settings").findOne({ _id: officerId });
    if (typeof document?.settings_json !== "string" || !document.settings_json) return { ...DEFAULT_SETTINGS };
    try { return { ...DEFAULT_SETTINGS, ...JSON.parse(document.settings_json) }; } catch { return { ...DEFAULT_SETTINGS }; }
  }

  async saveSettings(officerId: string, settings: Record<string, unknown>): Promise<Record<string, unknown>> {
    const merged = { ...DEFAULT_SETTINGS, ...settings };
    const now = new Date();
    await db().collection<MongoDoc>("officer_settings").updateOne(
      { _id: officerId },
      { $set: { settings_json: JSON.stringify(merged), updated_at: now }, $setOnInsert: { officer_id: officerId, created_at: now } },
      { upsert: true },
    );
    return merged;
  }

  async getActiveShift(officerId: string): Promise<OfficerShiftRow | null> {
    const shift = await db().collection<MongoDoc>("officer_shifts").find({ officer_id: officerId, status: "active" }).sort({ started_at: -1, _id: 1 }).limit(1).next();
    return shift ? mapById<OfficerShiftRow>(shift) : null;
  }

  async startShift(officerId: string): Promise<OfficerShiftRow> {
    const existing = await this.getActiveShift(officerId);
    if (existing) return existing;
    const id = crypto.randomUUID();
    const now = new Date();
    await db().collection<MongoDoc>("officer_shifts").insertOne({ _id: id, id, officer_id: officerId, started_at: now, ended_at: null, status: "active", created_at: now });
    return { id, officer_id: officerId, started_at: now, ended_at: null, status: "active" };
  }

  async endShift(officerId: string): Promise<OfficerShiftRow | null> {
    const active = await this.getActiveShift(officerId);
    if (!active) return null;
    const endedAt = new Date();
    const result = await db().collection<MongoDoc>("officer_shifts").updateOne(
      { _id: active.id, officer_id: officerId, status: "active" },
      { $set: { ended_at: endedAt, status: "ended" } },
    );
    if (!result.matchedCount) return this.getActiveShift(officerId);
    return { ...active, ended_at: endedAt, status: "ended" };
  }

  async getOnDutySecondsToday(officerId: string): Promise<number> {
    const start = dayStart();
    const [completed, active] = await Promise.all([
      db().collection<MongoDoc>("officer_shifts").aggregate([
        { $match: { officer_id: officerId, started_at: { $gte: start }, status: "ended" } },
        { $group: { _id: null, seconds: { $sum: { $dateDiff: { startDate: "$started_at", endDate: { $ifNull: ["$ended_at", "$$NOW"] }, unit: "second" } } } } },
      ]).toArray(),
      this.getActiveShift(officerId),
    ]);
    let total = Number(completed[0]?.seconds ?? 0);
    if (active) total += Math.max(0, Math.floor((Date.now() - new Date(active.started_at).getTime()) / 1000));
    return total;
  }

  async listOfflineRecords(officerId: string, status?: OfflineRecordStatus): Promise<OfficerOfflineRow[]> {
    const filter = status ? { officer_id: officerId, status } : { officer_id: officerId, status: { $in: ["pending", "syncing", "failed"] } };
    const records = await db().collection<MongoDoc>("officer_offline_records").find(filter).sort({ created_at: 1, _id: 1 }).toArray();
    return records.map((record) => mapById<OfficerOfflineRow>(record));
  }

  async createOfflineRecord(input: { officerId: string; recordType: OfflineRecordType; title: string; subtitle?: string; payload: Record<string, unknown>; clientId?: string }): Promise<OfficerOfflineRow> {
    const id = crypto.randomUUID();
    const record: OfficerOfflineRow = { id, officer_id: input.officerId, record_type: input.recordType, title: input.title, subtitle: input.subtitle ?? null, payload_json: JSON.stringify(input.payload), status: "pending", error_message: null, client_id: input.clientId ?? null, created_at: new Date(), synced_at: null };
    await db().collection<MongoDoc>("officer_offline_records").insertOne({ ...record, _id: id });
    return record;
  }

  async deleteOfflineRecord(officerId: string, recordId: string): Promise<boolean> {
    return (await db().collection<MongoDoc>("officer_offline_records").deleteOne({ _id: recordId, officer_id: officerId })).deletedCount > 0;
  }

  async updateOfflineStatus(recordId: string, status: OfflineRecordStatus, errorMessage?: string | null): Promise<void> {
    const fields: Record<string, unknown> = { status, error_message: errorMessage ?? null };
    if (status === "synced") fields.synced_at = new Date();
    await db().collection<MongoDoc>("officer_offline_records").updateOne({ _id: recordId }, { $set: fields });
  }

  async countPendingOffline(officerId: string): Promise<number> {
    return db().collection("officer_offline_records").countDocuments({ officer_id: officerId, status: { $in: ["pending", "failed"] } });
  }
}

export const officerPortalRepository = new OfficerPortalRepository();
