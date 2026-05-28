export interface CreateTransactionDTO {
    amount: number;
    paymentMethod: 'credit_card' | 'debit_card' | 'apple_pay' | 'google_pay' | 'stripe';
    transactionType: 'parking_booking' | 'penalty_payment' | 'booking_extension' | 'refund' | 'adjustment';
    bookingId?: string;
    penaltyId?: string;
    userEmail: string;
    stripePaymentIntentId?: string;
    ipAddress?: string;
    userAgent?: string;
}
export interface TransactionResponse {
    id: string;
    transaction_reference: string;
    amount: number;
    status: string;
    created_at: Date;
}
export declare class TransactionService {
    createTransaction(dto: CreateTransactionDTO): Promise<TransactionResponse>;
    getTransaction(id: string): Promise<import("../repositories/transaction.repository").TransactionRow>;
    getTransactionByReference(reference: string): Promise<import("../repositories/transaction.repository").TransactionRow>;
    getTransactionsByEmail(email: string, page?: number, limit?: number): Promise<{
        count: number;
        rows: unknown[];
    }>;
    getTransactionByStripeId(stripePaymentIntentId: string): Promise<import("../repositories/transaction.repository").TransactionRow>;
    completeTransaction(id: string): Promise<void>;
    failTransaction(id: string, responseCode: string, responseMessage: string): Promise<void>;
    getTransactionStats(startDate?: Date, endDate?: Date): Promise<unknown[]>;
    getRevenueByDate(startDate: Date, endDate: Date): Promise<unknown[]>;
    getTodayRevenue(): Promise<{
        total: number;
        count: number;
    }>;
}
export declare const transactionService: TransactionService;
//# sourceMappingURL=transaction.service.d.ts.map