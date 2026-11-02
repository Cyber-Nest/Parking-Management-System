import { getMongoDatabase } from "../config/mongodb";
import { ParkingLotRow } from "../types";

export interface ParkingLotListFilters {
  page?: number;
  limit?: number;
  q?: string;
}

type ParkingLotDocument = ParkingLotRow & { _id: string; created_at: Date; updated_at?: Date };
const collection = () => getMongoDatabase().collection<ParkingLotDocument>("parking_lots");
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const fromDocument = (document: ParkingLotDocument): ParkingLotRow => {
  const { _id, ...lot } = document;
  return { ...lot, id: _id };
};

export class ParkingLotRepository {
  async list(filters: ParkingLotListFilters = {}): Promise<{ items: ParkingLotRow[]; total: number }> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.max(1, Math.min(500, filters.limit ?? 100));
    const q = filters.q?.trim();
    const search = q ? { $regex: escapeRegex(q), $options: "i" } : undefined;
    const filter = search ? { $or: [{ lot_name: search }, { _id: search }, { address: search }] } : {};
    const [documents, total] = await Promise.all([
      collection().find(filter).sort({ lot_name: 1, _id: 1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection().countDocuments(filter),
    ]);
    return { items: documents.map(fromDocument), total };
  }

  async findById(id: string): Promise<ParkingLotRow | null> {
    const document = await collection().findOne({ _id: id });
    return document ? fromDocument(document) : null;
  }

  async create(params: {
    id?: string;
    owner_id?: string | null;
    lot_name: string;
    address?: string;
    image_url?: string | null;
    qr_code_url?: string | null;
  }): Promise<string> {
    const id = params.id ?? `LOT-${Date.now()}`;
    const now = new Date();
    await collection().insertOne({
      _id: id,
      id,
      owner_id: params.owner_id ?? null,
      lot_name: params.lot_name.trim(),
      address: params.address ?? "",
      image_url: params.image_url ?? null,
      qr_code_url: params.qr_code_url ?? null,
      created_at: now,
      updated_at: now,
    });
    return id;
  }

  async update(id: string, params: Partial<{ owner_id: string | null; lot_name: string; address: string; image_url: string | null; qr_code_url: string | null }>): Promise<number> {
    const fields: Record<string, unknown> = {};
    if (params.owner_id !== undefined) fields.owner_id = params.owner_id;
    if (params.lot_name !== undefined) fields.lot_name = params.lot_name.trim();
    if (params.address !== undefined) fields.address = params.address.trim();
    if (params.image_url !== undefined) fields.image_url = params.image_url;
    if (params.qr_code_url !== undefined) fields.qr_code_url = params.qr_code_url;
    if (Object.keys(fields).length === 0) return 0;
    fields.updated_at = new Date();
    const result = await collection().updateOne({ _id: id }, { $set: fields });
    return result.matchedCount;
  }

  async remove(id: string): Promise<number> {
    const result = await collection().deleteOne({ _id: id });
    return result.deletedCount;
  }
}

export const parkingLotRepository = new ParkingLotRepository();
