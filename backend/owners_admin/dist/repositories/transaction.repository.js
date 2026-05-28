"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionRepository = exports.TransactionRepository = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
class TransactionRepository {
    async createTransaction(data) {
        const id = crypto_1.default.randomUUID();
        const { transaction_reference, amount, currency, payment_method, payment_gateway, stripe_payment_intent_id, transaction_type, booking_id, penalty_id, user_email, ip_address, user_agent, metadata, } = data;
        await (0, database_1.execute)(`INSERT INTO transactions (
        id, transaction_reference, amount, currency, payment_method, payment_gateway,
        stripe_payment_intent_id, transaction_type, status, booking_id, penalty_id,
        user_email, ip_address, user_agent, metadata, initiated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'initiated', ?, ?, ?, ?, ?, ?, NOW())`, [
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
        ]);
        return this.findTransactionById(id);
    }
    async findTransactionById(id) {
        const rows = await (0, database_1.queryRows)('SELECT * FROM transactions WHERE id = ? LIMIT 1', [id]);
        return rows[0] ?? null;
    }
    async findByReference(reference) {
        const rows = await (0, database_1.queryRows)('SELECT * FROM transactions WHERE transaction_reference = ? LIMIT 1', [reference]);
        return rows[0] ?? null;
    }
    async findByEmail(email, limit = 50, offset = 0) {
        const countRows = await (0, database_1.queryRows)('SELECT COUNT(*) AS total FROM transactions WHERE user_email = ?', [email]);
        const rows = await (0, database_1.queryRows)(`SELECT * FROM transactions WHERE user_email = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`, [email, limit, offset]);
        return {
            count: Number(countRows[0]?.total ?? 0),
            rows,
        };
    }
    async findByStripeIntentId(stripePaymentIntentId) {
        const rows = await (0, database_1.queryRows)('SELECT * FROM transactions WHERE stripe_payment_intent_id = ? LIMIT 1', [stripePaymentIntentId]);
        return rows[0] ?? null;
    }
    async findByStatus(status, limit = 50, offset = 0) {
        const countRows = await (0, database_1.queryRows)('SELECT COUNT(*) AS total FROM transactions WHERE status = ?', [status]);
        const rows = await (0, database_1.queryRows)(`SELECT * FROM transactions WHERE status = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`, [status, limit, offset]);
        return {
            count: Number(countRows[0]?.total ?? 0),
            rows,
        };
    }
    async findByDateRange(startDate, endDate, limit = 50, offset = 0) {
        const countRows = await (0, database_1.queryRows)('SELECT COUNT(*) AS total FROM transactions WHERE initiated_at BETWEEN ? AND ?', [startDate, endDate]);
        const rows = await (0, database_1.queryRows)(`SELECT * FROM transactions WHERE initiated_at BETWEEN ? AND ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`, [startDate, endDate, limit, offset]);
        return {
            count: Number(countRows[0]?.total ?? 0),
            rows,
        };
    }
    async findByType(transactionType, limit = 50, offset = 0) {
        const countRows = await (0, database_1.queryRows)('SELECT COUNT(*) AS total FROM transactions WHERE transaction_type = ?', [transactionType]);
        const rows = await (0, database_1.queryRows)(`SELECT * FROM transactions WHERE transaction_type = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`, [transactionType, limit, offset]);
        return {
            count: Number(countRows[0]?.total ?? 0),
            rows,
        };
    }
    async updateTransaction(id, data) {
        if (Object.keys(data).length === 0) {
            return this.findTransactionById(id);
        }
        const fields = Object.keys(data).map((key) => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];
        await (0, database_1.execute)(`UPDATE transactions SET ${fields}, updated_at = NOW() WHERE id = ?`, values);
        return this.findTransactionById(id);
    }
    async markAsCompleted(id) {
        await (0, database_1.execute)(`UPDATE transactions
       SET status = 'completed', completed_at = NOW(), updated_at = NOW()
       WHERE id = ?`, [id]);
        return this.findTransactionById(id);
    }
    async markAsFailed(id, responseCode, responseMessage) {
        await (0, database_1.execute)(`UPDATE transactions
       SET status = 'failed', failed_at = NOW(), response_code = ?, response_message = ?, updated_at = NOW()
       WHERE id = ?`, [responseCode, responseMessage, id]);
        return this.findTransactionById(id);
    }
    async getTransactionStats(startDate, endDate) {
        let query = `
      SELECT status, transaction_type AS type, COUNT(*) AS count, SUM(amount) AS total_amount
      FROM transactions`;
        const values = [];
        if (startDate && endDate) {
            query += ' WHERE initiated_at BETWEEN ? AND ?';
            values.push(startDate, endDate);
        }
        query += ' GROUP BY status, transaction_type ORDER BY transaction_type';
        return (0, database_1.queryRows)(query, values);
    }
    async getRevenueByDate(startDate, endDate) {
        return (0, database_1.queryRows)(`SELECT DATE(initiated_at) AS date, COUNT(*) AS transaction_count, SUM(amount) AS total_revenue
       FROM transactions
       WHERE status = 'completed' AND initiated_at BETWEEN ? AND ?
       GROUP BY DATE(initiated_at)
       ORDER BY DATE(initiated_at) DESC`, [startDate, endDate]);
    }
    async getTodayRevenue() {
        const rows = await (0, database_1.queryRows)(`SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
       FROM transactions
       WHERE status = 'completed' AND DATE(initiated_at) = CURDATE()`);
        return rows[0] ?? { total: 0, count: 0 };
    }
    async deleteTransaction(id) {
        return (0, database_1.execute)('DELETE FROM transactions WHERE id = ?', [id]);
    }
}
exports.TransactionRepository = TransactionRepository;
exports.transactionRepository = new TransactionRepository();
//# sourceMappingURL=transaction.repository.js.map