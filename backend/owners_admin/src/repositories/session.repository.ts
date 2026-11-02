import crypto from "crypto";
import { getMongoDatabase } from "../config/mongodb";
import { SessionStatus } from "../types";

export interface SessionListFilters { page: number; limit: number; q?: string; status?: SessionStatus; from?: string; to?: string; parkingLotId?: string }
export interface SessionRow {
  id: string; user_id: string | null; vehicle_id: string | null; license_plate: string; plan_id: string | null;
  plan_name: string | null; start_time: Date; end_time: Date; duration_minutes: number; status: SessionStatus;
  notes: string | null; amount: number; location_name?: string | null; created_by_officer: string | null;
  created_at: Date; parking_lot_id?: string | null; parking_lot_name?: string | null; subzone_id?: string | null; subzone_name?: string | null;
}
type SessionDocument = { _id: string; id: string; user_id: string | null; vehicle_id: string | null; license_plate: string; plan_id: string | null; plan_name: string | null; location_name?: string | null; start_time: Date; end_time: Date; duration_minutes: number; status: SessionStatus; notes: string | null; created_by_officer: string | null; created_at: Date; [key: string]: unknown };
const collection = () => getMongoDatabase().collection<SessionDocument>("parking_sessions");
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const parseDate = (value: string) => new Date(value.includes("T") || value.endsWith("Z") ? value : `${value.replace(" ", "T")}Z`);
const dayStart = () => { const now = new Date(); return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); };

export class SessionRepository {
  private async lotScope(lotId: string) {
    const db = getMongoDatabase();
    const [zones, plans] = await Promise.all([
      db.collection<{ _id: string; parking_name: string; parking_lot_id?: string | null }>("parking_zones").find({ parking_lot_id: lotId }).toArray(),
      db.collection<{ _id: string }>("parking_plans").find({ parking_lot_id: lotId }).project<{ _id: string }>({ _id: 1 }).toArray(),
    ]);
    return { zones, zoneNames: zones.map((zone) => zone.parking_name), planIds: plans.map((plan) => plan._id) };
  }

  private async filterFor(filters: SessionListFilters) {
    const clauses: Record<string, unknown>[] = [];
    if (filters.q?.trim()) clauses.push({ license_plate: { $regex: escapeRegex(filters.q.trim()), $options: "i" } });
    if (filters.status) clauses.push({ status: filters.status });
    if (filters.from) clauses.push({ start_time: { $gte: parseDate(filters.from) } });
    if (filters.to) clauses.push({ end_time: { $lte: parseDate(`${filters.to} 23:59:59`) } });
    if (filters.parkingLotId) {
      const { zoneNames, planIds } = await this.lotScope(filters.parkingLotId);
      clauses.push({ $or: [{ location_name: { $in: zoneNames } }, { plan_id: { $in: planIds } }] });
    }
    return clauses.length ? { $and: clauses } : {};
  }

  private async enrich(session: SessionDocument, firstLot: { _id: string; lot_name: string } | null): Promise<SessionRow> {
    const db = getMongoDatabase();
    const location = session.location_name ?? "";
    const [zonesByName, zoneById, plan, officer, directLots, payments] = await Promise.all([
      db.collection<{ _id: string; parking_name: string; parking_lot_id?: string | null }>("parking_zones").find({ parking_name: location }).toArray(),
      db.collection<{ _id: string; parking_name: string; parking_lot_id?: string | null }>("parking_zones").findOne({ _id: location }),
      session.plan_id ? db.collection<{ _id: string; parking_lot_id?: string | null }>("parking_plans").findOne({ _id: session.plan_id }) : null,
      session.created_by_officer ? db.collection<{ _id: string; parking_lot_id?: string | null }>("officers").findOne({ _id: session.created_by_officer }) : null,
      db.collection<{ _id: string; lot_name: string; created_at?: Date }>("parking_lots").find({ $or: [{ _id: location }, { lot_name: location }] }).sort({ _id: 1 }).toArray(),
      db.collection<{ amount: number }>("payments").find({ session_id: session._id, status: "success" }).project<{ amount: number }>({ amount: 1 }).toArray(),
    ]);
    const nameMatches = zonesByName.length ? zonesByName : [null];
    const joinLotIds = nameMatches.map((zone) => zone?.parking_lot_id ?? zoneById?.parking_lot_id ?? plan?.parking_lot_id).filter((id): id is string => Boolean(id));
    const zoneLotIds = [...joinLotIds, officer?.parking_lot_id, ...directLots.map((lot) => lot._id), firstLot?._id].filter((id): id is string => Boolean(id));
    const sortedLotIds = [...zoneLotIds].sort((a, b) => a.localeCompare(b));
    const selectedLotId = sortedLotIds[0] ?? null;
    const joinLotIdsForNames = nameMatches.map((zone) => zone?.parking_lot_id ?? zoneById?.parking_lot_id ?? plan?.parking_lot_id).filter((id): id is string => Boolean(id));
    const [joinedLots, officerLot] = await Promise.all([
      joinLotIdsForNames.length ? db.collection<{ _id: string; lot_name: string }>("parking_lots").find({ _id: { $in: [...new Set(joinLotIdsForNames)] } }).toArray() : [],
      officer?.parking_lot_id ? db.collection<{ _id: string; lot_name: string }>("parking_lots").findOne({ _id: officer.parking_lot_id }) : null,
    ]);
    const lotNames = [...joinedLots.map((lot) => lot.lot_name), officerLot?.lot_name, ...directLots.map((lot) => lot.lot_name), firstLot?.lot_name].filter((name): name is string => Boolean(name)).sort((a, b) => a.localeCompare(b));
    const subzones = [...zonesByName, ...(zoneById ? [zoneById] : [])];
    const subzoneIds = subzones.map((zone) => zone._id).sort((a, b) => a.localeCompare(b));
    const subzoneNames = subzones.map((zone) => zone.parking_name).sort((a, b) => a.localeCompare(b));
    const { _id, ...fields } = session;
    return {
      ...fields,
      id: _id,
      amount: payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
      parking_lot_id: selectedLotId,
      parking_lot_name: lotNames[0] ?? null,
      subzone_id: subzoneIds[0] ?? null,
      subzone_name: subzoneNames[0] ?? null,
    } as unknown as SessionRow;
  }

  async list(filters: SessionListFilters): Promise<{ items: SessionRow[]; total: number }> {
    const filter = await this.filterFor(filters);
    const page = Math.max(1, filters.page);
    const limit = Math.max(1, Math.min(500, filters.limit));
    const [sessions, total, firstLot] = await Promise.all([
      collection().find(filter).sort({ start_time: -1, _id: 1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection().countDocuments(filter),
      getMongoDatabase().collection<{ _id: string; lot_name: string }>("parking_lots").find().sort({ created_at: 1, _id: 1 }).limit(1).next(),
    ]);
    return { items: await Promise.all(sessions.map((session) => this.enrich(session, firstLot))), total };
  }

  async summary(filters: { parkingLotId?: string } = {}): Promise<{ totalToday: number; activeCount: number; expiredCount: number; extendedCount: number; cancelledCount: number }> {
    const scope: Record<string, unknown> = {};
    if (filters.parkingLotId) {
      const { zoneNames, planIds } = await this.lotScope(filters.parkingLotId);
      scope.$or = [{ location_name: { $in: zoneNames } }, { plan_id: { $in: planIds } }];
    }
    const start = dayStart();
    const end = new Date(start.getTime() + 86400000);
    const [totalToday, activeCount, expiredCount, extendedCount, cancelledCount] = await Promise.all([
      collection().countDocuments({ ...scope, start_time: { $gte: start, $lt: end } }),
      collection().countDocuments({ ...scope, status: "active" }),
      collection().countDocuments({ ...scope, status: "expired" }),
      collection().countDocuments({ ...scope, status: "extended" }),
      collection().countDocuments({ ...scope, status: "cancelled" }),
    ]);
    return { totalToday, activeCount, expiredCount, extendedCount, cancelledCount };
  }

  async create(params: { licensePlate: string; planId?: string; planName?: string; startTime: string; endTime: string; durationMinutes: number; status?: SessionStatus; notes?: string; locationName?: string; userId?: string; vehicleId?: string; createdByOfficer?: string }): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();
    await collection().insertOne({ _id: id, id, user_id: params.userId ?? null, vehicle_id: params.vehicleId ?? null,
      license_plate: params.licensePlate.trim().toUpperCase(), plan_id: params.planId ?? null, plan_name: params.planName ?? null,
      location_name: params.locationName ?? null, start_time: parseDate(params.startTime), end_time: parseDate(params.endTime),
      duration_minutes: params.durationMinutes, status: params.status ?? "active", notes: params.notes ?? null,
      created_by_officer: params.createdByOfficer ?? null, created_at: now, updated_at: now, amount: 0 });
    return id;
  }

  async cancel(id: string, reason?: string): Promise<SessionRow | null> {
    const note = reason?.trim() || "Cancelled manually by admin.";
    const now = new Date();
    await collection().updateOne({ _id: id }, [{ $set: {
      status: "cancelled",
      end_time: { $min: ["$end_time", now] },
      notes: { $cond: [{ $or: [{ $eq: ["$notes", null] }, { $eq: ["$notes", ""] }] }, note, { $concat: ["$notes", "\n", note] }] },
      updated_at: now,
    } }]);
    const session = await collection().findOne({ _id: id });
    if (!session) return null;
    const { _id, ...fields } = session;
    return { ...fields, id: _id } as unknown as SessionRow;
  }
}
