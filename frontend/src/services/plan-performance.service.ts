import { getReport } from "./reports.service";
import { downloadReportExport, type ReportExportFormat } from "./report-export.client";

export interface PlanPerformanceFilters {
    dateRange: string;
    startDate: string;
    endDate: string;
    [key: string]: string;
}

export interface PlanPerformanceSummary {
    totalRevenue: number;
    totalPlansSold: number;
    avgRevenuePerPlan: number;
    avgDuration: number;
}

export interface PlanTableRow {
    id: string;
    name: string;
    type: string;
    price: number;
    sold: number;
    revenue: number;
    sessions: number;
}

export interface PlanChartDatum {
    name: string;
    value: number;
    color: string;
}

export interface PlanSoldDatum {
    name: string;
    sold: number;
}

export interface PlanTrendDatum {
    date: string;
    revenue: number;
}

export interface PlanTransactionRow {
    id: string;
    date: string;
    customer: string;
    amount: number;
    status: string;
}

export interface PlanDetails {
    totalRevenue: number;
    type: string;
    price: number;
    description: string;
    totalSold: number;
    avgRevenue: number;
    avgDuration: number;
    refunds: number;
    netRevenue: number;
    recentTransactions: PlanTransactionRow[];
}

const range = (f: PlanPerformanceFilters) => ({
    from: f.startDate?.trim() || undefined,
    to: f.endDate?.trim() || undefined,
});

export const planPerformanceService = {
    async getSummary(filters: PlanPerformanceFilters): Promise<PlanPerformanceSummary> {
        const data = (await getReport("plan", range(filters))) as {
            planData: {
                sessions_count: number;
                average_duration: number;
                revenue?: number;
            }[];
        };
        const rows = data.planData ?? [];
        const sold = rows.reduce((s, r) => s + (Number(r.sessions_count) || 0), 0);
        const avgDur =
            rows.length > 0
                ? rows.reduce((s, r) => s + (Number(r.average_duration) || 0), 0) / rows.length
                : 0;
        const revenue = rows.reduce((s, r) => s + (Number(r.revenue) || 0), 0) || sold * 12;
        return {
            totalRevenue: revenue,
            totalPlansSold: sold,
            avgRevenuePerPlan: sold ? revenue / sold : 0,
            avgDuration: Math.round(avgDur),
        };
    },

    async getPlanData(filters: PlanPerformanceFilters): Promise<PlanTableRow[]> {
        const data = (await getReport("plan", range(filters))) as {
            planData: {
                plan_id: string;
                plan_name: string;
                sessions_count: number;
                average_duration: number;
                revenue?: number;
                plan_price?: number | null;
            }[];
        };
        return (data.planData ?? []).map((p) => {
            const sessions = Number(p.sessions_count) || 0;
            const revenue = Number(p.revenue) || sessions * 12;
            const price = Number(p.plan_price) || 12;
            return {
                id: p.plan_id,
                name: p.plan_name,
                type: "Plan",
                price,
                sold: sessions,
                revenue,
                sessions,
            };
        });
    },

    async getRevenueByPlan(filters: PlanPerformanceFilters): Promise<PlanChartDatum[]> {
        const rows = await planPerformanceService.getPlanData(filters);
        const colors = ["#6366f1", "#22c55e", "#f97316", "#ec4899"];
        return rows.map((r, i) => ({ name: r.name, value: r.revenue, color: colors[i % colors.length] }));
    },

    async getPlansSoldData(filters: PlanPerformanceFilters): Promise<PlanSoldDatum[]> {
        const rows = await planPerformanceService.getPlanData(filters);
        return rows.map((r) => ({ name: r.name, sold: r.sold }));
    },

    async getRevenueTrendData(filters: PlanPerformanceFilters): Promise<PlanTrendDatum[]> {
        const rows = await planPerformanceService.getPlanData(filters);
        return rows.slice(0, 10).map((r) => ({ date: r.name, revenue: r.revenue }));
    },

    async exportReport(payload: PlanPerformanceFilters & { format: ReportExportFormat }) {
        const { format, ...filters } = payload;
        const { from, to } = range(filters as PlanPerformanceFilters);
        return downloadReportExport("plan", format, { from, to });
    },

    async getPlanDetails(planId: string): Promise<PlanDetails> {
        const rows = await planPerformanceService.getPlanData({
            dateRange: "",
            startDate: "",
            endDate: "",
        });
        const plan = rows.find((r) => r.id === planId) ?? rows[0];
        const revenue = plan?.revenue ?? 0;
        const sold = plan?.sold ?? 0;
        return {
            totalRevenue: revenue,
            type: plan?.type ?? "Plan",
            price: plan?.price ?? 0,
            description: plan?.name ?? "Parking plan",
            totalSold: sold,
            avgRevenue: sold ? revenue / sold : 0,
            avgDuration: 0,
            refunds: 0,
            netRevenue: revenue,
            recentTransactions: plan
                ? [
                      {
                          id: "TXN-1",
                          date: new Date().toLocaleString(),
                          customer: "Customer",
                          amount: plan.price,
                          status: "success",
                      },
                  ]
                : [],
        };
    },
};

export type PlanData = PlanTableRow;
export type RevenueByPlanData = PlanChartDatum;
export type PlansSoldData = PlanSoldDatum;
export type RevenueTrendData = PlanTrendDatum;
