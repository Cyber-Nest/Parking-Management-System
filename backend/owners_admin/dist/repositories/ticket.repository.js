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
        const items = await (0, database_1.queryRows)(`SELECT id, ticket_number, officer_id, officer_name, license_plate, amount, reason, status,
              date_issued, due_date, paid_at, remarks, dispute_raised, created_at
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
      (id, ticket_number, officer_id, officer_name, session_id, license_plate, amount, reason, status, date_issued, due_date, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`, [
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
        ]);
        return id;
    }
}
exports.TicketRepository = TicketRepository;
//# sourceMappingURL=ticket.repository.js.map