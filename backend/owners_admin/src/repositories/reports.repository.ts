import { Document } from "mongodb";
import { getMongoDatabase } from "../config/mongodb";

type Doc = Document & { _id: string; [key: string]: any };
const db = () => getMongoDatabase();
const coll = (name: string) => db().collection<Doc>(name);
const asDate = (value?: string, end = false) => value ? new Date(`${value.slice(0, 10)}T${end ? "23:59:59.999" : "00:00:00.000"}Z`) : undefined;
const range = (from?: string, to?: string, field = "paid_at") => {
  const condition: Record<string, Date> = {};
  const start = asDate(from); const end = asDate(to, true);
  if (start) condition.$gte = start;
  if (end) condition.$lte = end;
  return Object.keys(condition).length ? { [field]: condition } : {};
};
const lotScope = async (lotId?: string) => {
  if (!lotId?.trim()) return null;
  const id = lotId.trim();
  const [zones, plans, officers] = await Promise.all([
    coll("parking_zones").find({ parking_lot_id: id }).project({ parking_name: 1 }).toArray(),
    coll("parking_plans").find({ parking_lot_id: id }).project({ _id: 1 }).toArray(),
    coll("officers").find({ parking_lot_id: id }).project({ _id: 1 }).toArray(),
  ]);
  return { zoneNames: zones.map(x => x.parking_name), planIds: plans.map(x => x._id), officerIds: officers.map(x => x._id) };
};
const sessionLotOr = (scope: NonNullable<Awaited<ReturnType<typeof lotScope>>>) => [{ location_name: { $in: scope.zoneNames } }, { plan_id: { $in: scope.planIds } }];
const ticketLotOr = async (scope: NonNullable<Awaited<ReturnType<typeof lotScope>>>) => {
  const sessions = await coll("parking_sessions").find({ $or: sessionLotOr(scope) }).project({ _id: 1 }).toArray();
  return [{ location_name: { $in: scope.zoneNames } }, { session_id: { $in: sessions.map(x => x._id) } }, { officer_id: { $in: scope.officerIds } }];
};
const paymentLotOr = async (scope: NonNullable<Awaited<ReturnType<typeof lotScope>>>) => {
  const [sessions, tickets] = await Promise.all([
    coll("parking_sessions").find({ $or: sessionLotOr(scope) }).project({ _id: 1 }).toArray(),
    coll("penalty_tickets").find({ location_name: { $in: scope.zoneNames } }).project({ _id: 1 }).toArray(),
  ]);
  return [{ session_id: { $in: sessions.map(x => x._id) } }, { ticket_id: { $in: tickets.map(x => x._id) } }];
};
const andFilter = (...parts: Array<Record<string, any> | null | undefined>) => {
  const filters = parts.filter(x => x && Object.keys(x).length) as Record<string, any>[];
  return filters.length > 1 ? { $and: filters } : filters[0] ?? {};
};
const paymentLookup = (from: string, localField: string, as: string) => ({ $lookup: { from, localField, foreignField: "session_id", as } });
const cmpPlate = (field: string, plate: string) => ({ $eq: [{ $toUpper: { $trim: { input: field } } }, plate.trim().toUpperCase()] });

export class ReportsRepository {
  async getRevenue(from?: string, to?: string, parkingLotId?: string) {
    const scope = await lotScope(parkingLotId);
    const lot = scope ? { $or: await paymentLotOr(scope) } : null;
    const filter = andFilter(range(from, to), lot);
    const [totalsRows, daily] = await Promise.all([
      coll("payments").aggregate([{ $match: filter }, { $group: { _id: null, total_revenue: { $sum: "$amount" }, total_transactions: { $sum: 1 }, successful_transactions: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } }, failed_transactions: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } }, refunded_amount: { $sum: { $cond: [{ $eq: ["$status", "refunded"] }, "$amount", 0] } } } }, { $project: { _id: 0 } }]).toArray(),
      coll("payments").aggregate([{ $match: filter }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$paid_at" } }, total_amount: { $sum: "$amount" }, transaction_count: { $sum: 1 } } }, { $project: { _id: 0, report_date: "$_id", total_amount: 1, transaction_count: 1 } }, { $sort: { report_date: -1 } }, { $limit: 14 }]).toArray(),
    ]);
    return { totals: totalsRows[0] ?? { total_revenue: 0, total_transactions: 0, successful_transactions: 0, failed_transactions: 0, refunded_amount: 0 }, daily };
  }

  private async sessionFilter(from?: string, to?: string, lotId?: string) {
    const scope = await lotScope(lotId);
    const overlap: Record<string, any> = {};
    if (from) overlap.end_time = { $gte: asDate(from) };
    if (to) overlap.start_time = { ...(overlap.start_time ?? {}), $lte: asDate(to, true) };
    return andFilter(overlap, scope ? { $or: sessionLotOr(scope) } : null);
  }
  private async ticketFilter(from?: string, to?: string, lotId?: string) {
    const scope = await lotScope(lotId);
    return andFilter(range(from, to, "date_issued"), scope ? { $or: await ticketLotOr(scope) } : null);
  }
  private async paymentFilter(from?: string, to?: string, lotId?: string) {
    const scope = await lotScope(lotId);
    return andFilter(range(from, to), scope ? { $or: await paymentLotOr(scope) } : null);
  }

  async getUsage(from?: string, to?: string, parkingLotId?: string) {
    const filter = await this.sessionFilter(from, to, parkingLotId);
    const [sessionTotals, planBreakdown, dailyBreakdown, hourly, heat] = await Promise.all([
      coll("parking_sessions").aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $project: { _id: 0, status: "$_id", count: 1 } }]).toArray(),
      coll("parking_sessions").aggregate([{ $match: filter }, { $group: { _id: "$plan_name", sessions: { $sum: 1 }, total_duration: { $sum: { $ifNull: ["$duration_minutes", 0] } } } }, { $project: { _id: 0, plan_name: { $ifNull: ["$_id", "Unassigned"] }, sessions: 1, total_duration: 1 } }, { $sort: { sessions: -1 } }, { $limit: 12 }]).toArray(),
      coll("parking_sessions").aggregate([{ $match: filter }, paymentLookup("payments", "_id", "payments") , { $unwind: { path: "$payments", preserveNullAndEmptyArrays: true } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$start_time" } }, total_sessions: { $sum: 1 }, completed: { $sum: { $cond: [{ $in: ["$status", ["expired", "extended"]] }, 1, 0] } }, active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } }, expired: { $sum: { $cond: [{ $eq: ["$status", "expired"] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } }, avg_duration: { $avg: "$duration_minutes" }, revenue: { $sum: { $cond: [{ $and: [{ $eq: ["$payments.status", "success"] }, { $in: ["$payments.payment_type", ["parking", "extension"]] }] }, "$payments.amount", 0] } } } }, { $project: { _id: 0, report_date: "$_id", total_sessions: 1, completed: 1, active: 1, expired: 1, cancelled: 1, avg_duration: { $ifNull: ["$avg_duration", 0] }, revenue: 1 } }, { $sort: { report_date: -1 } }, { $limit: 45 }]).toArray(),
      coll("parking_sessions").aggregate([{ $match: filter }, { $group: { _id: { $hour: "$start_time" }, session_count: { $sum: 1 } } }, { $project: { _id: 0, hour: "$_id", session_count: 1 } }, { $sort: { hour: 1 } }]).toArray(),
      coll("parking_sessions").aggregate([{ $match: filter }, { $group: { _id: { weekday: { $subtract: [{ $dayOfWeek: "$start_time" }, 2] }, hour: { $hour: "$start_time" } }, session_count: { $sum: 1 } } }, { $project: { _id: 0, weekday: { $mod: [{ $add: ["$_id.weekday", 7] }, 7] }, hour: "$_id.hour", session_count: 1 } }]).toArray(),
    ]);
    const heatmapByWeekdayHour = Array.from({ length: 7 }, (_, weekday) => ({ weekday, hours: Array(24).fill(0) }));
    for (const row of heat) heatmapByWeekdayHour[row.weekday].hours[row.hour] = row.session_count;
    return { sessionTotals, planBreakdown, dailyBreakdown, hourlyHistogram: hourly, heatmapByWeekdayHour };
  }

  async getPenalty(from?: string, to?: string, parkingLotId?: string) {
    const filter = await this.ticketFilter(from, to, parkingLotId);
    const [statusSummary, officerBreakdown] = await Promise.all([
      coll("penalty_tickets").aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 }, total_amount: { $sum: "$amount" } } }, { $project: { _id: 0, status: "$_id", count: 1, total_amount: 1 } }]).toArray(),
      coll("penalty_tickets").aggregate([{ $match: filter }, { $group: { _id: "$officer_name", count: { $sum: 1 }, total_amount: { $sum: "$amount" } } }, { $project: { _id: 0, officer_name: "$_id", count: 1, total_amount: 1 } }, { $sort: { count: -1 } }, { $limit: 10 }]).toArray(),
    ]);
    return { statusSummary, officerBreakdown };
  }

  async getPerformance(from?: string, to?: string, parkingLotId?: string) {
    const officers = await coll("officers").find().toArray();
    const ticketFilter = await this.ticketFilter(from, to, parkingLotId);
    const allTickets = await coll("penalty_tickets").find(ticketFilter).toArray();
    const officerPerformance = officers.map(officer => {
      const matches = allTickets.filter(ticket => String(ticket.officer_id ?? "") === officer._id || String(ticket.officer_name ?? "").trim().toLowerCase() === String(officer.full_name ?? "").trim().toLowerCase() || String(ticket.officer_name ?? "").trim().toLowerCase() === String(officer.email ?? "").trim().toLowerCase());
      return { officer_id: officer._id, officer_name: officer.full_name, officer_email: officer.email, officer_phone: officer.phone ?? null, officer_role: officer.role, tickets_issued: matches.length, paid_tickets: matches.filter(x => x.status === "paid").length, pending_tickets: matches.filter(x => ["unpaid", "disputed"].includes(x.status)).length, cancelled_tickets: matches.filter(x => x.status === "cancelled").length, total_penalty_amount: matches.reduce((sum, x) => sum + Number(x.amount ?? 0), 0) };
    }).sort((a, b) => b.tickets_issued - a.tickets_issued || String(a.officer_name).localeCompare(String(b.officer_name)));
    return { officerPerformance };
  }

  async getPaymentReconciliation(from?: string, to?: string, parkingLotId?: string) {
    const reconciliation = await coll("payments").aggregate([{ $match: await this.paymentFilter(from, to, parkingLotId) }, { $group: { _id: { payment_type: "$payment_type", status: "$status" }, count: { $sum: 1 }, total_amount: { $sum: "$amount" } } }, { $project: { _id: 0, payment_type: "$_id.payment_type", status: "$_id.status", count: 1, total_amount: 1 } }]).toArray();
    return { reconciliation };
  }

  async getDue(from?: string, to?: string, parkingLotId?: string) {
    const dueTickets = await coll("penalty_tickets").find(andFilter(await this.ticketFilter(from, to, parkingLotId), { status: "unpaid" }), { projection: { _id: 0, id: 1, ticket_number: 1, license_plate: 1, amount: 1, due_date: 1, officer_name: 1, date_issued: 1, location_name: 1, reason: 1 } }).sort({ due_date: 1 }).limit(100).toArray();
    return { dueTickets };
  }

  async getLocationPerformance(from?: string, to?: string, parkingLotId?: string) {
    const locationData = await coll("parking_sessions").aggregate([{ $match: await this.sessionFilter(from, to, parkingLotId) }, paymentLookup("payments", "_id", "payments"), { $unwind: { path: "$payments", preserveNullAndEmptyArrays: true } }, { $group: { _id: { $ifNull: [{ $cond: [{ $eq: [{ $trim: { input: { $ifNull: ["$location_name", ""] } } }, ""] }, "$plan_name", "$location_name"] }, "Unassigned"] }, sessions: { $sum: 1 }, total_duration: { $sum: { $ifNull: ["$duration_minutes", 0] } }, revenue: { $sum: { $cond: [{ $eq: ["$payments.status", "success"] }, "$payments.amount", 0] } } } }, { $project: { _id: 0, location_key: "$_id", sessions: 1, total_duration: 1, revenue: 1 } }, { $sort: { sessions: -1 } }, { $limit: 20 }]).toArray();
    return { locationData };
  }

  async getOccupancy(from?: string, to?: string, parkingLotId?: string) {
    const filter = await this.sessionFilter(from, to, parkingLotId);
    const [occupancy, average] = await Promise.all([coll("parking_sessions").aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $project: { _id: 0, status: "$_id", count: 1 } }]).toArray(), coll("parking_sessions").aggregate([{ $match: filter }, { $group: { _id: null, average_duration: { $avg: "$duration_minutes" } } }]).toArray()]);
    return { occupancy, averageDuration: average[0]?.average_duration ?? 0 };
  }

  async getPlanPerformance(from?: string, to?: string, parkingLotId?: string) {
    const planData = await coll("parking_sessions").aggregate([{ $match: await this.sessionFilter(from, to, parkingLotId) }, paymentLookup("payments", "_id", "payments"), { $unwind: { path: "$payments", preserveNullAndEmptyArrays: true } }, { $lookup: { from: "parking_plans", localField: "plan_id", foreignField: "_id", as: "plan" } }, { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } }, { $group: { _id: { id: "$plan_id", name: "$plan_name" }, sessions_count: { $sum: 1 }, average_duration: { $avg: "$duration_minutes" }, revenue: { $sum: { $cond: [{ $and: [{ $eq: ["$payments.status", "success"] }, { $in: ["$payments.payment_type", ["parking", "extension"]] }] }, "$payments.amount", 0] } }, plan_price: { $max: "$plan.price" } } }, { $project: { _id: 0, plan_id: "$_id.id", plan_name: { $ifNull: [{ $cond: [{ $eq: [{ $trim: { input: { $ifNull: ["$_id.name", ""] } } }, ""] }, "Unassigned", "$_id.name"] }, "Unassigned"] }, sessions_count: 1, average_duration: { $ifNull: ["$average_duration", 0] }, revenue: 1, plan_price: { $ifNull: ["$plan_price", null] } } }, { $sort: { sessions_count: -1 } }, { $limit: 20 }]).toArray();
    return { planData };
  }

  async getAuditReport(limit = 50, from?: string, to?: string) {
    const filter = range(from, to, "created_at");
    const [summaryRows, recentActivity] = await Promise.all([coll("audit_logs").aggregate([{ $match: filter }, { $group: { _id: null, total_logs: { $sum: 1 }, success_count: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } }, failure_count: { $sum: { $cond: [{ $eq: ["$status", "failure"] }, 1, 0] } } } }, { $project: { _id: 0 } }]).toArray(), coll("audit_logs").find(filter, { projection: { _id: 0, id: 1, user_id: 1, user_name: 1, action: 1, module: 1, resource_id: 1, resource_name: 1, details: 1, old_value: 1, new_value: 1, ip_address: 1, user_agent: 1, status: 1, created_at: 1 } }).sort({ created_at: -1 }).limit(Math.max(1, limit)).toArray()]);
    return { summary: summaryRows[0] ?? { total_logs: 0, success_count: 0, failure_count: 0 }, recentActivity };
  }

  async getVehicleHistory(licensePlate: string, from?: string, to?: string, location?: string, parkingLotId?: string) {
    const plate = licensePlate.trim();
    const empty = { history: [], parking_sessions: [], payments: [], refunds: [], summary: { total_sessions: 0, total_payments_amount: 0, total_penalties: 0, total_penalty_amount: 0, refunds_amount: 0 }, vehicle: null };
    if (!plate) return empty;
    const scope = await lotScope(parkingLotId);
    const locationFilter = location && location !== "All Locations" ? { location_name: { $regex: location.trim(), $options: "i" } } : null;
    const plates = (field: string) => ({ $expr: cmpPlate(field, plate) });
    const sessionsFilter = andFilter(plates("$license_plate"), range(from, to, "start_time"), locationFilter, scope ? { $or: sessionLotOr(scope) } : null);
    const ticketFilter = andFilter(plates("$license_plate"), range(from, to, "date_issued"), locationFilter, scope ? { $or: await ticketLotOr(scope) } : null);
    const paymentsFilter = andFilter(plates("$license_plate"), range(from, to), scope ? { $or: await paymentLotOr(scope) } : null);
    const [history, sessionRows, paymentRows, refundRows] = await Promise.all([
      coll("penalty_tickets").aggregate([{ $match: ticketFilter }, { $lookup: { from: "payments", localField: "payment_id", foreignField: "_id", as: "receipt" } }, { $unwind: { path: "$receipt", preserveNullAndEmptyArrays: true } }, { $project: { _id: 0, id: "$_id", ticket_number: 1, officer_name: 1, license_plate: 1, amount: 1, reason: 1, status: 1, date_issued: 1, due_date: 1, paid_at: 1, remarks: 1, location_name: 1, receipt_number: "$receipt.receipt_number" } }, { $sort: { date_issued: -1 } }, { $limit: 200 }]).toArray(),
      coll("parking_sessions").aggregate([{ $match: sessionsFilter }, paymentLookup("payments", "_id", "payments"), { $project: { _id: 0, id: "$_id", start_time: 1, end_time: 1, location_name: 1, plan_name: 1, duration_minutes: 1, status: 1, amount_paid: { $sum: { $map: { input: { $filter: { input: "$payments", as: "p", cond: { $eq: ["$$p.status", "success"] } } }, as: "p", in: "$$p.amount" } } }, payment_method: { $arrayElemAt: ["$payments.payment_method", -1] }, receipt_number: { $arrayElemAt: ["$payments.receipt_number", -1] } } }, { $sort: { start_time: -1 } }, { $limit: 200 }]).toArray(),
      coll("payments").find(andFilter(paymentsFilter, { status: { $ne: "refunded" } }), { projection: { session_id: 1, ticket_id: 1, license_plate: 1, amount: 1, payment_method: 1, payment_type: 1, status: 1, transaction_ref: 1, paid_at: 1, receipt_number: 1 } }).sort({ paid_at: -1 }).limit(200).toArray().then(rows => rows.map(({ _id, ...row }) => ({ ...row, id: _id })) as Array<Record<string, any>>),
      coll("payments").find(andFilter(paymentsFilter, { status: "refunded" }), { projection: { session_id: 1, ticket_id: 1, license_plate: 1, amount: 1, payment_method: 1, payment_type: 1, status: 1, transaction_ref: 1, paid_at: 1, receipt_number: 1 } }).sort({ paid_at: -1 }).limit(200).toArray().then(rows => rows.map(({ _id, ...row }) => ({ ...row, id: _id })) as Array<Record<string, any>>),
    ]);
    const totalPenalty = history.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    const totalPayments = paymentRows.filter(row => row.status === "success").reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    const refundsAmount = refundRows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    const times = sessionRows.map(row => new Date(row.start_time).getTime()).filter(Number.isFinite);
    const locationCounts = sessionRows.reduce((counts: Record<string, number>, row) => { const key = row.location_name ?? ""; counts[key] = (counts[key] ?? 0) + 1; return counts; }, {});
    const vehicle = times.length ? { first_seen: new Date(Math.min(...times)), last_seen: new Date(Math.max(...times)), total_duration_minutes: sessionRows.reduce((sum, row) => sum + Number(row.duration_minutes ?? 0), 0), favorite_location: Object.entries(locationCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || null } : history.length ? { first_seen: new Date(Math.min(...history.map(x => +new Date(x.date_issued)))), last_seen: new Date(Math.max(...history.map(x => +new Date(x.date_issued)))), total_duration_minutes: 0, favorite_location: history[0].location_name ?? null } : null;
    return { history, parking_sessions: sessionRows, payments: paymentRows, refunds: refundRows, summary: { total_sessions: sessionRows.length, total_payments_amount: totalPayments, total_penalties: history.length, total_penalty_amount: totalPenalty, refunds_amount: refundsAmount }, vehicle };
  }

  async getRefunds(limit = 50, from?: string, to?: string, parkingLotId?: string) {
    const filter = andFilter(await this.paymentFilter(from, to, parkingLotId), { status: "refunded" });
    const [summaryRows, recordDocs] = await Promise.all([coll("payments").aggregate([{ $match: filter }, { $group: { _id: null, refund_count: { $sum: 1 }, total_refunded: { $sum: "$amount" } } }, { $project: { _id: 0 } }]).toArray(), coll("payments").find(filter, { projection: { ticket_id: 1, session_id: 1, license_plate: 1, amount: 1, payment_method: 1, transaction_ref: 1, paid_at: 1, status: 1 } }).sort({ paid_at: -1 }).limit(Math.max(1, limit)).toArray()]);
    const records = recordDocs.map(({ _id, ...row }) => ({ ...row, id: _id }));
    return { summary: summaryRows[0] ?? { refund_count: 0, total_refunded: 0 }, records };
  }
}
