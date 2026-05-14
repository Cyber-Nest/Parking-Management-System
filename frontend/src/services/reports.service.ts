import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";
import { getResponseData } from "./response.helper";
import { downloadReportExport, type ReportExportFormat } from "./report-export.client";

export interface ReportQueryParams {
    from?: string;
    to?: string;
    limit?: number;
    license_plate?: string;
}

export const getReport = async (type: string, params: ReportQueryParams = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.GET(type), {
        params,
    });
    return getResponseData(response);
};

const pickRange = (filters: { startDate?: string; endDate?: string }): { from?: string; to?: string } => {
    const from = filters.startDate?.trim() || undefined;
    const to = filters.endDate?.trim() || undefined;
    return { from, to };
};

export interface RevenueFilters {
    paymentMethod: string;
    revenueType: string;
    planType: string;
    startDate: string;
    endDate: string;
}

export interface RevenueSummary {
    totalRevenue: number;
    parkingRevenue: number;
    penaltyRevenue: number;
    refunds: number;
}

export interface RevenueDaily {
    date: string;
    parkingRevenue: number;
    penaltyRevenue: number;
    refunds: number;
    netRevenue: number;
    transactions: number;
}

export interface RevenueByType {
    name: string;
    value: number;
    color: string;
}

export interface RevenueByPaymentMethod {
    name: string;
    value: number;
    color: string;
}

export interface RevenueTimeData {
    date: string;
    revenue: number;
}

type RevenueApiTotals = {
    total_revenue: number;
    total_transactions: number;
    successful_transactions: number;
    failed_transactions: number;
    refunded_amount: number;
};

type RevenueApiDaily = {
    report_date: string;
    total_amount: number;
    transaction_count: number;
};

const CHART_COLORS = ["#6366f1", "#22c55e", "#f97316", "#ec4899", "#14b8a6", "#a855f7"];

const loadRevenue = async (filters: RevenueFilters) => {
    const { from, to } = pickRange(filters);
    return getReport("revenue", { from, to }) as Promise<{
        totals: RevenueApiTotals;
        daily: RevenueApiDaily[];
    }>;
};

export const reportsService = {
    async getRevenueSummary(filters: RevenueFilters): Promise<RevenueSummary> {
        const { totals } = await loadRevenue(filters);
        const total = Number(totals.total_revenue) || 0;
        const refunded = Number(totals.refunded_amount) || 0;
        return {
            totalRevenue: total,
            parkingRevenue: total,
            penaltyRevenue: 0,
            refunds: -Math.abs(refunded),
        };
    },

    async getRevenueDaily(filters: RevenueFilters): Promise<RevenueDaily[]> {
        const { daily } = await loadRevenue(filters);
        return daily.map((row) => {
            const net = Number(row.total_amount) || 0;
            const tx = Number(row.transaction_count) || 0;
            const d = row.report_date ? String(row.report_date).slice(0, 10) : "";
            return {
                date: d,
                parkingRevenue: net,
                penaltyRevenue: 0,
                refunds: 0,
                netRevenue: net,
                transactions: tx,
            };
        });
    },

    async getRevenueByType(_filters: RevenueFilters): Promise<RevenueByType[]> {
        return [
            { name: "Recorded", value: 1, color: CHART_COLORS[0] },
            { name: "Other", value: 0, color: CHART_COLORS[1] },
        ];
    },

    async getRevenueByPaymentMethod(_filters: RevenueFilters): Promise<RevenueByPaymentMethod[]> {
        return [
            { name: "All methods", value: 1, color: CHART_COLORS[2] },
            { name: "—", value: 0, color: CHART_COLORS[3] },
        ];
    },

    async getRevenueTimeData(filters: RevenueFilters & { period: string }): Promise<RevenueTimeData[]> {
        const daily = await reportsService.getRevenueDaily(filters);
        return daily.map((r) => ({ date: r.date, revenue: r.netRevenue }));
    },

    async exportRevenueReport(filters: RevenueFilters & { format: ReportExportFormat }) {
        const { format, ...rest } = filters;
        const { from, to } = pickRange(rest);
        return downloadReportExport("revenue", format, { from, to });
    },
};
