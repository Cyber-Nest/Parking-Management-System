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
}

export interface VehicleHistoryStats {
    totalSessions: number;
    totalPayments: number;
    totalPenalties: number;
    totalPenaltyAmount: number;
    refunds: number;
}

export interface ParkingSession {
    id: string;
    startTime: string;
    endTime: string;
    location: string;
    amount: number;
    status: string;
}

export interface PenaltyTicket {
    id: string;
    ticketNumber: string;
    date: string;
    amount: number;
    status: string;
    reason: string;
}

export interface PaymentRecord {
    id: string;
    date: string;
    amount: number;
    method: string;
    status: string;
}

export interface RefundRecord {
    id: string;
    date: string;
    amount: number;
    status: string;
}

export interface NoteActivity {
    id: string;
    content: string;
    visibility?: string;
    createdAt?: string;
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

const notesByPlate: Record<string, NoteActivity[]> = {};
let lastPlate = "";

const loadHistory = async (licensePlate: string) =>
    getReport("vehicle-history", { license_plate: licensePlate }) as Promise<{ history: any[] }>;

export const vehicleHistoryService = {
    async getStats(params: VehicleHistoryFilters): Promise<VehicleHistoryStats> {
        const plate = params.licensePlate?.trim();
        if (!plate) {
            return {
                totalSessions: 0,
                totalPayments: 0,
                totalPenalties: 0,
                totalPenaltyAmount: 0,
                refunds: 0,
            };
        }
        const { history } = await loadHistory(plate);
        const totalPenalties = history.length;
        const totalPenaltyAmount = history.reduce((s, h) => s + (Number(h.amount) || 0), 0);
        return {
            totalSessions: 0,
            totalPayments: 0,
            totalPenalties,
            totalPenaltyAmount,
            refunds: 0,
        };
    },

    async getParkingSessions(_params: VehicleHistoryFilters): Promise<ParkingSession[]> {
        return [];
    },

    async getPenaltyTickets(params: VehicleHistoryFilters): Promise<PenaltyTicket[]> {
        const plate = params.licensePlate?.trim();
        if (!plate) return [];
        const { history } = await loadHistory(plate);
        return history.map((h: any) => ({
            id: h.id,
            ticketNumber: h.ticket_number,
            date: h.date_issued ? new Date(h.date_issued).toLocaleString() : "",
            amount: Number(h.amount) || 0,
            status: h.status,
            reason: h.reason || "",
        }));
    },

    async getPayments(_params: VehicleHistoryFilters): Promise<PaymentRecord[]> {
        return [];
    },

    async getRefunds(_params: VehicleHistoryFilters): Promise<RefundRecord[]> {
        return [];
    },

    async getNotesActivities(params: VehicleHistoryFilters): Promise<NoteActivity[]> {
        const plate = params.licensePlate?.trim() || "";
        lastPlate = plate;
        return notesByPlate[plate] ? [...notesByPlate[plate]] : [];
    },

    async getVehicleSummary(licensePlate: string): Promise<VehicleSummary> {
        const plate = licensePlate.trim();
        return {
            plate,
            licensePlate: plate,
            province: "—",
            vehicleColor: "",
            vehicleMake: "",
            vehicleModel: "—",
            totalTimeParked: "—",
            favoriteLocation: "—",
            firstSeen: "—",
            lastSeen: "—",
        };
    },

    async getCustomerInfo(licensePlate: string): Promise<CustomerInfo> {
        return {
            name: "—",
            email: "—",
            phone: "—",
            registeredDate: "—",
            customerType: "Standard",
        };
    },

    async exportReport(
        payload: VehicleHistoryFilters & { tab?: string; format: ReportExportFormat },
    ): Promise<{ blob: Blob; message?: string }> {
        const { format, tab: _tab, ...filters } = payload;
        const plate = String(filters.licensePlate || "").trim();
        return downloadReportExport("vehicle-history", format, { license_plate: plate });
    },

    async addNote(note: string): Promise<{ success: boolean; message: string }> {
        const plate = lastPlate;
        if (!plate) return { success: false, message: "Search a vehicle first" };
        if (!notesByPlate[plate]) notesByPlate[plate] = [];
        notesByPlate[plate].unshift({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            content: note,
            visibility: "internal",
            createdAt: new Date().toISOString(),
        });
        return { success: true, message: "Note added" };
    },
};
