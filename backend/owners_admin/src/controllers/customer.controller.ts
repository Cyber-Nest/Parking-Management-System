import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { customerService } from '../services/customer.service';
import { invoiceService } from '../services/invoice.service';
import { TicketService } from '../services/ticket.service';
import { ApiResponse, CustomerBookingResponse, ParkingZonePublic } from '../types';

const ticketService = new TicketService();

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

export const getCustomerBookingByReference = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reference } = req.params;
    const booking = await customerService.getBookingByReference(reference);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Booking fetched', data: { booking } });
  } catch (err) {
    console.error('[CustomerController] getCustomerBookingByReference error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch booking' });
  }
};

export const extendCustomerBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { durationLabel, durationMinutes, amount, stripePaymentIntentId } = req.body;

    if (!durationLabel || durationMinutes === undefined || amount === undefined || !stripePaymentIntentId) {
      res.status(400).json({ success: false, message: 'Missing required fields for booking extension' });
      return;
    }

    const booking = await customerService.extendBooking(id, {
      durationLabel,
      durationMinutes: Number(durationMinutes),
      amount: Number(amount),
      stripePaymentIntentId,
    });

    res.status(200).json({ success: true, message: 'Booking extended successfully', data: booking });
  } catch (err) {
    console.error('[CustomerController] extendCustomerBooking error:', err);
    res.status(500).json({ success: false, message: String(err instanceof Error ? err.message : 'Failed to extend booking') });
  }
};

export const getPenaltyByTicketNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await ticketService.getByTicketNumber(id);
    res.status(200).json({ success: true, message: 'Penalty fetched', data });
  } catch (err) {
    console.error('[CustomerController] getPenaltyByTicketNumber error:', err);
    res.status(404).json({ success: false, message: String(err instanceof Error ? err.message : 'Penalty not found') });
  }
};

export const payPenaltyTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email } = req.body; // Get email from request body
    
    const ticket = await ticketService.getByTicketNumber(id);
    const data = await ticketService.markPaid(ticket.id, {
      payment_method: 'stripe',
      transaction_ref: `CUST-${Date.now()}`,
      customer_email: email, // Pass customer email for email notification
    });
    res.status(200).json({ success: true, message: 'Penalty paid successfully', data });
  } catch (err) {
    console.error('[CustomerController] payPenaltyTicket error:', err);
    res.status(500).json({ success: false, message: String(err instanceof Error ? err.message : 'Failed to process penalty payment') });
  }
};

export const disputePenaltyTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, explanation, proofImage } = req.body;

    if (!fullName || !email || !phone || !explanation) {
      res.status(400).json({ success: false, message: 'fullName, email, phone, and explanation are required' });
      return;
    }

    const disputeText = `Dispute filed by ${fullName} (${email}, ${phone}): ${explanation}${proofImage ? ` | proof: ${proofImage}` : ''}`;
    const data = await ticketService.disputeTicket(id, disputeText);
    res.status(200).json({ success: true, message: 'Penalty dispute submitted', data });
  } catch (err) {
    console.error('[CustomerController] disputePenaltyTicket error:', err);
    res.status(500).json({ success: false, message: String(err instanceof Error ? err.message : 'Failed to submit dispute') });
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
