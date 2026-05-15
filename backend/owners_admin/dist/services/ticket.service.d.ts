import { CreateTicketBody, PaginatedResponse, TicketPublic, TicketStatus } from '../types';
export declare class TicketService {
    list(query: Record<string, string | undefined>): Promise<PaginatedResponse<TicketPublic>>;
    summary(): Promise<{
        totalToday: number;
        totalTickets: number;
        unpaidCount: number;
        paidCount: number;
        disputedCount: number;
        totalPenaltyAmount: number;
    }>;
    create(body: CreateTicketBody & {
        officer_id: string;
        officer_name: string;
        status?: TicketStatus;
        remarks?: string;
    }): Promise<{
        id: string;
    }>;
    getById(id: string): Promise<TicketPublic>;
    updateTicket(id: string, body: {
        license_plate?: string;
        amount?: number;
        reason?: string;
        due_date?: string | null;
        location_name?: string | null;
    }): Promise<TicketPublic>;
    addNote(id: string, note: string): Promise<void>;
    cancelTicket(id: string): Promise<void>;
    markPaid(id: string, body?: {
        payment_method?: string;
        transaction_ref?: string;
    }): Promise<{
        payment_id: string;
    }>;
}
//# sourceMappingURL=ticket.service.d.ts.map