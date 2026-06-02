import { getReport } from "./reports.service";
import { downloadReportExport, type ReportExportFormat } from "./report-export.client";
import { getTicketById as fetchTicketById } from "./tickets.service";

export interface OutstandingDueFilters {
    dateRange: string;
    startDate: string;
    endDate: string;
    [key: string]: string;
}

export interface OutstandingDueStats {
    totalOutstanding: number;
    overdueCount: number;
    dueThisWeek: number;
    averageDueAmount: number;
    days0to7: number;
    days7to30: number;
    days30plus: number;
}

export interface OutstandingTicketRow {
    id: string;
    ticketNumber: string;
    ticketId: string;
    ticketDate: string;
    plate: string;
    plateNumber: string;
    amount: number;
    dueDate: string;
    officer: string;
    officerName: string;
    officerId: string;
    status: string;
    violationType: string;
    location: string;
    daysPending: number;
    notes: string;
}

const range = (f: OutstandingDueFilters) => ({
    from: f.startDate?.trim() || undefined,
    to: f.endDate?.trim() || undefined,
    parking_lot_id: f.parkingLotId?.trim() || undefined,
});

const dayMs = 1000 * 60 * 60 * 24;

const mapTicket = (t: any): OutstandingTicketRow => {
    const due = t.due_date ? new Date(t.due_date) : null;
    const issued = t.date_issued ? new Date(t.date_issued) : new Date();
    const today = new Date();
    const overdueDays = due
        ? Math.max(0, Math.ceil((today.getTime() - due.getTime()) / dayMs))
        : Math.max(0, Math.ceil((today.getTime() - issued.getTime()) / dayMs));
    const plate = t.license_plate || "—";
    return {
        id: t.id,
        ticketNumber: t.ticket_number,
        ticketId: t.ticket_number || t.id,
        ticketDate: issued.toLocaleDateString(),
        plate,
        plateNumber: plate,
        amount: Number(t.amount) || 0,
        dueDate: due ? due.toLocaleDateString() : "—",
        officer: t.officer_name || "—",
        officerName: t.officer_name || "—",
        officerId: t.officer_id || "—",
        status: "Unpaid",
        violationType: t.reason || "Penalty",
        location: t.location_name || t.location || "—",
        daysPending: overdueDays,
        notes: t.remarks || "",
    };
};

export const outstandingDueService = {
    async getStats(filters: OutstandingDueFilters): Promise<OutstandingDueStats> {
        const tickets = await outstandingDueService.getTickets(filters);
        const total = tickets.reduce((s, t) => s + t.amount, 0);
        const b0 = tickets.filter((t) => t.daysPending <= 7).reduce((s, t) => s + t.amount, 0);
        const b1 = tickets.filter((t) => t.daysPending > 7 && t.daysPending <= 30).reduce((s, t) => s + t.amount, 0);
        const b2 = tickets.filter((t) => t.daysPending > 30).reduce((s, t) => s + t.amount, 0);
        return {
            totalOutstanding: total,
            overdueCount: tickets.length,
            dueThisWeek: tickets.filter((t) => t.daysPending <= 7).length,
            averageDueAmount: tickets.length ? total / tickets.length : 0,
            days0to7: b0,
            days7to30: b1,
            days30plus: b2,
        };
    },

    async getTickets(filters: OutstandingDueFilters): Promise<OutstandingTicketRow[]> {
        const data = (await getReport("due", range(filters))) as { dueTickets: any[] };
        return (data.dueTickets ?? []).map(mapTicket);
    },

    async exportReport(payload: OutstandingDueFilters & { format: ReportExportFormat }) {
        const { format, ...filters } = payload;
        const { from, to, parking_lot_id } = range(filters as OutstandingDueFilters);
        return downloadReportExport("due", format, { from, to, parking_lot_id });
    },

    async getTicketById(ticketId: string): Promise<OutstandingTicketRow> {
        try {
            const t = await fetchTicketById(ticketId);
            return mapTicket(t);
        } catch {
            return {
                id: ticketId,
                ticketNumber: ticketId,
                ticketId,
                ticketDate: "—",
                plate: "—",
                plateNumber: "—",
                amount: 0,
                dueDate: "—",
                officer: "—",
                officerName: "—",
                officerId: "—",
                status: "—",
                violationType: "—",
                location: "—",
                daysPending: 0,
                notes: "",
            };
        }
    },
};

export type OutstandingFilters = OutstandingDueFilters;
export type OutstandingStats = OutstandingDueStats;
export type OutstandingTicket = OutstandingTicketRow;
