import { CreatePaymentBody, PaginatedResponse, PaymentPublic, PaymentStatus } from '../types';
export declare class PaymentService {
    list(query: Record<string, string | undefined>): Promise<PaginatedResponse<PaymentPublic>>;
    summary(): Promise<{
        todayPayments: number;
        todayAmount: number;
        todayRevenue: number;
        parkingRevenue: number;
        penaltyRevenue: number;
        pendingAmount: number;
        failedAmount: number;
    }>;
    create(body: CreatePaymentBody & {
        status?: PaymentStatus;
        user_id?: string;
        paid_at?: string;
    }): Promise<{
        id: string;
    }>;
}
//# sourceMappingURL=payment.service.d.ts.map