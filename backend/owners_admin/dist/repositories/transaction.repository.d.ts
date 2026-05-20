export interface TransactionFilters {
    page?: number;
    limit?: number;
    email?: string;
    status?: string;
    type?: string;
    from?: string;
    to?: string;
}
export interface TransactionRow {
    id: string;
    transaction_reference: string;
    amount: number;
    payment_method: string;
    transaction_type: string;
    status: string;
    user_email: string;
    booking_id?: string;
    penalty_id?: string;
    initiated_at: Date;
    completed_at?: Date;
    response_message?: string;
}
export declare class TransactionRepository {
    createTransaction(data: Record<string, unknown>): Promise<TransactionRow>;
    findTransactionById(id: string): Promise<TransactionRow>;
    findByReference(reference: string): Promise<TransactionRow>;
    findByEmail(email: string, limit?: number, offset?: number): Promise<{
        count: number;
        rows: unknown[];
    }>;
    findByStripeIntentId(stripePaymentIntentId: string): Promise<TransactionRow>;
    findByStatus(status: string, limit?: number, offset?: number): Promise<{
        count: number;
        rows: unknown[];
    }>;
    findByDateRange(startDate: Date, endDate: Date, limit?: number, offset?: number): Promise<{
        count: number;
        rows: unknown[];
    }>;
    findByType(transactionType: string, limit?: number, offset?: number): Promise<{
        count: number;
        rows: unknown[];
    }>;
    updateTransaction(id: string, data: Record<string, unknown>): Promise<TransactionRow>;
    markAsCompleted(id: string): Promise<TransactionRow>;
    markAsFailed(id: string, responseCode: string, responseMessage: string): Promise<TransactionRow>;
    getTransactionStats(startDate?: Date, endDate?: Date): Promise<unknown[]>;
    getRevenueByDate(startDate: Date, endDate: Date): Promise<unknown[]>;
    getTodayRevenue(): Promise<{
        total: number;
        count: number;
    }>;
    deleteTransaction(id: string): Promise<import("mysql2").ResultSetHeader>;
}
export declare const transactionRepository: TransactionRepository;
//# sourceMappingURL=transaction.repository.d.ts.map