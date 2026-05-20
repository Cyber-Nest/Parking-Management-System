import { SendEmailOptions } from '../types';
/**
 * Send an email and log result to email_logs table
 */
export declare const sendEmail: (options: SendEmailOptions) => Promise<boolean>;
export declare const passwordResetTemplate: (name: string, resetLink: string) => string;
export interface PaymentReceiptData {
    bookingId?: string;
    customerName?: string;
    customerEmail: string;
    vehicleModel: string;
    vehiclePlateNumber: string;
    parkingName: string;
    parkingLocation: string;
    startTime: Date;
    endTime: Date;
    durationLabel: string;
    bookingReference: string;
    invoiceNumber: string;
    totalAmount: number;
    basePrice: number;
    serviceFee: number;
    frontendUrl?: string;
}
export declare const paymentReceiptTemplate: (data: PaymentReceiptData) => string;
export interface PenaltyNoticeData {
    customerEmail: string;
    licensePlate: string;
    ticketNumber: string;
    amount: number;
    reason: string;
    location: string;
    issuedAt: string;
    dueDate: string;
    frontendUrl?: string;
}
export declare const penaltyNoticeTemplate: (data: PenaltyNoticeData) => string;
export interface PenaltyPaymentData {
    customerEmail: string;
    licensePlate: string;
    ticketNumber: string;
    amount: number;
    paymentMethod: string;
    paidAt: string;
    reason: string;
}
export declare const penaltyPaymentTemplate: (data: PenaltyPaymentData) => string;
//# sourceMappingURL=email.d.ts.map