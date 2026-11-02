import crypto from "crypto";
import { UpdateFilter } from "mongodb";
import { getMongoDatabase } from "../config/mongodb";

export interface InvoiceFilters { page?: number; limit?: number; email?: string; status?: string; payment_status?: string; from?: string; to?: string }
export interface InvoiceRow {
  id: string; invoice_number: string; invoice_date: Date; due_date?: Date; customer_email: string;
  customer_name?: string; vehicle_plate_number?: string; item_type: string; total_amount: number;
  payment_status: string; paid_amount: number; status: string; booking_id?: string; penalty_id?: string; pdf_file_path?: string;
}
type InvoiceDocument = { _id: string; id: string; invoice_number: string; invoice_date: Date; customer_email: string; item_type: string; total_amount: number; payment_status: string; paid_amount: number; download_count: number; status: string; created_at: Date; updated_at: Date; [key: string]: unknown };
const collection = () => getMongoDatabase().collection<InvoiceDocument>("invoices");
const toRow = (document: InvoiceDocument) => {
  const { _id, ...fields } = document;
  return { ...fields, id: _id } as unknown as InvoiceRow & Record<string, unknown>;
};
const pageBounds = (limit: number, offset: number) => ({ skip: Math.max(0, offset), limit: Math.max(1, Math.min(500, limit)) });

export class InvoiceRepository {
  async createInvoice(data: Record<string, unknown>) {
    const id = crypto.randomUUID();
    const now = new Date();
    const document = {
      ...data, _id: id, id, invoice_date: now, customer_name: data.customer_name ?? null,
      vehicle_plate_number: data.vehicle_plate_number ?? null, vehicle_model: data.vehicle_model ?? null,
      vehicle_color: data.vehicle_color ?? null, quantity: data.quantity ?? 1,
      tax_amount: data.tax_amount ?? 0, tax_rate: data.tax_rate ?? 13, discount_amount: data.discount_amount ?? 0,
      service_fee: data.service_fee ?? 0, currency: data.currency ?? "CAD", payment_status: "unpaid",
      booking_id: data.booking_id ?? null, penalty_id: data.penalty_id ?? null, transaction_id: data.transaction_id ?? null,
      status: data.status ?? "issued", parking_zone: data.parking_zone ?? null, parking_location: data.parking_location ?? null,
      start_time: data.start_time ?? null, end_time: data.end_time ?? null, duration_minutes: data.duration_minutes ?? null,
      paid_amount: 0, download_count: 0, metadata: data.metadata ?? {}, created_at: now, updated_at: now,
    } as unknown as InvoiceDocument;
    await collection().insertOne(document);
    return this.findInvoiceById(id);
  }

  async findInvoiceById(id: string) {
    const document = await collection().findOne({ _id: id });
    return document ? toRow(document) : null;
  }

  async findByNumber(invoiceNumber: string) {
    const document = await collection().findOne({ invoice_number: invoiceNumber });
    return document ? toRow(document) : null;
  }

  async findByEmail(email: string, limit = 50, offset = 0) {
    const filter = { customer_email: email };
    const [count, documents] = await Promise.all([collection().countDocuments(filter), collection().find(filter).sort({ invoice_date: -1, _id: 1 }).skip(pageBounds(limit, offset).skip).limit(pageBounds(limit, offset).limit).toArray()]);
    return { count, rows: documents.map(toRow) };
  }

  async findByBookingId(bookingId: string) {
    const document = await collection().findOne({ booking_id: bookingId });
    return document ? toRow(document) : null;
  }

  async findByTransactionId(transactionId: string) {
    const document = await collection().findOne({ transaction_id: transactionId });
    return document ? toRow(document) : null;
  }

  async findByPenaltyId(penaltyId: string) {
    const document = await collection().find({ penalty_id: penaltyId }).sort({ invoice_date: -1, _id: 1 }).limit(1).next();
    return document ? toRow(document) : null;
  }

  async findByStatus(status: string, limit = 50, offset = 0) {
    const [count, documents] = await Promise.all([collection().countDocuments({ status }), collection().find({ status }).sort({ invoice_date: -1, _id: 1 }).skip(pageBounds(limit, offset).skip).limit(pageBounds(limit, offset).limit).toArray()]);
    return { count, rows: documents.map(toRow) };
  }

  async findByPaymentStatus(paymentStatus: string, limit = 50, offset = 0) {
    const [count, documents] = await Promise.all([collection().countDocuments({ payment_status: paymentStatus }), collection().find({ payment_status: paymentStatus }).sort({ invoice_date: -1, _id: 1 }).skip(pageBounds(limit, offset).skip).limit(pageBounds(limit, offset).limit).toArray()]);
    return { count, rows: documents.map(toRow) };
  }

  async findByDateRange(startDate: Date, endDate: Date, limit = 50, offset = 0) {
    const filter = { invoice_date: { $gte: startDate, $lte: endDate } };
    const [count, documents] = await Promise.all([collection().countDocuments(filter), collection().find(filter).sort({ invoice_date: -1, _id: 1 }).skip(pageBounds(limit, offset).skip).limit(pageBounds(limit, offset).limit).toArray()]);
    return { count, rows: documents.map(toRow) };
  }

  async updateInvoice(id: string, data: Record<string, unknown>) {
    const fields = Object.fromEntries(Object.entries(data).filter(([key]) => key !== "_id" && key !== "id"));
    if (Object.keys(fields).length) await collection().updateOne({ _id: id }, { $set: { ...fields, updated_at: new Date() } });
    return this.findInvoiceById(id);
  }

  async markAsPaid(id: string, paidAmount: number) {
    const now = new Date();
    await collection().updateOne({ _id: id }, { $set: { payment_status: "paid", paid_amount: paidAmount, paid_date: now, status: "paid", updated_at: now } });
    return this.findInvoiceById(id);
  }

  async markAsPartiallyPaid(id: string, paidAmount: number) {
    await collection().updateOne({ _id: id }, { $set: { payment_status: "partial", updated_at: new Date() }, $inc: { paid_amount: paidAmount } } as unknown as UpdateFilter<InvoiceDocument>);
    return this.findInvoiceById(id);
  }

  async recordDownload(id: string) {
    const now = new Date();
    await collection().updateOne({ _id: id }, { $inc: { download_count: 1 }, $set: { last_downloaded_at: now, updated_at: now } } as unknown as UpdateFilter<InvoiceDocument>);
    return this.findInvoiceById(id);
  }

  async getInvoiceStats() {
    return collection().aggregate([
      { $group: { _id: "$payment_status", count: { $sum: 1 }, total_amount: { $sum: "$total_amount" }, paid_amount: { $sum: "$paid_amount" } } },
      { $project: { _id: 0, payment_status: "$_id", count: 1, total_amount: 1, paid_amount: 1 } },
    ]).toArray();
  }

  async getRevenueByDate(startDate: Date, endDate: Date) {
    return collection().aggregate([
      { $match: { invoice_date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$invoice_date", timezone: "UTC" } }, invoice_count: { $sum: 1 }, total_revenue: { $sum: "$total_amount" }, paid_amount: { $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, "$paid_amount", 0] } } } },
      { $project: { _id: 0, date: "$_id", invoice_count: 1, total_revenue: 1, paid_amount: 1 } },
      { $sort: { date: -1 } },
    ]).toArray();
  }

  async getTodayInvoices() {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const result = await collection().aggregate([
      { $match: { invoice_date: { $gte: start, $lt: end } } },
      { $group: { _id: null, invoice_count: { $sum: 1 }, total_amount: { $sum: "$total_amount" }, paid_amount: { $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, "$paid_amount", 0] } } } },
      { $project: { _id: 0, invoice_count: 1, total_amount: 1, paid_amount: 1 } },
    ]).toArray();
    return result[0] ?? { invoice_count: 0, total_amount: 0, paid_amount: 0 };
  }

  async deleteInvoice(id: string) {
    return { affectedRows: (await collection().deleteOne({ _id: id })).deletedCount };
  }
}

export const invoiceRepository = new InvoiceRepository();
