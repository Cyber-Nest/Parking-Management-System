import crypto from 'crypto';
import { execute, queryRows } from '../config/database';

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
  created_at?: Date;
  updated_at?: Date;
}

export class ParkingPlanRepository {
  async list(): Promise<ParkingPlanRow[]> {
    return queryRows<ParkingPlanRow>(
      `SELECT p.id, p.name, p.price, p.duration, p.plan_type, p.tax_percent, p.status,
              p.parking_lot_id, l.lot_name AS parking_lot_name, p.created_at, p.updated_at
       FROM parking_plans p
       LEFT JOIN parking_lots l ON p.parking_lot_id = l.id
       ORDER BY p.created_at DESC`
    );
  }

  async findById(id: string): Promise<ParkingPlanRow | null> {
    const rows = await queryRows<ParkingPlanRow>(
      `SELECT p.id, p.name, p.price, p.duration, p.plan_type, p.tax_percent, p.status,
              p.parking_lot_id, l.lot_name AS parking_lot_name, p.created_at, p.updated_at
       FROM parking_plans p
       LEFT JOIN parking_lots l ON p.parking_lot_id = l.id
       WHERE p.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async listByLotId(lotId: string): Promise<ParkingPlanRow[]> {
    return queryRows<ParkingPlanRow>(
      `SELECT p.id, p.name, p.price, p.duration, p.plan_type, p.tax_percent, p.status,
              p.parking_lot_id, l.lot_name AS parking_lot_name, p.created_at, p.updated_at
       FROM parking_plans p
       LEFT JOIN parking_lots l ON p.parking_lot_id = l.id
       WHERE p.status = 'Active' AND (p.parking_lot_id = ? OR p.parking_lot_id IS NULL)
       ORDER BY p.duration ASC, p.price ASC`,
      [lotId]
    );
  }

  async findByPriceAndDuration(price: number, duration: number): Promise<ParkingPlanRow | null> {
    const rows = await queryRows<ParkingPlanRow>(
      `SELECT p.id, p.name, p.price, p.duration, p.plan_type, p.tax_percent, p.status,
              p.parking_lot_id, l.lot_name AS parking_lot_name, p.created_at, p.updated_at
       FROM parking_plans p
       LEFT JOIN parking_lots l ON p.parking_lot_id = l.id
       WHERE p.price = ? AND p.duration = ?
       LIMIT 1`,
      [price, duration]
    );
    return rows[0] ?? null;
  }

  /** Match customer booking duration to an active plan (exact duration, then closest price). */
  async findForBooking(durationMinutes: number, price?: number): Promise<ParkingPlanRow | null> {
    const exactDuration = await queryRows<ParkingPlanRow>(
      `SELECT p.id, p.name, p.price, p.duration, p.plan_type, p.tax_percent, p.status,
              p.parking_lot_id, l.lot_name AS parking_lot_name, p.created_at, p.updated_at
       FROM parking_plans p
       LEFT JOIN parking_lots l ON p.parking_lot_id = l.id
       WHERE p.duration = ? AND p.status = 'Active'
       ORDER BY ABS(p.price - ?) ASC
       LIMIT 1`,
      [durationMinutes, price ?? 0],
    );
    if (exactDuration[0]) return exactDuration[0];

    const closestDuration = await queryRows<ParkingPlanRow>(
      `SELECT p.id, p.name, p.price, p.duration, p.plan_type, p.tax_percent, p.status,
              p.parking_lot_id, l.lot_name AS parking_lot_name, p.created_at, p.updated_at
       FROM parking_plans p
       LEFT JOIN parking_lots l ON p.parking_lot_id = l.id
       WHERE p.status = 'Active'
       ORDER BY ABS(p.duration - ?) ASC, ABS(p.price - ?) ASC
       LIMIT 1`,
      [durationMinutes, price ?? 0],
    );
    return closestDuration[0] ?? null;
  }

  async create(params: {
    name: string;
    price: number;
    duration: number;
    plan_type?: string;
    tax_percent?: number;
    status?: string;
    parking_lot_id?: string | null;
  }): Promise<string> {
    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO parking_plans (id, name, price, duration, plan_type, tax_percent, status, parking_lot_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.name.trim(),
        params.price,
        params.duration,
        params.plan_type ?? 'Hourly',
        params.tax_percent ?? 0,
        params.status ?? 'Active',
        params.parking_lot_id ?? null,
      ]
    );
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
    }
  ): Promise<number> {
    const updates: string[] = [];
    const values: any[] = [];

    if (typeof params.name === 'string') {
      updates.push('name = ?');
      values.push(params.name.trim());
    }
    if (typeof params.price === 'number') {
      updates.push('price = ?');
      values.push(params.price);
    }
    if (typeof params.duration === 'number') {
      updates.push('duration = ?');
      values.push(params.duration);
    }
    if (typeof params.plan_type === 'string') {
      updates.push('plan_type = ?');
      values.push(params.plan_type.trim());
    }
    if (typeof params.tax_percent === 'number') {
      updates.push('tax_percent = ?');
      values.push(params.tax_percent);
    }
    if (typeof params.status === 'string') {
      updates.push('status = ?');
      values.push(params.status);
    }
    if (params.parking_lot_id !== undefined) {
      updates.push('parking_lot_id = ?');
      values.push(params.parking_lot_id);
    }

    if (updates.length === 0) return 0;

    values.push(id);
    const result = await execute(
      `UPDATE parking_plans
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = ?`,
      values
    );
    return result.affectedRows;
  }

  async remove(id: string): Promise<number> {
    const result = await execute(`DELETE FROM parking_plans WHERE id = ?`, [id]);
    return result.affectedRows;
  }
}
