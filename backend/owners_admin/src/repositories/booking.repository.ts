import crypto from "crypto";
import { getMongoDatabase } from "../config/mongodb";

export interface BookingFilters { page?: number; limit?: number; email?: string; status?: string; from?: string; to?: string; plate?: string }
export interface BookingRow {
  id: string; booking_reference: string; parking_lot_id?: string | null; customer_email: string;
  vehicle_plate_number: string; vehicle_model: string; vehicle_color?: string | null; parking_name: string;
  parking_location?: string | null; start_time: Date; end_time: Date; duration_minutes: number;
  duration_label?: string | null; total_price: number; booking_status: string; payment_status: string;
  allow_extension?: number; total_extensions?: number;
}
type BookingDocument = { _id: string; id: string; start_time: Date; end_time: Date; booking_status: string; customer_email: string; vehicle_plate_number: string; total_price: number; created_at: Date; updated_at: Date; [key: string]: unknown };
const collection = () => getMongoDatabase().collection<BookingDocument>("bookings");
const toRow = (document: BookingDocument) => {
  const { _id, ...fields } = document;
  return { ...fields, id: _id } as unknown as BookingRow & Record<string, unknown>;
};
const pageBounds = (limit: number, offset: number) => ({ skip: Math.max(0, offset), limit: Math.max(1, Math.min(500, limit)) });

export class BookingRepository {
  async createBooking(data: Record<string, unknown>) {
    const id = crypto.randomUUID();
    const now = new Date();
    const document = {
      ...data,
      _id: id,
      id,
      parking_lot_id: data.parking_lot_id ?? null,
      parking_location: data.parking_location ?? null,
      vehicle_color: data.vehicle_color ?? null,
      duration_label: data.duration_label ?? null,
      parking_plan_id: data.parking_plan_id ?? null,
      tax_amount: data.tax_amount ?? 0,
      service_fee: data.service_fee ?? 0,
      currency: data.currency ?? "CAD",
      spot_id: data.spot_id ?? null,
      zone_name: data.zone_name ?? null,
      booking_status: "pending",
      payment_status: "unpaid",
      grace_period_minutes: data.grace_period_minutes ?? 15,
      stripe_payment_intent_id: data.stripe_payment_intent_id ?? null,
      metadata: data.metadata ?? {},
      created_at: now,
      updated_at: now,
    } as unknown as BookingDocument;
    await collection().insertOne(document);
    return this.findBookingById(id);
  }

  async findBookingById(id: string) {
    const document = await collection().findOne({ _id: id });
    return document ? toRow(document) : null;
  }

  async findByReference(reference: string) {
    const document = await collection().findOne({ booking_reference: reference });
    return document ? toRow(document) : null;
  }

  async findByEmail(email: string, limit = 50, offset = 0) {
    const [count, documents] = await Promise.all([
      collection().countDocuments({ customer_email: email }),
      collection().find({ customer_email: email }).sort({ start_time: -1, _id: 1 }).skip(pageBounds(limit, offset).skip).limit(pageBounds(limit, offset).limit).toArray(),
    ]);
    return { count, rows: documents.map(toRow) };
  }

  async findByPlateNumber(plate: string) {
    const documents = await collection().find({ vehicle_plate_number: plate }).sort({ start_time: -1, _id: 1 }).toArray();
    return documents.map(toRow);
  }

  async findByStatus(status: string, limit = 50, offset = 0) {
    const [count, documents] = await Promise.all([
      collection().countDocuments({ booking_status: status }),
      collection().find({ booking_status: status }).sort({ start_time: -1, _id: 1 }).skip(pageBounds(limit, offset).skip).limit(pageBounds(limit, offset).limit).toArray(),
    ]);
    return { count, rows: documents.map(toRow) };
  }

  async findActiveBookings() {
    const documents = await collection().find({ booking_status: "active", end_time: { $gt: new Date() } }).sort({ start_time: -1, _id: 1 }).toArray();
    return documents.map(toRow);
  }

  async findByDateRange(startDate: Date, endDate: Date, limit = 50, offset = 0) {
    const filter = { start_time: { $gte: startDate, $lte: endDate } };
    const [count, documents] = await Promise.all([
      collection().countDocuments(filter),
      collection().find(filter).sort({ start_time: -1, _id: 1 }).skip(pageBounds(limit, offset).skip).limit(pageBounds(limit, offset).limit).toArray(),
    ]);
    return { count, rows: documents.map(toRow) };
  }

  async updateBooking(id: string, data: Record<string, unknown>) {
    const fields = Object.fromEntries(Object.entries(data).filter(([key]) => key !== "_id" && key !== "id"));
    if (Object.keys(fields).length) await collection().updateOne({ _id: id }, { $set: { ...fields, updated_at: new Date() } });
    return this.findBookingById(id);
  }

  async confirmBooking(id: string, paymentId: string) {
    await collection().updateOne({ _id: id }, { $set: { booking_status: "confirmed", payment_status: "paid", payment_id: paymentId, updated_at: new Date() } });
    return this.findBookingById(id);
  }

  async markAsActive(id: string) {
    await collection().updateOne({ _id: id }, { $set: { booking_status: "active", updated_at: new Date() } });
    return this.findBookingById(id);
  }

  async markAsCompleted(id: string) {
    await collection().updateOne({ _id: id }, { $set: { booking_status: "completed", updated_at: new Date() } });
    return this.findBookingById(id);
  }

  async getBookingStats() {
    return collection().aggregate([
      { $group: { _id: "$booking_status", count: { $sum: 1 }, total_revenue: { $sum: "$total_price" } } },
      { $project: { _id: 0, booking_status: "$_id", count: 1, total_revenue: 1 } },
    ]).toArray();
  }

  async getTodayBookings() {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const result = await collection().aggregate([
      { $match: { start_time: { $gte: start, $lt: end } } },
      { $group: { _id: null, booking_count: { $sum: 1 }, total_revenue: { $sum: "$total_price" } } },
      { $project: { _id: 0, booking_count: 1, total_revenue: 1 } },
    ]).toArray();
    return result[0] ?? { booking_count: 0, total_revenue: 0 };
  }

  async deleteBooking(id: string) {
    return { affectedRows: (await collection().deleteOne({ _id: id })).deletedCount };
  }
}

export const bookingRepository = new BookingRepository();
