import crypto from "crypto";
import { getMongoDatabase } from "../config/mongodb";
import { TicketStatus } from "../types";
import { nextNumericTicketNumber } from "../utils/ticketNumber";

export interface EnforcementTicketInput {
  officerId: string; officerName: string; licensePlate: string; provinceState?: string; vehicleMake?: string;
  vehicleModel?: string; vehicleColor?: string; vehicleType?: string; violationType: string; violationSubType?: string;
  fineAmount: number; lateFee?: number; locationName?: string; violationDateTime?: string; sessionId?: string | null;
  officerNotes?: string; violationDetails?: string; meterNumber?: string; zoneArea?: string; beatArea?: string;
  photos?: string[]; status?: TicketStatus;
}
export interface EnforcementTicketRow {
  id: string; ticket_number: string; officer_id: string; officer_name: string; session_id: string | null;
  license_plate: string; location_name: string | null; amount: number; reason: string; status: TicketStatus;
  date_issued: Date; due_date: Date | null; remarks: string | null; note: string | null; created_at: Date;
}
export interface EnforcementSessionRow {
  id: string; license_plate: string; plan_name: string | null; location_name: string | null; start_time: Date;
  end_time: Date; duration_minutes: number; status: string; notes: string | null; created_by_officer: string | null;
  created_at: Date; user_id?: string | null; customer_name?: string | null; customer_email?: string | null;
  amount_paid?: number | null; payment_method?: string | null; paid_at?: Date | null;
}
export interface PlateScanCustomer { user_id: string | null; name: string; email: string | null }
export interface EvidencePhotoRow {
  id: string; ticket_id: string | null; ticket_number: string | null; license_plate: string; reason: string;
  photo_url: string; photo_taken_at: Date; uploaded_at: Date; source?: "ticket" | "standalone";
  location_name?: string | null; officer_name?: string | null; notes?: string | null;
}
export interface OfficerEvidenceInput { officerId: string; officerName: string; licensePlate: string; locationName?: string; evidenceType?: string; notes?: string; photos: string[] }
export interface OfficerEvidenceUpdateInput { licensePlate?: string; locationName?: string; reason?: string; notes?: string }
export interface ManualEntryInput { officerId: string; licensePlate: string; provinceState?: string; vehicleMake?: string; vehicleModel?: string; vehicleColor?: string; vehicleType?: string; planName?: string; durationMinutes?: number; locationName?: string; notes?: string }
export interface OfficerTicketListQuery { limit?: number; officerId?: string; status?: string; violationType?: string; location?: string; search?: string; fromDate?: string; toDate?: string }
export interface OfficerSessionListQuery { limit?: number; status?: string; zone?: string; location?: string; search?: string; sort?: string }

type MongoDoc = { _id?: string; [key: string]: unknown };
const db = () => getMongoDatabase();
const tickets = () => db().collection<MongoDoc>("penalty_tickets");
const sessions = () => db().collection<MongoDoc>("parking_sessions");
const ticketPhotos = () => db().collection<MongoDoc>("ticket_photos");
const standaloneEvidence = () => db().collection<MongoDoc>("officer_evidence");
const dayStart = () => { const now = new Date(); return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); };
const parseDate = (value: string) => new Date(value.includes("T") || value.endsWith("Z") ? value : `${value.replace(" ", "T")}Z`);
const normalizePlate = (value: string) => value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
const plateExpr = (field: string, normalized: string) => ({ $eq: [{ $replaceAll: { input: { $replaceAll: { input: { $toUpper: field }, find: " ", replacement: "" } }, find: "-", replacement: "" } }, normalized] });
const rowFromDoc = <T>(doc: MongoDoc): T => { const { _id, ...rest } = doc; return { ...rest, id: _id } as T; };
const takeLimit = (value: number | undefined, fallback: number) => Math.max(1, Math.min(500, Number(value ?? fallback) || fallback));

export class EnforcementRepository {
  private async bookingMatchForSession(session: MongoDoc) {
    const normalized = normalizePlate(String(session.license_plate ?? ""));
    const rows = await db().collection("bookings").aggregate([
      { $match: { $expr: { $and: [plateExpr("$vehicle_plate_number", normalized), { $lte: ["$start_time", session.end_time] }, { $gte: ["$end_time", session.start_time] }] } } },
      { $sort: { start_time: -1 } },
      { $limit: 1 },
    ]).toArray();
    return rows[0] as MongoDoc | undefined;
  }

  private async sessionDetails(session: MongoDoc, includeCustomer = false): Promise<EnforcementSessionRow & Record<string, unknown>> {
    const [plan, user, booking, payment] = await Promise.all([
      session.plan_id ? db().collection<MongoDoc>("parking_plans").findOne({ _id: String(session.plan_id) }) : null,
      session.user_id ? db().collection<MongoDoc>("users").findOne({ _id: String(session.user_id) }) : null,
      this.bookingMatchForSession(session),
      db().collection<MongoDoc>("payments").find({ session_id: session._id, status: "success" }).sort({ paid_at: -1, _id: 1 }).limit(1).next(),
    ]);
    let zone: MongoDoc | null = null;
    const zoneId = (plan?.parking_zone_id as string | null | undefined);
    if (zoneId) zone = await db().collection<MongoDoc>("parking_zones").findOne({ _id: zoneId });
    const { _id, ...base } = session;
    const result: Record<string, unknown> = {
      ...base,
      id: _id,
      location_name: session.location_name ?? zone?.parking_name ?? booking?.parking_name ?? null,
      amount_paid: payment ? Number(payment.amount ?? 0) : 0,
      payment_method: payment?.payment_method ?? null,
      paid_at: payment?.paid_at ?? null,
    };
    if (includeCustomer) {
      result.customer_name = user?.username ?? user?.email ?? booking?.customer_email ?? null;
      result.customer_email = user?.email ?? booking?.customer_email ?? null;
    }
    return result as EnforcementSessionRow & Record<string, unknown>;
  }

  async findDefaultOfficer() {
    const officer = await db().collection<MongoDoc>("officers").find({ status: "active" }).sort({ created_at: 1, _id: 1 }).limit(1).next();
    return officer ? { id: String(officer._id ?? ""), full_name: String(officer.full_name ?? "") } : null;
  }

  async dashboard(_officerId?: string) {
    const now = new Date();
    const start = dayStart();
    const end = new Date(start.getTime() + 86400000);
    const [ticketsToday, activeCount, collected, activeRows, summaryRows] = await Promise.all([
      tickets().countDocuments({ date_issued: { $gte: start, $lt: end } }),
      sessions().countDocuments({ status: "active", end_time: { $gte: now } }),
      db().collection("payments").aggregate([
        { $match: { status: "success", $expr: { $and: [{ $gte: [{ $ifNull: ["$paid_at", "$created_at"] }, start] }, { $lt: [{ $ifNull: ["$paid_at", "$created_at"] }, end] }] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).toArray(),
      sessions().find({ status: "active", end_time: { $gte: now } }).sort({ start_time: -1, _id: 1 }).limit(5).toArray(),
      tickets().aggregate([
        { $match: { date_issued: { $gte: start, $lt: end } } },
        { $group: { _id: "$reason", total: { $sum: 1 } } },
        { $project: { _id: 0, reason: "$_id", total: 1 } },
        { $sort: { total: -1 } },
      ]).toArray(),
    ]);
    const activeSessionDoc = await sessions().find({ status: "active", end_time: { $gte: now } }).sort({ end_time: 1, _id: 1 }).limit(1).next();
    const recentScans = await Promise.all(activeRows.map(async (session) => {
      const details = await this.sessionDetails(session);
      return { license_plate: details.license_plate, location_name: details.location_name, checked_at: details.start_time, scan_status: "valid" };
    }));
    const activeSession = activeSessionDoc ? await this.sessionDetails(activeSessionDoc) : null;
    return { ticketsToday, activeSessions: activeCount, collectedToday: Number(collected[0]?.total ?? 0), onDutyMinutes: 0, onDutySeconds: 0, recentScans, activeSession, violationSummary: summaryRows };
  }

  async findPlateStatus(plate: string) {
    const normalized = normalizePlate(plate);
    const sessionDocs = await sessions().aggregate([
      { $match: { $expr: plateExpr("$license_plate", normalized) } },
      { $sort: { start_time: -1 } },
      { $limit: 1 },
    ]).toArray();
    const session = sessionDocs[0] ? await this.sessionDetails(sessionDocs[0], true) : null;
    const ticketDocs = await tickets().aggregate([
      { $match: { $expr: plateExpr("$license_plate", normalized) } },
      { $sort: { date_issued: -1 } }, { $limit: 5 },
    ]).toArray();
    const recentTickets = ticketDocs.map((doc) => rowFromDoc<EnforcementTicketRow>(doc));
    const now = Date.now();
    const validSession = Boolean(session && session.status === "active" && new Date(session.end_time).getTime() >= now);
    const openTicket = recentTickets.find((ticket) => ticket.status === "unpaid" || ticket.status === "disputed") ?? null;
    const customer: PlateScanCustomer | null = session ? {
      user_id: (session.user_id as string | null | undefined) ?? null,
      name: session.customer_name?.trim() || "Guest / Walk-in",
      email: session.customer_email ?? null,
    } : null;
    const status = validSession ? "valid" : session ? "expired" : openTicket ? "violation" : "not_found";
    return { plate: normalized, status, session, openTicket, recentTickets, customer };
  }

  async listTickets(query: OfficerTicketListQuery = {}) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.officerId) filter.officer_id = query.officerId;
    const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const addText = (key: string, value: string) => ({ [key]: { $regex: escape(value), $options: "i" } });
    const clauses: Record<string, unknown>[] = [];
    if (query.violationType) clauses.push(addText("reason", query.violationType));
    if (query.location) clauses.push(addText("location_name", query.location));
    if (query.search) clauses.push({ $or: [addText("ticket_number", query.search), addText("license_plate", query.search), addText("reason", query.search), addText("location_name", query.search)] });
    if (query.fromDate) clauses.push({ date_issued: { $gte: parseDate(query.fromDate) } });
    if (query.toDate) clauses.push({ date_issued: { $lt: new Date(parseDate(query.toDate).getTime() + 86400000) } });
    if (clauses.length) filter.$and = clauses;
    const rows = await tickets().find(filter).sort({ date_issued: -1, _id: 1 }).limit(takeLimit(query.limit, 25)).toArray();
    return rows.map((row) => rowFromDoc<EnforcementTicketRow>(row));
  }

  async listSessions(query: OfficerSessionListQuery = {}) {
    const now = new Date();
    const filter: Record<string, unknown> = { end_time: { $gt: now } };
    if (query.status === "active" || !query.status) filter.status = "active";
    else if (query.status === "expiring_soon") { filter.status = "active"; filter.end_time = { $gt: now, $lte: new Date(now.getTime() + 10 * 60 * 1000) }; }
    else if (query.status === "issue") filter.status = "issue";
    const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const textFilter = (key: string, value: string) => ({ [key]: { $regex: escape(value), $options: "i" } });
    const clauses: Record<string, unknown>[] = [];
    if (query.zone) clauses.push({ $or: [textFilter("plan_name", query.zone), textFilter("location_name", query.zone)] });
    if (query.location) clauses.push(textFilter("location_name", query.location));
    if (query.search) clauses.push({ $or: [textFilter("license_plate", query.search), textFilter("_id", query.search), textFilter("location_name", query.search), textFilter("plan_name", query.search)] });
    if (clauses.length) filter.$and = clauses;
    const rows = await sessions().find(filter).toArray();
    const enriched = await Promise.all(rows.map(async (session) => {
      const paymentRows = await db().collection<MongoDoc>("payments").find({ session_id: session._id, status: "success" }).sort({ paid_at: -1, _id: 1 }).toArray();
      const amount_paid = paymentRows.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
      const payment_method = paymentRows[0]?.payment_method ?? null;
      return { ...rowFromDoc<EnforcementSessionRow>(session), amount_paid, payment_method, source: session.created_by_officer ? "ADMIN" : "APP" };
    }));
    if (query.sort === "Expiry Time Soonest") enriched.sort((a, b) => +new Date(a.end_time) - +new Date(b.end_time));
    else if (query.sort === "Plate Number") enriched.sort((a, b) => a.license_plate.localeCompare(b.license_plate));
    else if (query.sort === "Amount") enriched.sort((a, b) => b.amount_paid - a.amount_paid);
    else enriched.sort((a, b) => +new Date(b.start_time) - +new Date(a.start_time));
    return enriched.slice(0, takeLimit(query.limit, 100));
  }

  private async ticketEvidenceRows(limit: number, normalizedPlate?: string): Promise<EvidencePhotoRow[]> {
    const filter = normalizedPlate ? { $expr: plateExpr("$license_plate", normalizedPlate) } : {};
    const [photoDocs, ticketDocs, standaloneDocs] = await Promise.all([
      ticketPhotos().find().sort({ uploaded_at: -1, _id: 1 }).toArray(),
      tickets().find(filter).toArray(),
      standaloneEvidence().find(filter).toArray(),
    ]);
    const ticketById = new Map(ticketDocs.map((ticket) => [String(ticket._id ?? ""), ticket]));
    const ticketEvidence: EvidencePhotoRow[] = photoDocs.flatMap((photo) => {
      const ticket = ticketById.get(String(photo.ticket_id));
      if (!ticket) return [];
      return [{ id: String(photo._id ?? ""), ticket_id: String(photo.ticket_id), ticket_number: String(ticket.ticket_number ?? ""), license_plate: String(ticket.license_plate ?? ""), reason: String(ticket.reason ?? ""), photo_url: String(photo.photo_url ?? ""), photo_taken_at: photo.photo_taken_at as Date, uploaded_at: photo.uploaded_at as Date, source: "ticket", location_name: (ticket.location_name as string | null | undefined) ?? null, officer_name: String(ticket.officer_name ?? ""), notes: (ticket.note as string | null | undefined) ?? null }];
    });
    const standaloneRows: EvidencePhotoRow[] = standaloneDocs.map((row) => ({ id: String(row._id ?? ""), ticket_id: null, ticket_number: null, license_plate: String(row.license_plate ?? ""), reason: String(row.evidence_type ?? "general"), photo_url: String(row.photo_url ?? ""), photo_taken_at: row.photo_taken_at as Date, uploaded_at: row.uploaded_at as Date, source: "standalone", location_name: (row.location_name as string | null | undefined) ?? null, officer_name: String(row.officer_name ?? ""), notes: (row.notes as string | null | undefined) ?? null }));
    return [...ticketEvidence, ...standaloneRows].sort((a, b) => +new Date(b.uploaded_at) - +new Date(a.uploaded_at)).slice(0, takeLimit(limit, 50));
  }

  async listEvidence(limit = 50) { return this.ticketEvidenceRows(limit); }

  async createStandaloneEvidence(input: OfficerEvidenceInput) {
    const normalizedPlate = input.licensePlate.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
    const rows: EvidencePhotoRow[] = [];
    for (const photoUrl of input.photos) {
      const id = crypto.randomUUID();
      const now = new Date();
      await standaloneEvidence().insertOne({ _id: id, id, officer_id: input.officerId, officer_name: input.officerName, license_plate: normalizedPlate, location_name: input.locationName ?? null, evidence_type: input.evidenceType ?? "general", notes: input.notes ?? null, photo_url: photoUrl, photo_taken_at: now, uploaded_at: now });
      rows.push({ id, ticket_id: null, ticket_number: null, license_plate: normalizedPlate, reason: input.evidenceType ?? "general", photo_url: photoUrl, photo_taken_at: now, uploaded_at: now, source: "standalone", location_name: input.locationName ?? null, officer_name: input.officerName, notes: input.notes ?? null });
    }
    return rows;
  }

  async updateEvidence(id: string, input: OfficerEvidenceUpdateInput) {
    const standalone = await standaloneEvidence().findOne({ _id: id });
    const normalizedPlate = input.licensePlate?.trim() ? input.licensePlate.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "") : undefined;
    if (standalone) {
      const fields: Record<string, unknown> = {};
      if (normalizedPlate !== undefined) fields.license_plate = normalizedPlate;
      if (input.locationName !== undefined) fields.location_name = input.locationName.trim() || null;
      if (input.reason !== undefined) fields.evidence_type = input.reason.trim() || "general";
      if (input.notes !== undefined) fields.notes = input.notes.trim() || null;
      if (Object.keys(fields).length) await standaloneEvidence().updateOne({ _id: id }, { $set: fields });
    } else {
      const photo = await ticketPhotos().findOne({ _id: id });
      if (!photo?.ticket_id) return null;
      const fields: Record<string, unknown> = {};
      if (normalizedPlate !== undefined) fields.license_plate = normalizedPlate;
      if (input.locationName !== undefined) fields.location_name = input.locationName.trim() || null;
      if (input.reason !== undefined) fields.reason = input.reason.trim() || "";
      if (input.notes !== undefined) fields.note = input.notes.trim() || null;
      if (Object.keys(fields).length) await tickets().updateOne({ _id: String(photo.ticket_id) }, { $set: fields });
    }
    const rows = await this.listEvidence(200);
    return rows.find((row) => row.id === id) ?? null;
  }

  async deleteEvidence(id: string) {
    const standalone = await standaloneEvidence().deleteOne({ _id: id });
    if (standalone.deletedCount) return true;
    return (await ticketPhotos().deleteOne({ _id: id })).deletedCount > 0;
  }

  async createManualEntry(input: ManualEntryInput) {
    const id = crypto.randomUUID();
    const now = new Date();
    const durationMinutes = Number(input.durationMinutes ?? 120);
    const end = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const notes = JSON.stringify({ provinceState: input.provinceState ?? "", vehicleMake: input.vehicleMake ?? "", vehicleModel: input.vehicleModel ?? "", vehicleColor: input.vehicleColor ?? "", vehicleType: input.vehicleType ?? "" });
    const session = { _id: id, id, user_id: null, vehicle_id: null, license_plate: input.licensePlate.trim().toUpperCase(), plan_id: null, plan_name: input.planName ?? "Manual Entry", location_name: input.locationName ?? null, start_time: now, end_time: end, duration_minutes: durationMinutes, status: "active", notes, created_by_officer: input.officerId, created_at: now, updated_at: now };
    await sessions().insertOne(session);
    return rowFromDoc<EnforcementSessionRow>(session);
  }

  async vehicleHistory(plate: string, limit = 10) {
    const normalized = normalizePlate(plate);
    const safeLimit = takeLimit(limit, 10);
    const [sessionDocs, ticketDocs, evidence] = await Promise.all([
      sessions().aggregate([{ $match: { $expr: plateExpr("$license_plate", normalized) } }, { $sort: { start_time: -1 } }, { $limit: safeLimit }]).toArray(),
      tickets().aggregate([{ $match: { $expr: plateExpr("$license_plate", normalized) } }, { $sort: { date_issued: -1 } }, { $limit: safeLimit }]).toArray(),
      this.ticketEvidenceRows(safeLimit, normalized),
    ]);
    const sessionRows = await Promise.all(sessionDocs.map((session) => this.sessionDetails(session, true)));
    return { plate: normalized, sessions: sessionRows, tickets: ticketDocs.map((ticket) => rowFromDoc<EnforcementTicketRow>(ticket)), evidence };
  }

  async createTicket(input: EnforcementTicketInput) {
    const id = crypto.randomUUID();
    const ticketNumber = await nextNumericTicketNumber();
    const now = input.violationDateTime ? parseDate(input.violationDateTime) : new Date();
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const totalAmount = Number(input.fineAmount) + Number(input.lateFee ?? 0);
    let locationName = input.locationName?.trim() || null;
    if (!locationName && input.sessionId) {
      const session = await sessions().findOne({ _id: input.sessionId });
      if (session) {
        locationName = (session.location_name as string | null | undefined) ?? null;
        if (!locationName && session.plan_id) {
          const plan = await db().collection<MongoDoc>("parking_plans").findOne({ _id: String(session.plan_id) });
          if (plan?.parking_zone_id) {
            const zone = await db().collection<MongoDoc>("parking_zones").findOne({ _id: String(plan.parking_zone_id) });
            locationName = (zone?.parking_name as string | null | undefined) ?? null;
          }
        }
      }
    }
    const remarks = JSON.stringify({ provinceState: input.provinceState ?? "Ontario (ON)", vehicleMake: input.vehicleMake ?? "", vehicleModel: input.vehicleModel ?? "", vehicleColor: input.vehicleColor ?? "", vehicleType: input.vehicleType ?? "", violationSubType: input.violationSubType ?? "", fineAmount: Number(input.fineAmount), lateFee: Number(input.lateFee ?? 0), officerNotes: input.officerNotes ?? "", violationDetails: input.violationDetails ?? "", meterNumber: input.meterNumber ?? "", zoneArea: input.zoneArea ?? "", beatArea: input.beatArea ?? "" });
    await tickets().insertOne({ _id: id, id, ticket_number: ticketNumber, officer_id: input.officerId, officer_name: input.officerName, session_id: input.sessionId ?? null, license_plate: input.licensePlate.trim().toUpperCase(), location_name: locationName, amount: totalAmount, reason: input.violationType.trim(), status: input.status ?? "unpaid", date_issued: now, due_date: dueDate, paid_at: null, payment_id: null, remarks, note: input.officerNotes ?? null, dispute_raised: 0, dispute_message: null, dispute_at: null, dispute_resolved_at: null, created_at: now, updated_at: now });
    for (const photoUrl of input.photos ?? []) {
      if (!photoUrl.trim()) continue;
      const photoId = crypto.randomUUID();
      const photoNow = new Date();
      await ticketPhotos().insertOne({ _id: photoId, id: photoId, ticket_id: id, photo_url: photoUrl.trim(), photo_taken_at: photoNow, uploaded_at: photoNow });
    }
    return this.findTicketById(id);
  }

  async attachTicketPhoto(ticketId: string, photoUrl: string) {
    if (!ticketId?.trim()) throw new Error("ticket id is required");
    if (!photoUrl?.trim()) throw new Error("photo url is required");
    const id = crypto.randomUUID();
    const now = new Date();
    await ticketPhotos().insertOne({ _id: id, id, ticket_id: ticketId, photo_url: photoUrl.trim(), photo_taken_at: now, uploaded_at: now });
  }

  async findTicketById(id: string) {
    const [ticket, photoRows] = await Promise.all([
      tickets().findOne({ _id: id }),
      ticketPhotos().find({ ticket_id: id }).sort({ uploaded_at: 1, _id: 1 }).toArray(),
    ]);
    if (!ticket) return null;
    return { ...rowFromDoc<EnforcementTicketRow>(ticket), photos: photoRows.map((photo) => String(photo.photo_url ?? "")) };
  }
}

export const enforcementRepository = new EnforcementRepository();
