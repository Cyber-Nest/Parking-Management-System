import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { customerService } from '../services/customer.service';
import { invoiceService } from '../services/invoice.service';
import { ApiResponse, CustomerBookingResponse, ParkingZonePublic } from '../types';

export const getParkingZoneById = async (
  req: Request,
  res: Response<ApiResponse<ParkingZonePublic>>
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

export const getStripeConfig = async (
  _req: Request,
  res: Response<ApiResponse<{ stripePublishableKey: string }>>
): Promise<void> => {
  try {
    const data = await customerService.getStripeConfig();
    res.status(200).json({ success: true, message: 'Stripe config fetched', data });
  } catch (err) {
    console.error('[CustomerController] getStripeConfig error:', err instanceof Error ? err.stack : err);
    res.status(500).json({ success: false, message: String(err instanceof Error ? err.message : 'Failed to fetch Stripe config') });
  }
};

export const createPaymentIntent = async (
  req: Request,
  res: Response<ApiResponse<{ clientSecret: string; amount: number; currency: string }>>
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
  res: Response<ApiResponse<CustomerBookingResponse>>
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

    const missingFields: string[] = [];

    if (!zoneId) missingFields.push('zoneId');
    if (!email) missingFields.push('email');
    if (!vehicleModel) missingFields.push('vehicleModel');
    if (!plateNumber) missingFields.push('plateNumber');
    if (!carColor) missingFields.push('carColor');
    if (!durationLabel) missingFields.push('durationLabel');
    if (durationMinutes === undefined || durationMinutes === null) missingFields.push('durationMinutes');
    if (price === undefined || price === null) missingFields.push('price');
    if (!stripePaymentIntentId) missingFields.push('stripePaymentIntentId');

    if (missingFields.length > 0) {
      const message = `Missing required booking fields: ${missingFields.join(', ')}`;
      console.error('[CustomerController] createBooking validation failed:', message, 'body:', req.body);
      res.status(400).json({ success: false, message });
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

export const getCustomerBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await customerService.getBookingWithInvoice(id);

    if (!data) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Booking fetched', data });
  } catch (err) {
    console.error('[CustomerController] getCustomerBooking error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch booking' });
  }
};

export const downloadCustomerInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const filePath = await invoiceService.downloadInvoice(id);

    if (!filePath || !fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: 'Invoice file not found' });
      return;
    }

    const fileName = path.basename(filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('[CustomerController] downloadCustomerInvoice error:', err);
    res.status(500).json({ success: false, message: 'Failed to download invoice' });
  }
};
