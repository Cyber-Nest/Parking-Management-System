import { getMongoDatabase } from "../config/mongodb";
import { ParkingZoneRow } from "../types";

export interface ParkingZoneListFilters {
  page?: number;
  limit?: number;
  q?: string;
  lotId?: string;
}

type ParkingZoneDocument = ParkingZoneRow & { _id: string; status?: string; created_at?: Date; updated_at?: Date };
const collection = () => getMongoDatabase().collection<ParkingZoneDocument>("parking_zones");
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const fromDocument = (document: ParkingZoneDocument): ParkingZoneRow & { status?: string } => {
  const { _id, ...zone } = document;
  return { ...zone, id: _id };
};

export class ParkingZoneRepository {
  async list(filters: ParkingZoneListFilters = {}): Promise<{ items: ParkingZoneRow[]; total: number }> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.max(1, Math.min(500, filters.limit ?? 100));
    const filter: Record<string, unknown> = {};
    if (filters.lotId?.trim()) filter.parking_lot_id = filters.lotId.trim();
    const q = filters.q?.trim();
    if (q) {
      const term = { $regex: escapeRegex(q), $options: "i" };
      filter.$or = [{ parking_name: term }, { _id: term }, { address: term }];
    }
    const [documents, total] = await Promise.all([
      collection().find(filter).sort({ parking_name: 1, _id: 1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection().countDocuments(filter),
    ]);
    return { items: documents.map(fromDocument), total };
  }

  async findById(id: string): Promise<(ParkingZoneRow & { status?: string }) | null> {
    const document = await collection().findOne({ _id: id });
    return document ? fromDocument(document) : null;
  }

  async create(params: {
    id?: string; parking_name: string; address: string; image_url: string; hourly_rate: number;
    available_spots: number; total_spots: number; spot_id: string; status?: "active" | "inactive";
    parking_lot_id?: string | null;
  }): Promise<string> {
    const id = params.id ?? `ZONE-${Date.now()}`;
    const now = new Date();
    await collection().insertOne({
      _id: id, id, parking_name: params.parking_name.trim(), address: params.address.trim(),
      image_url: params.image_url, hourly_rate: params.hourly_rate, available_spots: params.available_spots,
      total_spots: params.total_spots, spot_id: params.spot_id, parking_lot_id: params.parking_lot_id ?? null,
      status: params.status ?? "active", created_at: now, updated_at: now,
    });
    return id;
  }

  async update(id: string, params: Partial<{
    parking_name: string; address: string; image_url: string; hourly_rate: number; available_spots: number;
    total_spots: number; spot_id: string; status: "active" | "inactive"; parking_lot_id: string | null;
  }>): Promise<number> {
    const fields: Record<string, unknown> = {};
    for (const key of ["parking_name", "address", "image_url", "hourly_rate", "available_spots", "total_spots", "spot_id", "status", "parking_lot_id"] as const) {
      const value = params[key];
      if (value !== undefined) fields[key] = key === "parking_name" || key === "address" ? String(value).trim() : value;
    }
    if (!Object.keys(fields).length) return 0;
    fields.updated_at = new Date();
    const result = await collection().updateOne({ _id: id }, { $set: fields });
    return result.matchedCount;
  }

  async remove(id: string): Promise<number> {
    const result = await collection().deleteOne({ _id: id });
    return result.deletedCount;
  }

  async decrementAvailableSpots(id: string): Promise<void> {
    await collection().updateOne({ _id: id, available_spots: { $gt: 0 } }, { $inc: { available_spots: -1 }, $set: { updated_at: new Date() } });
  }

  async findCustomerSubZones(excludeId: string, limit = 6): Promise<ParkingZoneRow[]> {
    const documents = await collection().find({ _id: { $ne: excludeId }, available_spots: { $gt: 0 }, status: "active" })
      .sort({ parking_name: 1 }).limit(Math.max(1, limit)).toArray();
    return documents.map(fromDocument);
  }

  async listByLot(lotId: string, page = 1, limit = 100): Promise<{ items: ParkingZoneRow[]; total: number }> {
    const filter = { parking_lot_id: lotId };
    const pageSize = Math.max(1, Math.min(500, limit));
    const [documents, total] = await Promise.all([
      collection().find(filter).sort({ parking_name: 1, _id: 1 }).skip((Math.max(1, page) - 1) * pageSize).limit(pageSize).toArray(),
      collection().countDocuments(filter),
    ]);
    return { items: documents.map(fromDocument), total };
  }
}

export const parkingZoneRepository = new ParkingZoneRepository();
