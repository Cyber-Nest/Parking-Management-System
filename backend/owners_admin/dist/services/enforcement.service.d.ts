import { EnforcementTicketInput, ManualEntryInput, OfficerEvidenceInput, OfficerEvidenceUpdateInput } from '../repositories/enforcement.repository';
export declare class EnforcementService {
    dashboard(officerId?: string): Promise<{
        ticketsToday: number;
        activeSessions: number;
        collectedToday: number;
        onDutyMinutes: number;
        onDutySeconds: number;
        recentScans: unknown[];
        activeSession: import("../repositories/enforcement.repository").EnforcementSessionRow;
        violationSummary: {
            reason: string;
            total: number;
        }[];
    }>;
    scanPlate(plate: string): Promise<{
        plate: string;
        status: "expired" | "violation" | "valid" | "not_found";
        session: import("../repositories/enforcement.repository").EnforcementSessionRow;
        openTicket: import("../repositories/enforcement.repository").EnforcementTicketRow | null;
        recentTickets: import("../repositories/enforcement.repository").EnforcementTicketRow[];
        customer: import("../repositories/enforcement.repository").PlateScanCustomer | null;
    }>;
    listTickets(query?: any): Promise<import("../repositories/enforcement.repository").EnforcementTicketRow[]>;
    listSessions(query?: any): Promise<(import("../repositories/enforcement.repository").EnforcementSessionRow & {
        amount_paid: number;
        payment_method: string | null;
        source: string;
    })[]>;
    listEvidence(limit?: string): Promise<import("../repositories/enforcement.repository").EvidencePhotoRow[]>;
    uploadPhoto(body: {
        photo?: string;
        label?: string;
    }): Promise<{
        id: string;
        photoUrl: string;
        label: string;
        uploadedAt: string;
    }>;
    captureEvidence(body: Partial<OfficerEvidenceInput>): Promise<import("../repositories/enforcement.repository").EvidencePhotoRow[]>;
    updateEvidence(id: string, body: Partial<OfficerEvidenceUpdateInput>): Promise<import("../repositories/enforcement.repository").EvidencePhotoRow>;
    deleteEvidence(id: string): Promise<{
        id: string;
    }>;
    createManualEntry(body: Partial<ManualEntryInput>): Promise<import("../repositories/enforcement.repository").EnforcementSessionRow>;
    vehicleHistory(plate: string, limit?: string): Promise<{
        plate: string;
        sessions: import("../repositories/enforcement.repository").EnforcementSessionRow[];
        tickets: import("../repositories/enforcement.repository").EnforcementTicketRow[];
        evidence: import("../repositories/enforcement.repository").EvidencePhotoRow[];
    }>;
    createTicket(body: Partial<EnforcementTicketInput>): Promise<{
        photos: string[];
        id: string;
        ticket_number: string;
        officer_id: string;
        officer_name: string;
        session_id: string | null;
        license_plate: string;
        location_name: string | null;
        amount: number;
        reason: string;
        status: import("../types").TicketStatus;
        date_issued: Date;
        due_date: Date | null;
        remarks: string | null;
        note: string | null;
        created_at: Date;
    }>;
    payTicket(id: string, body: {
        payment_method?: string;
        transaction_ref?: string;
        customer_email?: string;
    }): Promise<{
        payment_id: string;
        invoice_id?: string;
        invoice_number?: string;
    }>;
    addTicketEvidence(id: string, body: {
        photos?: string[];
        note?: string;
    }): Promise<{
        ticketId: string;
        photos: string[];
    }>;
    reviewTicket(id: string, note?: string): Promise<import("../types").TicketPublic>;
    createTicketsBatch(items: Partial<EnforcementTicketInput>[]): Promise<{
        success: boolean;
        id?: string;
        error?: string;
    }[]>;
    getPrintPayload(id: string): Promise<{
        ticketId: string;
        ticketNumber: string;
        issuedAt: Date;
        dueDate: Date | null;
        officerName: string;
        officerId: string;
        licensePlate: string;
        locationName: string | null;
        violationType: string;
        totalAmount: number;
        status: import("../types").TicketStatus;
        details: Record<string, unknown>;
        photos: string[];
        receiptLines: string[];
    }>;
    private parseLimit;
}
export declare const enforcementService: EnforcementService;
//# sourceMappingURL=enforcement.service.d.ts.map