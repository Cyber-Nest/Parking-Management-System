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
}
//# sourceMappingURL=ticket.service.d.ts.map