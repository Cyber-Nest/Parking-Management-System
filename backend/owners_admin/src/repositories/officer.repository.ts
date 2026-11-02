import crypto from "crypto";
import { getMongoDatabase } from "../config/mongodb";
import { OfficerRole } from "../types";

export type UiOfficerStatus = "ACTIVE" | "DISABLED";
export interface OfficerListFilters { page: number; limit: number; q?: string; status?: UiOfficerStatus; role?: OfficerRole; parkingLotId?: string }
export interface OfficerRow {
  id: string; full_name: string; email: string; phone: string | null; badge_number: string | null;
  role: OfficerRole; status: "active" | "inactive" | "suspended"; last_login_at: Date | null;
  created_at: Date; tickets_issued?: number; parking_lot_id?: string | null;
}
type OfficerDocument = { _id: string; id: string; email: string; full_name: string; password_hash: string; role: OfficerRole; status: string; created_at: Date; updated_at: Date; [key: string]: unknown };
const collection = () => getMongoDatabase().collection<OfficerDocument>("officers");
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toOfficer = (document: OfficerDocument): OfficerRow => ({
  id: document._id,
  full_name: document.full_name,
  email: document.email,
  phone: (document.phone as string | null | undefined) ?? null,
  badge_number: (document.badge_number as string | null | undefined) ?? null,
  role: document.role,
  status: document.status as OfficerRow["status"],
  last_login_at: (document.last_login_at as Date | null | undefined) ?? null,
  created_at: document.created_at,
  parking_lot_id: (document.parking_lot_id as string | null | undefined) ?? null,
});
const utcDayStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export class OfficerRepository {
  private async lotScope(lotId: string) {
    const db = getMongoDatabase();
    const [zones, plans] = await Promise.all([
      db.collection<{ parking_name: string }>("parking_zones").find({ parking_lot_id: lotId }).project<{ parking_name: string }>({ parking_name: 1 }).toArray(),
      db.collection<{ _id: string }>("parking_plans").find({ parking_lot_id: lotId }).project<{ _id: string }>({ _id: 1 }).toArray(),
    ]);
    const zoneNames = zones.map((zone) => zone.parking_name);
    const planIds = plans.map((plan) => plan._id);
    const sessions = await db.collection<{ _id: string }>("parking_sessions").find({
      $or: [{ location_name: { $in: zoneNames } }, { plan_id: { $in: planIds } }],
    }).project<{ _id: string }>({ _id: 1 }).toArray();
    return { zoneNames, planIds, sessionIds: sessions.map((session) => session._id) };
  }

  private async officerIdsWithLotTickets(lotId: string): Promise<string[]> {
    const { zoneNames, sessionIds } = await this.lotScope(lotId);
    const tickets = await getMongoDatabase().collection<{ officer_id?: string | null }>("penalty_tickets").find({
      $or: [{ location_name: { $in: zoneNames } }, { session_id: { $in: sessionIds } }],
    }).project<{ officer_id?: string | null }>({ officer_id: 1 }).toArray();
    return [...new Set(tickets.map((ticket) => ticket.officer_id).filter((id): id is string => Boolean(id)))];
  }

  private async listFilter(filters: OfficerListFilters, includeDirectLot: boolean) {
    const clauses: Record<string, unknown>[] = [];
    if (filters.q?.trim()) {
      const term = { $regex: escapeRegex(filters.q.trim()), $options: "i" };
      clauses.push({ $or: [{ full_name: term }, { email: term }, { badge_number: term }] });
    }
    if (filters.role) clauses.push({ role: filters.role });
    if (filters.status === "ACTIVE") clauses.push({ status: "active" });
    if (filters.status === "DISABLED") clauses.push({ status: { $exists: true, $ne: "active" } });
    if (filters.parkingLotId) {
      const ticketOfficerIds = await this.officerIdsWithLotTickets(filters.parkingLotId);
      const lotOr: Record<string, unknown>[] = [{ _id: { $in: ticketOfficerIds } }];
      if (includeDirectLot) lotOr.unshift({ parking_lot_id: filters.parkingLotId });
      clauses.push({ $or: lotOr });
    }
    return clauses.length ? { $and: clauses } : {};
  }

  async list(filters: OfficerListFilters): Promise<{ items: OfficerRow[]; total: number }> {
    const filter = await this.listFilter(filters, true);
    const page = Math.max(1, filters.page);
    const limit = Math.max(1, Math.min(500, filters.limit));
    const [officers, total] = await Promise.all([
      collection().find(filter).sort({ created_at: -1, _id: 1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection().countDocuments(filter),
    ]);
    const tickets = await getMongoDatabase().collection<{ officer_id: string }>("penalty_tickets").aggregate([
      { $match: { officer_id: { $in: officers.map((officer) => officer._id) } } },
      { $group: { _id: "$officer_id", tickets_issued: { $sum: 1 } } },
    ]).toArray();
    const ticketCounts = new Map(tickets.map((ticket) => [String(ticket._id), ticket.tickets_issued as number]));
    return { items: officers.map((officer) => ({ ...toOfficer(officer), tickets_issued: ticketCounts.get(officer._id) ?? 0 })), total };
  }

  async findById(id: string): Promise<OfficerRow | null> {
    const officer = await collection().findOne({ _id: id });
    if (!officer) return null;
    const tickets_issued = await getMongoDatabase().collection("penalty_tickets").countDocuments({ officer_id: id });
    return { ...toOfficer(officer), tickets_issued };
  }

  async findByEmail(email: string): Promise<{ id: string; full_name: string; email: string; password_hash: string; status?: string } | null> {
    const officer = await collection().findOne({ email: email.toLowerCase().trim() });
    if (!officer) return null;
    return { id: officer._id, full_name: officer.full_name, email: officer.email, password_hash: officer.password_hash, status: officer.status };
  }

  async saveResetToken(id: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await collection().updateOne({ _id: id }, { $set: { reset_token: tokenHash, reset_token_expires_at: expiresAt, updated_at: new Date() } });
  }

  async findByResetToken(tokenHash: string, officerId: string): Promise<{ id: string } | null> {
    const officer = await collection().findOne({ _id: officerId, reset_token: tokenHash, reset_token_expires_at: { $gt: new Date() } });
    return officer ? { id: officer._id } : null;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await collection().updateOne({ _id: id }, { $set: { password_hash: passwordHash, reset_token: null, reset_token_expires_at: null, updated_at: new Date() } });
  }

  async updateLastLogin(id: string): Promise<void> {
    await collection().updateOne({ _id: id }, { $set: { last_login_at: new Date(), updated_at: new Date() } });
  }

  async summary(filters: { parkingLotId?: string } = {}): Promise<{ totalOfficers: number; activeOfficers: number; disabledOfficers: number; ticketsIssuedToday: number }> {
    const listFilter = await this.listFilter({ page: 1, limit: 1, parkingLotId: filters.parkingLotId }, false);
    const { zoneNames, sessionIds } = filters.parkingLotId ? await this.lotScope(filters.parkingLotId) : { zoneNames: [], sessionIds: [] };
    const ticketFilter: Record<string, unknown> = { date_issued: { $gte: utcDayStart(), $lt: new Date(utcDayStart().getTime() + 86400000) } };
    if (filters.parkingLotId) ticketFilter.$or = [{ location_name: { $in: zoneNames } }, { session_id: { $in: sessionIds } }];
    const [totalOfficers, activeOfficers, disabledOfficers, ticketsIssuedToday] = await Promise.all([
      collection().countDocuments(listFilter),
      collection().countDocuments({ ...listFilter, status: "active" }),
      collection().countDocuments({ ...listFilter, status: { $exists: true, $ne: "active" } }),
      getMongoDatabase().collection("penalty_tickets").countDocuments(ticketFilter),
    ]);
    return { totalOfficers, activeOfficers, disabledOfficers, ticketsIssuedToday };
  }

  async create(params: { createdByAdminId: string; fullName: string; email: string; phone?: string; badgeNumber?: string; role: OfficerRole; passwordHash: string; parkingLotId?: string }): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();
    await collection().insertOne({
      _id: id, id, created_by_admin_id: params.createdByAdminId, full_name: params.fullName.trim(),
      email: params.email.toLowerCase().trim(), phone: params.phone ?? null, password_hash: params.passwordHash,
      badge_number: params.badgeNumber ?? null, role: params.role, status: "active", parking_lot_id: params.parkingLotId ?? null,
      reset_token: null, reset_token_expires_at: null, last_login_at: null, created_at: now, updated_at: now,
    } as OfficerDocument);
    return id;
  }

  async update(id: string, params: { fullName?: string; phone?: string; role?: OfficerRole; badgeNumber?: string; parkingLotId?: string }): Promise<number> {
    const fields: Record<string, unknown> = {};
    if (typeof params.fullName === "string") fields.full_name = params.fullName.trim();
    if (typeof params.phone === "string") fields.phone = params.phone.trim();
    if (typeof params.badgeNumber === "string") fields.badge_number = params.badgeNumber.trim();
    if (params.role) fields.role = params.role;
    if (params.parkingLotId !== undefined) fields.parking_lot_id = params.parkingLotId ?? null;
    if (!Object.keys(fields).length) return 0;
    fields.updated_at = new Date();
    return (await collection().updateOne({ _id: id }, { $set: fields })).matchedCount;
  }

  async setUiStatus(id: string, status: UiOfficerStatus): Promise<number> {
    return (await collection().updateOne({ _id: id }, { $set: { status: status === "ACTIVE" ? "active" : "inactive", updated_at: new Date() } })).matchedCount;
  }

  async remove(id: string): Promise<number> {
    return (await collection().deleteOne({ _id: id })).deletedCount;
  }
}
