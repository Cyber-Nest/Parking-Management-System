import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { customerService } from '../services/customer.service';
import { invoiceService } from '../services/invoice.service';
import { TicketService } from '../services/ticket.service';
import { ensureCloudinaryUrl } from '../services/cloudinary.service';
import { ApiResponse, CustomerBookingResponse, ParkingZonePublic } from '../types';
import { NotFoundError, ValidationError } from '../services/commonErrors';
import { enforcementRepository } from '../repositories/enforcement.repository';

const ticketService = new TicketService();

const handleError = (err: unknown, res: Response, fallbackMessage: string) => {
  if (err instanceof ValidationError || err instanceof NotFoundError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[CustomerController] Unhandled error:', err);
  res.status(500).json({ success: false, message: fallbackMessage });
};

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
    const ticket = await ticketService.getByTicketNumber(id);
    const ticketWithPhotos = await enforcementRepository.findTicketById(ticket.id);
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
  } catch (err) {
    console.error('[CustomerController] getPenaltyByTicketNumber error:', err);
    handleError(err, res, 'Failed to fetch penalty');
  }
};

export const payPenaltyTicket = async (req: Request, res: Response): Promise<void> => {
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
  } catch (err) {
    console.error('[CustomerController] payPenaltyTicket error:', err);
    handleError(err, res, 'Failed to process penalty payment');
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

    let proofUrl: string | undefined;
    if (proofImage && String(proofImage).trim()) {
      proofUrl = await ensureCloudinaryUrl(String(proofImage), { folder: 'parksmart/disputes' });
    }

    const disputeText = `Dispute filed by ${fullName} (${email}, ${phone}): ${explanation}${proofUrl ? ` | proof: ${proofUrl}` : ''}`;
    const data = await ticketService.disputeTicket(id, disputeText);
    res.status(200).json({ success: true, message: 'Penalty dispute submitted', data });
  } catch (err) {
    console.error('[CustomerController] disputePenaltyTicket error:', err);
    handleError(err, res, 'Failed to submit dispute');
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

export const downloadPenaltyReceipt = async (req: Request, res: Response): Promise<void> => {
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

    const filePath = await invoiceService.downloadInvoice(invoice.id);
    if (!filePath || !fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: 'Receipt file not found' });
      return;
    }

    const fileName = path.basename(filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('[CustomerController] downloadPenaltyReceipt error:', err);
    handleError(err, res, 'Failed to download receipt');
  }
};

export const getCustomerInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const invoice = await invoiceService.getInvoice(id);

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Invoice fetched',
      data: invoice,
    });
  } catch (err) {
    console.error('[CustomerController] getCustomerInvoice error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch invoice' });
  }
};
