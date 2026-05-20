import crypto from 'crypto';
import { execute, queryRows } from '../config/database';

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  email?: string;
  status?: string;
  payment_status?: string;
  from?: string;
  to?: string;
}

export interface InvoiceRow {
  id: string;
  invoice_number: string;
  invoice_date: Date;
  due_date?: Date;
  customer_email: string;
  customer_name?: string;
  vehicle_plate_number?: string;
  item_type: string;
  total_amount: number;
  payment_status: string;
  paid_amount: number;
  status: string;
  booking_id?: string;
  penalty_id?: string;
  pdf_file_path?: string;
}

export class InvoiceRepository {
  async createInvoice(data: Record<string, unknown>) {
    const id = crypto.randomUUID();
    const {
      invoice_number,
      customer_email,
      customer_name,
      vehicle_plate_number,
      vehicle_model,
      vehicle_color,
      item_description,
      item_type,
      quantity,
      unit_price,
      subtotal,
      tax_amount,
      tax_rate,
      discount_amount,
      service_fee,
      total_amount,
      currency,
      booking_id,
      penalty_id,
      transaction_id,
      status,
      parking_zone,
      parking_location,
      start_time,
      end_time,
      duration_minutes,
      metadata,
    } = data;

    await execute(
      `INSERT INTO invoices (
        id, invoice_number, invoice_date, customer_email, customer_name,
        vehicle_plate_number, vehicle_model, vehicle_color, item_description,
        item_type, quantity, unit_price, subtotal, tax_amount, tax_rate,
        discount_amount, service_fee, total_amount, currency, payment_status,
        booking_id, penalty_id, transaction_id, status, parking_zone,
        parking_location, start_time, end_time, duration_minutes, metadata
      ) VALUES (
        ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid',
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [
        id,
        invoice_number,
        customer_email,
        customer_name ?? null,
        vehicle_plate_number ?? null,
        vehicle_model ?? null,
        vehicle_color ?? null,
        item_description,
        item_type,
        quantity ?? 1,
        unit_price,
        subtotal,
        tax_amount ?? 0,
        tax_rate ?? 13,
        discount_amount ?? 0,
        service_fee ?? 0,
        total_amount,
        currency ?? 'CAD',
        booking_id ?? null,
        penalty_id ?? null,
        transaction_id ?? null,
        status ?? 'issued',
        parking_zone ?? null,
        parking_location ?? null,
        start_time ?? null,
        end_time ?? null,
        duration_minutes ?? null,
        JSON.stringify(metadata ?? {}),
      ],
    );

    return this.findInvoiceById(id);
  }

  async findInvoiceById(id: string) {
    const rows = await queryRows<InvoiceRow>('SELECT * FROM invoices WHERE id = ? LIMIT 1', [id]);
    return rows[0] ?? null;
  }

  async findByNumber(invoiceNumber: string) {
    const rows = await queryRows<InvoiceRow>(
      'SELECT * FROM invoices WHERE invoice_number = ? LIMIT 1',
      [invoiceNumber],
    );
    return rows[0] ?? null;
  }

  async findByEmail(email: string, limit = 50, offset = 0) {
    const countRows = await queryRows<{ total: number }>(
      'SELECT COUNT(*) AS total FROM invoices WHERE customer_email = ?',
      [email],
    );
    const rows = await queryRows(
      `SELECT * FROM invoices WHERE customer_email = ?
       ORDER BY invoice_date DESC LIMIT ? OFFSET ?`,
      [email, limit, offset],
    );

    return {
      count: Number(countRows[0]?.total ?? 0),
      rows,
    };
  }

  async findByBookingId(bookingId: string) {
    const rows = await queryRows<InvoiceRow>(
      'SELECT * FROM invoices WHERE booking_id = ? LIMIT 1',
      [bookingId],
    );
    return rows[0] ?? null;
  }

  async findByTransactionId(transactionId: string) {
    const rows = await queryRows<InvoiceRow>(
      'SELECT * FROM invoices WHERE transaction_id = ? LIMIT 1',
      [transactionId],
    );
    return rows[0] ?? null;
  }

  async findByStatus(status: string, limit = 50, offset = 0) {
    const countRows = await queryRows<{ total: number }>(
      'SELECT COUNT(*) AS total FROM invoices WHERE status = ?',
      [status],
    );
    const rows = await queryRows(
      `SELECT * FROM invoices WHERE status = ?
       ORDER BY invoice_date DESC LIMIT ? OFFSET ?`,
      [status, limit, offset],
    );

    return {
      count: Number(countRows[0]?.total ?? 0),
      rows,
    };
  }

  async findByPaymentStatus(paymentStatus: string, limit = 50, offset = 0) {
    const countRows = await queryRows<{ total: number }>(
      'SELECT COUNT(*) AS total FROM invoices WHERE payment_status = ?',
      [paymentStatus],
    );
    const rows = await queryRows(
      `SELECT * FROM invoices WHERE payment_status = ?
       ORDER BY invoice_date DESC LIMIT ? OFFSET ?`,
      [paymentStatus, limit, offset],
    );

    return {
      count: Number(countRows[0]?.total ?? 0),
      rows,
    };
  }

  async findByDateRange(startDate: Date, endDate: Date, limit = 50, offset = 0) {
    const countRows = await queryRows<{ total: number }>(
      'SELECT COUNT(*) AS total FROM invoices WHERE invoice_date BETWEEN ? AND ?',
      [startDate, endDate],
    );
    const rows = await queryRows(
      `SELECT * FROM invoices WHERE invoice_date BETWEEN ? AND ?
       ORDER BY invoice_date DESC LIMIT ? OFFSET ?`,
      [startDate, endDate, limit, offset],
    );

    return {
      count: Number(countRows[0]?.total ?? 0),
      rows,
    };
  }

  async updateInvoice(id: string, data: Record<string, unknown>) {
    if (Object.keys(data).length === 0) {
      return this.findInvoiceById(id);
    }

    const fields = Object.keys(data).map((key) => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    await execute(`UPDATE invoices SET ${fields}, updated_at = NOW() WHERE id = ?`, values);
    return this.findInvoiceById(id);
  }

  async markAsPaid(id: string, paidAmount: number) {
    await execute(
      `UPDATE invoices
       SET payment_status = 'paid', paid_amount = ?, paid_date = NOW(),
           status = 'paid', updated_at = NOW()
       WHERE id = ?`,
      [paidAmount, id],
    );
    return this.findInvoiceById(id);
  }

  async markAsPartiallyPaid(id: string, paidAmount: number) {
    await execute(
      `UPDATE invoices
       SET payment_status = 'partial', paid_amount = paid_amount + ?, updated_at = NOW()
       WHERE id = ?`,
      [paidAmount, id],
    );
    return this.findInvoiceById(id);
  }

  async recordDownload(id: string) {
    await execute(
      `UPDATE invoices
       SET download_count = download_count + 1, last_downloaded_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [id],
    );
    return this.findInvoiceById(id);
  }

  async getInvoiceStats() {
    return queryRows(
      `SELECT payment_status, COUNT(*) AS count, SUM(total_amount) AS total_amount,
              SUM(paid_amount) AS paid_amount
       FROM invoices GROUP BY payment_status`,
    );
  }

  async getRevenueByDate(startDate: Date, endDate: Date) {
    return queryRows(
      `SELECT DATE(invoice_date) AS date, COUNT(*) AS invoice_count,
              SUM(total_amount) AS total_revenue,
              SUM(CASE WHEN payment_status = 'paid' THEN paid_amount ELSE 0 END) AS paid_amount
       FROM invoices
       WHERE invoice_date BETWEEN ? AND ?
       GROUP BY DATE(invoice_date)
       ORDER BY DATE(invoice_date) DESC`,
      [startDate, endDate],
    );
  }

  async getTodayInvoices() {
    const rows = await queryRows<{ invoice_count: number; total_amount: number; paid_amount: number }>(
      `SELECT COUNT(*) AS invoice_count, COALESCE(SUM(total_amount), 0) AS total_amount,
              COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN paid_amount ELSE 0 END), 0) AS paid_amount
       FROM invoices WHERE DATE(invoice_date) = CURDATE()`,
    );
    return rows[0] ?? { invoice_count: 0, total_amount: 0, paid_amount: 0 };
  }

  async deleteInvoice(id: string) {
    return execute('DELETE FROM invoices WHERE id = ?', [id]);
  }
}

export const invoiceRepository = new InvoiceRepository();
