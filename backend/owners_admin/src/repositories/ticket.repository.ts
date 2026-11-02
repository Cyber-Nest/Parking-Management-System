import crypto from "crypto";
import { getMongoDatabase } from "../config/mongodb";
import { TicketStatus } from "../types";
import { nextNumericTicketNumber, normalizeTicketNumberLookup } from "../utils/ticketNumber";

export interface TicketListFilters { page: number; limit: number; q?: string; status?: TicketStatus; officerId?: string; from?: string; to?: string; parkingLotId?: string }
export interface TicketRow {
  id: string; ticket_number: string; officer_id: string; officer_name: string; license_plate: string; amount: number;
  reason: string; status: TicketStatus; date_issued: Date; due_date: Date | null; paid_at: Date | null;
  payment_id?: string | null; remarks: string | null; note: string | null; dispute_raised: number;
  dispute_message?: string | null; dispute_at?: Date | null; dispute_resolved_at?: Date | null; created_at: Date;
  session_id?: string | null; location_name?: string | null; start_time?: Date | null; end_time?: Date | null;
  plan_name?: string | null; notes?: string | null; parking_lot_id?: string | null; parking_lot_name?: string | null;
  payment_method?: string | null; transaction_ref?: string | null; evidence_photos?: { id: string; image: string }[];
}
type TicketDocument = { _id: string; id: string; ticket_number: string; officer_id: string; officer_name: string; license_plate: string; amount: number; reason: string; status: TicketStatus; date_issued: Date; created_at: Date; [key: string]: unknown };
type RelatedZone = { _id: string; parking_name: string; parking_lot_id?: string | null };
type ParkingLot = { _id: string; lot_name: string; created_at?: Date };
const tickets = () => getMongoDatabase().collection<TicketDocument>("penalty_tickets");
const photos = () => getMongoDatabase().collection<{ _id: string; id: string; ticket_id: string; photo_url: string; uploaded_at?: Date }>("ticket_photos");
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const parseDate = (value: string) => new Date(value.includes("T") || value.endsWith("Z") ? value : `${value.replace(" ", "T")}Z`);
const dayStart = () => { const now = new Date(); return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); };
const minText = (values: Array<string | null | undefined>) => values.filter((value): value is string => Boolean(value)).sort((a, b) => a.localeCompare(b))[0] ?? null;

export class TicketRepository {
  private async lotScope(lotId: string) {
    const db = getMongoDatabase();
    const [zones, plans, officers] = await Promise.all([
      db.collection<RelatedZone>("parking_zones").find({ parking_lot_id: lotId }).toArray(),
      db.collection<{ _id: string }>("parking_plans").find({ parking_lot_id: lotId }).project<{ _id: string }>({ _id: 1 }).toArray(),
      db.collection<{ _id: string }>("officers").find({ parking_lot_id: lotId }).project<{ _id: string }>({ _id: 1 }).toArray(),
    ]);
    const zoneNames = zones.map((zone) => zone.parking_name);
    const planIds = plans.map((plan) => plan._id);
    const sessions = await db.collection<{ _id: string }>("parking_sessions").find({ $or: [{ location_name: { $in: zoneNames } }, { plan_id: { $in: planIds } }] }).project<{ _id: string }>({ _id: 1 }).toArray();
    return { zoneNames, planIds, sessionIds: sessions.map((session) => session._id), officerIds: officers.map((officer) => officer._id) };
  }

  private async filterFor(filters: TicketListFilters) {
    const clauses: Record<string, unknown>[] = [];
    if (filters.q?.trim()) {
      const term = { $regex: escapeRegex(filters.q.trim()), $options: "i" };
      clauses.push({ $or: [{ ticket_number: term }, { license_plate: term }] });
    }
    if (filters.status) clauses.push({ status: filters.status });
    if (filters.officerId) clauses.push({ officer_id: filters.officerId });
    if (filters.from) clauses.push({ date_issued: { $gte: parseDate(filters.from) } });
    if (filters.to) clauses.push({ date_issued: { $lte: parseDate(`${filters.to} 23:59:59`) } });
    if (filters.parkingLotId) {
      const scope = await this.lotScope(filters.parkingLotId);
      clauses.push({ $or: [
        { location_name: { $in: scope.zoneNames } },
        { session_id: { $in: scope.sessionIds } },
        { officer_id: { $in: scope.officerIds } },
      ] });
    }
    return clauses.length ? { $and: clauses } : {};
  }

  private async enrich(ticket: TicketDocument, firstLot: ParkingLot | null, includePhotos: boolean, includeLot = true): Promise<TicketRow> {
    const db = getMongoDatabase();
    const location = String(ticket.location_name ?? "");
    const [ticketZones, ticketZoneById, session, officer, directLots, payment, evidence] = await Promise.all([
      db.collection<RelatedZone>("parking_zones").find({ parking_name: location }).toArray(),
      db.collection<RelatedZone>("parking_zones").findOne({ _id: location }),
      ticket.session_id ? db.collection<{ _id: string; location_name?: string; plan_id?: string | null; start_time?: Date; end_time?: Date; plan_name?: string; notes?: string }>("parking_sessions").findOne({ _id: ticket.session_id }) : null,
      db.collection<{ _id: string; parking_lot_id?: string | null }>("officers").findOne({ _id: ticket.officer_id }),
      db.collection<ParkingLot>("parking_lots").find({ $or: [{ _id: location }, { lot_name: location }] }).sort({ _id: 1 }).toArray(),
      ticket.payment_id ? db.collection<{ _id: string; payment_method?: string | null; transaction_ref?: string | null }>("payments").findOne({ _id: String(ticket.payment_id) }) : null,
      includePhotos ? photos().find({ ticket_id: ticket._id }).sort({ uploaded_at: 1, _id: 1 }).toArray() : [],
    ]);
    const sessionLocation = String(session?.location_name ?? "");
    const [sessionZones, sessionZoneById, plan, officerLot, firstLotNameMatch] = await Promise.all([
      session ? db.collection<RelatedZone>("parking_zones").find({ parking_name: sessionLocation }).toArray() : [],
      session ? db.collection<RelatedZone>("parking_zones").findOne({ _id: sessionLocation }) : null,
      session?.plan_id ? db.collection<{ _id: string; parking_lot_id?: string | null }>("parking_plans").findOne({ _id: session.plan_id }) : null,
      officer?.parking_lot_id ? db.collection<ParkingLot>("parking_lots").findOne({ _id: officer.parking_lot_id }) : null,
      db.collection<ParkingLot>("parking_lots").find().sort({ created_at: 1, _id: 1 }).limit(1).next(),
    ]);
    const ticketZoneMatches = ticketZones.length ? ticketZones : [null];
    const sessionZoneMatches = sessionZones.length ? sessionZones : [null];
    const joinedLotIds: string[] = [];
    const resolvedLotIds: string[] = [];
    const resolvedLotNameSets: string[][] = [];
    for (const ticketZone of ticketZoneMatches) {
      for (const sessionZone of sessionZoneMatches) {
        const joinedLotId = ticketZone?.parking_lot_id ?? ticketZoneById?.parking_lot_id
          ?? sessionZone?.parking_lot_id ?? sessionZoneById?.parking_lot_id ?? plan?.parking_lot_id;
        if (joinedLotId) joinedLotIds.push(joinedLotId);
        const fallbackIds = joinedLotId ? [joinedLotId]
          : officer?.parking_lot_id ? [officer.parking_lot_id]
          : directLots.length ? directLots.map((lot) => lot._id)
          : firstLot ? [firstLot._id] : [];
        resolvedLotIds.push(...fallbackIds);
        resolvedLotNameSets.push(joinedLotId ? [joinedLotId] : []);
      }
    }
    const joinedLots = joinedLotIds.length
      ? await db.collection<ParkingLot>("parking_lots").find({ _id: { $in: [...new Set(joinedLotIds)] } }).toArray()
      : [];
    const joinedLotNames = new Map(joinedLots.map((lot) => [lot._id, lot.lot_name]));
    const lotNameCandidates = resolvedLotNameSets.flatMap((ids) => {
      const fromJoin = ids.map((id) => joinedLotNames.get(id)).filter((name): name is string => Boolean(name));
      return fromJoin.length ? fromJoin
        : officerLot?.lot_name ? [officerLot.lot_name]
        : directLots.length ? directLots.map((lot) => lot.lot_name)
        : firstLotNameMatch?.lot_name ? [firstLotNameMatch.lot_name] : [];
    });
    const { _id, ...fields } = ticket;
    return {
      ...fields,
      id: _id,
      start_time: session?.start_time ?? null,
      end_time: session?.end_time ?? null,
      plan_name: session?.plan_name ?? null,
      notes: session?.notes ?? null,
      ...(includeLot ? { parking_lot_id: minText(resolvedLotIds), parking_lot_name: minText(lotNameCandidates) } : {}),
      payment_method: payment?.payment_method ?? null,
      transaction_ref: payment?.transaction_ref ?? null,
      ...(includePhotos ? { evidence_photos: evidence.map((photo) => ({ id: photo._id, image: photo.photo_url })) } : {}),
    } as unknown as TicketRow;
  }

  async list(filters: TicketListFilters): Promise<{ items: TicketRow[]; total: number }> {
    const filter = await this.filterFor(filters);
    const page = Math.max(1, filters.page);
    const limit = Math.max(1, Math.min(500, filters.limit));
    const [documents, total, firstLot] = await Promise.all([
      tickets().find(filter).sort({ date_issued: -1, _id: 1 }).skip((page - 1) * limit).limit(limit).toArray(),
      tickets().countDocuments(filter),
      getMongoDatabase().collection<ParkingLot>("parking_lots").find().sort({ created_at: 1, _id: 1 }).limit(1).next(),
    ]);
    const enriched = await Promise.all(documents.map((ticket) => this.enrich(ticket, firstLot, true)));
    const items = enriched.map((item) => {
      const { dispute_message, dispute_at, dispute_resolved_at, notes, ...listItem } = item;
      void dispute_message; void dispute_at; void dispute_resolved_at; void notes;
      return listItem;
    });
    return { items, total };
  }

  async summary(filters: { parkingLotId?: string } = {}): Promise<{ totalToday: number; totalTickets: number; unpaidCount: number; paidCount: number; disputedCount: number; totalPenaltyAmount: number }> {
    const scope: Record<string, unknown> = {};
    if (filters.parkingLotId) {
      const lot = await this.lotScope(filters.parkingLotId);
      scope.$or = [{ location_name: { $in: lot.zoneNames } }, { session_id: { $in: lot.sessionIds } }, { officer_id: { $in: lot.officerIds } }];
    }
    const start = dayStart();
    const end = new Date(start.getTime() + 86400000);
    const [totalToday, totalTickets, unpaidCount, paidCount, disputedCount, aggregate] = await Promise.all([
      tickets().countDocuments({ ...scope, date_issued: { $gte: start, $lt: end } }),
      tickets().countDocuments(scope),
      tickets().countDocuments({ ...scope, status: "unpaid" }),
      tickets().countDocuments({ ...scope, status: "paid" }),
      tickets().countDocuments({ ...scope, status: "disputed" }),
      tickets().aggregate([{ $match: scope }, { $group: { _id: null, total: { $sum: "$amount" } } }]).toArray(),
    ]);
    return { totalToday, totalTickets, unpaidCount, paidCount, disputedCount, totalPenaltyAmount: Number(aggregate[0]?.total ?? 0) };
  }

  async create(params: { officerId: string; officerName: string; licensePlate: string; amount: number; reason: string; status?: TicketStatus; dueDate?: string; sessionId?: string; remarks?: string }): Promise<string> {
    const id = crypto.randomUUID();
    const ticketNumber = await nextNumericTicketNumber();
    const now = new Date();
    await tickets().insertOne({
      _id: id, id, ticket_number: ticketNumber, officer_id: params.officerId, officer_name: params.officerName,
      session_id: params.sessionId ?? null, license_plate: params.licensePlate.trim().toUpperCase(), amount: params.amount,
      reason: params.reason.trim(), status: params.status ?? "unpaid", date_issued: now,
      due_date: params.dueDate ? parseDate(params.dueDate) : null, paid_at: null, payment_id: null,
      location_name: null, remarks: params.remarks ?? null, note: null, dispute_raised: 0,
      dispute_message: null, dispute_at: null, dispute_resolved_at: null, created_at: now, updated_at: now,
    });
    return id;
  }

  private async withPhotos(ticket: TicketDocument | null): Promise<TicketRow | null> {
    if (!ticket) return null;
    const firstLot = await getMongoDatabase().collection<ParkingLot>("parking_lots").find().sort({ created_at: 1, _id: 1 }).limit(1).next();
    return this.enrich(ticket, firstLot, true, false);
  }

  async findById(id: string): Promise<TicketRow | null> {
    return this.withPhotos(await tickets().findOne({ _id: id }));
  }

  async findByTicketNumber(ticketNumber: string): Promise<TicketRow | null> {
    const candidates = normalizeTicketNumberLookup(ticketNumber);
    if (!candidates.length) return null;
    return this.withPhotos(await tickets().findOne({ ticket_number: { $in: candidates } }));
  }

  async raiseDispute(id: string, disputeMessage: string): Promise<number> {
    return (await tickets().updateOne({ _id: id }, { $set: { dispute_raised: 1, dispute_message: disputeMessage, dispute_at: new Date(), status: "disputed", updated_at: new Date() } })).matchedCount;
  }

  async updateTicket(id: string, params: { licensePlate?: string; amount?: number; reason?: string; dueDate?: string | null; locationName?: string | null }): Promise<number> {
    const fields: Record<string, unknown> = {};
    if (params.licensePlate !== undefined) fields.license_plate = params.licensePlate.trim().toUpperCase();
    if (params.amount !== undefined) fields.amount = params.amount;
    if (params.reason !== undefined) fields.reason = params.reason.trim();
    if (params.dueDate !== undefined) fields.due_date = params.dueDate ? parseDate(params.dueDate) : null;
    if (params.locationName !== undefined) fields.location_name = params.locationName;
    if (!Object.keys(fields).length) return 0;
    fields.updated_at = new Date();
    return (await tickets().updateOne({ _id: id }, { $set: fields })).matchedCount;
  }

  async appendRemarks(id: string, note: string): Promise<number> {
    const ticket = await tickets().findOne({ _id: id });
    if (!ticket) return 0;
    const stamp = new Date().toISOString();
    const trimmed = note.trim();
    const next = ticket.remarks ? `${String(ticket.remarks)}\n[${stamp}] ${trimmed}` : `[${stamp}] ${trimmed}`;
    return (await tickets().updateOne({ _id: id }, { $set: { remarks: next, note: trimmed, updated_at: new Date() } })).matchedCount;
  }

  async setStatus(id: string, status: TicketStatus, extras?: { paidAt?: Date | null; paymentId?: string | null }): Promise<number> {
    const fields: Record<string, unknown> = { status, updated_at: new Date() };
    if (status === "paid") { fields.paid_at = extras?.paidAt ?? new Date(); fields.payment_id = extras?.paymentId ?? null; }
    return (await tickets().updateOne({ _id: id }, { $set: fields })).matchedCount;
  }
}
