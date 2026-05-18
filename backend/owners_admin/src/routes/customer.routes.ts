import { Router } from 'express';
import {
  createBooking,
  createPaymentIntent,
  getParkingZoneById,
  getStripeConfig,
} from '../controllers/customer.controller';

const router = Router();

router.get('/parking-zones/:id', getParkingZoneById);
router.get('/config', getStripeConfig);
router.post('/payment-intents', createPaymentIntent);
router.post('/bookings', createBooking);

export default router;
