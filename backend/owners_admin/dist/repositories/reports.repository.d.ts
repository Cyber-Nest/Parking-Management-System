export declare class ReportsRepository {
    private sessionOverlapWhere;
    getRevenue(from?: string, to?: string): Promise<{
        totals: {
            total_revenue: number;
            total_transactions: number;
            successful_transactions: number;
            failed_transactions: number;
            refunded_amount: number;
        };
        daily: {
            report_date: string;
            total_amount: number;
            transaction_count: number;
        }[];
    }>;
    getUsage(from?: string, to?: string): Promise<{
        sessionTotals: {
            status: string;
            count: number;
        }[];
        planBreakdown: {
            plan_name: string;
            sessions: number;
            total_duration: number;
        }[];
        dailyBreakdown: {
            report_date: string;
            total_sessions: number;
            completed: number;
            active: number;
            expired: number;
            cancelled: number;
            avg_duration: number;
            revenue: number;
        }[];
        hourlyHistogram: {
            hour: number;
            session_count: number;
        }[];
        heatmapByWeekdayHour: {
            weekday: number;
            hours: number[];
        }[];
    }>;
    getPenalty(from?: string, to?: string): Promise<{
        statusSummary: {
            status: string;
            count: number;
            total_amount: number;
        }[];
        officerBreakdown: {
            officer_name: string;
            count: number;
            total_amount: number;
        }[];
    }>;
    getPerformance(from?: string, to?: string): Promise<{
        officerPerformance: {
            officer_id: string;
            officer_name: string;
            tickets_issued: number;
            total_penalty_amount: number;
        }[];
    }>;
    getPaymentReconciliation(from?: string, to?: string): Promise<{
        reconciliation: {
            payment_type: string;
            status: string;
            count: number;
            total_amount: number;
        }[];
    }>;
    getDue(from?: string, to?: string): Promise<{
        dueTickets: {
            id: string;
            ticket_number: string;
            license_plate: string;
            amount: number;
            due_date: Date | null;
            officer_name: string;
            date_issued: Date;
            location_name: string | null;
            reason: string;
        }[];
    }>;
    getLocationPerformance(from?: string, to?: string): Promise<{
        locationData: {
            location_key: string;
            sessions: number;
            total_duration: number;
            revenue: number;
        }[];
    }>;
    getOccupancy(from?: string, to?: string): Promise<{
        occupancy: {
            status: string;
            count: number;
        }[];
        averageDuration: number;
    }>;
    getPlanPerformance(from?: string, to?: string): Promise<{
        planData: {
            plan_id: string | null;
            plan_name: string;
            sessions_count: number;
            average_duration: number;
            revenue: number;
            plan_price: number | null;
        }[];
    }>;
    getAuditReport(limit?: number): Promise<{
        summary: {
            total_logs: number;
            success_count: number;
            failure_count: number;
        };
        recentActivity: {
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
        }[];
    }>;
    getVehicleHistory(licensePlate: string, from?: string, to?: string, location?: string): Promise<{
        history: {
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
        }[];
        parking_sessions: {
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
        }[];
        payments: {
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
        }[];
        refunds: {
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
        }[];
        summary: {
            total_sessions: number;
            total_payments_amount: number;
            total_penalties: number;
            total_penalty_amount: number;
            refunds_amount: number;
        };
        vehicle: {
            first_seen: Date | null;
            last_seen: Date | null;
            total_duration_minutes: number;
            favorite_location: string | null;
        } | null;
    }>;
    getRefunds(limit?: number): Promise<{
        summary: {
            refund_count: number;
            total_refunded: number;
        };
        records: {
            id: string;
            ticket_id: string | null;
            session_id: string | null;
            license_plate: string;
            amount: number;
            payment_method: string;
            transaction_ref: string | null;
            paid_at: Date | null;
            status: string;
        }[];
    }>;
}
//# sourceMappingURL=reports.repository.d.ts.map