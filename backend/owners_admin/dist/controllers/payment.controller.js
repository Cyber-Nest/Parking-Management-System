"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentReceipt = exports.getPaymentById = exports.createPayment = exports.getPaymentSummary = exports.listPayments = void 0;
const payment_service_1 = require("../services/payment.service");
const commonErrors_1 = require("../services/commonErrors");
const paymentService = new payment_service_1.PaymentService();
const handleError = (err, res) => {
    if (err instanceof commonErrors_1.ValidationError || err instanceof commonErrors_1.NotFoundError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    console.error('[PaymentController] Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
const listPayments = async (req, res) => {
    try {
        const data = await paymentService.list(req.query);
        res.status(200).json({ success: true, message: 'Payments fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.listPayments = listPayments;
const getPaymentSummary = async (_req, res) => {
    try {
        const data = await paymentService.summary();
        res.status(200).json({ success: true, message: 'Payment summary fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getPaymentSummary = getPaymentSummary;
const createPayment = async (req, res) => {
    try {
        const data = await paymentService.create(req.body);
        res.status(201).json({ success: true, message: 'Payment created', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.createPayment = createPayment;
const getPaymentById = async (req, res) => {
    try {
        const data = await paymentService.getById(req.params.id);
        res.status(200).json({ success: true, message: 'Payment fetched', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getPaymentById = getPaymentById;
const getPaymentReceipt = async (req, res) => {
    try {
        const row = await paymentService.getById(req.params.id);
        const data = paymentService.getReceiptPayload(row);
        res.status(200).json({ success: true, message: 'Receipt data', data });
    }
    catch (err) {
        handleError(err, res);
    }
};
exports.getPaymentReceipt = getPaymentReceipt;
//# sourceMappingURL=payment.controller.js.map