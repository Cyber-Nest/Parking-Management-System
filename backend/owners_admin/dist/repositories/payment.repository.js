"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
class PaymentRepository {
    buildWhere(filters) {
        const conditions = [];
        const values = [];
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
    async list(filters) {
        const { clause, values } = this.buildWhere(filters);
        const offset = (filters.page - 1) * filters.limit;
        const items = await (0, database_1.queryRows)(`SELECT id, session_id, ticket_id, user_id, license_plate, amount, payment_method, payment_type,
              status, transaction_ref, paid_at, receipt_number, receipt_date, created_at
       FROM payments
       ${clause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`, [...values, filters.limit, offset]);
        const countRows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS total
       FROM payments
       ${clause}`, values);
        return { items, total: countRows[0]?.total ?? 0 };
    }
    async findById(id) {
        const rows = await (0, database_1.queryRows)(`SELECT id, session_id, ticket_id, user_id, license_plate, amount, payment_method, payment_type,
              status, transaction_ref, paid_at, receipt_number, receipt_date, created_at
       FROM payments WHERE id = ? LIMIT 1`, [id]);
        return rows[0] ?? null;
    }
    async summary() {
        const todayCountRows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS total
       FROM payments
       WHERE DATE(created_at) = CURDATE()`);
        const todayAmountRows = await (0, database_1.queryRows)(`SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE DATE(created_at) = CURDATE()`);
        const parkingRevenueRows = await (0, database_1.queryRows)(`SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE payment_type = 'parking' AND status = 'success'`);
        const penaltyRevenueRows = await (0, database_1.queryRows)(`SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE payment_type = 'penalty' AND status = 'success'`);
        const pendingRows = await (0, database_1.queryRows)(`SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE status = 'pending'`);
        const failedRows = await (0, database_1.queryRows)(`SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       WHERE status = 'failed'`);
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
    async create(params) {
        const id = crypto_1.default.randomUUID();
        const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const receiptDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await (0, database_1.execute)(`INSERT INTO payments
      (id, session_id, ticket_id, user_id, license_plate, amount, payment_method, payment_type, status, transaction_ref, paid_at, receipt_number, receipt_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
        ]);
        return id;
    }
}
exports.PaymentRepository = PaymentRepository;
//# sourceMappingURL=payment.repository.js.map