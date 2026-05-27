import { TicketStatus } from '../types';
export interface EnforcementTicketInput {
    officerId: string;
    officerName: string;
    licensePlate: string;
    provinceState?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    vehicleType?: string;
    violationType: string;
    violationSubType?: string;
    fineAmount: number;
    lateFee?: number;
    locationName?: string;
    violationDateTime?: string;
    sessionId?: string | null;
    officerNotes?: string;
    violationDetails?: string;
    meterNumber?: string;
    zoneArea?: string;
    beatArea?: string;
    photos?: string[];
    status?: TicketStatus;
}
export interface EnforcementTicketRow {
    id: string;
    ticket_number: string;
    officer_id: string;
    officer_name: string;
    session_id: string | null;
    license_plate: string;
    location_name: string | null;
    amount: number;
    reason: string;
    status: TicketStatus;
    date_issued: Date;
    due_date: Date | null;
    remarks: string | null;
    note: string | null;
    created_at: Date;
}
export interface EnforcementSessionRow {
    id: string;
    license_plate: string;
    plan_name: string | null;
    location_name: string | null;
    start_time: Date;
    end_time: Date;
    duration_minutes: number;
    status: string;
    notes: string | null;
    created_by_officer: string | null;
    created_at: Date;
    user_id?: string | null;
    customer_name?: string | null;
    customer_email?: string | null;
    amount_paid?: number | null;
    payment_method?: string | null;
    paid_at?: Date | null;
}
export interface PlateScanCustomer {
    user_id: string | null;
    name: string;
    email: string | null;
}
export interface EvidencePhotoRow {
    id: string;
    ticket_id: string | null;
    ticket_number: string | null;
    license_plate: string;
    reason: string;
    photo_url: string;
    photo_taken_at: Date;
    uploaded_at: Date;
    source?: 'ticket' | 'standalone';
    location_name?: string | null;
    officer_name?: string | null;
    notes?: string | null;
}
export interface OfficerEvidenceInput {
    officerId: string;
    officerName: string;
    licensePlate: string;
    locationName?: string;
    evidenceType?: string;
    notes?: string;
    photos: string[];
}
export interface OfficerEvidenceUpdateInput {
    licensePlate?: string;
    locationName?: string;
    reason?: string;
    notes?: string;
}
export interface ManualEntryInput {
    officerId: string;
    licensePlate: string;
    provinceState?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    vehicleType?: string;
    planName?: string;
    durationMinutes?: number;
    locationName?: string;
    notes?: string;
}
export interface OfficerTicketListQuery {
    limit?: number;
    status?: string;
    violationType?: string;
    location?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
}
export interface OfficerSessionListQuery {
    limit?: number;
    status?: string;
    zone?: string;
    location?: string;
    search?: string;
    sort?: string;
}
export declare class EnforcementRepository {
    private nextTicketNumber;
    private evidenceTableReady;
    private photoCapacityReady;
    private ensureStandaloneEvidenceTable;
    private ensurePhotoCapacity;
    findDefaultOfficer(): Promise<{
        id: string;
        full_name: string;
    }>;
    dashboard(_officerId?: string): Promise<{
        ticketsToday: number;
        activeSessions: number;
        collectedToday: number;
        onDutyMinutes: number;
        onDutySeconds: number;
        recentScans: unknown[];
        activeSession: EnforcementSessionRow;
        violationSummary: {
            reason: string;
            total: number;
        }[];
    }>;
    findPlateStatus(plate: string): Promise<{
        plate: string;
        status: "expired" | "violation" | "valid" | "not_found";
        session: EnforcementSessionRow;
        openTicket: EnforcementTicketRow | null;
        recentTickets: EnforcementTicketRow[];
        customer: PlateScanCustomer | null;
    }>;
    listTickets(query?: OfficerTicketListQuery): Promise<EnforcementTicketRow[]>;
    listSessions(query?: OfficerSessionListQuery): Promise<(EnforcementSessionRow & {
        amount_paid: number;
        payment_method: string | null;
        source: string;
    })[]>;
    listEvidence(limit?: number): Promise<EvidencePhotoRow[]>;
    createStandaloneEvidence(input: OfficerEvidenceInput): Promise<EvidencePhotoRow[]>;
    updateEvidence(id: string, input: OfficerEvidenceUpdateInput): Promise<EvidencePhotoRow | null>;
    deleteEvidence(id: string): Promise<boolean>;
    createManualEntry(input: ManualEntryInput): Promise<EnforcementSessionRow>;
    vehicleHistory(plate: string, limit?: number): Promise<{
        plate: string;
        sessions: EnforcementSessionRow[];
        tickets: EnforcementTicketRow[];
        evidence: EvidencePhotoRow[];
    }>;
    createTicket(input: EnforcementTicketInput): Promise<{
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
        status: TicketStatus;
        date_issued: Date;
        due_date: Date | null;
        remarks: string | null;
        note: string | null;
        created_at: Date;
    } | null>;
    attachTicketPhoto(ticketId: string, photoUrl: string): Promise<void>;
    findTicketById(id: string): Promise<{
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
        status: TicketStatus;
        date_issued: Date;
        due_date: Date | null;
        remarks: string | null;
        note: string | null;
        created_at: Date;
    } | null>;
}
export declare const enforcementRepository: EnforcementRepository;
//# sourceMappingURL=enforcement.repository.d.ts.map