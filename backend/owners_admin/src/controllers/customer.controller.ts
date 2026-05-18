import { Request, Response } from 'express';
import { customerService } from '../services/customer.service';
import { ApiResponse } from '../types';

export const getParkingZoneById = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await customerService.getParkingZoneById(id);
    res.status(200).json({ success: true, message: 'Parking zone fetched', data });
  } catch (err) {
    console.error('[CustomerController] getParkingZoneById error:', err);
    res.status(404).json({ success: false, message: String(err instanceof Error ? err.message : 'Zone not found') });
  }
};

export const createPaymentIntent = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: 'Invalid amount' });
      return;
    }

    const data = await customerService.createPaymentIntent(Number(amount));
    res.status(200).json({ success: true, message: 'Payment intent created', data });
  } catch (err) {
    console.error('[CustomerController] createPaymentIntent error:', err instanceof Error ? err.stack : err);
    res.status(500).json({ success: false, message: String(err instanceof Error ? err.message : 'Failed to create payment intent') });
  }
};

export const createBooking = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const {
      zoneId,
      email,
      vehicleModel,
      plateNumber,
      carColor,
      durationLabel,
      durationMinutes,
      price,
      stripePaymentIntentId,
    } = req.body;

    if (
      !zoneId ||
      !email ||
      !vehicleModel ||
      !plateNumber ||
      !carColor ||
      !durationLabel ||
      !durationMinutes ||
      !price ||
      !stripePaymentIntentId
    ) {
      res.status(400).json({ success: false, message: 'Missing required booking fields' });
      return;
    }

    const data = await customerService.createBooking({
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
  } catch (err) {
    console.error('[CustomerController] createBooking error:', err);
    res.status(400).json({ success: false, message: String(err instanceof Error ? err.message : 'Booking failed') });
  }
};
