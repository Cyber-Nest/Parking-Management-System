import crypto from "crypto";
import { getMongoDatabase } from "../config/mongodb";
import { ValidationError, NotFoundError } from "./commonErrors";

type TaxDocument = {
  _id: string; id: string; name: string; rate: number; type: "percentage" | "fixed";
  is_active: boolean; parking_lot_id: string | null; created_at: Date; updated_at: Date;
};
const collection = () => getMongoDatabase().collection<TaxDocument>("taxes");
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class TaxService {
  async list(query: Record<string, string | undefined>) {
    const page = Math.max(1, Number(query.page ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? "20")));
    const filter: Record<string, unknown> = {};
    if (query.q) filter.name = { $regex: escapeRegex(query.q), $options: "i" };
    if (query.is_active) filter.is_active = query.is_active === "true";
    if (query.parking_lot_id) filter.parking_lot_id = query.parking_lot_id;
    const [items, total] = await Promise.all([
      collection().find(filter).sort({ created_at: -1, _id: 1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection().countDocuments(filter),
    ]);
    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async create(body: { name: string; rate: number; type?: "percentage" | "fixed"; is_active?: boolean; parking_lot_id?: string }) {
    if (!body.name?.trim()) throw new ValidationError("name is required");
    if (typeof body.rate !== "number" || body.rate < 0) throw new ValidationError("rate must be a non-negative number");
    const id = crypto.randomUUID();
    const now = new Date();
    const tax: TaxDocument = { _id: id, id, name: body.name.trim(), rate: body.rate, type: body.type ?? "percentage", is_active: body.is_active ?? true, parking_lot_id: body.parking_lot_id || null, created_at: now, updated_at: now };
    await collection().insertOne(tax);
    return tax;
  }

  async update(id: string, body: { name?: string; rate?: number; type?: "percentage" | "fixed"; is_active?: boolean; parking_lot_id?: string }) {
    const current = await collection().findOne({ _id: id });
    if (!current) throw new NotFoundError("Tax not found");
    if (body.name !== undefined && !body.name.trim()) throw new ValidationError("name cannot be empty");
    if (body.rate !== undefined && (typeof body.rate !== "number" || body.rate < 0)) throw new ValidationError("rate must be a non-negative number");
    const fields: Record<string, unknown> = { updated_at: new Date() };
    if (body.name !== undefined) fields.name = body.name.trim();
    if (body.rate !== undefined) fields.rate = body.rate;
    if (body.type !== undefined) fields.type = body.type;
    if (body.is_active !== undefined) fields.is_active = body.is_active;
    if (body.parking_lot_id !== undefined) fields.parking_lot_id = body.parking_lot_id || null;
    await collection().updateOne({ _id: id }, { $set: fields });
    return { ...current, ...fields };
  }

  async remove(id: string) {
    if (!(await collection().deleteOne({ _id: id })).deletedCount) throw new NotFoundError("Tax not found");
  }
}
