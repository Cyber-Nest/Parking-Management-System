export interface BookingFilters {
    page?: number;
    limit?: number;
    email?: string;
    status?: string;
    from?: string;
    to?: string;
    plate?: string;
}
export interface BookingRow {
    id: string;
    booking_reference: string;
    customer_email: string;
    vehicle_plate_number: string;
    vehicle_model: string;
    vehicle_color?: string | null;
    parking_name: string;
    parking_location?: string | null;
    start_time: Date;
    end_time: Date;
    duration_minutes: number;
    duration_label?: string | null;
    total_price: number;
    booking_status: string;
    payment_status: string;
    allow_extension?: number;
    total_extensions?: number;
}
export declare class BookingRepository {
    createBooking(data: Record<string, unknown>): Promise<BookingRow>;
    findBookingById(id: string): Promise<BookingRow>;
    findByReference(reference: string): Promise<BookingRow>;
    findByEmail(email: string, limit?: number, offset?: number): Promise<{
        count: number;
        rows: unknown[];
    }>;
    findByPlateNumber(plate: string): Promise<unknown[]>;
    findByStatus(status: string, limit?: number, offset?: number): Promise<{
        count: number;
        rows: unknown[];
    }>;
    findActiveBookings(): Promise<unknown[]>;
    findByDateRange(startDate: Date, endDate: Date, limit?: number, offset?: number): Promise<{
        count: number;
        rows: unknown[];
    }>;
    updateBooking(id: string, data: Record<string, unknown>): Promise<BookingRow>;
    confirmBooking(id: string, paymentId: string): Promise<BookingRow>;
    markAsActive(id: string): Promise<BookingRow>;
    markAsCompleted(id: string): Promise<BookingRow>;
    getBookingStats(): Promise<unknown[]>;
    getTodayBookings(): Promise<{
        booking_count: number;
        total_revenue: number;
    }>;
    deleteBooking(id: string): Promise<import("mysql2").ResultSetHeader>;
}
export declare const bookingRepository: BookingRepository;
//# sourceMappingURL=booking.repository.d.ts.map