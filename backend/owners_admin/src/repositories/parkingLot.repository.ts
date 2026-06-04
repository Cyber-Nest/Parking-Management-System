import { execute, queryRows } from '../config/database';
import { ParkingLotRow } from '../types';

export interface ParkingLotListFilters {
  page?: number;
  limit?: number;
  q?: string;
}

export class ParkingLotRepository {
  async list(filters: ParkingLotListFilters = {}): Promise<{ items: ParkingLotRow[]; total: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 100;
    const offset = (page - 1) * limit;
    const values: unknown[] = [];
    let where = '';

    if (filters.q?.trim()) {
      where = 'WHERE lot_name LIKE ? OR id LIKE ? OR address LIKE ?';
      const term = `%${filters.q.trim()}%`;
      values.push(term, term, term);
    }

    const items = await queryRows<ParkingLotRow>(
      `SELECT id, owner_id, lot_name, address, image_url, qr_code_url
       FROM parking_lots
       ${where}
       ORDER BY lot_name ASC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );

    const countRows = await queryRows<{ total: number }>(
      `SELECT COUNT(*) AS total FROM parking_lots ${where}`,
      values,
    );

    return { items, total: Number(countRows[0]?.total ?? 0) };
  }

  async findById(id: string): Promise<ParkingLotRow | null> {
    const rows = await queryRows<ParkingLotRow>(
      `SELECT id, owner_id, lot_name, address, image_url, qr_code_url FROM parking_lots WHERE id = ? LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
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
    await execute(
      `INSERT INTO parking_lots (id, owner_id, lot_name, address, image_url, qr_code_url) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, params.owner_id ?? null, params.lot_name.trim(), params.address ?? '', params.image_url ?? null, params.qr_code_url ?? null],
    );
    return id;
  }

  async update(id: string, params: Partial<{ owner_id: string | null; lot_name: string; address: string; image_url: string | null; qr_code_url: string | null }>): Promise<number> {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (params.owner_id !== undefined) {
      updates.push('owner_id = ?');
      values.push(params.owner_id);
    }
    if (params.lot_name !== undefined) {
      updates.push('lot_name = ?');
      values.push(params.lot_name.trim());
    }
    if (params.address !== undefined) {
      updates.push('address = ?');
      values.push(params.address.trim());
    }
    if (params.image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(params.image_url);
    }
    if (params.qr_code_url !== undefined) {
      updates.push('qr_code_url = ?');
      values.push(params.qr_code_url);
    }

    if (updates.length === 0) return 0;

    values.push(id);
    const result = await execute(`UPDATE parking_lots SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
    return result.affectedRows;
  }

  async remove(id: string): Promise<number> {
    const result = await execute('DELETE FROM parking_lots WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

export const parkingLotRepository = new ParkingLotRepository();
