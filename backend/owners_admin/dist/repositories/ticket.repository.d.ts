import { TicketStatus } from '../types';
export interface TicketListFilters {
    page: number;
    limit: number;
    q?: string;
    status?: TicketStatus;
    officerId?: string;
    from?: string;
    to?: string;
}
export interface TicketRow {
    id: string;
    ticket_number: string;
    officer_id: string;
    officer_name: string;
    license_plate: string;
    amount: number;
    reason: string;
    status: TicketStatus;
    date_issued: Date;
    due_date: Date | null;
    paid_at: Date | null;
    remarks: string | null;
    note: string | null;
    dispute_raised: number;
    created_at: Date;
    session_id?: string | null;
    location_name?: string | null;
}
export declare class TicketRepository {
    private buildWhere;
    list(filters: TicketListFilters): Promise<{
        items: TicketRow[];
        total: number;
    }>;
    summary(): Promise<{
        totalToday: number;
        totalTickets: number;
        unpaidCount: number;
        paidCount: number;
        disputedCount: number;
        totalPenaltyAmount: number;
    }>;
    create(params: {
        officerId: string;
        officerName: string;
        licensePlate: string;
        amount: number;
        reason: string;
        status?: TicketStatus;
        dueDate?: string;
        sessionId?: string;
        remarks?: string;
    }): Promise<string>;
    findById(id: string): Promise<TicketRow | null>;
    updateTicket(id: string, params: {
        licensePlate?: string;
        amount?: number;
        reason?: string;
        dueDate?: string | null;
        locationName?: string | null;
    }): Promise<number>;
    appendRemarks(id: string, note: string): Promise<number>;
    setStatus(id: string, status: TicketStatus, extras?: {
        paidAt?: Date | null;
        paymentId?: string | null;
    }): Promise<number>;
}
//# sourceMappingURL=ticket.repository.d.ts.map