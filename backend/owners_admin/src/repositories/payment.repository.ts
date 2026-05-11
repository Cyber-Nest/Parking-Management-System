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
              status, transaction_ref, paid_at, created_at
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

  async summary(): Promise<{
    todayPayments: number;
    todayAmount: number;
    parkingRevenue: number;
    penaltyRevenue: number;
    pendingFailedAmount: number;
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
    const pendingFailedRows = await queryRows<AmountRow>(
      `SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE status IN ('pending', 'failed')`
    );

    return {
      todayPayments: todayCountRows[0]?.total ?? 0,
      todayAmount: Number(todayAmountRows[0]?.total_amount ?? 0),
      parkingRevenue: Number(parkingRevenueRows[0]?.total_amount ?? 0),
      penaltyRevenue: Number(penaltyRevenueRows[0]?.total_amount ?? 0),
      pendingFailedAmount: Number(pendingFailedRows[0]?.total_amount ?? 0),
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
    await execute(
      `INSERT INTO payments
      (id, session_id, ticket_id, user_id, license_plate, amount, payment_method, payment_type, status, transaction_ref, paid_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ]
    );
    return id;
  }
}
