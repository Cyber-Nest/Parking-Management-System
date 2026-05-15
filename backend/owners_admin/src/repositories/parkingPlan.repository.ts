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
  created_at?: Date;
  updated_at?: Date;
}

export class ParkingPlanRepository {
  async list(): Promise<ParkingPlanRow[]> {
    return queryRows<ParkingPlanRow>(
      `SELECT id, name, price, duration, plan_type, tax_percent, status, created_at, updated_at
       FROM parking_plans
       ORDER BY created_at DESC`
    );
  }

  async findById(id: string): Promise<ParkingPlanRow | null> {
    const rows = await queryRows<ParkingPlanRow>(
      `SELECT id, name, price, duration, plan_type, tax_percent, status, created_at, updated_at
       FROM parking_plans
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async create(params: {
    name: string;
    price: number;
    duration: number;
    plan_type?: string;
    tax_percent?: number;
    status?: string;
  }): Promise<string> {
    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO parking_plans (id, name, price, duration, plan_type, tax_percent, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.name.trim(),
        params.price,
        params.duration,
        params.plan_type ?? 'Hourly',
        params.tax_percent ?? 0,
        params.status ?? 'Active',
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
