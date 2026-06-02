import { getReport } from "./reports.service";
import { downloadReportExport, type ReportExportFormat } from "./report-export.client";

export interface RefundsFilters {
    dateRange: string;
    startDate: string;
    endDate: string;
    [key: string]: string;
}

export interface RefundsStats {
    totalRefunded: number;
    refundCount: number;
    averageRefund: number;
    pendingCount: number;
    totalRefunds: number;
    totalAdjustments: number;
    netAmount: number;
    totalTransactions: number;
}

export interface RefundAdjustmentData {
    id: string;
    date: string;
    plate: string;
    amount: number;
    method: string;
    status: string;
    type?: string;
    referenceId: string;
    dateTime?: string;
    reason: string;
    plateUser: string;
    processedBy?: string;
    paymentMethod?: string;
    transactionId?: string;
    relatedTo?: string;
}

export interface RefundTimeDatum {
    date: string;
    amount: number;
}

export interface RefundReasonDatum {
    name: string;
    value: number;
    color: string;
}

const queryParams = (f: RefundsFilters) => ({
    from: f.startDate?.trim() || undefined,
    to: f.endDate?.trim() || undefined,
    parking_lot_id: f.parkingLotId?.trim() || undefined,
});

export const refundsAdjustmentsService = {
    async getStats(filters: RefundsFilters): Promise<RefundsStats> {
        const data = (await getReport("refunds", { limit: 200, ...queryParams(filters) })) as {
            summary: { refund_count: number; total_refunded: number };
        };
        const c = Number(data.summary?.refund_count) || 0;
        const t = Number(data.summary?.total_refunded) || 0;
        return {
            totalRefunded: t,
            refundCount: c,
            averageRefund: c ? t / c : 0,
            pendingCount: 0,
            totalRefunds: t,
            totalAdjustments: 0,
            netAmount: t,
            totalTransactions: c,
        };
    },

    async getTableData(filters: RefundsFilters): Promise<RefundAdjustmentData[]> {
        const data = (await getReport("refunds", { limit: 100, ...queryParams(filters) })) as {
            records: {
                id: string;
                paid_at: string | null;
                license_plate: string;
                amount: number;
                payment_method: string;
                status: string;
            }[];
        };
        return (data.records ?? []).map((r) => ({
            id: r.id,
            date: r.paid_at ? new Date(r.paid_at).toLocaleString() : "—",
            plate: r.license_plate,
            amount: Number(r.amount) || 0,
            method: r.payment_method,
            status: r.status,
            paymentMethod: r.payment_method,
            transactionId: r.id,
            relatedTo: r.license_plate,
            referenceId: r.id,
            dateTime: r.paid_at ? new Date(r.paid_at).toLocaleString() : "—",
            reason: "Refund",
            plateUser: r.license_plate,
            processedBy: "System",
        }));
    },

    async getOverTimeData(days: number): Promise<RefundTimeDatum[]> {
        void days;
        const rows = await refundsAdjustmentsService.getTableData({
            dateRange: "",
            startDate: "",
            endDate: "",
        });
        return rows.slice(0, 14).map((r) => ({ date: r.date, amount: r.amount }));
    },

    async getReasonData(): Promise<RefundReasonDatum[]> {
        return [{ name: "Refund", value: 1, color: "#6366f1" }];
    },

    async exportReport(payload: RefundsFilters & { format: ReportExportFormat }) {
        const { format, ...filters } = payload;
        return downloadReportExport("refunds", format, { limit: 200, ...queryParams(filters as RefundsFilters) });
    },

    async getDetailsById(itemId: string): Promise<RefundAdjustmentData> {
        const rows = await refundsAdjustmentsService.getTableData({
            dateRange: "",
            startDate: "",
            endDate: "",
        });
        const base = rows.find((r) => r.id === itemId);
        if (!base) {
            return {
                id: itemId,
                date: "—",
                plate: "—",
                amount: 0,
                method: "—",
                status: "—",
                type: "Refund",
                referenceId: itemId,
                dateTime: "—",
                reason: "—",
                plateUser: "—",
                processedBy: "—",
                paymentMethod: "—",
                transactionId: itemId,
                relatedTo: "—",
            };
        }
        return {
            ...base,
            type: "Refund",
            referenceId: base.id,
            dateTime: base.date,
            reason: "Customer request",
            plateUser: base.plate,
            processedBy: "System",
        };
    },
};

export type RefundAdjustmentFilters = RefundsFilters;
export type RefundAdjustmentStats = RefundsStats;
export type OverTimeData = RefundTimeDatum;
export type ReasonData = RefundReasonDatum;
