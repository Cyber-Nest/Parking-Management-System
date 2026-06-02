import { getReport } from "./reports.service";
import { downloadReportExport, type ReportExportFormat } from "./report-export.client";
import { listTickets } from "./tickets.service";

export interface PenaltyReportFilters {
    dateRange: string;
    location: string;
    officer: string;
    violationType: string;
    ticketStatus: string;
    paymentStatus: string;
    minAmount: string;
    maxAmount: string;
    startDate: string;
    endDate: string;
    parkingLotId?: string;
}

export interface PenaltyReportSummary {
    totalTickets: number;
    paidTickets: number;
    unpaidTickets: number;
    totalRevenue: number;
}

export interface PenaltyTicketData {
    date: string;
    ticketId: string;
    violationType: string;
    location: string;
    amount: number;
    status: string;
}

export interface PenaltyTrendData {
    name: string;
    count: number;
}

export interface ViolationTypeData {
    name: string;
    value: number;
    color: string;
}

export interface PenaltyNote {
    content: string;
    createdBy: string;
    createdAt: string;
}

export interface PenaltyTicketDetails {
    status: string;
    amount: number;
    issueDate: string;
    issueTime: string;
    location: string;
    plateNumber: string;
    vehicleModel: string;
    evidence: string[];
    officerName: string;
    officerId: string;
    notes?: PenaltyNote[];
    paymentInfo?: { method: string; date: string; transactionId?: string };
}

const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ec4899", "#14b8a6", "#a855f7"];

const range = (f: PenaltyReportFilters) => ({
    from: f.startDate?.trim() || undefined,
    to: f.endDate?.trim() || undefined,
    parking_lot_id: f.parkingLotId?.trim() || undefined,
});

const displayStatus = (s: string): string => {
    const lower = s.toLowerCase();
    if (lower === "paid") return "Paid";
    if (lower === "unpaid") return "Unpaid";
    if (lower === "cancelled") return "Cancelled";
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const loadPenalty = async (filters: PenaltyReportFilters) =>
    getReport("penalty", range(filters)) as Promise<{
        statusSummary: { status: string; count: number; total_amount: number }[];
        officerBreakdown: { officer_name: string; count: number; total_amount: number }[];
    }>;

export const penaltyReportService = {
    async getSummary(filters: PenaltyReportFilters): Promise<PenaltyReportSummary> {
        const { statusSummary } = await loadPenalty(filters);
        let total = 0;
        let paid = 0;
        let unpaid = 0;
        let revenue = 0;
        statusSummary.forEach((row) => {
            total += Number(row.count) || 0;
            revenue += Number(row.total_amount) || 0;
            const st = row.status.toLowerCase();
            if (st === "paid") paid += Number(row.count) || 0;
            if (st === "unpaid") unpaid += Number(row.count) || 0;
        });
        return { totalTickets: total, paidTickets: paid, unpaidTickets: unpaid, totalRevenue: revenue };
    },

    async getTicketsData(filters: PenaltyReportFilters): Promise<PenaltyTicketData[]> {
        const { items } = await listTickets({ ...range(filters), limit: 100, page: 1 });
        return items.map((t: any) => ({
            date: t.date_issued ? new Date(t.date_issued).toISOString().slice(0, 10) : "",
            ticketId: t.ticket_number || t.id,
            violationType: t.reason || "—",
            location: "—",
            amount: Number(t.amount) || 0,
            status: displayStatus(String(t.status)),
        }));
    },

    async getPenaltyTrend(filters: PenaltyReportFilters & { period: string }): Promise<PenaltyTrendData[]> {
        const tickets = await penaltyReportService.getTicketsData(filters);
        const byDay = new Map<string, number>();
        tickets.forEach((t) => {
            const d = t.date || "unknown";
            byDay.set(d, (byDay.get(d) || 0) + 1);
        });
        return Array.from(byDay.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-14)
            .map(([name, count]) => ({ name, count }));
    },

    async getViolationTypes(filters: PenaltyReportFilters): Promise<ViolationTypeData[]> {
        const { officerBreakdown } = await loadPenalty(filters);
        return officerBreakdown.map((o, i) => ({
            name: o.officer_name || "Officer",
            value: Number(o.count) || 0,
            color: COLORS[i % COLORS.length],
        }));
    },

    async exportReport(payload: PenaltyReportFilters & { tab?: string; format: ReportExportFormat }) {
        const { format, tab: _tab, ...filters } = payload;
        const { from, to, parking_lot_id } = range(filters as PenaltyReportFilters);
        return downloadReportExport("penalty", format, { from, to, parking_lot_id });
    },

    async getTicketDetails(ticketId: string): Promise<PenaltyTicketDetails> {
        const { items } = await listTickets({ q: ticketId, limit: 25, page: 1 });
        const t = items.find((x: any) => x.id === ticketId || x.ticket_number === ticketId) ?? items[0];
        if (!t) {
            throw new Error("Ticket not found");
        }
        const d = t.date_issued ? new Date(t.date_issued) : new Date();
        return {
            status: displayStatus(String(t.status)),
            amount: Number(t.amount) || 0,
            issueDate: d.toLocaleDateString(),
            issueTime: d.toLocaleTimeString(),
            location: "—",
            plateNumber: t.license_plate || "—",
            vehicleModel: "—",
            evidence: Array.isArray(t.photos) ? t.photos : [],
            officerName: t.officer_name || "—",
            officerId: t.officer_id || "—",
            paymentInfo:
                String(t.status).toLowerCase() === "paid" && t.paid_at
                    ? { method: "Card", date: new Date(t.paid_at).toLocaleString(), transactionId: t.id }
                    : undefined,
            notes: t.remarks
                ? [
                      {
                          content: String(t.remarks),
                          createdBy: t.officer_name || "Officer",
                          createdAt: d.toLocaleString(),
                      },
                  ]
                : [],
        };
    },
};
