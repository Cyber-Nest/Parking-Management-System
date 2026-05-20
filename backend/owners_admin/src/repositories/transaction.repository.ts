import crypto from 'crypto';
import { execute, queryRows } from '../config/database';

export interface TransactionFilters {
  page?: number;
  limit?: number;
  email?: string;
  status?: string;
  type?: string;
  from?: string;
  to?: string;
}

export interface TransactionRow {
  id: string;
  transaction_reference: string;
  amount: number;
  payment_method: string;
  transaction_type: string;
  status: string;
  user_email: string;
  booking_id?: string;
  penalty_id?: string;
  initiated_at: Date;
  completed_at?: Date;
  response_message?: string;
}

export class TransactionRepository {
  async createTransaction(data: Record<string, unknown>) {
    const id = crypto.randomUUID();
    const {
      transaction_reference,
      amount,
      currency,
      payment_method,
      payment_gateway,
      stripe_payment_intent_id,
      transaction_type,
      booking_id,
      penalty_id,
      user_email,
      ip_address,
      user_agent,
      metadata,
    } = data;

    await execute(
      `INSERT INTO transactions (
        id, transaction_reference, amount, currency, payment_method, payment_gateway,
        stripe_payment_intent_id, transaction_type, status, booking_id, penalty_id,
        user_email, ip_address, user_agent, metadata, initiated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'initiated', ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id,
        transaction_reference,
        amount,
        currency ?? 'CAD',
        payment_method,
        payment_gateway ?? 'stripe',
        stripe_payment_intent_id ?? null,
        transaction_type,
        booking_id ?? null,
        penalty_id ?? null,
        user_email,
        ip_address ?? null,
        user_agent ?? null,
        JSON.stringify(metadata ?? {}),
      ],
    );

    return this.findTransactionById(id);
  }

  async findTransactionById(id: string) {
    const rows = await queryRows<TransactionRow>('SELECT * FROM transactions WHERE id = ? LIMIT 1', [id]);
    return rows[0] ?? null;
  }

  async findByReference(reference: string) {
    const rows = await queryRows<TransactionRow>(
      'SELECT * FROM transactions WHERE transaction_reference = ? LIMIT 1',
      [reference],
    );
    return rows[0] ?? null;
  }

  async findByEmail(email: string, limit = 50, offset = 0) {
    const countRows = await queryRows<{ total: number }>(
      'SELECT COUNT(*) AS total FROM transactions WHERE user_email = ?',
      [email],
    );
    const rows = await queryRows(
      `SELECT * FROM transactions WHERE user_email = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [email, limit, offset],
    );

    return {
      count: Number(countRows[0]?.total ?? 0),
      rows,
    };
  }

  async findByStripeIntentId(stripePaymentIntentId: string) {
    const rows = await queryRows<TransactionRow>(
      'SELECT * FROM transactions WHERE stripe_payment_intent_id = ? LIMIT 1',
      [stripePaymentIntentId],
    );
    return rows[0] ?? null;
  }

  async findByStatus(status: string, limit = 50, offset = 0) {
    const countRows = await queryRows<{ total: number }>(
      'SELECT COUNT(*) AS total FROM transactions WHERE status = ?',
      [status],
    );
    const rows = await queryRows(
      `SELECT * FROM transactions WHERE status = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [status, limit, offset],
    );

    return {
      count: Number(countRows[0]?.total ?? 0),
      rows,
    };
  }

  async findByDateRange(startDate: Date, endDate: Date, limit = 50, offset = 0) {
    const countRows = await queryRows<{ total: number }>(
      'SELECT COUNT(*) AS total FROM transactions WHERE initiated_at BETWEEN ? AND ?',
      [startDate, endDate],
    );
    const rows = await queryRows(
      `SELECT * FROM transactions WHERE initiated_at BETWEEN ? AND ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [startDate, endDate, limit, offset],
    );

    return {
      count: Number(countRows[0]?.total ?? 0),
      rows,
    };
  }

  async findByType(transactionType: string, limit = 50, offset = 0) {
    const countRows = await queryRows<{ total: number }>(
      'SELECT COUNT(*) AS total FROM transactions WHERE transaction_type = ?',
      [transactionType],
    );
    const rows = await queryRows(
      `SELECT * FROM transactions WHERE transaction_type = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [transactionType, limit, offset],
    );

    return {
      count: Number(countRows[0]?.total ?? 0),
      rows,
    };
  }

  async updateTransaction(id: string, data: Record<string, unknown>) {
    if (Object.keys(data).length === 0) {
      return this.findTransactionById(id);
    }

    const fields = Object.keys(data).map((key) => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    await execute(`UPDATE transactions SET ${fields}, updated_at = NOW() WHERE id = ?`, values);
    return this.findTransactionById(id);
  }

  async markAsCompleted(id: string) {
    await execute(
      `UPDATE transactions
       SET status = 'completed', completed_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [id],
    );
    return this.findTransactionById(id);
  }

  async markAsFailed(id: string, responseCode: string, responseMessage: string) {
    await execute(
      `UPDATE transactions
       SET status = 'failed', failed_at = NOW(), response_code = ?, response_message = ?, updated_at = NOW()
       WHERE id = ?`,
      [responseCode, responseMessage, id],
    );
    return this.findTransactionById(id);
  }

  async getTransactionStats(startDate?: Date, endDate?: Date) {
    let query = `
      SELECT status, transaction_type AS type, COUNT(*) AS count, SUM(amount) AS total_amount
      FROM transactions`;
    const values: unknown[] = [];

    if (startDate && endDate) {
      query += ' WHERE initiated_at BETWEEN ? AND ?';
      values.push(startDate, endDate);
    }

    query += ' GROUP BY status, transaction_type ORDER BY transaction_type';
    return queryRows(query, values);
  }

  async getRevenueByDate(startDate: Date, endDate: Date) {
    return queryRows(
      `SELECT DATE(initiated_at) AS date, COUNT(*) AS transaction_count, SUM(amount) AS total_revenue
       FROM transactions
       WHERE status = 'completed' AND initiated_at BETWEEN ? AND ?
       GROUP BY DATE(initiated_at)
       ORDER BY DATE(initiated_at) DESC`,
      [startDate, endDate],
    );
  }

  async getTodayRevenue() {
    const rows = await queryRows<{ total: number; count: number }>(
      `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
       FROM transactions
       WHERE status = 'completed' AND DATE(initiated_at) = CURDATE()`,
    );
    return rows[0] ?? { total: 0, count: 0 };
  }

  async deleteTransaction(id: string) {
    return execute('DELETE FROM transactions WHERE id = ?', [id]);
  }
}

export const transactionRepository = new TransactionRepository();
