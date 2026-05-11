import crypto from 'crypto';
import { execute, queryRows } from '../config/database';

export interface ParkingPlanRow {
  id: string;
  name: string;
  price: number;
  duration: number;
  created_at?: Date;
  updated_at?: Date;
}

export class ParkingPlanRepository {
  async list(): Promise<ParkingPlanRow[]> {
    return queryRows<ParkingPlanRow>(
      `SELECT id, name, price, duration, created_at, updated_at
       FROM parking_plans
       ORDER BY created_at DESC`
    );
  }

  async findById(id: string): Promise<ParkingPlanRow | null> {
    const rows = await queryRows<ParkingPlanRow>(
      `SELECT id, name, price, duration, created_at, updated_at
       FROM parking_plans
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async create(params: { name: string; price: number; duration: number }): Promise<string> {
    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO parking_plans (id, name, price, duration)
       VALUES (?, ?, ?, ?)`,
      [id, params.name.trim(), params.price, params.duration]
    );
    return id;
  }

  async update(
    id: string,
    params: { name?: string; price?: number; duration?: number }
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
