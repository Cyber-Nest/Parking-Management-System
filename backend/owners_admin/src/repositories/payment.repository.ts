import crypto from 'crypto';
import { execute, queryRows } from '../config/database';
import { PaymentMethod, PaymentStatus, PaymentType } from '../types';

export interface PaymentListFilters {
  page: number;
  limit: number;
  q?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentType?: PaymentType;
  from?: string;
  to?: string;
  parkingLotId?: string;
}

export interface PaymentRow {
  id: string;
  session_id: string | null;
  ticket_id: string | null;
  user_id: string | null;
  license_plate: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  status: PaymentStatus;
  transaction_ref: string | null;
  paid_at: Date | null;
  receipt_number: string | null;
  receipt_date: Date | null;
  created_at: Date;
  parking_lot_id?: string | null;
  parking_lot_name?: string | null;
}

interface CountRow {
  total: number;
}

interface AmountRow {
  total_amount: number | null;
}

export class PaymentRepository {
  private buildWhere(filters: PaymentListFilters, paymentAlias = ''): { clause: string; values: any[] } {
    const conditions: string[] = [];
    const values: any[] = [];
    const col = (name: string) => `${paymentAlias}${name}`;

    if (filters.q) {
      conditions.push(`(${col('license_plate')} LIKE ? OR ${col('id')} LIKE ?)`);
      values.push(`%${filters.q}%`, `%${filters.q}%`);
    }
    if (filters.status) {
      conditions.push(`${col('status')} = ?`);
      values.push(filters.status);
    }
    if (filters.paymentMethod) {
      conditions.push(`${col('payment_method')} = ?`);
      values.push(filters.paymentMethod);
    }
    if (filters.paymentType) {
      conditions.push(`${col('payment_type')} = ?`);
      values.push(filters.paymentType);
    }
    if (filters.from) {
      conditions.push(`${col('created_at')} >= ?`);
      values.push(filters.from);
    }
    if (filters.to) {
      conditions.push(`${col('created_at')} <= ?`);
      values.push(`${filters.to} 23:59:59`);
    }
    if (filters.parkingLotId) {
      conditions.push(`(
        ${col('session_id')} IN (
          SELECT id FROM parking_sessions
          WHERE location_name IN (SELECT parking_name FROM parking_zones WHERE parking_lot_id = ?)
             OR plan_id IN (SELECT id FROM parking_plans WHERE parking_lot_id = ?)
        )
        OR ${col('ticket_id')} IN (
          SELECT id FROM penalty_tickets
          WHERE location_name IN (SELECT parking_name FROM parking_zones WHERE parking_lot_id = ?)
        )
      )`);
      values.push(filters.parkingLotId, filters.parkingLotId, filters.parkingLotId);
    }

    return {
      clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      values,
    };
  }

  async list(filters: PaymentListFilters): Promise<{ items: PaymentRow[]; total: number }> {
    const { clause, values } = this.buildWhere(filters, 'p.');
    const { clause: countClause, values: countValues } = this.buildWhere(filters, '');
    const offset = (filters.page - 1) * filters.limit;

    const items = await queryRows<PaymentRow>(
      `SELECT p.id, p.session_id, p.ticket_id, p.user_id, p.license_plate, p.amount, p.payment_method, p.payment_type,
              p.status, p.transaction_ref, p.paid_at, p.receipt_number, p.receipt_date, p.created_at,
              MIN(COALESCE(sz.parking_lot_id, sz_id.parking_lot_id, pp.parking_lot_id, tz.parking_lot_id, tz_id.parking_lot_id, o_s.parking_lot_id, o_t.parking_lot_id, pl_direct_s.id, pl_direct_t.id, (SELECT id FROM parking_lots ORDER BY created_at ASC LIMIT 1))) AS parking_lot_id,
              MIN(COALESCE(pl.lot_name, pl_by_officer_s.lot_name, pl_by_officer_t.lot_name, pl_direct_s.lot_name, pl_direct_t.lot_name, (SELECT lot_name FROM parking_lots ORDER BY created_at ASC LIMIT 1))) AS parking_lot_name
       FROM payments p
       LEFT JOIN parking_sessions ps ON ps.id = p.session_id
       LEFT JOIN parking_zones sz ON sz.parking_name = ps.location_name
       LEFT JOIN parking_zones sz_id ON sz_id.id = ps.location_name
       LEFT JOIN parking_plans pp ON pp.id = ps.plan_id
       LEFT JOIN penalty_tickets pt ON pt.id = p.ticket_id
       LEFT JOIN parking_zones tz ON tz.parking_name = pt.location_name
       LEFT JOIN parking_zones tz_id ON tz_id.id = pt.location_name
       LEFT JOIN officers o_s ON o_s.id = ps.created_by_officer
       LEFT JOIN officers o_t ON o_t.id = pt.officer_id
       LEFT JOIN parking_lots pl_by_officer_s ON pl_by_officer_s.id = o_s.parking_lot_id
       LEFT JOIN parking_lots pl_by_officer_t ON pl_by_officer_t.id = o_t.parking_lot_id
       LEFT JOIN parking_lots pl_direct_s ON (pl_direct_s.lot_name = ps.location_name OR pl_direct_s.id = ps.location_name)
       LEFT JOIN parking_lots pl_direct_t ON (pl_direct_t.lot_name = pt.location_name OR pl_direct_t.id = pt.location_name)
       LEFT JOIN parking_lots pl ON pl.id = COALESCE(sz.parking_lot_id, sz_id.parking_lot_id, pp.parking_lot_id, tz.parking_lot_id, tz_id.parking_lot_id)
       ${clause}
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, filters.limit, offset]
    );

    const countRows = await queryRows<CountRow>(
      `SELECT COUNT(*) AS total
       FROM payments
       ${countClause}`,
      countValues
    );

    return { items, total: countRows[0]?.total ?? 0 };
  }

  async findById(id: string): Promise<PaymentRow | null> {
    const rows = await queryRows<PaymentRow>(
      `SELECT id, session_id, ticket_id, user_id, license_plate, amount, payment_method, payment_type,
              status, transaction_ref, paid_at, receipt_number, receipt_date, created_at
       FROM payments WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async summary(filters: { parkingLotId?: string } = {}): Promise<{
    todayPayments: number;
    todayAmount: number;
    todayRevenue: number;
    parkingRevenue: number;
    penaltyRevenue: number;
    pendingAmount: number;
    failedAmount: number;
  }> {
    const lotClause = filters.parkingLotId
      ? ` AND (
          session_id IN (
            SELECT id FROM parking_sessions
            WHERE location_name IN (SELECT parking_name FROM parking_zones WHERE parking_lot_id = ?)
               OR plan_id IN (SELECT id FROM parking_plans WHERE parking_lot_id = ?)
          )
          OR ticket_id IN (
            SELECT id FROM penalty_tickets
            WHERE location_name IN (SELECT parking_name FROM parking_zones WHERE parking_lot_id = ?)
          )
        )`
      : '';
    const lotValues = filters.parkingLotId ? [filters.parkingLotId, filters.parkingLotId, filters.parkingLotId] : [];
    const todayCountRows = await queryRows<CountRow>(
      `SELECT COUNT(*) AS total
       FROM payments
       WHERE DATE(created_at) = CURDATE()${lotClause}`,
      lotValues
    );
    const todayAmountRows = await queryRows<AmountRow>(
      `SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE DATE(created_at) = CURDATE()${lotClause}`,
      lotValues
    );
    const parkingRevenueRows = await queryRows<AmountRow>(
      `SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE payment_type = 'parking' AND status = 'success'${lotClause}`,
      lotValues
    );
    const penaltyRevenueRows = await queryRows<AmountRow>(
      `SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE payment_type = 'penalty' AND status = 'success'${lotClause}`,
      lotValues
    );
    const pendingRows = await queryRows<AmountRow>(
      `SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE status = 'pending'${lotClause}`,
      lotValues
    );

    const failedRows = await queryRows<AmountRow>(
      `SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE status = 'failed'${lotClause}`,
      lotValues
    );

    const todayAmount = Number(todayAmountRows[0]?.total_amount ?? 0);
    return {
      todayPayments: todayCountRows[0]?.total ?? 0,
      todayAmount,
      // UI commonly expects `todayRevenue`, so keep an alias.
      todayRevenue: todayAmount,
      parkingRevenue: Number(parkingRevenueRows[0]?.total_amount ?? 0),
      penaltyRevenue: Number(penaltyRevenueRows[0]?.total_amount ?? 0),
      pendingAmount: Number(pendingRows[0]?.total_amount ?? 0),
      failedAmount: Number(failedRows[0]?.total_amount ?? 0),
    };
  }

  async create(params: {
    sessionId?: string;
    ticketId?: string;
    userId?: string;
    licensePlate: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentType: PaymentType;
    status?: PaymentStatus;
    transactionRef?: string;
    paidAt?: string;
  }): Promise<string> {
    const id = crypto.randomUUID();
    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const receiptDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await execute(
      `INSERT INTO payments
      (id, session_id, ticket_id, user_id, license_plate, amount, payment_method, payment_type, status, transaction_ref, paid_at, receipt_number, receipt_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.sessionId ?? null,
        params.ticketId ?? null,
        params.userId ?? null,
        params.licensePlate.trim().toUpperCase(),
        params.amount,
        params.paymentMethod,
        params.paymentType,
        params.status ?? 'success',
        params.transactionRef ?? null,
        params.paidAt ?? null,
        receiptNumber,
        receiptDate,
      ]
    );
    return id;
  }
}
