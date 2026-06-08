import crypto from 'crypto';
import { execute, queryRows } from '../config/database';
import { SessionStatus } from '../types';

export interface SessionListFilters {
  page: number;
  limit: number;
  q?: string; // license plate search
  status?: SessionStatus;
  from?: string; // start_time >= from
  to?: string;   // end_time <= to
  parkingLotId?: string;
}

export interface SessionRow {
  id: string;
  user_id: string | null;
  vehicle_id: string | null;
  license_plate: string;
  plan_id: string | null;
  plan_name: string | null;
  start_time: Date;
  end_time: Date;
  duration_minutes: number;
  status: SessionStatus;
  notes: string | null;
  amount: number;
  location_name?: string | null;
  created_by_officer: string | null;
  created_at: Date;
  parking_lot_id?: string | null;
  parking_lot_name?: string | null;
  subzone_id?: string | null;
  subzone_name?: string | null;
}

interface CountRow {
  total: number;
}

export class SessionRepository {
  private buildWhere(filters: SessionListFilters): { clause: string; values: any[] } {
    const conditions: string[] = [];
    const values: any[] = [];

    if (filters.q) {
      conditions.push('license_plate LIKE ?');
      values.push(`%${filters.q}%`);
    }
    if (filters.status) {
      conditions.push('status = ?');
      values.push(filters.status);
    }
    if (filters.from) {
      conditions.push('start_time >= ?');
      values.push(filters.from);
    }
    if (filters.to) {
      conditions.push('end_time <= ?');
      values.push(`${filters.to} 23:59:59`);
    }
    if (filters.parkingLotId) {
      conditions.push(`(
        location_name IN (SELECT parking_name FROM parking_zones WHERE parking_lot_id = ?)
        OR plan_id IN (SELECT id FROM parking_plans WHERE parking_lot_id = ?)
      )`);
      values.push(filters.parkingLotId, filters.parkingLotId);
    }

    return {
      clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      values,
    };
  }

  async list(filters: SessionListFilters): Promise<{ items: SessionRow[]; total: number }> {
    const { clause, values } = this.buildWhere(filters);
    const offset = (filters.page - 1) * filters.limit;

    const items = await queryRows<SessionRow>(
      `SELECT
        ps.id, ps.user_id, ps.vehicle_id, ps.license_plate, ps.plan_id, ps.plan_name, ps.location_name,
        ps.start_time, ps.end_time, ps.duration_minutes, ps.status, ps.notes,
        COALESCE((SELECT SUM(amount) FROM payments p WHERE p.session_id = ps.id AND p.status = 'success'), 0) AS amount,
        ps.created_by_officer, ps.created_at,
        COALESCE(z.parking_lot_id, z_id.parking_lot_id, pp.parking_lot_id, o.parking_lot_id, pl_direct.id, (SELECT id FROM parking_lots ORDER BY created_at ASC LIMIT 1)) AS parking_lot_id,
        COALESCE(pl.lot_name, pl_by_officer.lot_name, pl_direct.lot_name, (SELECT lot_name FROM parking_lots ORDER BY created_at ASC LIMIT 1)) AS parking_lot_name,
        COALESCE(z.id, z_id.id) AS subzone_id,
        COALESCE(z.parking_name, z_id.parking_name) AS subzone_name
       FROM parking_sessions ps
       LEFT JOIN parking_zones z ON z.parking_name = ps.location_name
       LEFT JOIN parking_zones z_id ON z_id.id = ps.location_name
       LEFT JOIN parking_plans pp ON pp.id = ps.plan_id
       LEFT JOIN officers o ON o.id = ps.created_by_officer
       LEFT JOIN parking_lots pl_by_officer ON pl_by_officer.id = o.parking_lot_id
       LEFT JOIN parking_lots pl_direct ON (pl_direct.lot_name = ps.location_name OR pl_direct.id = ps.location_name)
       LEFT JOIN parking_lots pl ON pl.id = COALESCE(z.parking_lot_id, z_id.parking_lot_id, pp.parking_lot_id)
       ${clause}
       ORDER BY ps.start_time DESC
       LIMIT ? OFFSET ?`,
      [...values, filters.limit, offset]
    );

    const countRows = await queryRows<CountRow>(
      `SELECT COUNT(*) AS total
       FROM parking_sessions
       ${clause}`,
      values
    );

    return { items, total: countRows[0]?.total ?? 0 };
  }

  async summary(filters: { parkingLotId?: string } = {}): Promise<{
    totalToday: number;
    activeCount: number;
    expiredCount: number;
    extendedCount: number;
    cancelledCount: number;
  }> {
    const lotClause = filters.parkingLotId
      ? ` AND (
          location_name IN (SELECT parking_name FROM parking_zones WHERE parking_lot_id = ?)
          OR plan_id IN (SELECT id FROM parking_plans WHERE parking_lot_id = ?)
        )`
      : '';
    const lotValues = filters.parkingLotId ? [filters.parkingLotId, filters.parkingLotId] : [];
    const [todayRows, activeRows, expiredRows, extendedRows, cancelledRows] = await Promise.all([
      queryRows<CountRow>(`SELECT COUNT(*) AS total FROM parking_sessions WHERE DATE(start_time) = CURDATE()${lotClause}`, lotValues),
      queryRows<CountRow>(`SELECT COUNT(*) AS total FROM parking_sessions WHERE status = 'active'${lotClause}`, lotValues),
      queryRows<CountRow>(`SELECT COUNT(*) AS total FROM parking_sessions WHERE status = 'expired'${lotClause}`, lotValues),
      queryRows<CountRow>(`SELECT COUNT(*) AS total FROM parking_sessions WHERE status = 'extended'${lotClause}`, lotValues),
      queryRows<CountRow>(`SELECT COUNT(*) AS total FROM parking_sessions WHERE status = 'cancelled'${lotClause}`, lotValues),
    ]);

    return {
      totalToday: todayRows[0]?.total ?? 0,
      activeCount: activeRows[0]?.total ?? 0,
      expiredCount: expiredRows[0]?.total ?? 0,
      extendedCount: extendedRows[0]?.total ?? 0,
      cancelledCount: cancelledRows[0]?.total ?? 0,
    };
  }

  async create(params: {
    licensePlate: string;
    planId?: string;
    planName?: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    status?: SessionStatus;
    notes?: string;
    locationName?: string;
    userId?: string;
    vehicleId?: string;
    createdByOfficer?: string;
  }): Promise<string> {
    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO parking_sessions
      (id, user_id, vehicle_id, license_plate, plan_id, plan_name, location_name, start_time, end_time, duration_minutes, status, notes, created_by_officer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.userId ?? null,
        params.vehicleId ?? null,
        params.licensePlate.trim().toUpperCase(),
        params.planId ?? null,
        params.planName ?? null,
        params.locationName ?? null,
        params.startTime,
        params.endTime,
        params.durationMinutes,
        params.status ?? 'active',
        params.notes ?? null,
        params.createdByOfficer ?? null,
      ]
    );
    return id;
  }

  async cancel(id: string, reason?: string): Promise<SessionRow | null> {
    const note = reason?.trim() || 'Cancelled manually by admin.';
    await execute(
      `UPDATE parking_sessions
       SET status = 'cancelled',
           end_time = LEAST(end_time, NOW()),
           notes = CASE
             WHEN notes IS NULL OR notes = '' THEN ?
             ELSE CONCAT(notes, '\n', ?)
           END,
           updated_at = NOW()
       WHERE id = ?`,
      [note, note, id],
    );

    const rows = await queryRows<SessionRow>(
      `SELECT id, user_id, vehicle_id, license_plate, plan_id, plan_name, location_name,
              start_time, end_time, duration_minutes, status, notes, created_by_officer, created_at
       FROM parking_sessions
       WHERE id = ?
       LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }
}

