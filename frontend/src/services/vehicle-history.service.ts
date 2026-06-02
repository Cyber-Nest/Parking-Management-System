import { getReport } from "./reports.service";
import { downloadReportExport, type ReportExportFormat } from "./report-export.client";

export interface VehicleHistoryFilters {
    licensePlate: string;
    customerName: string;
    dateRange: string;
    location: string;
    searchIn: string;
    startDate: string;
    endDate: string;
    parkingLotId?: string;
}

export interface VehicleHistoryStats {
    totalSessions: number;
    totalPayments: number;
    totalPenalties: number;
    totalPenaltyAmount: number;
    refunds: number;
}

/** Table row shapes expected by `reports/vehicle-history/page.tsx` */
export interface SessionTableRow {
    entryTime: string;
    exitTime: string;
    location: string;
    planType: string;
    duration: string;
    amount: number;
    paymentMethod: string;
    status: string;
    receiptId: string;
}

export interface PenaltyTableRow {
    ticketNo: string;
    issuedDate: string;
    issuedTime: string;
    location: string;
    violationType: string;
    amount: number;
    status: string;
    paidDate: string;
    receiptId: string;
}

export interface PaymentTableRow {
    paymentId: string;
    dateTime: string;
    type: string;
    description: string;
    amount: number;
    method: string;
    status: string;
    receiptId: string;
}

export interface RefundTableRow {
    refundId: string;
    relatedTo: string;
    relatedType: string;
    refundType: string;
    dateTime: string;
    refundAmount: number;
    reason: string;
    status: string;
    processedBy: string;
}

export interface NoteActivity {
    id: string;
    content: string;
    visibility?: string;
    createdAt?: string;
    addedBy?: string;
    dateTime?: string;
}

export interface VehicleSummary {
    plate: string;
    make?: string;
    model?: string;
    licensePlate: string;
    province: string;
    vehicleColor: string;
    vehicleMake: string;
    vehicleModel: string;
    totalTimeParked: string;
    favoriteLocation: string;
    firstSeen: string;
    lastSeen: string;
}

export interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    registeredDate: string;
    customerType: string;
}

type VehicleHistoryApi = {
    history: any[];
    parking_sessions: any[];
    payments: any[];
    refunds: any[];
    summary: {
        total_sessions: number;
        total_payments_amount: number;
        total_penalties: number;
        total_penalty_amount: number;
        refunds_amount: number;
    };
    vehicle: {
        first_seen: string | Date | null;
        last_seen: string | Date | null;
        total_duration_minutes: number;
        favorite_location: string | null;
    } | null;
};

const notesByPlate: Record<string, NoteActivity[]> = {};

const fmtMethod = (m: string) =>
    String(m || "—")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

const fmtDate = (d: string | Date | null | undefined) => {
    if (!d) return "—";
    const dt = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleDateString();
};

const fmtTime = (d: string | Date | null | undefined) => {
    if (!d) return "";
    const dt = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const fmtDateTime = (d: string | Date | null | undefined) => {
    if (!d) return "—";
    const dt = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const durationLabel = (minutes: number | null | undefined) => {
    const m = Math.max(0, Math.round(Number(minutes) || 0));
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r ? `${h}h ${r}m` : `${h}h`;
};

const totalParkedLabel = (minutes: number) => durationLabel(minutes);

const queryParams = (f: VehicleHistoryFilters) => {
    const plate = f.licensePlate?.trim();
    const from = f.startDate?.trim() || undefined;
    const to = f.endDate?.trim() || undefined;
    const location = f.location?.trim() || undefined;
    const parking_lot_id = f.parkingLotId?.trim() || undefined;
    return { license_plate: plate, from, to, location, parking_lot_id };
};

const mapSessions = (rows: any[]): SessionTableRow[] =>
    (rows || []).map((ps) => ({
        entryTime: fmtDateTime(ps.start_time),
        exitTime: ps.end_time ? fmtDateTime(ps.end_time) : "—",
        location: ps.location_name || "—",
        planType: ps.plan_name || "—",
        duration: durationLabel(ps.duration_minutes),
        amount: Math.round((Number(ps.amount_paid) || 0) * 100) / 100,
        paymentMethod: fmtMethod(ps.payment_method || ""),
        status: ps.status || "—",
        receiptId: ps.receipt_number || "—",
    }));

const mapPenalties = (rows: any[]): PenaltyTableRow[] =>
    (rows || []).map((h) => ({
        ticketNo: h.ticket_number || h.id,
        issuedDate: fmtDate(h.date_issued),
        issuedTime: fmtTime(h.date_issued),
        location: h.location_name || "—",
        violationType: h.reason || "Penalty",
        amount: Math.round((Number(h.amount) || 0) * 100) / 100,
        status: h.status || "—",
        paidDate: h.paid_at ? fmtDateTime(h.paid_at) : "",
        receiptId: h.receipt_number || "—",
    }));

const mapPayments = (rows: any[]): PaymentTableRow[] =>
    (rows || []).map((p) => ({
        paymentId: String(p.id || "").slice(0, 8).toUpperCase(),
        dateTime: fmtDateTime(p.paid_at),
        type: p.payment_type || "—",
        description: [p.payment_type, p.session_id ? `Session ${String(p.session_id).slice(0, 8)}` : "", p.ticket_id ? `Ticket ${String(p.ticket_id).slice(0, 8)}` : ""]
            .filter(Boolean)
            .join(" · ") || "Payment",
        amount: Math.round((Number(p.amount) || 0) * 100) / 100,
        method: fmtMethod(p.payment_method),
        status: p.status || "—",
        receiptId: p.receipt_number || "—",
    }));

const mapRefunds = (rows: any[]): RefundTableRow[] =>
    (rows || []).map((p) => ({
        refundId: String(p.id || "").slice(0, 8).toUpperCase(),
        relatedTo: p.ticket_id ? `Ticket` : p.session_id ? `Session` : "Payment",
        relatedType: "",
        refundType: p.payment_type || "refund",
        dateTime: fmtDateTime(p.paid_at),
        refundAmount: Math.round((Number(p.amount) || 0) * 100) / 100,
        reason: p.transaction_ref ? `Ref: ${p.transaction_ref}` : "Refund",
        status: p.status || "refunded",
        processedBy: "System",
    }));

const mapVehicleSummary = (plate: string, vehicle: VehicleHistoryApi["vehicle"]): VehicleSummary => {
    const mins = vehicle?.total_duration_minutes ?? 0;
    return {
        plate,
        licensePlate: plate,
        province: "—",
        vehicleColor: "",
        vehicleMake: "",
        vehicleModel: "—",
        totalTimeParked: vehicle ? totalParkedLabel(mins) : "—",
        favoriteLocation: vehicle?.favorite_location || "—",
        firstSeen: vehicle?.first_seen ? fmtDateTime(vehicle.first_seen) : "—",
        lastSeen: vehicle?.last_seen ? fmtDateTime(vehicle.last_seen) : "—",
    };
};

export const vehicleHistoryService = {
    async fetchReport(filters: VehicleHistoryFilters): Promise<{
        stats: VehicleHistoryStats;
        sessions: SessionTableRow[];
        penalties: PenaltyTableRow[];
        payments: PaymentTableRow[];
        refunds: RefundTableRow[];
        vehicleSummary: VehicleSummary;
        customerInfo: CustomerInfo;
    }> {
        const plate = filters.licensePlate?.trim();
        if (!plate) {
            return {
                stats: {
                    totalSessions: 0,
                    totalPayments: 0,
                    totalPenalties: 0,
                    totalPenaltyAmount: 0,
                    refunds: 0,
                },
                sessions: [],
                penalties: [],
                payments: [],
                refunds: [],
                vehicleSummary: mapVehicleSummary("", null),
                customerInfo: {
                    name: "—",
                    email: "—",
                    phone: "—",
                    registeredDate: "—",
                    customerType: "Standard",
                },
            };
        }

        const data = (await getReport("vehicle-history", queryParams(filters))) as VehicleHistoryApi;
        const s = data.summary || {
            total_sessions: 0,
            total_payments_amount: 0,
            total_penalties: 0,
            total_penalty_amount: 0,
            refunds_amount: 0,
        };

        return {
            stats: {
                totalSessions: Number(s.total_sessions) || 0,
                totalPayments: Math.round((Number(s.total_payments_amount) || 0) * 100) / 100,
                totalPenalties: Number(s.total_penalties) || 0,
                totalPenaltyAmount: Math.round((Number(s.total_penalty_amount) || 0) * 100) / 100,
                refunds: Math.round((Number(s.refunds_amount) || 0) * 100) / 100,
            },
            sessions: mapSessions(data.parking_sessions),
            penalties: mapPenalties(data.history),
            payments: mapPayments(data.payments),
            refunds: mapRefunds(data.refunds),
            vehicleSummary: mapVehicleSummary(plate, data.vehicle),
            customerInfo: {
                name: "—",
                email: "—",
                phone: "—",
                registeredDate: "—",
                customerType: "Standard",
            },
        };
    },

    async getStats(params: VehicleHistoryFilters): Promise<VehicleHistoryStats> {
        return (await vehicleHistoryService.fetchReport(params)).stats;
    },

    async getParkingSessions(params: VehicleHistoryFilters): Promise<SessionTableRow[]> {
        return (await vehicleHistoryService.fetchReport(params)).sessions;
    },

    async getPenaltyTickets(params: VehicleHistoryFilters): Promise<PenaltyTableRow[]> {
        return (await vehicleHistoryService.fetchReport(params)).penalties;
    },

    async getPayments(params: VehicleHistoryFilters): Promise<PaymentTableRow[]> {
        return (await vehicleHistoryService.fetchReport(params)).payments;
    },

    async getRefunds(params: VehicleHistoryFilters): Promise<RefundTableRow[]> {
        return (await vehicleHistoryService.fetchReport(params)).refunds;
    },

    async getNotesActivities(params: VehicleHistoryFilters): Promise<NoteActivity[]> {
        const plate = params.licensePlate?.trim() || "";
        const list = notesByPlate[plate] ? [...notesByPlate[plate]] : [];
        return list.map((n) => ({
            ...n,
            addedBy: n.addedBy || "Admin",
            dateTime: n.createdAt ? fmtDateTime(n.createdAt) : "—",
        }));
    },

    async getVehicleSummary(licensePlate: string): Promise<VehicleSummary> {
        const plate = licensePlate.trim();
        if (!plate) return mapVehicleSummary("", null);
        const { vehicleSummary } = await vehicleHistoryService.fetchReport({
            licensePlate: plate,
            customerName: "",
            dateRange: "",
            location: "All Locations",
            searchIn: "All Records",
            startDate: "",
            endDate: "",
        });
        return vehicleSummary;
    },

    async getCustomerInfo(licensePlate: string): Promise<CustomerInfo> {
        const plate = licensePlate.trim();
        if (!plate) {
            return { name: "—", email: "—", phone: "—", registeredDate: "—", customerType: "Standard" };
        }
        return (await vehicleHistoryService.fetchReport({
            licensePlate: plate,
            customerName: "",
            dateRange: "",
            location: "All Locations",
            searchIn: "All Records",
            startDate: "",
            endDate: "",
        })).customerInfo;
    },

    async exportReport(
        payload: VehicleHistoryFilters & { tab?: string; format: ReportExportFormat },
    ): Promise<{ blob: Blob; message?: string }> {
        const { format, tab: _tab, ...filters } = payload;
        const q = queryParams(filters as VehicleHistoryFilters);
        return downloadReportExport("vehicle-history", format, {
            license_plate: q.license_plate,
            from: q.from,
            to: q.to,
            location: q.location,
            parking_lot_id: q.parking_lot_id,
        });
    },

    async addNote(
        note: string,
        visibility?: string,
        licensePlate?: string,
    ): Promise<{ success: boolean; message: string }> {
        const plate = (licensePlate || "").trim();
        if (!plate) return { success: false, message: "Search a vehicle first" };
        if (!notesByPlate[plate]) notesByPlate[plate] = [];
        notesByPlate[plate].unshift({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            content: note,
            visibility: visibility || "internal",
            createdAt: new Date().toISOString(),
            addedBy: "Admin",
        });
        return { success: true, message: "Note added" };
    },

    updateNote(
        licensePlate: string,
        noteId: string,
        content: string,
        visibility: string,
    ): { success: boolean; message: string } {
        const plate = licensePlate.trim();
        if (!plate || !notesByPlate[plate]) return { success: false, message: "No notes for this plate" };
        const n = notesByPlate[plate].find((x) => x.id === noteId);
        if (!n) return { success: false, message: "Note not found" };
        n.content = content;
        n.visibility = visibility;
        return { success: true, message: "Note updated" };
    },

    deleteNote(licensePlate: string, noteId: string): void {
        const plate = licensePlate.trim();
        if (!plate || !notesByPlate[plate]) return;
        notesByPlate[plate] = notesByPlate[plate].filter((n) => n.id !== noteId);
    },
};

/** @deprecated Use SessionTableRow — kept for existing imports */
export type ParkingSession = SessionTableRow;
export type PenaltyTicket = PenaltyTableRow;
export type PaymentRecord = PaymentTableRow;
export type RefundRecord = RefundTableRow;
