import crypto from "crypto";
import { getMongoDatabase } from "../config/mongodb";
import { PaymentMethod, PaymentStatus, PaymentType } from "../types";

export interface PaymentListFilters { page: number; limit: number; q?: string; status?: PaymentStatus; paymentMethod?: PaymentMethod; paymentType?: PaymentType; from?: string; to?: string; parkingLotId?: string }
export interface PaymentRow {
  id: string; session_id: string | null; ticket_id: string | null; user_id: string | null; license_plate: string;
  amount: number; payment_method: PaymentMethod; payment_type: PaymentType; status: PaymentStatus;
  transaction_ref: string | null; paid_at: Date | null; receipt_number: string | null; receipt_date: Date | null;
  created_at: Date; parking_lot_id?: string | null; parking_lot_name?: string | null;
}
type PaymentDocument = { _id: string; id: string; session_id: string | null; ticket_id: string | null; user_id: string | null; license_plate: string; amount: number; payment_method: PaymentMethod; payment_type: PaymentType; status: PaymentStatus; transaction_ref: string | null; paid_at: Date | null; receipt_number: string | null; receipt_date: Date | null; created_at: Date; [key: string]: unknown };
type RelatedZone = { _id: string; parking_name: string; parking_lot_id?: string | null };
type ParkingLot = { _id: string; lot_name: string; created_at?: Date };
const collection = () => getMongoDatabase().collection<PaymentDocument>("payments");
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const parseDate = (value: string) => new Date(value.includes("T") || value.endsWith("Z") ? value : `${value.replace(" ", "T")}Z`);
const minText = (values: Array<string | null | undefined>) => values.filter((value): value is string => Boolean(value)).sort((a, b) => a.localeCompare(b))[0] ?? null;
const utcDayStart = () => { const now = new Date(); return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); };

export class PaymentRepository {
  private async lotScope(lotId: string) {
    const db = getMongoDatabase();
    const [zones, plans] = await Promise.all([
      db.collection<RelatedZone>("parking_zones").find({ parking_lot_id: lotId }).toArray(),
      db.collection<{ _id: string }>("parking_plans").find({ parking_lot_id: lotId }).project<{ _id: string }>({ _id: 1 }).toArray(),
    ]);
    const zoneNames = zones.map((zone) => zone.parking_name);
    const planIds = plans.map((plan) => plan._id);
    const [sessions, tickets] = await Promise.all([
      db.collection<{ _id: string }>("parking_sessions").find({ $or: [{ location_name: { $in: zoneNames } }, { plan_id: { $in: planIds } }] }).project<{ _id: string }>({ _id: 1 }).toArray(),
      db.collection<{ _id: string }>("penalty_tickets").find({ location_name: { $in: zoneNames } }).project<{ _id: string }>({ _id: 1 }).toArray(),
    ]);
    return { zoneNames, planIds, sessionIds: sessions.map((row) => row._id), ticketIds: tickets.map((row) => row._id) };
  }

  private async filterFor(filters: PaymentListFilters) {
    const clauses: Record<string, unknown>[] = [];
    if (filters.q?.trim()) {
      const term = { $regex: escapeRegex(filters.q.trim()), $options: "i" };
      clauses.push({ $or: [{ license_plate: term }, { _id: term }] });
    }
    if (filters.status) clauses.push({ status: filters.status });
    if (filters.paymentMethod) clauses.push({ payment_method: filters.paymentMethod });
    if (filters.paymentType) clauses.push({ payment_type: filters.paymentType });
    if (filters.from) clauses.push({ created_at: { $gte: parseDate(filters.from) } });
    if (filters.to) clauses.push({ created_at: { $lte: parseDate(`${filters.to} 23:59:59`) } });
    if (filters.parkingLotId) {
      const scope = await this.lotScope(filters.parkingLotId);
      clauses.push({ $or: [{ session_id: { $in: scope.sessionIds } }, { ticket_id: { $in: scope.ticketIds } }] });
    }
    return clauses.length ? { $and: clauses } : {};
  }

  private async lotDetails(payment: PaymentDocument, firstLot: ParkingLot | null) {
    const db = getMongoDatabase();
    const [session, ticket] = await Promise.all([
      payment.session_id ? db.collection<{ _id: string; location_name?: string; plan_id?: string | null; created_by_officer?: string | null }>("parking_sessions").findOne({ _id: payment.session_id }) : null,
      payment.ticket_id ? db.collection<{ _id: string; location_name?: string; officer_id?: string | null }>("penalty_tickets").findOne({ _id: payment.ticket_id }) : null,
    ]);
    const [sessionZones, sessionZoneById, plan, ticketZones, ticketZoneById, sessionOfficer, ticketOfficer, directSessionLots, directTicketLots] = await Promise.all([
      session ? db.collection<RelatedZone>("parking_zones").find({ parking_name: session.location_name ?? "" }).toArray() : [],
      session?.location_name ? db.collection<RelatedZone>("parking_zones").findOne({ _id: session.location_name }) : null,
      session?.plan_id ? db.collection<{ _id: string; parking_lot_id?: string | null }>("parking_plans").findOne({ _id: session.plan_id }) : null,
      ticket ? db.collection<RelatedZone>("parking_zones").find({ parking_name: ticket.location_name ?? "" }).toArray() : [],
      ticket?.location_name ? db.collection<RelatedZone>("parking_zones").findOne({ _id: ticket.location_name }) : null,
      session?.created_by_officer ? db.collection<{ _id: string; parking_lot_id?: string | null }>("officers").findOne({ _id: session.created_by_officer }) : null,
      ticket?.officer_id ? db.collection<{ _id: string; parking_lot_id?: string | null }>("officers").findOne({ _id: ticket.officer_id }) : null,
      session?.location_name ? db.collection<ParkingLot>("parking_lots").find({ $or: [{ _id: session.location_name }, { lot_name: session.location_name }] }).sort({ _id: 1 }).toArray() : [],
      ticket?.location_name ? db.collection<ParkingLot>("parking_lots").find({ $or: [{ _id: ticket.location_name }, { lot_name: ticket.location_name }] }).sort({ _id: 1 }).toArray() : [],
    ]);
    const first = <T>(rows: T[]): Array<T | null> => rows.length ? rows : [null];
    const candidates: string[] = [];
    const joinedCandidates: string[] = [];
    for (const sz of first(sessionZones)) for (const tz of first(ticketZones)) {
      const joined = sz?.parking_lot_id ?? sessionZoneById?.parking_lot_id ?? plan?.parking_lot_id
        ?? tz?.parking_lot_id ?? ticketZoneById?.parking_lot_id;
      if (joined) joinedCandidates.push(joined);
      if (joined) candidates.push(joined);
      else if (sessionOfficer?.parking_lot_id) candidates.push(sessionOfficer.parking_lot_id);
      else if (ticketOfficer?.parking_lot_id) candidates.push(ticketOfficer.parking_lot_id);
      else if (directSessionLots.length) candidates.push(...directSessionLots.map((lot) => lot._id));
      else if (directTicketLots.length) candidates.push(...directTicketLots.map((lot) => lot._id));
      else if (firstLot) candidates.push(firstLot._id);
    }
    const joinedLots = joinedCandidates.length ? await db.collection<ParkingLot>("parking_lots").find({ _id: { $in: [...new Set(joinedCandidates)] } }).toArray() : [];
    const lotNames = joinedCandidates.map((id) => joinedLots.find((lot) => lot._id === id)?.lot_name).filter((name): name is string => Boolean(name));
    if (!lotNames.length) {
      if (sessionOfficer?.parking_lot_id || ticketOfficer?.parking_lot_id) {
        const officerLotIds = [sessionOfficer?.parking_lot_id, ticketOfficer?.parking_lot_id].filter((id): id is string => Boolean(id));
        const officerLots = await db.collection<ParkingLot>("parking_lots").find({ _id: { $in: officerLotIds } }).toArray();
        lotNames.push(...officerLots.map((lot) => lot.lot_name));
      }
      if (!lotNames.length) lotNames.push(...directSessionLots.map((lot) => lot.lot_name), ...directTicketLots.map((lot) => lot.lot_name));
      if (!lotNames.length && firstLot) lotNames.push(firstLot.lot_name);
    }
    return { parking_lot_id: minText(candidates), parking_lot_name: minText(lotNames) };
  }

  async list(filters: PaymentListFilters): Promise<{ items: PaymentRow[]; total: number }> {
    const filter = await this.filterFor(filters);
    const page = Math.max(1, filters.page);
    const limit = Math.max(1, Math.min(500, filters.limit));
    const [documents, total, firstLot] = await Promise.all([
      collection().find(filter).sort({ created_at: -1, _id: 1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection().countDocuments(filter),
      getMongoDatabase().collection<ParkingLot>("parking_lots").find().sort({ created_at: 1, _id: 1 }).limit(1).next(),
    ]);
    const items = await Promise.all(documents.map(async (payment) => {
      const { _id, ...fields } = payment;
      return { ...fields, id: _id, ...await this.lotDetails(payment, firstLot) } as PaymentRow;
    }));
    return { items, total };
  }

  async findById(id: string): Promise<PaymentRow | null> {
    const payment = await collection().findOne({ _id: id });
    if (!payment) return null;
    const { _id, ...fields } = payment;
    return { ...fields, id: _id } as PaymentRow;
  }

  async summary(filters: { parkingLotId?: string } = {}): Promise<{ todayPayments: number; todayAmount: number; todayRevenue: number; parkingRevenue: number; penaltyRevenue: number; pendingAmount: number; failedAmount: number }> {
    const base: Record<string, unknown> = {};
    if (filters.parkingLotId) {
      const scope = await this.lotScope(filters.parkingLotId);
      base.$or = [{ session_id: { $in: scope.sessionIds } }, { ticket_id: { $in: scope.ticketIds } }];
    }
    const start = utcDayStart();
    const end = new Date(start.getTime() + 86400000);
    const rows = await collection().aggregate([
      { $facet: {
        today: [{ $match: { ...base, created_at: { $gte: start, $lt: end } } }, { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amount" } } }],
        parking: [{ $match: { ...base, payment_type: "parking", status: "success" } }, { $group: { _id: null, amount: { $sum: "$amount" } } }],
        penalty: [{ $match: { ...base, payment_type: "penalty", status: "success" } }, { $group: { _id: null, amount: { $sum: "$amount" } } }],
        pending: [{ $match: { ...base, status: "pending" } }, { $group: { _id: null, amount: { $sum: "$amount" } } }],
        failed: [{ $match: { ...base, status: "failed" } }, { $group: { _id: null, amount: { $sum: "$amount" } } }],
      } },
    ]).toArray();
    const result = rows[0] ?? {};
    const todayPayments = Number(result.today?.[0]?.count ?? 0);
    const todayAmount = Number(result.today?.[0]?.amount ?? 0);
    return {
      todayPayments, todayAmount, todayRevenue: todayAmount,
      parkingRevenue: Number(result.parking?.[0]?.amount ?? 0),
      penaltyRevenue: Number(result.penalty?.[0]?.amount ?? 0),
      pendingAmount: Number(result.pending?.[0]?.amount ?? 0),
      failedAmount: Number(result.failed?.[0]?.amount ?? 0),
    };
  }

  async create(params: { sessionId?: string; ticketId?: string; userId?: string; licensePlate: string; amount: number; paymentMethod: PaymentMethod; paymentType: PaymentType; status?: PaymentStatus; transactionRef?: string; paidAt?: string }): Promise<string> {
    const id = crypto.randomUUID();
    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const now = new Date();
    await collection().insertOne({
      _id: id, id, session_id: params.sessionId ?? null, ticket_id: params.ticketId ?? null, user_id: params.userId ?? null,
      license_plate: params.licensePlate.trim().toUpperCase(), amount: params.amount, payment_method: params.paymentMethod,
      payment_type: params.paymentType, status: params.status ?? "success", transaction_ref: params.transactionRef ?? null,
      paid_at: params.paidAt ? parseDate(params.paidAt) : null, receipt_number: receiptNumber, receipt_date: now,
      created_at: now, updated_at: now,
    });
    return id;
  }
}
