import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware';
import { createPayment, getPaymentById, getPaymentReceipt, getPaymentSummary, listPayments } from '../controllers/payment.controller';
import { transactionController } from '../controllers/transaction.controller';
import { invoiceController } from '../controllers/invoice.controller';
import { bookingController } from '../controllers/booking.controller';

const router = Router();

const adminOnly = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => [
  verifyToken as unknown as (req: Request, res: Response, next: NextFunction) => void,
  requireAdmin as unknown as (req: Request, res: Response, next: NextFunction) => void,
  handler as unknown as (req: Request, res: Response, next: NextFunction) => void,
];

// ─── Transactions (specific paths before /:id) ─────────────────────────────
router.post('/transactions', transactionController.createTransaction.bind(transactionController));
router.get('/transactions/stats/summary', ...adminOnly(async (req, res) => { await transactionController.getTransactionStats(req, res); }));
router.get('/transactions/revenue/by-date', ...adminOnly(async (req, res) => { await transactionController.getRevenueByDate(req, res); }));
router.get('/transactions/revenue/today', ...adminOnly(async (req, res) => { await transactionController.getTodayRevenue(req, res); }));
router.get('/transactions/reference/:reference', transactionController.getTransactionByReference.bind(transactionController));
router.get('/transactions/email/:email', transactionController.getTransactionsByEmail.bind(transactionController));
router.patch('/transactions/:id/complete', ...adminOnly(async (req, res) => { await transactionController.completeTransaction(req, res); }));
router.patch('/transactions/:id/fail', ...adminOnly(async (req, res) => { await transactionController.failTransaction(req, res); }));
router.get('/transactions/:id', transactionController.getTransaction.bind(transactionController));

// ─── Invoices ───────────────────────────────────────────────────────────────
router.post('/invoices', invoiceController.createInvoice.bind(invoiceController));
router.get('/invoices/stats/summary', ...adminOnly(async (req, res) => { await invoiceController.getInvoiceStats(req, res); }));
router.get('/invoices/stats/today', ...adminOnly(async (req, res) => { await invoiceController.getTodayInvoices(req, res); }));
router.get('/invoices/number/:invoiceNumber', invoiceController.getInvoiceByNumber.bind(invoiceController));
router.get('/invoices/email/:email', invoiceController.getInvoicesByEmail.bind(invoiceController));
router.get('/invoices/:id/download', invoiceController.downloadInvoice.bind(invoiceController));
router.patch('/invoices/:id/mark-paid', ...adminOnly(async (req, res) => { await invoiceController.markAsPaid(req, res); }));
router.get('/invoices/:id', invoiceController.getInvoice.bind(invoiceController));

// ─── Bookings ───────────────────────────────────────────────────────────────
router.post('/bookings', bookingController.createBooking.bind(bookingController));
router.get('/bookings/stats/summary', ...adminOnly(async (req, res) => { await bookingController.getBookingStats(req, res); }));
router.get('/bookings/stats/today', ...adminOnly(async (req, res) => { await bookingController.getTodayBookings(req, res); }));
router.get('/bookings/reference/:reference', bookingController.getBookingByReference.bind(bookingController));
router.get('/bookings/email/:email', bookingController.getBookingsByEmail.bind(bookingController));
router.get('/bookings/active/list', ...adminOnly(async (req, res) => { await bookingController.getActiveBookings(req, res); }));
router.patch('/bookings/:id/confirm', bookingController.confirmBooking.bind(bookingController));
router.patch('/bookings/:id/active', ...adminOnly(async (req, res) => { await bookingController.markAsActive(req, res); }));
router.patch('/bookings/:id/complete', ...adminOnly(async (req, res) => { await bookingController.markAsCompleted(req, res); }));
router.get('/bookings/:id', bookingController.getBooking.bind(bookingController));

// ─── Legacy payments (catch-all /:id last) ──────────────────────────────────
router.get('/summary', ...adminOnly(getPaymentSummary));
router.get('/', ...adminOnly(listPayments));
router.post('/', ...adminOnly(createPayment));
router.get('/:id/receipt', ...adminOnly(getPaymentReceipt));
router.get('/:id', ...adminOnly(getPaymentById));

export default router;
