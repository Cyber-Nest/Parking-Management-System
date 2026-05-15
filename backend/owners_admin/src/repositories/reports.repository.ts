import { queryRows } from '../config/database';

export class ReportsRepository {
    private sessionOverlapWhere(from?: string, to?: string, tableAlias = ''): { clause: string; values: any[] } {
        const p = tableAlias ? `${tableAlias}.` : '';
        const conditions: string[] = [];
        const values: any[] = [];
        if (from) {
            conditions.push(`${p}end_time >= ?`);
            values.push(from);
        }
        if (to) {
            conditions.push(`${p}start_time <= ?`);
            values.push(`${to} 23:59:59`);
        }
        return {
            clause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
            values,
        };
    }

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
        const { clause: whereClause, values } = this.sessionOverlapWhere(from, to);
        const { clause: wherePs, values: valuesPs } = this.sessionOverlapWhere(from, to, 'ps');

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
            `SELECT COALESCE(plan_name, 'Unassigned') AS plan_name, COUNT(*) AS sessions, COALESCE(SUM(duration_minutes), 0) AS total_duration
       FROM parking_sessions
       ${whereClause}
       GROUP BY plan_name
       ORDER BY sessions DESC
       LIMIT 12`,
            values
        );

        const dailyBreakdown = await queryRows<{
            report_date: string;
            total_sessions: number;
            completed: number;
            active: number;
            expired: number;
            cancelled: number;
            avg_duration: number;
            revenue: number;
        }>(
            `SELECT DATE(ps.start_time) AS report_date,
              COUNT(*) AS total_sessions,
              SUM(ps.status IN ('expired','extended')) AS completed,
              SUM(ps.status = 'active') AS active,
              SUM(ps.status = 'expired') AS expired,
              SUM(ps.status = 'cancelled') AS cancelled,
              COALESCE(AVG(ps.duration_minutes), 0) AS avg_duration,
              COALESCE(SUM(CASE WHEN p.status = 'success' AND p.payment_type IN ('parking','extension') THEN p.amount ELSE 0 END), 0) AS revenue
            FROM parking_sessions ps
            LEFT JOIN payments p ON p.session_id = ps.id
            ${wherePs}
            GROUP BY DATE(ps.start_time)
            ORDER BY report_date DESC
            LIMIT 45`,
            valuesPs
        );

        const hourlyHistogram = await queryRows<{ hour: number; session_count: number }>(
            `SELECT HOUR(start_time) AS hour, COUNT(*) AS session_count
       FROM parking_sessions
       ${whereClause}
       GROUP BY HOUR(start_time)
       ORDER BY hour`,
            values
        );

        const heatmapRows = await queryRows<{ weekday: number; hour: number; session_count: number }>(
            `SELECT WEEKDAY(start_time) AS weekday, HOUR(start_time) AS hour, COUNT(*) AS session_count
       FROM parking_sessions
       ${whereClause}
       GROUP BY WEEKDAY(start_time), HOUR(start_time)`,
            values
        );

        const heatmapByWeekdayHour: { weekday: number; hours: number[] }[] = [];
        for (let wd = 0; wd < 7; wd += 1) {
            const hours = Array(24).fill(0);
            heatmapRows
                .filter((r) => Number(r.weekday) === wd)
                .forEach((r) => {
                    hours[Number(r.hour)] = Number(r.session_count) || 0;
                });
            heatmapByWeekdayHour.push({ weekday: wd, hours });
        }

        return {
            sessionTotals,
            planBreakdown,
            dailyBreakdown,
            hourlyHistogram,
            heatmapByWeekdayHour,
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
            location_name: string | null;
            reason: string;
        }>(
            `SELECT id, ticket_number, license_plate, amount, due_date, officer_name, date_issued,
              location_name, reason
       FROM penalty_tickets
       ${whereClause}
       ORDER BY due_date ASC
       LIMIT 100`,
            values
        );

        return { dueTickets };
    }

    async getLocationPerformance(from?: string, to?: string) {
        const { clause: whereClause, values } = this.sessionOverlapWhere(from, to, 'ps');

        const locationData = await queryRows<{
            location_key: string;
            sessions: number;
            total_duration: number;
            revenue: number;
        }>(
            `SELECT COALESCE(NULLIF(TRIM(location_name), ''), plan_name, 'Unassigned') AS location_key,
         COUNT(*) AS sessions,
         COALESCE(SUM(duration_minutes), 0) AS total_duration,
         COALESCE(SUM(CASE WHEN p.status = 'success' THEN p.amount ELSE 0 END), 0) AS revenue
       FROM parking_sessions ps
       LEFT JOIN payments p ON p.session_id = ps.id
       ${whereClause}
       GROUP BY COALESCE(NULLIF(TRIM(location_name), ''), plan_name, 'Unassigned')
       ORDER BY sessions DESC
       LIMIT 20`,
            values
        );

        return { locationData };
    }

    async getOccupancy(from?: string, to?: string) {
        const { clause: whereClause, values } = this.sessionOverlapWhere(from, to);

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
        const { clause: whereClause, values } = this.sessionOverlapWhere(from, to, 'ps');

        const planData = await queryRows<{
            plan_id: string | null;
            plan_name: string;
            sessions_count: number;
            average_duration: number;
            revenue: number;
            plan_price: number | null;
        }>(
            `SELECT ps.plan_id, COALESCE(NULLIF(TRIM(ps.plan_name), ''), 'Unassigned') AS plan_name,
         COUNT(*) AS sessions_count,
         COALESCE(AVG(ps.duration_minutes), 0) AS average_duration,
         COALESCE(SUM(CASE WHEN p.status = 'success' AND p.payment_type IN ('parking','extension') THEN p.amount ELSE 0 END), 0) AS revenue,
         MAX(pl.price) AS plan_price
       FROM parking_sessions ps
       LEFT JOIN payments p ON p.session_id = ps.id
       LEFT JOIN parking_plans pl ON pl.id = ps.plan_id
       ${whereClause}
       GROUP BY ps.plan_id, COALESCE(NULLIF(TRIM(ps.plan_name), ''), 'Unassigned')
       ORDER BY sessions_count DESC
       LIMIT 20`,
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

    async getVehicleHistory(licensePlate: string, from?: string, to?: string, location?: string) {
        const plate = licensePlate.trim();
        if (!plate) {
            return {
                history: [],
                parking_sessions: [],
                payments: [],
                refunds: [],
                summary: {
                    total_sessions: 0,
                    total_payments_amount: 0,
                    total_penalties: 0,
                    total_penalty_amount: 0,
                    refunds_amount: 0,
                },
                vehicle: null as {
                    first_seen: Date | null;
                    last_seen: Date | null;
                    total_duration_minutes: number;
                    favorite_location: string | null;
                } | null,
            };
        }

        const dateParts = (alias: string, col: string): { sql: string; vals: any[] } => {
            const parts: string[] = [];
            const vals: any[] = [];
            if (from) {
                parts.push(`DATE(${alias}.${col}) >= DATE(?)`);
                vals.push(from);
            }
            if (to) {
                parts.push(`DATE(${alias}.${col}) <= DATE(?)`);
                vals.push(to);
            }
            return { sql: parts.length ? ` AND ${parts.join(' AND ')}` : '', vals };
        };

        const locSql = (alias: string): { sql: string; vals: any[] } => {
            if (!location || location === 'All Locations' || !location.trim()) return { sql: '', vals: [] };
            return { sql: ` AND ${alias}.location_name LIKE ?`, vals: [`%${location.trim()}%`] };
        };

        const dTicket = dateParts('t', 'date_issued');
        const lTicket = locSql('t');
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
            location_name: string | null;
            receipt_number: string | null;
        }>(
            `SELECT t.id, t.ticket_number, t.officer_name, t.license_plate, t.amount, t.reason, t.status,
              t.date_issued, t.due_date, t.paid_at, t.remarks, t.location_name,
              p.receipt_number
       FROM penalty_tickets t
       LEFT JOIN payments p ON p.id = t.payment_id
       WHERE LOWER(TRIM(t.license_plate)) = LOWER(TRIM(?))
       ${dTicket.sql}${lTicket.sql}
       ORDER BY t.date_issued DESC
       LIMIT 200`,
            [plate, ...dTicket.vals, ...lTicket.vals]
        );

        const dPs = dateParts('ps', 'start_time');
        const lPs = locSql('ps');
        const parking_sessions = await queryRows<{
            id: string;
            start_time: Date;
            end_time: Date | null;
            location_name: string | null;
            plan_name: string | null;
            duration_minutes: number | null;
            status: string;
            amount_paid: number;
            payment_method: string | null;
            receipt_number: string | null;
        }>(
            `SELECT ps.id, ps.start_time, ps.end_time, ps.location_name, ps.plan_name, ps.duration_minutes, ps.status,
        COALESCE((
          SELECT SUM(p2.amount) FROM payments p2
          WHERE p2.session_id = ps.id AND p2.status = 'success'
        ), 0) AS amount_paid,
        (SELECT p2.payment_method FROM payments p2 WHERE p2.session_id = ps.id AND p2.status = 'success' ORDER BY p2.paid_at DESC LIMIT 1) AS payment_method,
        (SELECT p2.receipt_number FROM payments p2 WHERE p2.session_id = ps.id ORDER BY p2.paid_at DESC LIMIT 1) AS receipt_number
       FROM parking_sessions ps
       WHERE LOWER(TRIM(ps.license_plate)) = LOWER(TRIM(?))
       ${dPs.sql}${lPs.sql}
       ORDER BY ps.start_time DESC
       LIMIT 200`,
            [plate, ...dPs.vals, ...lPs.vals]
        );

        const dPay = dateParts('p', 'paid_at');
        const payments = await queryRows<{
            id: string;
            session_id: string | null;
            ticket_id: string | null;
            license_plate: string;
            amount: number;
            payment_method: string;
            payment_type: string;
            status: string;
            transaction_ref: string | null;
            paid_at: Date | null;
            receipt_number: string | null;
        }>(
            `SELECT p.id, p.session_id, p.ticket_id, p.license_plate, p.amount, p.payment_method, p.payment_type,
              p.status, p.transaction_ref, p.paid_at, p.receipt_number
       FROM payments p
       WHERE LOWER(TRIM(p.license_plate)) = LOWER(TRIM(?))
         AND p.status <> 'refunded'
       ${dPay.sql}
       ORDER BY p.paid_at DESC
       LIMIT 200`,
            [plate, ...dPay.vals]
        );

        const dRefund = dateParts('p', 'paid_at');
        const refunds = await queryRows<{
            id: string;
            session_id: string | null;
            ticket_id: string | null;
            license_plate: string;
            amount: number;
            payment_method: string;
            payment_type: string;
            status: string;
            transaction_ref: string | null;
            paid_at: Date | null;
            receipt_number: string | null;
        }>(
            `SELECT p.id, p.session_id, p.ticket_id, p.license_plate, p.amount, p.payment_method, p.payment_type,
              p.status, p.transaction_ref, p.paid_at, p.receipt_number
       FROM payments p
       WHERE LOWER(TRIM(p.license_plate)) = LOWER(TRIM(?))
         AND p.status = 'refunded'
       ${dRefund.sql}
       ORDER BY p.paid_at DESC
       LIMIT 200`,
            [plate, ...dRefund.vals]
        );

        const total_penalty_amount = history.reduce((s, r) => s + (Number(r.amount) || 0), 0);
        const total_payments_amount = payments
            .filter((p) => p.status === 'success')
            .reduce((s, p) => s + (Number(p.amount) || 0), 0);
        const refunds_amount = refunds.reduce((s, p) => s + (Number(p.amount) || 0), 0);

        const vRow = await queryRows<{
            first_seen: Date | null;
            last_seen: Date | null;
            total_duration_minutes: number | null;
        }>(
            `SELECT MIN(ps.start_time) AS first_seen,
              MAX(GREATEST(COALESCE(ps.end_time, ps.start_time), ps.start_time)) AS last_seen,
              COALESCE(SUM(ps.duration_minutes), 0) AS total_duration_minutes
       FROM parking_sessions ps
       WHERE LOWER(TRIM(ps.license_plate)) = LOWER(TRIM(?))
       ${dPs.sql}${lPs.sql}`,
            [plate, ...dPs.vals, ...lPs.vals]
        );

        const fav = await queryRows<{ location_name: string | null; c: number }>(
            `SELECT ps.location_name, COUNT(*) AS c
       FROM parking_sessions ps
       WHERE LOWER(TRIM(ps.license_plate)) = LOWER(TRIM(?))
       ${dPs.sql}${lPs.sql}
       GROUP BY ps.location_name
       ORDER BY c DESC
       LIMIT 1`,
            [plate, ...dPs.vals, ...lPs.vals]
        );

        let vehicle =
            vRow[0]?.first_seen || vRow[0]?.last_seen
                ? {
                      first_seen: vRow[0].first_seen,
                      last_seen: vRow[0].last_seen,
                      total_duration_minutes: Number(vRow[0].total_duration_minutes) || 0,
                      favorite_location: fav[0]?.location_name ?? null,
                  }
                : null;

        if (!vehicle && history.length) {
            const times = history
                .map((h) => new Date(h.date_issued).getTime())
                .filter((t) => !Number.isNaN(t));
            if (times.length) {
                vehicle = {
                    first_seen: new Date(Math.min(...times)),
                    last_seen: new Date(Math.max(...times)),
                    total_duration_minutes: 0,
                    favorite_location: history[0].location_name ?? null,
                };
            }
        }

        return {
            history,
            parking_sessions,
            payments,
            refunds,
            summary: {
                total_sessions: parking_sessions.length,
                total_payments_amount,
                total_penalties: history.length,
                total_penalty_amount,
                refunds_amount,
            },
            vehicle,
        };
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
