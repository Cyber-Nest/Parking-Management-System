import crypto from 'crypto';
import { execute, queryRows } from '../config/database';
import { OfficerRole } from '../types';

export type UiOfficerStatus = 'ACTIVE' | 'DISABLED';

export interface OfficerListFilters {
  page: number;
  limit: number;
  q?: string;
  status?: UiOfficerStatus;
  role?: OfficerRole;
  parkingLotId?: string;
}

export interface OfficerRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  badge_number: string | null;
  role: OfficerRole;
  status: 'active' | 'inactive' | 'suspended';
  last_login_at: Date | null;
  created_at: Date;
  tickets_issued?: number;
  parking_lot_id?: string | null;
}

interface CountRow {
  total: number;
}

export class OfficerRepository {
  private buildWhere(filters: OfficerListFilters): { clause: string; values: any[] } {
    const conditions: string[] = [];
    const values: any[] = [];

    if (filters.q) {
      conditions.push('(full_name LIKE ? OR email LIKE ? OR badge_number LIKE ?)');
      values.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`);
    }

    if (filters.role) {
      conditions.push('role = ?');
      values.push(filters.role);
    }

    if (filters.status) {
      if (filters.status === 'ACTIVE') {
        conditions.push(`status = 'active'`);
      } else {
        conditions.push(`status <> 'active'`);
      }
    }
    if (filters.parkingLotId) {
      conditions.push(`(
        o.parking_lot_id = ?
        OR o.id IN (
          SELECT DISTINCT officer_id FROM penalty_tickets
          WHERE location_name IN (SELECT parking_name FROM parking_zones WHERE parking_lot_id = ?)
             OR session_id IN (
              SELECT id FROM parking_sessions
              WHERE location_name IN (SELECT parking_name FROM parking_zones WHERE parking_lot_id = ?)
                 OR plan_id IN (SELECT id FROM parking_plans WHERE parking_lot_id = ?)
            )
        )
      )`);
      values.push(filters.parkingLotId, filters.parkingLotId, filters.parkingLotId, filters.parkingLotId);
    }

    return {
      clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      values,
    };
  }

  async list(filters: OfficerListFilters): Promise<{ items: OfficerRow[]; total: number }> {
    const { clause, values } = this.buildWhere(filters);
    const offset = (filters.page - 1) * filters.limit;

    const items = await queryRows<OfficerRow>(
      `SELECT
          o.id, o.full_name, o.email, o.phone, o.badge_number, o.role, o.status, o.last_login_at, o.created_at, o.parking_lot_id,
          COALESCE(t.tickets_issued, 0) AS tickets_issued
       FROM officers o
       LEFT JOIN (
         SELECT officer_id, COUNT(*) AS tickets_issued
         FROM penalty_tickets
         GROUP BY officer_id
       ) t ON t.officer_id = o.id
       ${clause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, filters.limit, offset]
    );

    const countRows = await queryRows<CountRow>(
      `SELECT COUNT(*) AS total
       FROM officers
       ${clause}`,
      values
    );

    return { items, total: countRows[0]?.total ?? 0 };
  }

  async findById(id: string): Promise<OfficerRow | null> {
    const rows = await queryRows<OfficerRow>(
      `SELECT
          o.id, o.full_name, o.email, o.phone, o.badge_number, o.role, o.status, o.last_login_at, o.created_at, o.parking_lot_id,
          COALESCE(t.tickets_issued, 0) AS tickets_issued
       FROM officers o
       LEFT JOIN (
         SELECT officer_id, COUNT(*) AS tickets_issued
         FROM penalty_tickets
         GROUP BY officer_id
       ) t ON t.officer_id = o.id
       WHERE o.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<{ id: string; full_name: string; email: string; password_hash: string; status?: string } | null> {
    const rows = await queryRows<any>(
      `SELECT id, full_name, email, password_hash, status FROM officers WHERE email = ? LIMIT 1`,
      [email.toLowerCase().trim()]
    );

    console.log('findByEmail result:', rows[0]); // Debug log
    return rows[0] ?? null;
  }

  async saveResetToken(id: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await execute(
      `UPDATE officers SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?`,
      [tokenHash, expiresAt, id]
    );
  }

  async findByResetToken(tokenHash: string, officerId: string): Promise<{ id: string } | null> {
    const rows = await queryRows<any>(
      `SELECT id FROM officers WHERE id = ? AND reset_token = ? AND reset_token_expires_at > NOW() LIMIT 1`,
      [officerId, tokenHash]
    );
    return rows[0] ?? null;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await execute(`UPDATE officers SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?`, [passwordHash, id]);
  }

  async updateLastLogin(id: string): Promise<void> {
    await execute(`UPDATE officers SET last_login_at = NOW() WHERE id = ?`, [id]);
  }

  async summary(filters: { parkingLotId?: string } = {}): Promise<{
    totalOfficers: number;
    activeOfficers: number;
    disabledOfficers: number;
    ticketsIssuedToday: number;
  }> {
    const lotOfficerClause = filters.parkingLotId
      ? ` WHERE id IN (
          SELECT DISTINCT officer_id FROM penalty_tickets
          WHERE location_name IN (SELECT parking_name FROM parking_zones WHERE parking_lot_id = ?)
             OR session_id IN (
              SELECT id FROM parking_sessions
              WHERE location_name IN (SELECT parking_name FROM parking_zones WHERE parking_lot_id = ?)
                 OR plan_id IN (SELECT id FROM parking_plans WHERE parking_lot_id = ?)
            )
        )`
      : '';
    const lotTicketClause = filters.parkingLotId
      ? ` AND (
          location_name IN (SELECT parking_name FROM parking_zones WHERE parking_lot_id = ?)
          OR session_id IN (
            SELECT id FROM parking_sessions
            WHERE location_name IN (SELECT parking_name FROM parking_zones WHERE parking_lot_id = ?)
               OR plan_id IN (SELECT id FROM parking_plans WHERE parking_lot_id = ?)
          )
        )`
      : '';
    const lotValues = filters.parkingLotId ? [filters.parkingLotId, filters.parkingLotId, filters.parkingLotId] : [];
    const [totalRows, activeRows, disabledRows, ticketsTodayRows] = await Promise.all([
      queryRows<CountRow>(`SELECT COUNT(*) AS total FROM officers${lotOfficerClause}`, lotValues),
      queryRows<CountRow>(`SELECT COUNT(*) AS total FROM officers${lotOfficerClause ? `${lotOfficerClause} AND status = 'active'` : ` WHERE status = 'active'`}`, lotValues),
      queryRows<CountRow>(`SELECT COUNT(*) AS total FROM officers${lotOfficerClause ? `${lotOfficerClause} AND status <> 'active'` : ` WHERE status <> 'active'`}`, lotValues),
      queryRows<CountRow>(`SELECT COUNT(*) AS total FROM penalty_tickets WHERE DATE(date_issued) = CURDATE()${lotTicketClause}`, lotValues),
    ]);

    return {
      totalOfficers: totalRows[0]?.total ?? 0,
      activeOfficers: activeRows[0]?.total ?? 0,
      disabledOfficers: disabledRows[0]?.total ?? 0,
      ticketsIssuedToday: ticketsTodayRows[0]?.total ?? 0,
    };
  }

  async create(params: {
    createdByAdminId: string;
    fullName: string;
    email: string;
    phone?: string;
    badgeNumber?: string;
    role: OfficerRole;
    passwordHash: string;
    parkingLotId?: string;
  }): Promise<string> {
    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO officers
      (id, created_by_admin_id, full_name, email, phone, password_hash, badge_number, role, status, parking_lot_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [
        id,
        params.createdByAdminId,
        params.fullName.trim(),
        params.email.toLowerCase().trim(),
        params.phone ?? null,
        params.passwordHash,
        params.badgeNumber ?? null,
        params.role,
        params.parkingLotId ?? null,
      ]
    );
    return id;
  }

  async update(
    id: string,
    params: { fullName?: string; phone?: string; role?: OfficerRole; badgeNumber?: string; parkingLotId?: string }
  ): Promise<number> {
    const updates: string[] = [];
    const values: any[] = [];

    if (typeof params.fullName === 'string') {
      updates.push('full_name = ?');
      values.push(params.fullName.trim());
    }
    if (typeof params.phone === 'string') {
      updates.push('phone = ?');
      values.push(params.phone.trim());
    }
    if (typeof params.badgeNumber === 'string') {
      updates.push('badge_number = ?');
      values.push(params.badgeNumber.trim());
    }
    if (params.role) {
      updates.push('role = ?');
      values.push(params.role);
    }
    if (params.parkingLotId !== undefined) {
      updates.push('parking_lot_id = ?');
      values.push(params.parkingLotId ?? null);
    }

    if (updates.length === 0) return 0;
    values.push(id);

    const result = await execute(
      `UPDATE officers SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    return result.affectedRows;
  }

  async setUiStatus(id: string, status: UiOfficerStatus): Promise<number> {
    const next = status === 'ACTIVE' ? 'active' : 'inactive';
    const result = await execute(`UPDATE officers SET status = ?, updated_at = NOW() WHERE id = ?`, [next, id]);
    return result.affectedRows;
  }

  async remove(id: string): Promise<number> {
    const result = await execute(`DELETE FROM officers WHERE id = ?`, [id]);
    return result.affectedRows;
  }
}
