import Stripe from 'stripe';
import { env } from '../config/env';
import { PaymentRepository } from '../repositories/payment.repository';
import { SessionRepository } from '../repositories/session.repository';
import { ParkingPlanRepository, ParkingPlanRow } from '../repositories/parkingPlan.repository';
import { ParkingZoneRepository } from '../repositories/parkingZone.repository';
import { ParkingLotRepository } from '../repositories/parkingLot.repository';
import { bookingService } from './booking.service';
import { transactionService } from './transaction.service';
import { invoiceService } from './invoice.service';
import { SettingsService } from './settings.service';
import {
  CustomerBookingPayload,
  CustomerBookingResponse,
  ParkingLotCustomerResponse,
} from '../types';
import { sanitizeParkingImageUrl } from '../utils/parkingImages';
import { sendEmail, paymentReceiptTemplate } from '../utils/email';

const parkingZoneRepo = new ParkingZoneRepository();
const parkingLotRepo = new ParkingLotRepository();
const parkingPlanRepo = new ParkingPlanRepository();
const sessionRepo = new SessionRepository();
const paymentRepo = new PaymentRepository();
const stripe = new Stripe(env.stripe.secretKey, { apiVersion: '2022-11-15' });

const formatDateTime = (date: Date): string =>
  date.toISOString().slice(0, 19).replace('T', ' ');

const SERVICE_FEE = 2;
const settingsService = new SettingsService();

export class CustomerService {
  async getParkingZoneById(lotId: string): Promise<ParkingLotCustomerResponse> {
    const lot = await parkingLotRepo.findById(lotId);
    if (!lot) {
      throw new Error('Parking lot not found');
    }

    const zonesResponse = await parkingZoneRepo.listByLot(lotId, 1, 100);
    const zones = zonesResponse?.items || [];

    return {
      lot_id: lot.id,
      lot_name: lot.lot_name,
      address: lot.address ?? '',
      image_url: sanitizeParkingImageUrl(lot.image_url ?? ''),
      zones: zones.map((z) => ({
        id: z.id,
        parking_name: z.parking_name,
        address: z.address,
        image_url: sanitizeParkingImageUrl(z.image_url ?? ''),
        hourly_rate: z.hourly_rate,
        available_spots: z.available_spots,
        total_spots: z.total_spots,
        spot_id: z.spot_id,
        parking_lot_id: z.parking_lot_id,
      })),
    };
  }

  /** Amount is in CAD dollars (e.g. 6.50 for $6.50). */
  async createPaymentIntent(amount: number): Promise<{ clientSecret: string; amount: number; currency: string }> {
    if (!env.stripe.secretKey) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in backend .env');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'cad',
        payment_method_types: ['card'],
        description: 'ParkSmart parking booking',
        metadata: {
          source: 'customer_booking',
        },
      });

      if (!paymentIntent.client_secret) {
        throw new Error('Unable to create payment intent');
      }

      return {
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency ?? 'cad',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Stripe error';
      throw new Error(`Stripe payment intent creation failed: ${message}`);
    }
  }

  async getStripeConfig(): Promise<{ stripePublishableKey: string }> {
    if (!env.stripe.publishableKey) {
      throw new Error('Stripe publishable key is not configured. Please set STRIPE_PUBLISHABLE_KEY in backend .env');
    }

    return {
      stripePublishableKey: env.stripe.publishableKey,
    };
  }

  async getParkingPlansForLot(lotId: string): Promise<ParkingPlanRow[]> {
    return parkingPlanRepo.listByLotId(lotId);
  }

  async getBookingByReference(reference: string) {
    return await bookingService.getBookingByReference(reference);
  }

  async extendBooking(
    bookingId: string,
    payload: {
      durationLabel: string;
      durationMinutes: number;
      amount: number;
      stripePaymentIntentId: string;
    }
  ) {
    const booking = await bookingService.getBooking(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.booking_status === 'cancelled' || booking.booking_status === 'completed') {
      throw new Error('Cannot extend a cancelled or completed booking');
    }

    if (booking.allow_extension === 0) {
      throw new Error('Booking extension is not allowed for this booking');
    }

    if (!payload.stripePaymentIntentId) {
      throw new Error('Stripe payment intent ID is required for booking extension');
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(payload.stripePaymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Stripe payment intent is not completed');
    }

    const expectedAmount = Math.round(payload.amount * 100);
    if (paymentIntent.amount < expectedAmount) {
      throw new Error('Stripe payment amount is lower than the extension amount');
    }

    const existingEndTime = new Date(booking.end_time);
    const newEndTime = new Date(existingEndTime.getTime() + payload.durationMinutes * 60000);
    const updatedDurationMinutes = Number(booking.duration_minutes) + payload.durationMinutes;
    const updatedTotalPrice = Number(booking.total_price) + payload.amount;
    const updatedExtensions = Number(booking.total_extensions ?? 0) + 1;

    const updatedBooking = await bookingService.updateBooking(booking.id, {
      end_time: newEndTime,
      duration_label: payload.durationLabel,
      duration_minutes: updatedDurationMinutes,
      total_price: updatedTotalPrice,
      booking_status: 'extended',
      total_extensions: updatedExtensions,
    });

    try {
      const transaction = await transactionService.createTransaction({
        amount: payload.amount,
        paymentMethod: 'stripe',
        transactionType: 'booking_extension',
        bookingId: booking.id,
        userEmail: booking.customer_email,
        stripePaymentIntentId: payload.stripePaymentIntentId,
      });
      await transactionService.completeTransaction(transaction.id);

      const extendInvoice = await invoiceService.createInvoice({
        customerEmail: booking.customer_email,
        vehiclePlateNumber: booking.vehicle_plate_number,
        vehicleModel: booking.vehicle_model,
        vehicleColor: booking.vehicle_color ?? undefined,
        itemDescription: `Extension for booking ${booking.booking_reference} (${payload.durationLabel})`,
        itemType: 'extension',
        quantity: 1,
        unitPrice: payload.amount,
        subtotal: payload.amount,
        taxAmount: 0,
        serviceFee: 0,
        totalAmount: payload.amount,
        bookingId: booking.id,
        transactionId: transaction.id,
        parkingZone: booking.parking_name,
        parkingLocation: booking.parking_location ?? undefined,
        startTime: existingEndTime,
        endTime: newEndTime,
        durationMinutes: payload.durationMinutes,
      });

      if (extendInvoice?.id) {
        await invoiceService.markAsPaid(extendInvoice.id, payload.amount);
      }

      // Send extension confirmation email
      try {
        const emailHtml = paymentReceiptTemplate({
          bookingId: booking.id,
          customerEmail: booking.customer_email,
          vehicleModel: booking.vehicle_model,
          vehiclePlateNumber: booking.vehicle_plate_number,
          parkingName: booking.parking_name,
          parkingLocation: booking.parking_location || 'N/A',
          startTime: existingEndTime,
          endTime: newEndTime,
          durationLabel: payload.durationLabel,
          bookingReference: booking.booking_reference,
          invoiceNumber: extendInvoice?.invoice_number || 'N/A',
          totalAmount: payload.amount,
          basePrice: payload.amount,
          serviceFee: 0,
          frontendUrl: env.frontendUrl,
        });

        const attachments = [];
        if (extendInvoice?.pdf_file_path) {
          attachments.push({
            filename: `extension-invoice-${extendInvoice.invoice_number}.pdf`,
            path: extendInvoice.pdf_file_path,
          });
        }

        await sendEmail({
          to: booking.customer_email,
          subject: `ParkSmart Extension Confirmed - Reservation #${booking.booking_reference}`,
          html: emailHtml,
          emailType: 'extension_receipt',
          relatedId: booking.id,
          attachments: attachments.length > 0 ? attachments : undefined,
        });

        console.log(`[CustomerService] Extension confirmation sent to ${booking.customer_email}`);
      } catch (emailError) {
        console.error('[CustomerService] Failed to send extension email:', emailError);
      }
    } catch (error) {
      console.error('[CustomerService] extendBooking transaction/invoice failed:', error);
    }

    return updatedBooking;
  }

  async createBooking(payload: CustomerBookingPayload): Promise<CustomerBookingResponse> {
    const zone = await parkingZoneRepo.findById(payload.zoneId);
    if (!zone) {
      throw new Error('Parking zone not found');
    }
    if (zone.available_spots <= 0) {
      throw new Error('No available spots in the selected parking zone');
    }
    if (!payload.stripePaymentIntentId) {
      throw new Error('Stripe payment intent ID is required');
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(payload.stripePaymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Stripe payment intent is not completed');
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + payload.durationMinutes * 60000);
    const paidAt = formatDateTime(new Date());

    const basePrice = Number(payload.price);
    // Fetch tax/pricing for the parking lot (may include lot-specific overrides)
    const taxPricing = await settingsService.getTaxPricing(payload.lotId);
    const settingsServiceFee = Number(taxPricing?.service_fee ?? SERVICE_FEE);

    const matchingPlan = payload.planId
      ? await parkingPlanRepo.findById(payload.planId)
      : (await parkingPlanRepo.findForBooking(payload.durationMinutes, payload.price)) ??
      (await parkingPlanRepo.findByPriceAndDuration(payload.price, payload.durationMinutes));

    // Determine applicable tax rate: plan override wins, else lot/global setting
    const matchingPlanTax = matchingPlan?.tax_percent ?? null;
    const taxRatePercent = Number(matchingPlanTax && matchingPlanTax > 0 ? matchingPlanTax : taxPricing?.tax_rate_percent ?? 0);

    const pricesIncludeTax = Number(taxPricing?.prices_include_tax ?? 1) === 1;

    let taxAmount = 0;
    let serviceFee = settingsServiceFee;
    let totalAmount = 0;

    if (pricesIncludeTax) {
      // basePrice already includes tax -> extract tax portion
      taxAmount = Number((basePrice - basePrice / (1 + taxRatePercent / 100)).toFixed(2));
      totalAmount = Number((basePrice + serviceFee).toFixed(2));
    } else {
      taxAmount = Number(((basePrice * taxRatePercent) / 100).toFixed(2));
      totalAmount = Number((basePrice + taxAmount + serviceFee).toFixed(2));
    }

    const planId = matchingPlan?.id ?? null;
    const planName = matchingPlan?.name ?? payload.durationLabel;

    const sessionId = await sessionRepo.create({
      licensePlate: payload.plateNumber,
      planId: planId ?? undefined,
      planName,
      startTime: formatDateTime(startTime),
      endTime: formatDateTime(endTime),
      durationMinutes: payload.durationMinutes,
      status: 'active',
      notes: `Vehicle: ${payload.vehicleModel} / ${payload.carColor}`,
    });

    const paymentId = await paymentRepo.create({
      sessionId,
      licensePlate: payload.plateNumber,
      amount: totalAmount,
      paymentMethod: 'credit_card',
      paymentType: 'parking',
      status: 'success',
      transactionRef: payload.stripePaymentIntentId,
      paidAt,
    });

    const booking = await bookingService.createBooking({
      parkingLotId: payload.lotId ?? undefined,
      parkingZoneId: zone.id,
      parkingName: zone.parking_name,
      parkingLocation: zone.address,
      customerEmail: payload.email,
      vehicleModel: payload.vehicleModel,
      vehiclePlateNumber: payload.plateNumber,
      vehicleColor: payload.carColor,
      startTime,
      endTime,
      durationMinutes: payload.durationMinutes,
      durationLabel: payload.durationLabel,
      parkingPlanId: planId ?? undefined,
      hourlyRate: Number(zone.hourly_rate),
      basePrice,
      taxAmount,
      serviceFee,
      totalPrice: totalAmount,
      spotId: zone.spot_id,
    });

    await bookingService.updateBooking(booking.id, {
      stripe_payment_intent_id: payload.stripePaymentIntentId,
    });

    const transaction = await transactionService.createTransaction({
      amount: totalAmount,
      paymentMethod: 'stripe',
      transactionType: 'parking_booking',
      bookingId: booking.id,
      userEmail: payload.email,
      stripePaymentIntentId: payload.stripePaymentIntentId,
    });

    await transactionService.completeTransaction(transaction.id);

    let invoice: Awaited<ReturnType<typeof invoiceService.createInvoice>> | null = null;
    try {
      invoice = await invoiceService.createInvoice({
        customerEmail: payload.email,
        vehiclePlateNumber: payload.plateNumber,
        vehicleModel: payload.vehicleModel,
        vehicleColor: payload.carColor,
        itemDescription: `Parking at ${zone.parking_name} (${payload.durationLabel})`,
        itemType: 'parking_booking',
        quantity: 1,
        unitPrice: basePrice,
        subtotal: basePrice,
        taxAmount,
        serviceFee,
        totalAmount,
        bookingId: booking.id,
        transactionId: transaction.id,
        parkingZone: zone.parking_name,
        parkingLocation: zone.address,
        startTime,
        endTime,
        durationMinutes: payload.durationMinutes,
      });

      if (invoice?.id) {
        await invoiceService.markAsPaid(invoice.id, totalAmount);
      }
    } catch (invoiceError) {
      console.error('[CustomerService] Invoice/PDF step failed (booking still saved):', invoiceError);
    }

    await bookingService.confirmBooking(booking.id, transaction.id);
    await parkingZoneRepo.decrementAvailableSpots(zone.id);

    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    // Send payment receipt email
    try {
      const emailHtml = paymentReceiptTemplate({
        bookingId: booking.id,
        customerEmail: payload.email,
        vehicleModel: payload.vehicleModel,
        vehiclePlateNumber: payload.plateNumber,
        parkingName: zone.parking_name,
        parkingLocation: zone.address,
        startTime: startTime,
        endTime: endTime,
        durationLabel: payload.durationLabel,
        bookingReference: booking.booking_reference,
        invoiceNumber: invoice?.invoice_number || 'N/A',
        totalAmount: totalAmount,
        basePrice: basePrice,
        serviceFee: serviceFee,
        frontendUrl: env.frontendUrl,
      });

      const attachments = [];
      if (invoice?.pdf_file_path) {
        attachments.push({
          filename: `invoice-${invoice.invoice_number}.pdf`,
          path: invoice.pdf_file_path,
        });
      }

      await sendEmail({
        to: payload.email,
        subject: `ParkSmart Booking Confirmed - Reservation #${booking.booking_reference}`,
        html: emailHtml,
        emailType: 'payment_receipt',
        relatedId: booking.id,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      console.log(`[CustomerService] Payment receipt sent to ${payload.email}` + (attachments.length > 0 ? ' with invoice PDF' : ''));
    } catch (emailError) {
      console.error('[CustomerService] Failed to send receipt email:', emailError);
      // Don't throw - booking is already completed, just log the error
    }

    return {
      bookingId: booking.id,
      paymentId,
      receiptNumber,
      amount: totalAmount,
      total: totalAmount,
      bookingReference: booking.booking_reference,
      parkingPlanId: planId ?? undefined,
      transactionId: transaction.id,
      transactionReference: transaction.transaction_reference,
      invoiceId: invoice?.id,
      invoiceNumber: invoice?.invoice_number,
    };
  }

  async getBookingWithInvoice(bookingId: string) {
    const booking = await bookingService.getBooking(bookingId);
    if (!booking) {
      return null;
    }
    const invoice = await invoiceService.getInvoiceByBookingId(bookingId);
    return { booking, invoice };
  }
}

export const customerService = new CustomerService();
