"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingService = exports.BookingService = void 0;
const booking_repository_1 = require("../repositories/booking.repository");
class BookingService {
    async createBooking(dto) {
        const bookingReference = `PS-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const result = await booking_repository_1.bookingRepository.createBooking({
            booking_reference: bookingReference,
            parking_zone_id: dto.parkingZoneId,
            parking_name: dto.parkingName,
            parking_location: dto.parkingLocation,
            customer_email: dto.customerEmail,
            vehicle_model: dto.vehicleModel,
            vehicle_plate_number: dto.vehiclePlateNumber,
            vehicle_color: dto.vehicleColor,
            start_time: dto.startTime,
            end_time: dto.endTime,
            duration_minutes: dto.durationMinutes,
            duration_label: dto.durationLabel,
            parking_plan_id: dto.parkingPlanId ?? null,
            hourly_rate: dto.hourlyRate,
            base_price: dto.basePrice,
            tax_amount: dto.taxAmount,
            service_fee: dto.serviceFee,
            total_price: dto.totalPrice,
            currency: 'CAD',
            spot_id: dto.spotId,
            zone_name: dto.zoneName,
            grace_period_minutes: 15,
            metadata: {
                created_at: new Date().toISOString()
            }
        });
        return result;
    }
    async getBooking(id) {
        return await booking_repository_1.bookingRepository.findBookingById(id);
    }
    async getBookingByReference(reference) {
        return await booking_repository_1.bookingRepository.findByReference(reference);
    }
    async getBookingsByEmail(email, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        return await booking_repository_1.bookingRepository.findByEmail(email, limit, offset);
    }
    async getBookingsByPlate(plate) {
        return await booking_repository_1.bookingRepository.findByPlateNumber(plate);
    }
    async getActiveBookings() {
        return await booking_repository_1.bookingRepository.findActiveBookings();
    }
    async confirmBooking(bookingId, paymentId) {
        return booking_repository_1.bookingRepository.confirmBooking(bookingId, paymentId);
    }
    async markAsActive(bookingId) {
        return booking_repository_1.bookingRepository.markAsActive(bookingId);
    }
    async markAsCompleted(bookingId) {
        return booking_repository_1.bookingRepository.markAsCompleted(bookingId);
    }
    async updateBooking(bookingId, data) {
        return booking_repository_1.bookingRepository.updateBooking(bookingId, data);
    }
    async getBookingStats() {
        return await booking_repository_1.bookingRepository.getBookingStats();
    }
    async getTodayBookings() {
        return await booking_repository_1.bookingRepository.getTodayBookings();
    }
}
exports.BookingService = BookingService;
exports.bookingService = new BookingService();
//# sourceMappingURL=booking.service.js.map