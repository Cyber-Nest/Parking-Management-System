import crypto from 'crypto';
import { execute, queryRows } from '../config/database';
import { TicketStatus } from '../types';

export interface TicketListFilters {
  page: number;
  limit: number;
  q?: string;
  status?: TicketStatus;
  officerId?: string;
  from?: string;
  to?: string;
}

export interface TicketRow {
  id: string;
  ticket_number: string;
  officer_id: string;
  officer_name: string;
  license_plate: string;
  amount: number;
  reason: string;
  status: TicketStatus;
  date_issued: Date;
  due_date: Date | null;
  paid_at: Date | null;
  remarks: string | null;
  note: string | null;
  dispute_raised: number;
  created_at: Date;
  session_id?: string | null;
  location_name?: string | null;
}

interface CountRow {
  total: number;
}

interface AmountRow {
  total_amount: number | null;
}

export class TicketRepository {
  private buildWhere(filters: TicketListFilters): { clause: string; values: any[] } {
    const conditions: string[] = [];
    const values: any[] = [];

    if (filters.q) {
      conditions.push('(ticket_number LIKE ? OR license_plate LIKE ?)');
      values.push(`%${filters.q}%`, `%${filters.q}%`);
    }
    if (filters.status) {
      conditions.push('status = ?');
      values.push(filters.status);
    }
    if (filters.officerId) {
      conditions.push('officer_id = ?');
      values.push(filters.officerId);
    }
    if (filters.from) {
      conditions.push('date_issued >= ?');
      values.push(filters.from);
    }
    if (filters.to) {
      conditions.push('date_issued <= ?');
      values.push(filters.to);
    }

    return {
      clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      values,
    };
  }

  async list(filters: TicketListFilters): Promise<{ items: TicketRow[]; total: number }> {
    const { clause, values } = this.buildWhere(filters);
    const offset = (filters.page - 1) * filters.limit;

    const items = await queryRows<TicketRow>(
      `SELECT id, ticket_number, officer_id, officer_name, license_plate, location_name, amount, reason, status,
              date_issued, due_date, paid_at, remarks, note, dispute_raised, created_at, session_id
       FROM penalty_tickets
       ${clause}
       ORDER BY date_issued DESC
       LIMIT ? OFFSET ?`,
      [...values, filters.limit, offset]
    );

    const countRows = await queryRows<CountRow>(
      `SELECT COUNT(*) AS total
       FROM penalty_tickets
       ${clause}`,
      values
    );

    return { items, total: countRows[0]?.total ?? 0 };
  }

  async summary(): Promise<{
    totalToday: number;
    totalTickets: number;
    unpaidCount: number;
    paidCount: number;
    disputedCount: number;
    totalPenaltyAmount: number;
  }> {
    const totalTodayRows = await queryRows<CountRow>(
      `SELECT COUNT(*) AS total
       FROM penalty_tickets
       WHERE DATE(date_issued) = CURDATE()`
    );
    const totalTicketsRows = await queryRows<CountRow>(
      `SELECT COUNT(*) AS total
       FROM penalty_tickets`
    );
    const unpaidRows = await queryRows<CountRow>(
      `SELECT COUNT(*) AS total
       FROM penalty_tickets
       WHERE status = 'unpaid'`
    );
    const paidRows = await queryRows<CountRow>(
      `SELECT COUNT(*) AS total
       FROM penalty_tickets
       WHERE status = 'paid'`
    );
    const disputedRows = await queryRows<CountRow>(
      `SELECT COUNT(*) AS total
       FROM penalty_tickets
       WHERE status = 'disputed'`
    );
    const amountRows = await queryRows<AmountRow>(
      `SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM penalty_tickets`
    );

    return {
      totalToday: totalTodayRows[0]?.total ?? 0,
      // UI commonly expects `totalTickets`/`unpaidTickets`/etc.
      totalTickets: totalTicketsRows[0]?.total ?? 0,
      unpaidCount: unpaidRows[0]?.total ?? 0,
      paidCount: paidRows[0]?.total ?? 0,
      disputedCount: disputedRows[0]?.total ?? 0,
      totalPenaltyAmount: Number(amountRows[0]?.total_amount ?? 0),
    };
  }

  async create(params: {
    officerId: string;
    officerName: string;
    licensePlate: string;
    amount: number;
    reason: string;
    status?: TicketStatus;
    dueDate?: string;
    sessionId?: string;
    remarks?: string;
  }): Promise<string> {
    const id = crypto.randomUUID();
    const ticketNumber = `TKT-${Date.now()}`;

    await execute(
      `INSERT INTO penalty_tickets
      (id, ticket_number, officer_id, officer_name, session_id, license_plate, amount, reason, status, date_issued, due_date, remarks, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [
        id,
        ticketNumber,
        params.officerId,
        params.officerName,
        params.sessionId ?? null,
        params.licensePlate.trim().toUpperCase(),
        params.amount,
        params.reason.trim(),
        params.status ?? 'unpaid',
        params.dueDate ?? null,
        params.remarks ?? null,
        null, // note
      ]
    );

    return id;
  }

  async findById(id: string): Promise<TicketRow | null> {
    const rows = await queryRows<TicketRow>(
      `SELECT id, ticket_number, officer_id, officer_name, license_plate, location_name, amount, reason, status,
              date_issued, due_date, paid_at, remarks, note, dispute_raised, created_at, session_id
       FROM penalty_tickets WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async updateTicket(
    id: string,
    params: {
      licensePlate?: string;
      amount?: number;
      reason?: string;
      dueDate?: string | null;
      locationName?: string | null;
    }
  ): Promise<number> {
    const updates: string[] = [];
    const values: any[] = [];
    if (params.licensePlate !== undefined) {
      updates.push('license_plate = ?');
      values.push(params.licensePlate.trim().toUpperCase());
    }
    if (params.amount !== undefined) {
      updates.push('amount = ?');
      values.push(params.amount);
    }
    if (params.reason !== undefined) {
      updates.push('reason = ?');
      values.push(params.reason.trim());
    }
    if (params.dueDate !== undefined) {
      updates.push('due_date = ?');
      values.push(params.dueDate);
    }
    if (params.locationName !== undefined) {
      updates.push('location_name = ?');
      values.push(params.locationName);
    }
    if (updates.length === 0) return 0;
    values.push(id);
    const result = await execute(
      `UPDATE penalty_tickets SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    return result.affectedRows;
  }

  async appendRemarks(id: string, note: string): Promise<number> {
    const row = await this.findById(id);
    if (!row) return 0;
    const stamp = new Date().toISOString();
    const trimmed = note.trim();
    const next = row.remarks ? `${row.remarks}\n[${stamp}] ${trimmed}` : `[${stamp}] ${trimmed}`;
    // `remarks` = full audit log; `note` = latest admin note (handy for DB browsing / exports)
    const result = await execute(
      `UPDATE penalty_tickets SET remarks = ?, note = ?, updated_at = NOW() WHERE id = ?`,
      [next, trimmed, id]
    );
    return result.affectedRows;
  }

  async setStatus(id: string, status: TicketStatus, extras?: { paidAt?: Date | null; paymentId?: string | null }): Promise<number> {
    const paidAt = extras?.paidAt;
    const paymentId = extras?.paymentId;
    if (status === 'paid') {
      const result = await execute(
        `UPDATE penalty_tickets SET status = ?, paid_at = COALESCE(?, NOW()), payment_id = ?, updated_at = NOW() WHERE id = ?`,
        [status, paidAt ?? null, paymentId ?? null, id]
      );
      return result.affectedRows;
    }
    if (status === 'cancelled') {
      const result = await execute(
        `UPDATE penalty_tickets SET status = ?, updated_at = NOW() WHERE id = ?`,
        [status, id]
      );
      return result.affectedRows;
    }
    const result = await execute(`UPDATE penalty_tickets SET status = ?, updated_at = NOW() WHERE id = ?`, [status, id]);
    return result.affectedRows;
  }
}
