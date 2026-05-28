"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerService = exports.CustomerService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("../config/env");
const payment_repository_1 = require("../repositories/payment.repository");
const session_repository_1 = require("../repositories/session.repository");
const parkingPlan_repository_1 = require("../repositories/parkingPlan.repository");
const parkingZone_repository_1 = require("../repositories/parkingZone.repository");
const booking_service_1 = require("./booking.service");
const transaction_service_1 = require("./transaction.service");
const invoice_service_1 = require("./invoice.service");
const parkingImages_1 = require("../utils/parkingImages");
const email_1 = require("../utils/email");
const parkingZoneRepo = new parkingZone_repository_1.ParkingZoneRepository();
const parkingPlanRepo = new parkingPlan_repository_1.ParkingPlanRepository();
const sessionRepo = new session_repository_1.SessionRepository();
const paymentRepo = new payment_repository_1.PaymentRepository();
const stripe = new stripe_1.default(env_1.env.stripe.secretKey, { apiVersion: '2022-11-15' });
const formatDateTime = (date) => date.toISOString().slice(0, 19).replace('T', ' ');
const SERVICE_FEE = 2;
class CustomerService {
    async getParkingZoneById(zoneId) {
        const zone = await parkingZoneRepo.findById(zoneId);
        if (!zone) {
            throw new Error('Parking zone not found');
        }
        const subZones = await parkingZoneRepo.findCustomerSubZones(zone.id, 6);
        return {
            id: zone.id,
            parking_name: zone.parking_name,
            address: zone.address,
            image_url: (0, parkingImages_1.sanitizeParkingImageUrl)(zone.image_url),
            hourly_rate: zone.hourly_rate,
            available_spots: zone.available_spots,
            total_spots: zone.total_spots,
            spot_id: zone.spot_id,
            sub_zones: subZones.map((z) => ({
                id: z.id,
                parking_name: z.parking_name,
                hourly_rate: z.hourly_rate,
                available_spots: z.available_spots,
                total_spots: z.total_spots,
                spot_id: z.spot_id,
            })),
        };
    }
    /** Amount is in CAD dollars (e.g. 6.50 for $6.50). */
    async createPaymentIntent(amount) {
        if (!env_1.env.stripe.secretKey) {
            throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in backend .env');
        }
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'cad',
                payment_method_types: ['card'],
                description: 'ParkSmart parking booking',
                metadata: {
                    source: 'customer_booking',
                },
            });
            if (!paymentIntent.client_secret) {
                throw new Error('Unable to create payment intent');
            }
            return {
                clientSecret: paymentIntent.client_secret,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency ?? 'cad',
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown Stripe error';
            throw new Error(`Stripe payment intent creation failed: ${message}`);
        }
    }
    async getStripeConfig() {
        if (!env_1.env.stripe.publishableKey) {
            throw new Error('Stripe publishable key is not configured. Please set STRIPE_PUBLISHABLE_KEY in backend .env');
        }
        return {
            stripePublishableKey: env_1.env.stripe.publishableKey,
        };
    }
    async getBookingByReference(reference) {
        return await booking_service_1.bookingService.getBookingByReference(reference);
    }
    async extendBooking(bookingId, payload) {
        const booking = await booking_service_1.bookingService.getBooking(bookingId);
        if (!booking) {
            throw new Error('Booking not found');
        }
        if (booking.booking_status === 'cancelled' || booking.booking_status === 'completed') {
            throw new Error('Cannot extend a cancelled or completed booking');
        }
        if (booking.allow_extension === 0) {
            throw new Error('Booking extension is not allowed for this booking');
        }
        if (!payload.stripePaymentIntentId) {
            throw new Error('Stripe payment intent ID is required for booking extension');
        }
        const paymentIntent = await stripe.paymentIntents.retrieve(payload.stripePaymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            throw new Error('Stripe payment intent is not completed');
        }
        const expectedAmount = Math.round(payload.amount * 100);
        if (paymentIntent.amount < expectedAmount) {
            throw new Error('Stripe payment amount is lower than the extension amount');
        }
        const existingEndTime = new Date(booking.end_time);
        const newEndTime = new Date(existingEndTime.getTime() + payload.durationMinutes * 60000);
        const updatedDurationMinutes = Number(booking.duration_minutes) + payload.durationMinutes;
        const updatedTotalPrice = Number(booking.total_price) + payload.amount;
        const updatedExtensions = Number(booking.total_extensions ?? 0) + 1;
        const updatedBooking = await booking_service_1.bookingService.updateBooking(booking.id, {
            end_time: newEndTime,
            duration_label: payload.durationLabel,
            duration_minutes: updatedDurationMinutes,
            total_price: updatedTotalPrice,
            booking_status: 'extended',
            total_extensions: updatedExtensions,
        });
        try {
            const transaction = await transaction_service_1.transactionService.createTransaction({
                amount: payload.amount,
                paymentMethod: 'stripe',
                transactionType: 'booking_extension',
                bookingId: booking.id,
                userEmail: booking.customer_email,
                stripePaymentIntentId: payload.stripePaymentIntentId,
            });
            await transaction_service_1.transactionService.completeTransaction(transaction.id);
            const extendInvoice = await invoice_service_1.invoiceService.createInvoice({
                customerEmail: booking.customer_email,
                vehiclePlateNumber: booking.vehicle_plate_number,
                vehicleModel: booking.vehicle_model,
                vehicleColor: booking.vehicle_color ?? undefined,
                itemDescription: `Extension for booking ${booking.booking_reference} (${payload.durationLabel})`,
                itemType: 'extension',
                quantity: 1,
                unitPrice: payload.amount,
                subtotal: payload.amount,
                taxAmount: 0,
                serviceFee: 0,
                totalAmount: payload.amount,
                bookingId: booking.id,
                transactionId: transaction.id,
                parkingZone: booking.parking_name,
                parkingLocation: booking.parking_location ?? undefined,
                startTime: existingEndTime,
                endTime: newEndTime,
                durationMinutes: payload.durationMinutes,
            });
            if (extendInvoice?.id) {
                await invoice_service_1.invoiceService.markAsPaid(extendInvoice.id, payload.amount);
            }
            // Send extension confirmation email
            try {
                const emailHtml = (0, email_1.paymentReceiptTemplate)({
                    bookingId: booking.id,
                    customerEmail: booking.customer_email,
                    vehicleModel: booking.vehicle_model,
                    vehiclePlateNumber: booking.vehicle_plate_number,
                    parkingName: booking.parking_name,
                    parkingLocation: booking.parking_location || 'N/A',
                    startTime: existingEndTime,
                    endTime: newEndTime,
                    durationLabel: payload.durationLabel,
                    bookingReference: booking.booking_reference,
                    invoiceNumber: extendInvoice?.invoice_number || 'N/A',
                    totalAmount: payload.amount,
                    basePrice: payload.amount,
                    serviceFee: 0,
                    frontendUrl: env_1.env.frontendUrl,
                });
                const attachments = [];
                if (extendInvoice?.pdf_file_path) {
                    attachments.push({
                        filename: `extension-invoice-${extendInvoice.invoice_number}.pdf`,
                        path: extendInvoice.pdf_file_path,
                    });
                }
                await (0, email_1.sendEmail)({
                    to: booking.customer_email,
                    subject: `ParkSmart Extension Confirmed - Reservation #${booking.booking_reference}`,
                    html: emailHtml,
                    emailType: 'extension_receipt',
                    relatedId: booking.id,
                    attachments: attachments.length > 0 ? attachments : undefined,
                });
                console.log(`[CustomerService] Extension confirmation sent to ${booking.customer_email}`);
            }
            catch (emailError) {
                console.error('[CustomerService] Failed to send extension email:', emailError);
            }
        }
        catch (error) {
            console.error('[CustomerService] extendBooking transaction/invoice failed:', error);
        }
        return updatedBooking;
    }
    async createBooking(payload) {
        const zone = await parkingZoneRepo.findById(payload.zoneId);
        if (!zone) {
            throw new Error('Parking zone not found');
        }
        if (zone.available_spots <= 0) {
            throw new Error('No available spots in the selected parking zone');
        }
        if (!payload.stripePaymentIntentId) {
            throw new Error('Stripe payment intent ID is required');
        }
        const paymentIntent = await stripe.paymentIntents.retrieve(payload.stripePaymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            throw new Error('Stripe payment intent is not completed');
        }
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + payload.durationMinutes * 60000);
        const paidAt = formatDateTime(new Date());
        const basePrice = Number(payload.price);
        const serviceFee = SERVICE_FEE;
        const taxAmount = 0;
        const totalAmount = basePrice + serviceFee;
        const matchingPlan = (await parkingPlanRepo.findForBooking(payload.durationMinutes, payload.price)) ??
            (await parkingPlanRepo.findByPriceAndDuration(payload.price, payload.durationMinutes));
        const planId = matchingPlan?.id ?? null;
        const planName = matchingPlan?.name ?? payload.durationLabel;
        const sessionId = await sessionRepo.create({
            licensePlate: payload.plateNumber,
            planId: planId ?? undefined,
            planName,
            startTime: formatDateTime(startTime),
            endTime: formatDateTime(endTime),
            durationMinutes: payload.durationMinutes,
            status: 'active',
            notes: `Vehicle: ${payload.vehicleModel} / ${payload.carColor}`,
        });
        const paymentId = await paymentRepo.create({
            sessionId,
            licensePlate: payload.plateNumber,
            amount: totalAmount,
            paymentMethod: 'credit_card',
            paymentType: 'parking',
            status: 'success',
            transactionRef: payload.stripePaymentIntentId,
            paidAt,
        });
        const booking = await booking_service_1.bookingService.createBooking({
            parkingZoneId: zone.id,
            parkingName: zone.parking_name,
            parkingLocation: zone.address,
            customerEmail: payload.email,
            vehicleModel: payload.vehicleModel,
            vehiclePlateNumber: payload.plateNumber,
            vehicleColor: payload.carColor,
            startTime,
            endTime,
            durationMinutes: payload.durationMinutes,
            durationLabel: payload.durationLabel,
            parkingPlanId: planId ?? undefined,
            hourlyRate: Number(zone.hourly_rate),
            basePrice,
            taxAmount,
            serviceFee,
            totalPrice: totalAmount,
            spotId: zone.spot_id,
        });
        await booking_service_1.bookingService.updateBooking(booking.id, {
            stripe_payment_intent_id: payload.stripePaymentIntentId,
        });
        const transaction = await transaction_service_1.transactionService.createTransaction({
            amount: totalAmount,
            paymentMethod: 'stripe',
            transactionType: 'parking_booking',
            bookingId: booking.id,
            userEmail: payload.email,
            stripePaymentIntentId: payload.stripePaymentIntentId,
        });
        await transaction_service_1.transactionService.completeTransaction(transaction.id);
        let invoice = null;
        try {
            invoice = await invoice_service_1.invoiceService.createInvoice({
                customerEmail: payload.email,
                vehiclePlateNumber: payload.plateNumber,
                vehicleModel: payload.vehicleModel,
                vehicleColor: payload.carColor,
                itemDescription: `Parking at ${zone.parking_name} (${payload.durationLabel})`,
                itemType: 'parking_booking',
                quantity: 1,
                unitPrice: basePrice,
                subtotal: basePrice,
                taxAmount,
                serviceFee,
                totalAmount,
                bookingId: booking.id,
                transactionId: transaction.id,
                parkingZone: zone.parking_name,
                parkingLocation: zone.address,
                startTime,
                endTime,
                durationMinutes: payload.durationMinutes,
            });
            if (invoice?.id) {
                await invoice_service_1.invoiceService.markAsPaid(invoice.id, totalAmount);
            }
        }
        catch (invoiceError) {
            console.error('[CustomerService] Invoice/PDF step failed (booking still saved):', invoiceError);
        }
        await booking_service_1.bookingService.confirmBooking(booking.id, transaction.id);
        await parkingZoneRepo.decrementAvailableSpots(zone.id);
        const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
        // Send payment receipt email
        try {
            const emailHtml = (0, email_1.paymentReceiptTemplate)({
                bookingId: booking.id,
                customerEmail: payload.email,
                vehicleModel: payload.vehicleModel,
                vehiclePlateNumber: payload.plateNumber,
                parkingName: zone.parking_name,
                parkingLocation: zone.address,
                startTime: startTime,
                endTime: endTime,
                durationLabel: payload.durationLabel,
                bookingReference: booking.booking_reference,
                invoiceNumber: invoice?.invoice_number || 'N/A',
                totalAmount: totalAmount,
                basePrice: basePrice,
                serviceFee: serviceFee,
                frontendUrl: env_1.env.frontendUrl,
            });
            const attachments = [];
            if (invoice?.pdf_file_path) {
                attachments.push({
                    filename: `invoice-${invoice.invoice_number}.pdf`,
                    path: invoice.pdf_file_path,
                });
            }
            await (0, email_1.sendEmail)({
                to: payload.email,
                subject: `ParkSmart Booking Confirmed - Reservation #${booking.booking_reference}`,
                html: emailHtml,
                emailType: 'payment_receipt',
                relatedId: booking.id,
                attachments: attachments.length > 0 ? attachments : undefined,
            });
            console.log(`[CustomerService] Payment receipt sent to ${payload.email}` + (attachments.length > 0 ? ' with invoice PDF' : ''));
        }
        catch (emailError) {
            console.error('[CustomerService] Failed to send receipt email:', emailError);
            // Don't throw - booking is already completed, just log the error
        }
        return {
            bookingId: booking.id,
            paymentId,
            receiptNumber,
            amount: totalAmount,
            total: totalAmount,
            bookingReference: booking.booking_reference,
            parkingPlanId: planId ?? undefined,
            transactionId: transaction.id,
            transactionReference: transaction.transaction_reference,
            invoiceId: invoice?.id,
            invoiceNumber: invoice?.invoice_number,
        };
    }
    async getBookingWithInvoice(bookingId) {
        const booking = await booking_service_1.bookingService.getBooking(bookingId);
        if (!booking) {
            return null;
        }
        const invoice = await invoice_service_1.invoiceService.getInvoiceByBookingId(bookingId);
        return { booking, invoice };
    }
}
exports.CustomerService = CustomerService;
exports.customerService = new CustomerService();
//# sourceMappingURL=customer.service.js.map