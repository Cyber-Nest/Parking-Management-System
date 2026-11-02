import crypto from "crypto";
import { getMongoDatabase } from "../config/mongodb";

export interface ParkingPlanRow {
  id: string;
  name: string;
  price: number;
  duration: number;
  plan_type: string | null;
  tax_percent: number;
  status: string;
  parking_lot_id?: string | null;
  parking_lot_name?: string | null;
  parking_zone_id?: string | null;
  parking_zone_name?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

type ParkingPlanDocument = ParkingPlanRow & { _id: string };

const planCollection = () => getMongoDatabase().collection<ParkingPlanDocument>("parking_plans");
const toPlanRow = async (plan: ParkingPlanDocument): Promise<ParkingPlanRow> => {
  const db = getMongoDatabase();
  const [lot, zone] = await Promise.all([
    plan.parking_lot_id ? db.collection<{ _id: string; lot_name: string }>("parking_lots").findOne({ _id: plan.parking_lot_id }) : null,
    plan.parking_zone_id ? db.collection<{ _id: string; parking_name: string }>("parking_zones").findOne({ _id: plan.parking_zone_id }) : null,
  ]);
  const { _id, ...fields } = plan;
  return { ...fields, id: _id, parking_lot_name: lot?.lot_name ?? null, parking_zone_name: zone?.parking_name ?? null };
};

export class ParkingPlanRepository {
  async list(): Promise<ParkingPlanRow[]> {
    const plans = await planCollection().find().sort({ created_at: -1, _id: 1 }).toArray();
    return Promise.all(plans.map(toPlanRow));
  }

  async findById(id: string): Promise<ParkingPlanRow | null> {
    const plan = await planCollection().findOne({ _id: id });
    return plan ? toPlanRow(plan) : null;
  }

  // async listByLotAndZone(lotId: string, zoneId: string): Promise<ParkingPlanRow[]> {
  //   return queryRows<ParkingPlanRow>(
  //     `SELECT p.id, p.name, p.price, p.duration, p.plan_type, p.tax_percent, p.status,
  //             p.parking_lot_id, l.lot_name AS parking_lot_name,
  //             p.parking_zone_id, z.parking_name AS parking_zone_name,
  //             p.created_at, p.updated_at
  //      FROM parking_plans p
  //      LEFT JOIN parking_lots l ON p.parking_lot_id = l.id
  //      LEFT JOIN parking_zones z ON p.parking_zone_id = z.id
  //      WHERE p.status = 'Active'
  //      AND (
  //        (p.parking_lot_id = ? AND p.parking_zone_id = ?)
  //        OR (p.parking_lot_id IS NULL AND p.parking_zone_id IS NULL)
  //      )
  //      ORDER BY p.duration ASC, p.price ASC`,
  //     [lotId, zoneId]
  //   );
  // }

  //response only zone id or lot id related data
  async listByLotAndZone(
    lotId: string,
    zoneId: string,
  ): Promise<ParkingPlanRow[]> {
    const plans = await planCollection().find({ status: "Active", parking_lot_id: lotId, parking_zone_id: zoneId })
      .sort({ duration: 1, price: 1, _id: 1 }).toArray();
    return Promise.all(plans.map(toPlanRow));
  }

  async findByPriceAndDuration(
    price: number,
    duration: number,
  ): Promise<ParkingPlanRow | null> {
    const plan = await planCollection().findOne({ price, duration });
    return plan ? toPlanRow(plan) : null;
  }

  /** Match customer booking duration to an active plan (exact duration, then closest price). */
  async findForBooking(
    durationMinutes: number,
    price?: number,
    lotId?: string,
    zoneId?: string,
  ): Promise<ParkingPlanRow | null> {
    const filter: Record<string, unknown> = { status: "Active" };
    if (lotId && zoneId) {
      filter.parking_lot_id = lotId;
      filter.parking_zone_id = zoneId;
    }
    const plans = await planCollection().find(filter).toArray();
    const exactDuration = plans.filter((plan) => plan.duration === durationMinutes)
      .sort((a, b) => Math.abs(a.price - (price ?? 0)) - Math.abs(b.price - (price ?? 0)) || a._id.localeCompare(b._id))[0];
    if (exactDuration) return toPlanRow(exactDuration);
    const closest = plans.sort((a, b) => Math.abs(a.duration - durationMinutes) - Math.abs(b.duration - durationMinutes)
      || Math.abs(a.price - (price ?? 0)) - Math.abs(b.price - (price ?? 0)) || a._id.localeCompare(b._id))[0];
    return closest ? toPlanRow(closest) : null;
  }

  async create(params: {
    name: string;
    price: number;
    duration: number;
    plan_type?: string;
    tax_percent?: number;
    status?: string;
    parking_lot_id?: string | null;
    parking_zone_id?: string | null;
  }): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();
    await planCollection().insertOne({
      _id: id, id, name: params.name.trim(), price: params.price, duration: params.duration,
      plan_type: params.plan_type ?? "Hourly", tax_percent: params.tax_percent ?? 0,
      status: params.status ?? "Active", parking_lot_id: params.parking_lot_id ?? null,
      parking_zone_id: params.parking_zone_id ?? null, created_at: now, updated_at: now,
    });
    return id;
  }

  async update(
    id: string,
    params: {
      name?: string;
      price?: number;
      duration?: number;
      plan_type?: string;
      tax_percent?: number;
      status?: string;
      parking_lot_id?: string | null;
      parking_zone_id?: string | null;
    },
  ): Promise<number> {
    const fields: Record<string, unknown> = {};
    if (typeof params.name === "string") fields.name = params.name.trim();
    if (typeof params.price === "number") fields.price = params.price;
    if (typeof params.duration === "number") fields.duration = params.duration;
    if (typeof params.plan_type === "string") fields.plan_type = params.plan_type.trim();
    if (typeof params.tax_percent === "number") fields.tax_percent = params.tax_percent;
    if (typeof params.status === "string") fields.status = params.status;
    if (params.parking_lot_id !== undefined) fields.parking_lot_id = params.parking_lot_id;
    if (params.parking_zone_id !== undefined) fields.parking_zone_id = params.parking_zone_id;
    if (Object.keys(fields).length === 0) return 0;
    fields.updated_at = new Date();
    return (await planCollection().updateOne({ _id: id }, { $set: fields })).matchedCount;
  }

  async remove(id: string): Promise<number> {
    return (await planCollection().deleteOne({ _id: id })).deletedCount;
  }
}
