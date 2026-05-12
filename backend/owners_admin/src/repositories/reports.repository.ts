import { queryRows } from '../config/database';

export class ReportsRepository {
    async getRevenue(from?: string, to?: string) {
        const conditions: string[] = [];
        const values: any[] = [];

        if (from) {
            conditions.push('paid_at >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('paid_at <= ?');
            values.push(to);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const totals = await queryRows<{
            total_revenue: number;
            total_transactions: number;
            successful_transactions: number;
            failed_transactions: number;
            refunded_amount: number;
        }>(
            `SELECT
         COALESCE(SUM(amount), 0) AS total_revenue,
         COUNT(*) AS total_transactions,
         SUM(status = 'success') AS successful_transactions,
         SUM(status = 'failed') AS failed_transactions,
         COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END), 0) AS refunded_amount
       FROM payments
       ${whereClause}`,
            values
        );

        const daily = await queryRows<{
            report_date: string;
            total_amount: number;
            transaction_count: number;
        }>(
            `SELECT
         DATE(paid_at) AS report_date,
         COALESCE(SUM(amount), 0) AS total_amount,
         COUNT(*) AS transaction_count
       FROM payments
       ${whereClause}
       GROUP BY DATE(paid_at)
       ORDER BY report_date DESC
       LIMIT 14`,
            values
        );

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

    async getUsage(from?: string, to?: string) {
        const conditions: string[] = [];
        const values: any[] = [];

        if (from) {
            conditions.push('start_time >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('end_time <= ?');
            values.push(to);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const sessionTotals = await queryRows<{
            status: string;
            count: number;
        }>(
            `SELECT status, COUNT(*) AS count
       FROM parking_sessions
       ${whereClause}
       GROUP BY status`,
            values
        );

        const planBreakdown = await queryRows<{
            plan_name: string;
            sessions: number;
            total_duration: number;
        }>(
            `SELECT plan_name, COUNT(*) AS sessions, COALESCE(SUM(duration_minutes), 0) AS total_duration
       FROM parking_sessions
       ${whereClause}
       GROUP BY plan_name
       ORDER BY sessions DESC
       LIMIT 12`,
            values
        );

        return {
            sessionTotals,
            planBreakdown,
        };
    }

    async getPenalty(from?: string, to?: string) {
        const conditions: string[] = [];
        const values: any[] = [];

        if (from) {
            conditions.push('date_issued >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('date_issued <= ?');
            values.push(to);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const statusSummary = await queryRows<{
            status: string;
            count: number;
            total_amount: number;
        }>(
            `SELECT status, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total_amount
       FROM penalty_tickets
       ${whereClause}
       GROUP BY status`,
            values
        );

        const officerBreakdown = await queryRows<{
            officer_name: string;
            count: number;
            total_amount: number;
        }>(
            `SELECT officer_name, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total_amount
       FROM penalty_tickets
       ${whereClause}
       GROUP BY officer_name
       ORDER BY count DESC
       LIMIT 10`,
            values
        );

        return {
            statusSummary,
            officerBreakdown,
        };
    }

    async getPerformance(from?: string, to?: string) {
        const joinConditions: string[] = ['t.officer_id = o.id'];
        const joinValues: any[] = [];

        if (from) {
            joinConditions.push('t.date_issued >= ?');
            joinValues.push(from);
        }
        if (to) {
            joinConditions.push('t.date_issued <= ?');
            joinValues.push(to);
        }

        const officerPerformance = await queryRows<{
            officer_id: string;
            officer_name: string;
            tickets_issued: number;
            total_penalty_amount: number;
        }>(
            `SELECT o.id AS officer_id, o.full_name AS officer_name,
         COUNT(t.id) AS tickets_issued,
         COALESCE(SUM(t.amount), 0) AS total_penalty_amount
       FROM officers o
       LEFT JOIN penalty_tickets t ON ${joinConditions.join(' AND ')}
       GROUP BY o.id, o.full_name
       ORDER BY tickets_issued DESC
       LIMIT 12`,
            joinValues
        );

        return { officerPerformance };
    }

    async getPaymentReconciliation(from?: string, to?: string) {
        const conditions: string[] = [];
        const values: any[] = [];

        if (from) {
            conditions.push('paid_at >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('paid_at <= ?');
            values.push(to);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const reconciliation = await queryRows<{
            payment_type: string;
            status: string;
            count: number;
            total_amount: number;
        }>(
            `SELECT payment_type, status, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total_amount
       FROM payments
       ${whereClause}
       GROUP BY payment_type, status`,
            values
        );

        return { reconciliation };
    }

    async getDue(from?: string, to?: string) {
        const conditions: string[] = ['status = \'unpaid\''];
        const values: any[] = [];

        if (from) {
            conditions.push('date_issued >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('date_issued <= ?');
            values.push(to);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const dueTickets = await queryRows<{
            id: string;
            ticket_number: string;
            license_plate: string;
            amount: number;
            due_date: Date | null;
            officer_name: string;
            date_issued: Date;
        }>(
            `SELECT id, ticket_number, license_plate, amount, due_date, officer_name, date_issued
       FROM penalty_tickets
       ${whereClause}
       ORDER BY due_date ASC
       LIMIT 100`,
            values
        );

        return { dueTickets };
    }

    async getLocationPerformance(from?: string, to?: string) {
        const conditions: string[] = [];
        const values: any[] = [];

        if (from) {
            conditions.push('start_time >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('end_time <= ?');
            values.push(to);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const locationData = await queryRows<{
            plan_name: string;
            sessions: number;
            total_duration: number;
        }>(
            `SELECT IFNULL(plan_name, 'Unassigned') AS plan_name,
         COUNT(*) AS sessions,
         COALESCE(SUM(duration_minutes), 0) AS total_duration
       FROM parking_sessions
       ${whereClause}
       GROUP BY plan_name
       ORDER BY sessions DESC
       LIMIT 12`,
            values
        );

        return { locationData };
    }

    async getOccupancy(from?: string, to?: string) {
        const conditions: string[] = [];
        const values: any[] = [];

        if (from) {
            conditions.push('start_time >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('end_time <= ?');
            values.push(to);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const occupancy = await queryRows<{
            status: string;
            count: number;
        }>(
            `SELECT status, COUNT(*) AS count
       FROM parking_sessions
       ${whereClause}
       GROUP BY status`,
            values
        );

        const averageDuration = await queryRows<{
            average_duration: number;
        }>(
            `SELECT COALESCE(AVG(duration_minutes), 0) AS average_duration
       FROM parking_sessions
       ${whereClause}`,
            values
        );

        return {
            occupancy,
            averageDuration: averageDuration[0]?.average_duration ?? 0,
        };
    }

    async getPlanPerformance(from?: string, to?: string) {
        const conditions: string[] = [];
        const values: any[] = [];

        if (from) {
            conditions.push('ps.start_time >= ?');
            values.push(from);
        }
        if (to) {
            conditions.push('ps.end_time <= ?');
            values.push(to);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const planData = await queryRows<{
            plan_id: string;
            plan_name: string;
            sessions_count: number;
            average_duration: number;
        }>(
            `SELECT ps.plan_id, ps.plan_name,
         COUNT(*) AS sessions_count,
         COALESCE(AVG(ps.duration_minutes), 0) AS average_duration
       FROM parking_sessions ps
       ${whereClause}
       GROUP BY ps.plan_id, ps.plan_name
       ORDER BY sessions_count DESC
       LIMIT 12`,
            values
        );

        return { planData };
    }

    async getAuditReport(limit = 50) {
        const summary = await queryRows<{
            total_logs: number;
            success_count: number;
            failure_count: number;
        }>(
            `SELECT
         COUNT(*) AS total_logs,
         SUM(status = 'success') AS success_count,
         SUM(status = 'failure') AS failure_count
       FROM audit_logs`
        );

        const recentActivity = await queryRows<{
            id: string;
            user_id: string;
            user_name: string;
            action: string;
            module: string;
            resource_id: string | null;
            resource_name: string | null;
            details: string | null;
            old_value: string | null;
            new_value: string | null;
            ip_address: string | null;
            user_agent: string | null;
            status: string;
            created_at: Date;
        }>(
            `SELECT id, user_id, user_name, action, module, resource_id, resource_name, details,
              old_value, new_value, ip_address, user_agent, status, created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT ?`,
            [limit]
        );

        return { summary: summary[0] ?? { total_logs: 0, success_count: 0, failure_count: 0 }, recentActivity };
    }

    async getVehicleHistory(licensePlate: string) {
        const history = await queryRows<{
            id: string;
            ticket_number: string;
            officer_name: string;
            license_plate: string;
            amount: number;
            reason: string;
            status: string;
            date_issued: Date;
            due_date: Date | null;
            paid_at: Date | null;
            remarks: string | null;
        }>(
            `SELECT id, ticket_number, officer_name, license_plate, amount, reason, status, date_issued, due_date, paid_at, remarks
       FROM penalty_tickets
       WHERE license_plate = ?
       ORDER BY date_issued DESC
       LIMIT 100`,
            [licensePlate]
        );

        return { history };
    }

    async getRefunds(limit = 50) {
        const summary = await queryRows<{
            refund_count: number;
            total_refunded: number;
        }>(
            `SELECT COUNT(*) AS refund_count, COALESCE(SUM(amount), 0) AS total_refunded
       FROM payments
       WHERE status = 'refunded'`
        );

        const records = await queryRows<{
            id: string;
            ticket_id: string | null;
            session_id: string | null;
            license_plate: string;
            amount: number;
            payment_method: string;
            transaction_ref: string | null;
            paid_at: Date | null;
            status: string;
        }>(
            `SELECT id, ticket_id, session_id, license_plate, amount, payment_method, transaction_ref, paid_at, status
       FROM payments
       WHERE status = 'refunded'
       ORDER BY paid_at DESC
       LIMIT ?`,
            [limit]
        );

        return { summary: summary[0] ?? { refund_count: 0, total_refunded: 0 }, records };
    }
}
