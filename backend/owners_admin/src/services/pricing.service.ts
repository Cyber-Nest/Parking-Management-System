import crypto from "crypto";
import { getMongoDatabase } from "../config/mongodb";
import { ValidationError, NotFoundError } from "./commonErrors";

type PricingDocument = {
  _id: string; id: string; name: string; base_price: number; additional_fees: number;
  tax_id: string | null; is_active: boolean; parking_lot_id: string | null; created_at: Date; updated_at: Date;
};
const collection = () => getMongoDatabase().collection<PricingDocument>("pricings");
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class PricingService {
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

  async create(body: { name: string; base_price: number; additional_fees?: number; tax_id?: string; is_active?: boolean; parking_lot_id?: string }) {
    if (!body.name?.trim()) throw new ValidationError("name is required");
    if (typeof body.base_price !== "number" || body.base_price < 0) throw new ValidationError("base_price must be a non-negative number");
    const id = crypto.randomUUID();
    const now = new Date();
    const pricing: PricingDocument = { _id: id, id, name: body.name.trim(), base_price: body.base_price, additional_fees: body.additional_fees ?? 0, tax_id: body.tax_id || null, is_active: body.is_active ?? true, parking_lot_id: body.parking_lot_id || null, created_at: now, updated_at: now };
    await collection().insertOne(pricing);
    return pricing;
  }

  async update(id: string, body: { name?: string; base_price?: number; additional_fees?: number; tax_id?: string; is_active?: boolean; parking_lot_id?: string }) {
    const current = await collection().findOne({ _id: id });
    if (!current) throw new NotFoundError("Pricing not found");
    if (body.name !== undefined && !body.name.trim()) throw new ValidationError("name cannot be empty");
    if (body.base_price !== undefined && (typeof body.base_price !== "number" || body.base_price < 0)) throw new ValidationError("base_price must be a non-negative number");
    const fields: Record<string, unknown> = { updated_at: new Date() };
    if (body.name !== undefined) fields.name = body.name.trim();
    if (body.base_price !== undefined) fields.base_price = body.base_price;
    if (body.additional_fees !== undefined) fields.additional_fees = body.additional_fees;
    if (body.tax_id !== undefined) fields.tax_id = body.tax_id || null;
    if (body.is_active !== undefined) fields.is_active = body.is_active;
    if (body.parking_lot_id !== undefined) fields.parking_lot_id = body.parking_lot_id || null;
    await collection().updateOne({ _id: id }, { $set: fields });
    return { ...current, ...fields };
  }

  async remove(id: string) {
    if (!(await collection().deleteOne({ _id: id })).deletedCount) throw new NotFoundError("Pricing not found");
  }
}
