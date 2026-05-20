"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketRepository = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
class TicketRepository {
    buildWhere(filters) {
        const conditions = [];
        const values = [];
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
    async list(filters) {
        const { clause, values } = this.buildWhere(filters);
        const offset = (filters.page - 1) * filters.limit;
        const items = await (0, database_1.queryRows)(`SELECT id, ticket_number, officer_id, officer_name, license_plate, location_name, amount, reason, status,
              date_issued, due_date, paid_at, remarks, note, dispute_raised, created_at, session_id
       FROM penalty_tickets
       ${clause}
       ORDER BY date_issued DESC
       LIMIT ? OFFSET ?`, [...values, filters.limit, offset]);
        const countRows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS total
       FROM penalty_tickets
       ${clause}`, values);
        return { items, total: countRows[0]?.total ?? 0 };
    }
    async summary() {
        const totalTodayRows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS total
       FROM penalty_tickets
       WHERE DATE(date_issued) = CURDATE()`);
        const totalTicketsRows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS total
       FROM penalty_tickets`);
        const unpaidRows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS total
       FROM penalty_tickets
       WHERE status = 'unpaid'`);
        const paidRows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS total
       FROM penalty_tickets
       WHERE status = 'paid'`);
        const disputedRows = await (0, database_1.queryRows)(`SELECT COUNT(*) AS total
       FROM penalty_tickets
       WHERE status = 'disputed'`);
        const amountRows = await (0, database_1.queryRows)(`SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM penalty_tickets`);
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
    async create(params) {
        const id = crypto_1.default.randomUUID();
        const ticketNumber = `TKT-${Date.now()}`;
        await (0, database_1.execute)(`INSERT INTO penalty_tickets
      (id, ticket_number, officer_id, officer_name, session_id, license_plate, amount, reason, status, date_issued, due_date, remarks, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`, [
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
        ]);
        return id;
    }
    async findById(id) {
        const rows = await (0, database_1.queryRows)(`SELECT id, ticket_number, officer_id, officer_name, license_plate, location_name, amount, reason, status,
              date_issued, due_date, paid_at, remarks, note, dispute_raised, created_at, session_id
       FROM penalty_tickets WHERE id = ? LIMIT 1`, [id]);
        return rows[0] ?? null;
    }
    async updateTicket(id, params) {
        const updates = [];
        const values = [];
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
        if (updates.length === 0)
            return 0;
        values.push(id);
        const result = await (0, database_1.execute)(`UPDATE penalty_tickets SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
        return result.affectedRows;
    }
    async appendRemarks(id, note) {
        const row = await this.findById(id);
        if (!row)
            return 0;
        const stamp = new Date().toISOString();
        const next = row.remarks ? `${row.remarks}\n[${stamp}] ${note}` : `[${stamp}] ${note}`;
        const result = await (0, database_1.execute)(`UPDATE penalty_tickets SET remarks = ?, updated_at = NOW() WHERE id = ?`, [next, id]);
        return result.affectedRows;
    }
    async setStatus(id, status, extras) {
        const paidAt = extras?.paidAt;
        const paymentId = extras?.paymentId;
        if (status === 'paid') {
            const result = await (0, database_1.execute)(`UPDATE penalty_tickets SET status = ?, paid_at = COALESCE(?, NOW()), payment_id = ?, updated_at = NOW() WHERE id = ?`, [status, paidAt ?? null, paymentId ?? null, id]);
            return result.affectedRows;
        }
        if (status === 'cancelled') {
            const result = await (0, database_1.execute)(`UPDATE penalty_tickets SET status = ?, updated_at = NOW() WHERE id = ?`, [status, id]);
            return result.affectedRows;
        }
        const result = await (0, database_1.execute)(`UPDATE penalty_tickets SET status = ?, updated_at = NOW() WHERE id = ?`, [status, id]);
        return result.affectedRows;
    }
}
exports.TicketRepository = TicketRepository;
//# sourceMappingURL=ticket.repository.js.map