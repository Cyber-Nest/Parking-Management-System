"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerInvoice = exports.downloadPenaltyReceipt = exports.downloadCustomerInvoice = exports.disputePenaltyTicket = exports.payPenaltyTicket = exports.getPenaltyByTicketNumber = exports.extendCustomerBooking = exports.getCustomerBookingByReference = exports.getCustomerBooking = exports.createBooking = exports.createPaymentIntent = exports.getStripeConfig = exports.getParkingZoneById = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const customer_service_1 = require("../services/customer.service");
const invoice_service_1 = require("../services/invoice.service");
const ticket_service_1 = require("../services/ticket.service");
const cloudinary_service_1 = require("../services/cloudinary.service");
const commonErrors_1 = require("../services/commonErrors");
const enforcement_repository_1 = require("../repositories/enforcement.repository");
const ticketService = new ticket_service_1.TicketService();
const handleError = (err, res, fallbackMessage) => {
    if (err instanceof commonErrors_1.ValidationError || err instanceof commonErrors_1.NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[CustomerController] Unhandled error:', err);
    res.status(500).json({ success: false, message: fallbackMessage });
};
const getParkingZoneById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await customer_service_1.customerService.getParkingZoneById(id);
        res.status(200).json({ success: true, message: 'Parking zone fetched', data });
    }
    catch (err) {
        console.error('[CustomerController] getParkingZoneById error:', err);
        res.status(404).json({ success: false, message: String(err instanceof Error ? err.message : 'Zone not found') });
    }
};
exports.getParkingZoneById = getParkingZoneById;
const getStripeConfig = async (_req, res) => {
    try {
        const data = await customer_service_1.customerService.getStripeConfig();
        res.status(200).json({ success: true, message: 'Stripe config fetched', data });
    }
    catch (err) {
        console.error('[CustomerController] getStripeConfig error:', err instanceof Error ? err.stack : err);
        res.status(500).json({ success: false, message: String(err instanceof Error ? err.message : 'Failed to fetch Stripe config') });
    }
};
exports.getStripeConfig = getStripeConfig;
const createPaymentIntent = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || Number(amount) <= 0) {
            res.status(400).json({ success: false, message: 'Invalid amount' });
            return;
        }
        const data = await customer_service_1.customerService.createPaymentIntent(Number(amount));
        res.status(200).json({ success: true, message: 'Payment intent created', data });
    }
    catch (err) {
        console.error('[CustomerController] createPaymentIntent error:', err instanceof Error ? err.stack : err);
        res.status(500).json({ success: false, message: String(err instanceof Error ? err.message : 'Failed to create payment intent') });
    }
};
exports.createPaymentIntent = createPaymentIntent;
const createBooking = async (req, res) => {
    try {
        const { zoneId, email, vehicleModel, plateNumber, carColor, durationLabel, durationMinutes, price, stripePaymentIntentId, } = req.body;
        const missingFields = [];
        if (!zoneId)
            missingFields.push('zoneId');
        if (!email)
            missingFields.push('email');
        if (!vehicleModel)
            missingFields.push('vehicleModel');
        if (!plateNumber)
            missingFields.push('plateNumber');
        if (!carColor)
            missingFields.push('carColor');
        if (!durationLabel)
            missingFields.push('durationLabel');
        if (durationMinutes === undefined || durationMinutes === null)
            missingFields.push('durationMinutes');
        if (price === undefined || price === null)
            missingFields.push('price');
        if (!stripePaymentIntentId)
            missingFields.push('stripePaymentIntentId');
        if (missingFields.length > 0) {
            const message = `Missing required booking fields: ${missingFields.join(', ')}`;
            console.error('[CustomerController] createBooking validation failed:', message, 'body:', req.body);
            res.status(400).json({ success: false, message });
            return;
        }
        const data = await customer_service_1.customerService.createBooking({
            zoneId,
            email,
            vehicleModel,
            plateNumber,
            carColor,
            durationLabel,
            durationMinutes: Number(durationMinutes),
            price: Number(price),
            stripePaymentIntentId,
        });
        res.status(201).json({ success: true, message: 'Booking created', data });
    }
    catch (err) {
        console.error('[CustomerController] createBooking error:', err);
        res.status(400).json({ success: false, message: String(err instanceof Error ? err.message : 'Booking failed') });
    }
};
exports.createBooking = createBooking;
const getCustomerBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await customer_service_1.customerService.getBookingWithInvoice(id);
        if (!data) {
            res.status(404).json({ success: false, message: 'Booking not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Booking fetched', data });
    }
    catch (err) {
        console.error('[CustomerController] getCustomerBooking error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch booking' });
    }
};
exports.getCustomerBooking = getCustomerBooking;
const getCustomerBookingByReference = async (req, res) => {
    try {
        const { reference } = req.params;
        const booking = await customer_service_1.customerService.getBookingByReference(reference);
        if (!booking) {
            res.status(404).json({ success: false, message: 'Booking not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Booking fetched', data: { booking } });
    }
    catch (err) {
        console.error('[CustomerController] getCustomerBookingByReference error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch booking' });
    }
};
exports.getCustomerBookingByReference = getCustomerBookingByReference;
const extendCustomerBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { durationLabel, durationMinutes, amount, stripePaymentIntentId } = req.body;
        if (!durationLabel || durationMinutes === undefined || amount === undefined || !stripePaymentIntentId) {
            res.status(400).json({ success: false, message: 'Missing required fields for booking extension' });
            return;
        }
        const booking = await customer_service_1.customerService.extendBooking(id, {
            durationLabel,
            durationMinutes: Number(durationMinutes),
            amount: Number(amount),
            stripePaymentIntentId,
        });
        res.status(200).json({ success: true, message: 'Booking extended successfully', data: booking });
    }
    catch (err) {
        console.error('[CustomerController] extendCustomerBooking error:', err);
        res.status(500).json({ success: false, message: String(err instanceof Error ? err.message : 'Failed to extend booking') });
    }
};
exports.extendCustomerBooking = extendCustomerBooking;
const getPenaltyByTicketNumber = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await ticketService.getByTicketNumber(id);
        const ticketWithPhotos = await enforcement_repository_1.enforcementRepository.findTicketById(ticket.id);
        const invoice = ticket.status === 'paid'
            ? await ticketService.ensurePenaltyReceipt(ticket.id, String(req.query.email ?? ''))
            : null;
        const penaltyData = {
            ...ticket,
            evidence_image: ticketWithPhotos?.photos?.[0] ?? null,
            photos: ticketWithPhotos?.photos ?? [],
            receiptInvoiceId: invoice?.id ?? null,
        };
        res.status(200).json({ success: true, message: 'Penalty fetched', data: penaltyData });
    }
    catch (err) {
        console.error('[CustomerController] getPenaltyByTicketNumber error:', err);
        handleError(err, res, 'Failed to fetch penalty');
    }
};
exports.getPenaltyByTicketNumber = getPenaltyByTicketNumber;
const payPenaltyTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, transaction_ref } = req.body; // Get email and optional transaction reference from request body
        const ticket = await ticketService.getByTicketNumber(id);
        const data = await ticketService.markPaid(ticket.id, {
            payment_method: 'credit_card',
            transaction_ref: transaction_ref ?? `CUST-${Date.now()}`,
            customer_email: email, // Pass customer email for email notification
        });
        res.status(200).json({ success: true, message: 'Penalty paid successfully', data });
    }
    catch (err) {
        console.error('[CustomerController] payPenaltyTicket error:', err);
        handleError(err, res, 'Failed to process penalty payment');
    }
};
exports.payPenaltyTicket = payPenaltyTicket;
const disputePenaltyTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, explanation, proofImage } = req.body;
        if (!fullName || !email || !phone || !explanation) {
            res.status(400).json({ success: false, message: 'fullName, email, phone, and explanation are required' });
            return;
        }
        let proofUrl;
        if (proofImage && String(proofImage).trim()) {
            proofUrl = await (0, cloudinary_service_1.ensureCloudinaryUrl)(String(proofImage), { folder: 'parksmart/disputes' });
        }
        const disputeText = `Dispute filed by ${fullName} (${email}, ${phone}): ${explanation}${proofUrl ? ` | proof: ${proofUrl}` : ''}`;
        const data = await ticketService.disputeTicket(id, disputeText);
        res.status(200).json({ success: true, message: 'Penalty dispute submitted', data });
    }
    catch (err) {
        console.error('[CustomerController] disputePenaltyTicket error:', err);
        res.status(500).json({ success: false, message: String(err instanceof Error ? err.message : 'Failed to submit dispute') });
    }
};
exports.disputePenaltyTicket = disputePenaltyTicket;
const downloadCustomerInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const filePath = await invoice_service_1.invoiceService.downloadInvoice(id);
        if (!filePath || !fs_1.default.existsSync(filePath)) {
            res.status(404).json({ success: false, message: 'Invoice file not found' });
            return;
        }
        const fileName = path_1.default.basename(filePath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        fs_1.default.createReadStream(filePath).pipe(res);
    }
    catch (err) {
        console.error('[CustomerController] downloadCustomerInvoice error:', err);
        res.status(500).json({ success: false, message: 'Failed to download invoice' });
    }
};
exports.downloadCustomerInvoice = downloadCustomerInvoice;
const downloadPenaltyReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const email = String(req.query.email ?? '');
        const ticket = await ticketService.getByTicketNumber(id);
        if (ticket.status !== 'paid') {
            res.status(400).json({ success: false, message: 'Receipt is available after payment only' });
            return;
        }
        const invoice = await ticketService.ensurePenaltyReceipt(ticket.id, email);
        if (!invoice?.id) {
            res.status(500).json({ success: false, message: 'Receipt could not be created' });
            return;
        }
        const filePath = await invoice_service_1.invoiceService.downloadInvoice(invoice.id);
        if (!filePath || !fs_1.default.existsSync(filePath)) {
            res.status(404).json({ success: false, message: 'Receipt file not found' });
            return;
        }
        const fileName = path_1.default.basename(filePath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        fs_1.default.createReadStream(filePath).pipe(res);
    }
    catch (err) {
        console.error('[CustomerController] downloadPenaltyReceipt error:', err);
        handleError(err, res, 'Failed to download receipt');
    }
};
exports.downloadPenaltyReceipt = downloadPenaltyReceipt;
const getCustomerInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await invoice_service_1.invoiceService.getInvoice(id);
        if (!invoice) {
            res.status(404).json({ success: false, message: 'Invoice not found' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Invoice fetched',
            data: invoice,
        });
    }
    catch (err) {
        console.error('[CustomerController] getCustomerInvoice error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch invoice' });
    }
};
exports.getCustomerInvoice = getCustomerInvoice;
//# sourceMappingURL=customer.controller.js.map