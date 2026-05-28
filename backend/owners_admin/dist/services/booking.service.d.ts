export interface CreateBookingDTO {
    parkingZoneId: string;
    parkingName: string;
    parkingLocation?: string;
    customerEmail: string;
    vehicleModel: string;
    vehiclePlateNumber: string;
    vehicleColor?: string;
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
    durationLabel: string;
    hourlyRate: number;
    basePrice: number;
    taxAmount: number;
    serviceFee: number;
    totalPrice: number;
    spotId?: string;
    zoneName?: string;
    parkingPlanId?: string;
}
export declare class BookingService {
    createBooking(dto: CreateBookingDTO): Promise<import("../repositories/booking.repository").BookingRow>;
    getBooking(id: string): Promise<import("../repositories/booking.repository").BookingRow>;
    getBookingByReference(reference: string): Promise<import("../repositories/booking.repository").BookingRow>;
    getBookingsByEmail(email: string, page?: number, limit?: number): Promise<{
        count: number;
        rows: unknown[];
    }>;
    getBookingsByPlate(plate: string): Promise<unknown[]>;
    getActiveBookings(): Promise<unknown[]>;
    confirmBooking(bookingId: string, paymentId: string): Promise<import("../repositories/booking.repository").BookingRow>;
    markAsActive(bookingId: string): Promise<import("../repositories/booking.repository").BookingRow>;
    markAsCompleted(bookingId: string): Promise<import("../repositories/booking.repository").BookingRow>;
    updateBooking(bookingId: string, data: any): Promise<import("../repositories/booking.repository").BookingRow>;
    getBookingStats(): Promise<unknown[]>;
    getTodayBookings(): Promise<{
        booking_count: number;
        total_revenue: number;
    }>;
}
export declare const bookingService: BookingService;
//# sourceMappingURL=booking.service.d.ts.map