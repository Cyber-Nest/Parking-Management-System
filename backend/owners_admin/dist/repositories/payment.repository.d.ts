import { PaymentMethod, PaymentStatus, PaymentType } from '../types';
export interface PaymentListFilters {
    page: number;
    limit: number;
    q?: string;
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    paymentType?: PaymentType;
    from?: string;
    to?: string;
}
export interface PaymentRow {
    id: string;
    session_id: string | null;
    ticket_id: string | null;
    user_id: string | null;
    license_plate: string;
    amount: number;
    payment_method: PaymentMethod;
    payment_type: PaymentType;
    status: PaymentStatus;
    transaction_ref: string | null;
    paid_at: Date | null;
    receipt_number: string | null;
    receipt_date: Date | null;
    created_at: Date;
}
export declare class PaymentRepository {
    private buildWhere;
    list(filters: PaymentListFilters): Promise<{
        items: PaymentRow[];
        total: number;
    }>;
    findById(id: string): Promise<PaymentRow | null>;
    summary(): Promise<{
        todayPayments: number;
        todayAmount: number;
        todayRevenue: number;
        parkingRevenue: number;
        penaltyRevenue: number;
        pendingAmount: number;
        failedAmount: number;
    }>;
    create(params: {
        sessionId?: string;
        ticketId?: string;
        userId?: string;
        licensePlate: string;
        amount: number;
        paymentMethod: PaymentMethod;
        paymentType: PaymentType;
        status?: PaymentStatus;
        transactionRef?: string;
        paidAt?: string;
    }): Promise<string>;
}
//# sourceMappingURL=payment.repository.d.ts.map