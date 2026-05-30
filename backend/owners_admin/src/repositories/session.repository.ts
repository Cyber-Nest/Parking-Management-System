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
  created_by_officer: string | null;
  created_at: Date;
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
      values.push(filters.to);
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
        id, user_id, vehicle_id, license_plate, plan_id, plan_name,
        start_time, end_time, duration_minutes, status, notes,
        COALESCE((SELECT SUM(amount) FROM payments p WHERE p.session_id = parking_sessions.id AND p.status = 'success'), 0) AS amount,
        created_by_officer, created_at
       FROM parking_sessions
       ${clause}
       ORDER BY start_time DESC
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

  async summary(): Promise<{
    totalToday: number;
    activeCount: number;
    expiredCount: number;
    extendedCount: number;
    cancelledCount: number;
  }> {
    const [todayRows, activeRows, expiredRows, extendedRows, cancelledRows] = await Promise.all([
      queryRows<CountRow>(`SELECT COUNT(*) AS total FROM parking_sessions WHERE DATE(start_time) = CURDATE()`),
      queryRows<CountRow>(`SELECT COUNT(*) AS total FROM parking_sessions WHERE status = 'active'`),
      queryRows<CountRow>(`SELECT COUNT(*) AS total FROM parking_sessions WHERE status = 'expired'`),
      queryRows<CountRow>(`SELECT COUNT(*) AS total FROM parking_sessions WHERE status = 'extended'`),
      queryRows<CountRow>(`SELECT COUNT(*) AS total FROM parking_sessions WHERE status = 'cancelled'`),
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
    userId?: string;
    vehicleId?: string;
    createdByOfficer?: string;
  }): Promise<string> {
    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO parking_sessions
      (id, user_id, vehicle_id, license_plate, plan_id, plan_name, start_time, end_time, duration_minutes, status, notes, created_by_officer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.userId ?? null,
        params.vehicleId ?? null,
        params.licensePlate.trim().toUpperCase(),
        params.planId ?? null,
        params.planName ?? null,
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
}

