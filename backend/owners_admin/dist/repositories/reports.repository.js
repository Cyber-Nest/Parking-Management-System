"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsRepository = void 0;
const database_1 = require("../config/database");
class ReportsRepository {
    async getRevenue(from, to) {
        const conditions = [];
        const values = [];
        if (from) {
            conditions.push('paid_at >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('paid_at <= ?');
            values.push(to);
        }
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const totals = await (0, database_1.queryRows)(`SELECT
         COALESCE(SUM(amount), 0) AS total_revenue,
         COUNT(*) AS total_transactions,
         SUM(status = 'success') AS successful_transactions,
         SUM(status = 'failed') AS failed_transactions,
         SUM(status = 'refunded') AS refunded_amount
       FROM payments
       ${whereClause}`, values);
        const daily = await (0, database_1.queryRows)(`SELECT
         DATE(paid_at) AS report_date,
         COALESCE(SUM(amount), 0) AS total_amount,
         COUNT(*) AS transaction_count
       FROM payments
       ${whereClause}
       GROUP BY DATE(paid_at)
       ORDER BY report_date DESC
       LIMIT 14`, values);
        return {
            totals: totals[0] ?? {
                total_revenue: 0,
                total_transactions: 0,
                successful_transactions: 0,
                failed_transactions: 0,
                refunded_amount: 0,
            },
            daily,
        };
    }
    async getUsage(from, to) {
        const conditions = [];
        const values = [];
        if (from) {
            conditions.push('start_time >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('end_time <= ?');
            values.push(to);
        }
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const sessionTotals = await (0, database_1.queryRows)(`SELECT status, COUNT(*) AS count
       FROM parking_sessions
       ${whereClause}
       GROUP BY status`, values);
        const planBreakdown = await (0, database_1.queryRows)(`SELECT plan_name, COUNT(*) AS sessions, COALESCE(SUM(duration_minutes), 0) AS total_duration
       FROM parking_sessions
       ${whereClause}
       GROUP BY plan_name
       ORDER BY sessions DESC
       LIMIT 12`, values);
        return {
            sessionTotals,
            planBreakdown,
        };
    }
    async getPenalty(from, to) {
        const conditions = [];
        const values = [];
        if (from) {
            conditions.push('date_issued >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('date_issued <= ?');
            values.push(to);
        }
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const statusSummary = await (0, database_1.queryRows)(`SELECT status, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total_amount
       FROM penalty_tickets
       ${whereClause}
       GROUP BY status`, values);
        const officerBreakdown = await (0, database_1.queryRows)(`SELECT officer_name, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total_amount
       FROM penalty_tickets
       ${whereClause}
       GROUP BY officer_name
       ORDER BY count DESC
       LIMIT 10`, values);
        return {
            statusSummary,
            officerBreakdown,
        };
    }
    async getPerformance(from, to) {
        const conditions = [];
        const values = [];
        if (from) {
            conditions.push('t.date_issued >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('t.date_issued <= ?');
            values.push(to);
        }
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const officerPerformance = await (0, database_1.queryRows)(`SELECT o.id AS officer_id, o.full_name AS officer_name,
         COUNT(t.id) AS tickets_issued,
         COALESCE(SUM(t.amount), 0) AS total_penalty_amount
       FROM officers o
       LEFT JOIN penalty_tickets t ON t.officer_id = o.id
       ${whereClause}
       GROUP BY o.id
       ORDER BY tickets_issued DESC
       LIMIT 12`, values);
        return { officerPerformance };
    }
    async getPaymentReconciliation(from, to) {
        const conditions = [];
        const values = [];
        if (from) {
            conditions.push('paid_at >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('paid_at <= ?');
            values.push(to);
        }
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const reconciliation = await (0, database_1.queryRows)(`SELECT payment_type, status, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       ${whereClause}
       GROUP BY payment_type, status`, values);
        return { reconciliation };
    }
    async getDue(from, to) {
        const conditions = ['status = \'unpaid\''];
        const values = [];
        if (from) {
            conditions.push('date_issued >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('date_issued <= ?');
            values.push(to);
        }
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const dueTickets = await (0, database_1.queryRows)(`SELECT id, ticket_number, license_plate, amount, due_date, officer_name, date_issued
       FROM penalty_tickets
       ${whereClause}
       ORDER BY due_date ASC
       LIMIT 100`, values);
        return { dueTickets };
    }
    async getLocationPerformance(from, to) {
        const conditions = [];
        const values = [];
        if (from) {
            conditions.push('start_time >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('end_time <= ?');
            values.push(to);
        }
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const locationData = await (0, database_1.queryRows)(`SELECT IFNULL(plan_name, 'Unassigned') AS plan_name,
         COUNT(*) AS sessions,
         COALESCE(SUM(duration_minutes), 0) AS total_duration
       FROM parking_sessions
       ${whereClause}
       GROUP BY plan_name
       ORDER BY sessions DESC
       LIMIT 12`, values);
        return { locationData };
    }
    async getOccupancy(from, to) {
        const conditions = [];
        const values = [];
        if (from) {
            conditions.push('start_time >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('end_time <= ?');
            values.push(to);
        }
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const occupancy = await (0, database_1.queryRows)(`SELECT status, COUNT(*) AS count
       FROM parking_sessions
       ${whereClause}
       GROUP BY status`, values);
        const averageDuration = await (0, database_1.queryRows)(`SELECT COALESCE(AVG(duration_minutes), 0) AS average_duration
       FROM parking_sessions
       ${whereClause}`, values);
        return {
            occupancy,
            averageDuration: averageDuration[0]?.average_duration ?? 0,
        };
    }
    async getPlanPerformance(from, to) {
        const conditions = [];
        const values = [];
        if (from) {
            conditions.push('ps.start_time >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('ps.end_time <= ?');
            values.push(to);
        }
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const planData = await (0, database_1.queryRows)(`SELECT ps.plan_id, ps.plan_name,
         COUNT(*) AS sessions_count,
         COALESCE(AVG(ps.duration_minutes), 0) AS average_duration
       FROM parking_sessions ps
       ${whereClause}
       GROUP BY ps.plan_id, ps.plan_name
       ORDER BY sessions_count DESC
       LIMIT 12`, values);
        return { planData };
    }
    async getAuditReport(limit = 50) {
        const summary = await (0, database_1.queryRows)(`SELECT
         COUNT(*) AS total_logs,
         SUM(status = 'success') AS success_count,
         SUM(status = 'failure') AS failure_count
       FROM audit_logs`);
        const recentActivity = await (0, database_1.queryRows)(`SELECT id, user_id, user_name, action, module, resource_id, resource_name, details,
              old_value, new_value, ip_address, user_agent, status, created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT ?`, [limit]);
        return { summary: summary[0] ?? { total_logs: 0, success_count: 0, failure_count: 0 }, recentActivity };
    }
    async getVehicleHistory(licensePlate) {
        const history = await (0, database_1.queryRows)(`SELECT id, ticket_number, officer_name, license_plate, amount, reason, status, date_issued, due_date, paid_at, remarks
       FROM penalty_tickets
       WHERE license_plate = ?
       ORDER BY date_issued DESC
       LIMIT 100`, [licensePlate]);
        return { history };
    }
    async getRefunds(limit = 50) {
        const summary = await (0, database_1.queryRows)(`SELECT COUNT(*) AS refund_count, COALESCE(SUM(amount), 0) AS total_refunded
       FROM payments
       WHERE status = 'refunded'`);
        const records = await (0, database_1.queryRows)(`SELECT id, ticket_id, session_id, license_plate, amount, payment_method, transaction_ref, paid_at, status
       FROM payments
       WHERE status = 'refunded'
       ORDER BY paid_at DESC
       LIMIT ?`, [limit]);
        return { summary: summary[0] ?? { refund_count: 0, total_refunded: 0 }, records };
    }
}
exports.ReportsRepository = ReportsRepository;
//# sourceMappingURL=reports.repository.js.map