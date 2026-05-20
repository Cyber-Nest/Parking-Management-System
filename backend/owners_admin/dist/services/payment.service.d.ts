import { PaymentRow } from '../repositories/payment.repository';
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
    getById(id: string): Promise<PaymentRow>;
    getReceiptPayload(row: PaymentRow): {
        receipt_id: string;
        receipt_number: string | null;
        license_plate: string;
        amount: number;
        payment_method: import("../types").PaymentMethod;
        payment_type: import("../types").PaymentType;
        status: PaymentStatus;
        transaction_ref: string | null;
        paid_at: Date | null;
        receipt_date: Date | null;
        created_at: Date;
        session_id: string | null;
        ticket_id: string | null;
        line_items: {
            description: string;
            amount: number;
        }[];
        total: number;
    };
}
//# sourceMappingURL=payment.service.d.ts.map