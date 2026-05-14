import { getReport } from "./reports.service";
import { downloadReportExport, type ReportExportFormat } from "./report-export.client";

export interface PaymentReconciliationFilters {
    dateRange: string;
    startDate: string;
    endDate: string;
    [key: string]: string;
}

export interface ReconciliationStats {
    totalCollected: number;
    deposited: number;
    refunds: number;
    adjustments: number;
}

export interface ReconciliationData {
    id: string;
    date: string;
    totalCollected: number;
    cardAmount: number;
    refunds: number;
    deposited: number;
    netExpected: number;
    variance: number;
    status: string;
    bankReference: string;
    otherAmount: number;
    adjustment: number;
    notes?: string;
}

export interface ChartData {
    name: string;
    collected: number;
    deposited: number;
    variance: number;
}

export interface PaymentMethodDatum {
    name: string;
    value: number;
    color: string;
}

const range = (f: PaymentReconciliationFilters) => ({
    from: f.startDate?.trim() || undefined,
    to: f.endDate?.trim() || undefined,
});

type RecRow = { payment_type: string; status: string; count: number; total_amount: number };

const load = async (filters: PaymentReconciliationFilters) =>
    getReport("payment-reconciliation", range(filters)) as Promise<{ reconciliation: RecRow[] }>;

export const paymentReconciliationService = {
    async getStats(filters: PaymentReconciliationFilters): Promise<ReconciliationStats> {
        const { reconciliation } = await load(filters);
        let totalCollected = 0;
        let deposited = 0;
        let refunds = 0;
        reconciliation.forEach((r) => {
            const amt = Number(r.total_amount) || 0;
            totalCollected += amt;
            if (r.status === "success") deposited += amt;
            if (r.status === "refunded") refunds += amt;
        });
        return { totalCollected, deposited, refunds, adjustments: 0 };
    },

    async getTableData(filters: PaymentReconciliationFilters): Promise<ReconciliationData[]> {
        const { reconciliation } = await load(filters);
        return reconciliation.map((r, i) => {
            const amt = Number(r.total_amount) || 0;
            const ref = r.status === "refunded" ? amt : 0;
            const dep = r.status === "success" ? amt : 0;
            return {
                id: String(i),
                date: `${r.payment_type} · ${r.status}`,
                totalCollected: amt,
                cardAmount: amt,
                refunds: -Math.abs(ref),
                deposited: dep,
                netExpected: dep,
                variance: 0,
                status: "Balanced",
                bankReference: "—",
                otherAmount: 0,
                adjustment: 0,
                notes: "",
            };
        });
    },

    async getChartData(filters: PaymentReconciliationFilters): Promise<ChartData[]> {
        const { reconciliation } = await load(filters);
        return reconciliation.map((r) => {
            const amt = Number(r.total_amount) || 0;
            const collected = amt;
            const deposited = r.status === "success" ? amt : 0;
            const variance = collected - deposited;
            return {
                name: `${r.payment_type} (${r.status})`,
                collected,
                deposited,
                variance,
            };
        });
    },

    async getPaymentMethodData(filters: PaymentReconciliationFilters): Promise<PaymentMethodDatum[]> {
        const { reconciliation } = await load(filters);
        const colors = ["#6366f1", "#22c55e", "#f97316", "#ec4899"];
        return reconciliation.map((r, i) => ({
            name: r.payment_type,
            value: Number(r.total_amount) || 0,
            color: colors[i % colors.length],
        }));
    },

    async exportReport(payload: PaymentReconciliationFilters & { format: ReportExportFormat }) {
        const { format, ...filters } = payload;
        const { from, to } = range(filters as PaymentReconciliationFilters);
        return downloadReportExport("payment-reconciliation", format, { from, to });
    },

    async getDetailsById(itemId: string): Promise<ReconciliationData> {
        const rows = await paymentReconciliationService.getTableData({
            dateRange: "",
            startDate: "",
            endDate: "",
        });
        const row = rows.find((r) => r.id === itemId);
        if (row) return row;
        return {
            id: itemId,
            date: "—",
            totalCollected: 0,
            cardAmount: 0,
            refunds: 0,
            deposited: 0,
            netExpected: 0,
            variance: 0,
            status: "—",
            bankReference: "—",
            otherAmount: 0,
            adjustment: 0,
            notes: "",
        };
    },
};

export type ReconciliationFilters = PaymentReconciliationFilters;
export type PaymentMethodData = PaymentMethodDatum;
