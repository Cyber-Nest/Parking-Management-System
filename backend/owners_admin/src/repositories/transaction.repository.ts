import crypto from "crypto";
import { getMongoDatabase } from "../config/mongodb";

export interface TransactionFilters {
  page?: number; limit?: number; email?: string; status?: string; type?: string; from?: string; to?: string;
}
export interface TransactionRow {
  id: string; transaction_reference: string; amount: number; payment_method: string; transaction_type: string;
  status: string; user_email: string; booking_id?: string; penalty_id?: string; initiated_at: Date;
  completed_at?: Date; response_message?: string;
}
type TransactionDocument = { _id: string; id: string; created_at: Date; updated_at?: Date; [key: string]: unknown };
const collection = () => getMongoDatabase().collection<TransactionDocument>("transactions");
const toRow = (document: TransactionDocument): TransactionRow => {
  const { _id, ...fields } = document;
  return { ...fields, id: _id } as unknown as TransactionRow;
};
const pageBounds = (limit: number, offset: number) => ({ skip: Math.max(0, offset), limit: Math.max(1, Math.min(500, limit)) });

export class TransactionRepository {
  async createTransaction(data: Record<string, unknown>) {
    const id = crypto.randomUUID();
    const now = new Date();
    const document = {
      _id: id,
      id,
      transaction_reference: data.transaction_reference,
      amount: data.amount,
      currency: data.currency ?? "CAD",
      payment_method: data.payment_method,
      payment_gateway: data.payment_gateway ?? "stripe",
      stripe_payment_intent_id: data.stripe_payment_intent_id ?? null,
      transaction_type: data.transaction_type,
      status: "initiated",
      booking_id: data.booking_id ?? null,
      penalty_id: data.penalty_id ?? null,
      user_email: data.user_email,
      ip_address: data.ip_address ?? null,
      user_agent: data.user_agent ?? null,
      metadata: data.metadata ?? {},
      initiated_at: now,
      created_at: now,
      updated_at: now,
    };
    await collection().insertOne(document as unknown as TransactionDocument);
    return this.findTransactionById(id);
  }

  async findTransactionById(id: string) {
    const document = await collection().findOne({ _id: id });
    return document ? toRow(document) : null;
  }

  async findByReference(reference: string) {
    const document = await collection().findOne({ transaction_reference: reference });
    return document ? toRow(document) : null;
  }

  async findByEmail(email: string, limit = 50, offset = 0) {
    const [count, documents] = await Promise.all([
      collection().countDocuments({ user_email: email }),
      collection().find({ user_email: email }).sort({ created_at: -1, _id: 1 }).skip(pageBounds(limit, offset).skip).limit(pageBounds(limit, offset).limit).toArray(),
    ]);
    return { count, rows: documents.map(toRow) };
  }

  async findByStripeIntentId(stripePaymentIntentId: string) {
    const document = await collection().findOne({ stripe_payment_intent_id: stripePaymentIntentId });
    return document ? toRow(document) : null;
  }

  async findByStatus(status: string, limit = 50, offset = 0) {
    const [count, documents] = await Promise.all([
      collection().countDocuments({ status }),
      collection().find({ status }).sort({ created_at: -1, _id: 1 }).skip(pageBounds(limit, offset).skip).limit(pageBounds(limit, offset).limit).toArray(),
    ]);
    return { count, rows: documents.map(toRow) };
  }

  async findByDateRange(startDate: Date, endDate: Date, limit = 50, offset = 0) {
    const filter = { initiated_at: { $gte: startDate, $lte: endDate } };
    const [count, documents] = await Promise.all([
      collection().countDocuments(filter),
      collection().find(filter).sort({ created_at: -1, _id: 1 }).skip(pageBounds(limit, offset).skip).limit(pageBounds(limit, offset).limit).toArray(),
    ]);
    return { count, rows: documents.map(toRow) };
  }

  async findByType(transactionType: string, limit = 50, offset = 0) {
    const [count, documents] = await Promise.all([
      collection().countDocuments({ transaction_type: transactionType }),
      collection().find({ transaction_type: transactionType }).sort({ created_at: -1, _id: 1 }).skip(pageBounds(limit, offset).skip).limit(pageBounds(limit, offset).limit).toArray(),
    ]);
    return { count, rows: documents.map(toRow) };
  }

  async updateTransaction(id: string, data: Record<string, unknown>) {
    const fields = Object.fromEntries(Object.entries(data).filter(([key]) => key !== "_id" && key !== "id"));
    if (Object.keys(fields).length) {
      await collection().updateOne({ _id: id }, { $set: { ...fields, updated_at: new Date() } });
    }
    return this.findTransactionById(id);
  }

  async markAsCompleted(id: string) {
    const now = new Date();
    await collection().updateOne({ _id: id }, { $set: { status: "completed", completed_at: now, updated_at: now } });
    return this.findTransactionById(id);
  }

  async markAsFailed(id: string, responseCode: string, responseMessage: string) {
    const now = new Date();
    await collection().updateOne({ _id: id }, { $set: { status: "failed", failed_at: now, response_code: responseCode, response_message: responseMessage, updated_at: now } });
    return this.findTransactionById(id);
  }

  async getTransactionStats(startDate?: Date, endDate?: Date) {
    const match = startDate && endDate ? { initiated_at: { $gte: startDate, $lte: endDate } } : {};
    return collection().aggregate([
      { $match: match },
      { $group: { _id: { status: "$status", type: "$transaction_type" }, count: { $sum: 1 }, total_amount: { $sum: "$amount" } } },
      { $project: { _id: 0, status: "$_id.status", type: "$_id.type", count: 1, total_amount: 1 } },
      { $sort: { type: 1 } },
    ]).toArray();
  }

  async getRevenueByDate(startDate: Date, endDate: Date) {
    return collection().aggregate([
      { $match: { status: "completed", initiated_at: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$initiated_at", timezone: "UTC" } }, transaction_count: { $sum: 1 }, total_revenue: { $sum: "$amount" } } },
      { $project: { _id: 0, date: "$_id", transaction_count: 1, total_revenue: 1 } },
      { $sort: { date: -1 } },
    ]).toArray();
  }

  async getTodayRevenue() {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const result = await collection().aggregate([
      { $match: { status: "completed", initiated_at: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $project: { _id: 0, total: 1, count: 1 } },
    ]).toArray();
    return result[0] ?? { total: 0, count: 0 };
  }

  async deleteTransaction(id: string) {
    const result = await collection().deleteOne({ _id: id });
    return { affectedRows: result.deletedCount };
  }
}

export const transactionRepository = new TransactionRepository();
