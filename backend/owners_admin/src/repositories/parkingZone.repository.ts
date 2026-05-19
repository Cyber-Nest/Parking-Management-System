import { execute, queryRows } from '../config/database';
import { ParkingZoneRow } from '../types';

export interface ParkingZoneListFilters {
  page?: number;
  limit?: number;
  q?: string;
}

export class ParkingZoneRepository {
  async list(filters: ParkingZoneListFilters = {}): Promise<{ items: ParkingZoneRow[]; total: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 100;
    const offset = (page - 1) * limit;
    const values: unknown[] = [];
    let where = '';

    if (filters.q?.trim()) {
      where = 'WHERE parking_name LIKE ? OR id LIKE ? OR address LIKE ?';
      const term = `%${filters.q.trim()}%`;
      values.push(term, term, term);
    }

    const items = await queryRows<ParkingZoneRow & { status?: string }>(
      `SELECT id, parking_name, address, image_url, hourly_rate, available_spots, total_spots, spot_id, status
       FROM parking_zones
       ${where}
       ORDER BY parking_name ASC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );

    const countRows = await queryRows<{ total: number }>(
      `SELECT COUNT(*) AS total FROM parking_zones ${where}`,
      values,
    );

    return { items, total: Number(countRows[0]?.total ?? 0) };
  }

  async findById(id: string): Promise<(ParkingZoneRow & { status?: string }) | null> {
    const rows = await queryRows<ParkingZoneRow & { status?: string }>(
      `SELECT id, parking_name, address, image_url, hourly_rate, available_spots, total_spots, spot_id, status
       FROM parking_zones WHERE id = ? LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(params: {
    id?: string;
    parking_name: string;
    address: string;
    image_url: string;
    hourly_rate: number;
    available_spots: number;
    total_spots: number;
    spot_id: string;
    status?: 'active' | 'inactive';
  }): Promise<string> {
    const id = params.id ?? `ZONE-${Date.now()}`;
    await execute(
      `INSERT INTO parking_zones (
        id, parking_name, address, image_url, hourly_rate,
        available_spots, total_spots, spot_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.parking_name.trim(),
        params.address.trim(),
        params.image_url,
        params.hourly_rate,
        params.available_spots,
        params.total_spots,
        params.spot_id,
        params.status ?? 'active',
      ],
    );
    return id;
  }

  async update(
    id: string,
    params: Partial<{
      parking_name: string;
      address: string;
      image_url: string;
      hourly_rate: number;
      available_spots: number;
      total_spots: number;
      spot_id: string;
      status: 'active' | 'inactive';
    }>,
  ): Promise<number> {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (params.parking_name !== undefined) {
      updates.push('parking_name = ?');
      values.push(params.parking_name.trim());
    }
    if (params.address !== undefined) {
      updates.push('address = ?');
      values.push(params.address.trim());
    }
    if (params.image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(params.image_url);
    }
    if (params.hourly_rate !== undefined) {
      updates.push('hourly_rate = ?');
      values.push(params.hourly_rate);
    }
    if (params.available_spots !== undefined) {
      updates.push('available_spots = ?');
      values.push(params.available_spots);
    }
    if (params.total_spots !== undefined) {
      updates.push('total_spots = ?');
      values.push(params.total_spots);
    }
    if (params.spot_id !== undefined) {
      updates.push('spot_id = ?');
      values.push(params.spot_id);
    }
    if (params.status !== undefined) {
      updates.push('status = ?');
      values.push(params.status);
    }

    if (updates.length === 0) return 0;

    values.push(id);
    const result = await execute(
      `UPDATE parking_zones SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values,
    );
    return result.affectedRows;
  }

  async remove(id: string): Promise<number> {
    const result = await execute('DELETE FROM parking_zones WHERE id = ?', [id]);
    return result.affectedRows;
  }

  async decrementAvailableSpots(id: string): Promise<void> {
    await execute(
      `UPDATE parking_zones
       SET available_spots = GREATEST(available_spots - 1, 0)
       WHERE id = ? AND available_spots > 0`,
      [id],
    );
  }

  async findCustomerSubZones(excludeId: string, limit = 6): Promise<ParkingZoneRow[]> {
    return queryRows<ParkingZoneRow>(
      `SELECT id, parking_name, address, image_url, hourly_rate, available_spots, total_spots, spot_id
       FROM parking_zones
       WHERE id != ? AND available_spots > 0 AND status = 'active'
       ORDER BY parking_name ASC
       LIMIT ?`,
      [excludeId, limit],
    );
  }
}

export const parkingZoneRepository = new ParkingZoneRepository();
