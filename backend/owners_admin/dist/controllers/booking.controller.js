"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = exports.BookingController = void 0;
const booking_service_1 = require("../services/booking.service");
class BookingController {
    async createBooking(req, res) {
        try {
            const { parkingZoneId, parkingName, parkingLocation, customerEmail, vehicleModel, vehiclePlateNumber, vehicleColor, startTime, endTime, durationMinutes, durationLabel, hourlyRate, basePrice, taxAmount, serviceFee, totalPrice, spotId, zoneName } = req.body;
            if (!parkingZoneId || !customerEmail || !vehicleModel || !vehiclePlateNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }
            const booking = await booking_service_1.bookingService.createBooking({
                parkingZoneId,
                parkingName,
                parkingLocation,
                customerEmail,
                vehicleModel,
                vehiclePlateNumber,
                vehicleColor,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                durationMinutes,
                durationLabel,
                hourlyRate,
                basePrice,
                taxAmount,
                serviceFee,
                totalPrice,
                spotId,
                zoneName
            });
            return res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                data: booking
            });
        }
        catch (error) {
            console.error('Error creating booking:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create booking'
            });
        }
    }
    async getBooking(req, res) {
        try {
            const { id } = req.params;
            const booking = await booking_service_1.bookingService.getBooking(id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: booking
            });
        }
        catch (error) {
            console.error('Error fetching booking:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch booking'
            });
        }
    }
    async getBookingByReference(req, res) {
        try {
            const { reference } = req.params;
            const booking = await booking_service_1.bookingService.getBookingByReference(reference);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: booking
            });
        }
        catch (error) {
            console.error('Error fetching booking:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch booking'
            });
        }
    }
    async getBookingsByEmail(req, res) {
        try {
            const { email } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const result = await booking_service_1.bookingService.getBookingsByEmail(email, page, limit);
            return res.status(200).json({
                success: true,
                data: result.rows,
                pagination: {
                    total: result.count,
                    page,
                    limit,
                    pages: Math.ceil(result.count / limit)
                }
            });
        }
        catch (error) {
            console.error('Error fetching bookings:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch bookings'
            });
        }
    }
    async getActiveBookings(req, res) {
        try {
            const bookings = await booking_service_1.bookingService.getActiveBookings();
            return res.status(200).json({
                success: true,
                data: bookings
            });
        }
        catch (error) {
            console.error('Error fetching active bookings:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch active bookings'
            });
        }
    }
    async confirmBooking(req, res) {
        try {
            const { id } = req.params;
            const { paymentId } = req.body;
            if (!paymentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required field: paymentId'
                });
            }
            const booking = await booking_service_1.bookingService.confirmBooking(id, paymentId);
            return res.status(200).json({
                success: true,
                message: 'Booking confirmed successfully',
                data: booking
            });
        }
        catch (error) {
            console.error('Error confirming booking:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to confirm booking'
            });
        }
    }
    async markAsActive(req, res) {
        try {
            const { id } = req.params;
            const booking = await booking_service_1.bookingService.markAsActive(id);
            return res.status(200).json({
                success: true,
                message: 'Booking marked as active',
                data: booking
            });
        }
        catch (error) {
            console.error('Error marking booking as active:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to mark booking as active'
            });
        }
    }
    async markAsCompleted(req, res) {
        try {
            const { id } = req.params;
            const booking = await booking_service_1.bookingService.markAsCompleted(id);
            return res.status(200).json({
                success: true,
                message: 'Booking marked as completed',
                data: booking
            });
        }
        catch (error) {
            console.error('Error marking booking as completed:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to mark booking as completed'
            });
        }
    }
    async getBookingStats(req, res) {
        try {
            const stats = await booking_service_1.bookingService.getBookingStats();
            return res.status(200).json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Error fetching stats:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch booking stats'
            });
        }
    }
    async getTodayBookings(req, res) {
        try {
            const stats = await booking_service_1.bookingService.getTodayBookings();
            return res.status(200).json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Error fetching today bookings:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch today bookings'
            });
        }
    }
}
exports.BookingController = BookingController;
exports.bookingController = new BookingController();
//# sourceMappingURL=booking.controller.js.map