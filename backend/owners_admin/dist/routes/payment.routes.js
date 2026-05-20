"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const payment_controller_1 = require("../controllers/payment.controller");
const transaction_controller_1 = require("../controllers/transaction.controller");
const invoice_controller_1 = require("../controllers/invoice.controller");
const booking_controller_1 = require("../controllers/booking.controller");
const router = (0, express_1.Router)();
const adminOnly = (handler) => [
    auth_middleware_1.verifyToken,
    auth_middleware_1.requireAdmin,
    handler,
];
// ─── Transactions (specific paths before /:id) ─────────────────────────────
router.post('/transactions', transaction_controller_1.transactionController.createTransaction.bind(transaction_controller_1.transactionController));
router.get('/transactions/stats/summary', ...adminOnly(async (req, res) => { await transaction_controller_1.transactionController.getTransactionStats(req, res); }));
router.get('/transactions/revenue/by-date', ...adminOnly(async (req, res) => { await transaction_controller_1.transactionController.getRevenueByDate(req, res); }));
router.get('/transactions/revenue/today', ...adminOnly(async (req, res) => { await transaction_controller_1.transactionController.getTodayRevenue(req, res); }));
router.get('/transactions/reference/:reference', transaction_controller_1.transactionController.getTransactionByReference.bind(transaction_controller_1.transactionController));
router.get('/transactions/email/:email', transaction_controller_1.transactionController.getTransactionsByEmail.bind(transaction_controller_1.transactionController));
router.patch('/transactions/:id/complete', ...adminOnly(async (req, res) => { await transaction_controller_1.transactionController.completeTransaction(req, res); }));
router.patch('/transactions/:id/fail', ...adminOnly(async (req, res) => { await transaction_controller_1.transactionController.failTransaction(req, res); }));
router.get('/transactions/:id', transaction_controller_1.transactionController.getTransaction.bind(transaction_controller_1.transactionController));
// ─── Invoices ───────────────────────────────────────────────────────────────
router.post('/invoices', invoice_controller_1.invoiceController.createInvoice.bind(invoice_controller_1.invoiceController));
router.get('/invoices/stats/summary', ...adminOnly(async (req, res) => { await invoice_controller_1.invoiceController.getInvoiceStats(req, res); }));
router.get('/invoices/stats/today', ...adminOnly(async (req, res) => { await invoice_controller_1.invoiceController.getTodayInvoices(req, res); }));
router.get('/invoices/number/:invoiceNumber', invoice_controller_1.invoiceController.getInvoiceByNumber.bind(invoice_controller_1.invoiceController));
router.get('/invoices/email/:email', invoice_controller_1.invoiceController.getInvoicesByEmail.bind(invoice_controller_1.invoiceController));
router.get('/invoices/:id/download', invoice_controller_1.invoiceController.downloadInvoice.bind(invoice_controller_1.invoiceController));
router.patch('/invoices/:id/mark-paid', ...adminOnly(async (req, res) => { await invoice_controller_1.invoiceController.markAsPaid(req, res); }));
router.get('/invoices/:id', invoice_controller_1.invoiceController.getInvoice.bind(invoice_controller_1.invoiceController));
// ─── Bookings ───────────────────────────────────────────────────────────────
router.post('/bookings', booking_controller_1.bookingController.createBooking.bind(booking_controller_1.bookingController));
router.get('/bookings/stats/summary', ...adminOnly(async (req, res) => { await booking_controller_1.bookingController.getBookingStats(req, res); }));
router.get('/bookings/stats/today', ...adminOnly(async (req, res) => { await booking_controller_1.bookingController.getTodayBookings(req, res); }));
router.get('/bookings/reference/:reference', booking_controller_1.bookingController.getBookingByReference.bind(booking_controller_1.bookingController));
router.get('/bookings/email/:email', booking_controller_1.bookingController.getBookingsByEmail.bind(booking_controller_1.bookingController));
router.get('/bookings/active/list', ...adminOnly(async (req, res) => { await booking_controller_1.bookingController.getActiveBookings(req, res); }));
router.patch('/bookings/:id/confirm', booking_controller_1.bookingController.confirmBooking.bind(booking_controller_1.bookingController));
router.patch('/bookings/:id/active', ...adminOnly(async (req, res) => { await booking_controller_1.bookingController.markAsActive(req, res); }));
router.patch('/bookings/:id/complete', ...adminOnly(async (req, res) => { await booking_controller_1.bookingController.markAsCompleted(req, res); }));
router.get('/bookings/:id', booking_controller_1.bookingController.getBooking.bind(booking_controller_1.bookingController));
// ─── Legacy payments (catch-all /:id last) ──────────────────────────────────
router.get('/summary', ...adminOnly(payment_controller_1.getPaymentSummary));
router.get('/', ...adminOnly(payment_controller_1.listPayments));
router.post('/', ...adminOnly(payment_controller_1.createPayment));
router.get('/:id/receipt', ...adminOnly(payment_controller_1.getPaymentReceipt));
router.get('/:id', ...adminOnly(payment_controller_1.getPaymentById));
exports.default = router;
//# sourceMappingURL=payment.routes.js.map