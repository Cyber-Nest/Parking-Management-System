import { Router } from 'express';
import {
  createBooking,
  createPaymentIntent,
  downloadCustomerInvoice,
  getCustomerBooking,
  getParkingZoneById,
  getStripeConfig,
} from '../controllers/customer.controller';

const router = Router();

router.get('/parking-zones/:id', getParkingZoneById);
router.get('/config', getStripeConfig);
router.post('/payment-intents', createPaymentIntent);
router.post('/bookings', createBooking);
router.get('/bookings/:id', getCustomerBooking);
router.get('/invoices/:id/download', downloadCustomerInvoice);

export default router;
