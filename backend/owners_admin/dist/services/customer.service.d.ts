import { CustomerBookingPayload, CustomerBookingResponse, ParkingZonePublic } from '../types';
export declare class CustomerService {
    getParkingZoneById(zoneId: string): Promise<ParkingZonePublic>;
    /** Amount is in CAD dollars (e.g. 6.50 for $6.50). */
    createPaymentIntent(amount: number): Promise<{
        clientSecret: string;
        amount: number;
        currency: string;
    }>;
    getStripeConfig(): Promise<{
        stripePublishableKey: string;
    }>;
    getBookingByReference(reference: string): Promise<import("../repositories/booking.repository").BookingRow>;
    extendBooking(bookingId: string, payload: {
        durationLabel: string;
        durationMinutes: number;
        amount: number;
        stripePaymentIntentId: string;
    }): Promise<import("../repositories/booking.repository").BookingRow>;
    createBooking(payload: CustomerBookingPayload): Promise<CustomerBookingResponse>;
    getBookingWithInvoice(bookingId: string): Promise<{
        booking: import("../repositories/booking.repository").BookingRow;
        invoice: import("../repositories/invoice.repository").InvoiceRow;
    } | null>;
}
export declare const customerService: CustomerService;
//# sourceMappingURL=customer.service.d.ts.map