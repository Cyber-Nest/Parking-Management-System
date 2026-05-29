"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerPaymentController = exports.CustomerPaymentController = void 0;
const stripe_1 = __importDefault(require("stripe"));
const booking_service_1 = require("../services/booking.service");
const transaction_service_1 = require("../services/transaction.service");
const invoice_service_1 = require("../services/invoice.service");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-04-10',
});
class CustomerPaymentController {
    /**
     * Create a payment intent for customer bookings
     */
    async createPaymentIntent(req, res) {
        try {
            const { amount } = req.body;
            if (!amount || amount < 0.50) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid amount. Minimum is $0.50'
                });
            }
            // Create Stripe payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'cad',
                payment_method_types: ['card'],
                metadata: {
                    integration_type: 'parking_booking'
                }
            });
            return res.status(200).json({
                success: true,
                data: {
                    id: paymentIntent.id,
                    clientSecret: paymentIntent.client_secret,
                    amount: paymentIntent.amount,
                    status: paymentIntent.status
                }
            });
        }
        catch (error) {
            console.error('Error creating payment intent:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create payment intent',
                error: error.message
            });
        }
    }
    /**
     * Submit booking after payment
     */
    async submitBooking(req, res) {
        try {
            const { zoneId, email, vehicleModel, plateNumber, carColor, durationLabel, durationMinutes, price, stripePaymentIntentId } = req.body;
            if (!zoneId || !email || !vehicleModel || !plateNumber || !stripePaymentIntentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }
            // Verify payment with Stripe
            const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
            if (paymentIntent.status !== 'succeeded') {
                return res.status(400).json({
                    success: false,
                    message: 'Payment not completed successfully'
                });
            }
            // Create transaction record
            const transaction = await transaction_service_1.transactionService.createTransaction({
                amount: price,
                paymentMethod: 'stripe',
                transactionType: 'parking_booking',
                userEmail: email,
                stripePaymentIntentId: stripePaymentIntentId,
                ipAddress: req.ip
            });
            // Create booking
            const now = new Date();
            const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);
            const booking = await booking_service_1.bookingService.createBooking({
                parkingZoneId: zoneId,
                parkingName: 'Central Parking Tower',
                customerEmail: email,
                vehicleModel,
                vehiclePlateNumber: plateNumber,
                vehicleColor: carColor,
                startTime: now,
                endTime: endTime,
                durationMinutes,
                durationLabel,
                hourlyRate: 4.5,
                basePrice: price - 2, // Remove service fee
                taxAmount: 0,
                serviceFee: 2,
                totalPrice: price
            });
            // Create invoice
            const invoice = await invoice_service_1.invoiceService.createInvoice({
                customerEmail: email,
                vehiclePlateNumber: plateNumber,
                vehicleModel,
                vehicleColor: carColor,
                itemDescription: `Parking Booking for ${durationLabel}`,
                itemType: 'parking_booking',
                quantity: 1,
                unitPrice: price - 2,
                subtotal: price - 2,
                taxAmount: 0,
                serviceFee: 2,
                totalAmount: price,
                bookingId: booking.id,
                transactionId: transaction.id,
                durationMinutes
            });
            // Mark transaction as completed
            await transaction_service_1.transactionService.completeTransaction(transaction.id);
            // Confirm booking
            await booking_service_1.bookingService.confirmBooking(booking.id, transaction.id);
            return res.status(200).json({
                success: true,
                message: 'Booking created successfully',
                data: {
                    booking_id: booking.id,
                    booking_reference: booking.booking_reference,
                    invoice_id: invoice.id,
                    invoice_number: invoice.invoice_number,
                    transaction_id: transaction.id,
                    start_time: booking.start_time,
                    end_time: booking.end_time,
                    total_amount: price
                }
            });
        }
        catch (error) {
            console.error('Error submitting booking:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to submit booking',
                error: error.message
            });
        }
    }
    /**
     * Get parking zones
     */
    async getParkingZone(req, res) {
        try {
            const { zoneId } = req.params;
            // Return mock data for now - in production, fetch from database
            const zones = [
                {
                    zoneId: 'zone-1',
                    zoneName: 'Central Parking Tower',
                    hourlyRate: 4.5,
                    availableSpots: 10,
                    totalSpots: 10,
                    spotId: 'A-102',
                    zones: [
                        {
                            zoneId: 'ZONE-A',
                            zoneName: 'Basement A',
                            hourlyRate: 4.5,
                            availableSpots: 10,
                            totalSpots: 15,
                            spotId: 'A-102',
                        },
                        {
                            zoneId: 'ZONE-B',
                            zoneName: 'VIP Floor',
                            hourlyRate: 8,
                            availableSpots: 4,
                            totalSpots: 10,
                            spotId: 'VIP-09',
                        },
                    ],
                },
            ];
            const zone = zones.find(z => z.zoneId === zoneId);
            if (!zone) {
                return res.status(404).json({
                    success: false,
                    message: 'Zone not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: zone
            });
        }
        catch (error) {
            console.error('Error fetching parking zone:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch parking zone'
            });
        }
    }
    /**
     * Get Stripe config
     */
    async getConfig(_req, res) {
        try {
            return res.status(200).json({
                success: true,
                data: {
                    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
                }
            });
        }
        catch (error) {
            console.error('Error fetching config:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch config'
            });
        }
    }
    /**
     * Get booking details with invoice
     */
    async getBookingDetails(req, res) {
        try {
            const { bookingId } = req.params;
            const booking = await booking_service_1.bookingService.getBooking(bookingId);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }
            const invoice = await invoice_service_1.invoiceService.getInvoiceByBookingId(bookingId);
            return res.status(200).json({
                success: true,
                data: {
                    booking,
                    invoice
                }
            });
        }
        catch (error) {
            console.error('Error fetching booking details:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch booking details'
            });
        }
    }
}
exports.CustomerPaymentController = CustomerPaymentController;
exports.customerPaymentController = new CustomerPaymentController();
//# sourceMappingURL=customer-payment.controller.js.map