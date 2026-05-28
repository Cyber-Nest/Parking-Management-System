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
    payment_id?: string | null;
    remarks: string | null;
    note: string | null;
    dispute_raised: number;
    dispute_message?: string | null;
    dispute_at?: Date | null;
    dispute_resolved_at?: Date | null;
    created_at: Date;
    session_id?: string | null;
    location_name?: string | null;
    start_time?: Date | null;
    end_time?: Date | null;
    plan_name?: string | null;
    notes?: string | null;
}
export declare class TicketRepository {
    private nextTicketNumber;
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
    findByTicketNumber(ticketNumber: string): Promise<TicketRow | null>;
    raiseDispute(id: string, disputeMessage: string): Promise<number>;
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