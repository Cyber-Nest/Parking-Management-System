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
}

interface CountRow {
  total: number;
}

interface AmountRow {
  total_amount: number | null;
}

export class PaymentRepository {
  private buildWhere(filters: PaymentListFilters): { clause: string; values: any[] } {
    const conditions: string[] = [];
    const values: any[] = [];

    if (filters.q) {
      conditions.push('(license_plate LIKE ? OR id LIKE ?)');
      values.push(`%${filters.q}%`, `%${filters.q}%`);
    }
    if (filters.status) {
      conditions.push('status = ?');
      values.push(filters.status);
    }
    if (filters.paymentMethod) {
      conditions.push('payment_method = ?');
      values.push(filters.paymentMethod);
    }
    if (filters.paymentType) {
      conditions.push('payment_type = ?');
      values.push(filters.paymentType);
    }
    if (filters.from) {
      conditions.push('created_at >= ?');
      values.push(filters.from);
    }
    if (filters.to) {
      conditions.push('created_at <= ?');
      values.push(filters.to);
    }

    return {
      clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      values,
    };
  }

  async list(filters: PaymentListFilters): Promise<{ items: PaymentRow[]; total: number }> {
    const { clause, values } = this.buildWhere(filters);
    const offset = (filters.page - 1) * filters.limit;

    const items = await queryRows<PaymentRow>(
      `SELECT id, session_id, ticket_id, user_id, license_plate, amount, payment_method, payment_type,
              status, transaction_ref, paid_at, receipt_number, receipt_date, created_at
       FROM payments
       ${clause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, filters.limit, offset]
    );

    const countRows = await queryRows<CountRow>(
      `SELECT COUNT(*) AS total
       FROM payments
       ${clause}`,
      values
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

  async summary(): Promise<{
    todayPayments: number;
    todayAmount: number;
    todayRevenue: number;
    parkingRevenue: number;
    penaltyRevenue: number;
    pendingAmount: number;
    failedAmount: number;
  }> {
    const todayCountRows = await queryRows<CountRow>(
      `SELECT COUNT(*) AS total
       FROM payments
       WHERE DATE(created_at) = CURDATE()`
    );
    const todayAmountRows = await queryRows<AmountRow>(
      `SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE DATE(created_at) = CURDATE()`
    );
    const parkingRevenueRows = await queryRows<AmountRow>(
      `SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE payment_type = 'parking' AND status = 'success'`
    );
    const penaltyRevenueRows = await queryRows<AmountRow>(
      `SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE payment_type = 'penalty' AND status = 'success'`
    );
    const pendingRows = await queryRows<AmountRow>(
      `SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE status = 'pending'`
    );

    const failedRows = await queryRows<AmountRow>(
      `SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE status = 'failed'`
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
