export interface CreateInvoiceDTO {
    customerEmail: string;
    customerName?: string;
    vehiclePlateNumber?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    itemDescription: string;
    itemType: 'parking_booking' | 'penalty' | 'extension' | 'adjustment';
    quantity: number;
    unitPrice: number;
    subtotal: number;
    taxAmount: number;
    taxRate?: number;
    discountAmount?: number;
    serviceFee?: number;
    totalAmount: number;
    bookingId?: string;
    penaltyId?: string;
    transactionId?: string;
    parkingZone?: string;
    parkingLocation?: string;
    startTime?: Date;
    endTime?: Date;
    durationMinutes?: number;
}
export declare class InvoiceService {
    private readonly invoiceDir;
    constructor();
    createInvoice(dto: CreateInvoiceDTO): Promise<import("../repositories/invoice.repository").InvoiceRow>;
    getInvoice(id: string): Promise<import("../repositories/invoice.repository").InvoiceRow>;
    getInvoiceByNumber(invoiceNumber: string): Promise<import("../repositories/invoice.repository").InvoiceRow>;
    getInvoicesByEmail(email: string, page?: number, limit?: number): Promise<{
        count: number;
        rows: unknown[];
    }>;
    getInvoiceByBookingId(bookingId: string): Promise<import("../repositories/invoice.repository").InvoiceRow>;
    markAsPaid(invoiceId: string, paidAmount: number): Promise<import("../repositories/invoice.repository").InvoiceRow>;
    getInvoiceStats(): Promise<unknown[]>;
    getTodayInvoices(): Promise<{
        invoice_count: number;
        total_amount: number;
        paid_amount: number;
    }>;
    downloadInvoice(invoiceId: string): Promise<string | null>;
    private generatePDF;
}
export declare const invoiceService: InvoiceService;
//# sourceMappingURL=invoice.service.d.ts.map