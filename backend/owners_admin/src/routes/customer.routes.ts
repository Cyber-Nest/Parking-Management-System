import { Router } from 'express';
import {
  createBooking,
  createPaymentIntent,
  downloadCustomerInvoice,
  downloadPenaltyReceipt,
  extendCustomerBooking,
  getCustomerBooking,
  getCustomerBookingByReference,
  getCustomerInvoice,
  getParkingZoneById,
  getPenaltyByTicketNumber,
  getStripeConfig,
  payPenaltyTicket,
  disputePenaltyTicket,
} from '../controllers/customer.controller';

const router = Router();

router.get('/parking-zones/:id', getParkingZoneById);
router.get('/config', getStripeConfig);
router.post('/payment-intents', createPaymentIntent);
router.post('/bookings', createBooking);
router.get('/bookings/:id', getCustomerBooking);
router.get('/bookings/reference/:reference', getCustomerBookingByReference);
router.patch('/bookings/:id/extend', extendCustomerBooking);
router.get('/penalties/:id', getPenaltyByTicketNumber);
router.get('/penalties/:id/receipt', downloadPenaltyReceipt);
router.patch('/penalties/:id/pay', payPenaltyTicket);
router.post('/penalties/:id/dispute', disputePenaltyTicket);
router.get('/invoices/:id', getCustomerInvoice);
router.get('/invoices/:id/download', downloadCustomerInvoice);

export default router;
