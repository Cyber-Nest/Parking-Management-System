export interface InvoiceFilters {
    page?: number;
    limit?: number;
    email?: string;
    status?: string;
    payment_status?: string;
    from?: string;
    to?: string;
}
export interface InvoiceRow {
    id: string;
    invoice_number: string;
    invoice_date: Date;
    due_date?: Date;
    customer_email: string;
    customer_name?: string;
    vehicle_plate_number?: string;
    item_type: string;
    total_amount: number;
    payment_status: string;
    paid_amount: number;
    status: string;
    booking_id?: string;
    penalty_id?: string;
    pdf_file_path?: string;
}
export declare class InvoiceRepository {
    createInvoice(data: Record<string, unknown>): Promise<InvoiceRow>;
    findInvoiceById(id: string): Promise<InvoiceRow>;
    findByNumber(invoiceNumber: string): Promise<InvoiceRow>;
    findByEmail(email: string, limit?: number, offset?: number): Promise<{
        count: number;
        rows: unknown[];
    }>;
    findByBookingId(bookingId: string): Promise<InvoiceRow>;
    findByTransactionId(transactionId: string): Promise<InvoiceRow>;
    findByPenaltyId(penaltyId: string): Promise<InvoiceRow>;
    findByStatus(status: string, limit?: number, offset?: number): Promise<{
        count: number;
        rows: unknown[];
    }>;
    findByPaymentStatus(paymentStatus: string, limit?: number, offset?: number): Promise<{
        count: number;
        rows: unknown[];
    }>;
    findByDateRange(startDate: Date, endDate: Date, limit?: number, offset?: number): Promise<{
        count: number;
        rows: unknown[];
    }>;
    updateInvoice(id: string, data: Record<string, unknown>): Promise<InvoiceRow>;
    markAsPaid(id: string, paidAmount: number): Promise<InvoiceRow>;
    markAsPartiallyPaid(id: string, paidAmount: number): Promise<InvoiceRow>;
    recordDownload(id: string): Promise<InvoiceRow>;
    getInvoiceStats(): Promise<unknown[]>;
    getRevenueByDate(startDate: Date, endDate: Date): Promise<unknown[]>;
    getTodayInvoices(): Promise<{
        invoice_count: number;
        total_amount: number;
        paid_amount: number;
    }>;
    deleteInvoice(id: string): Promise<import("mysql2").ResultSetHeader>;
}
export declare const invoiceRepository: InvoiceRepository;
//# sourceMappingURL=invoice.repository.d.ts.map