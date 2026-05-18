import Stripe from 'stripe';
import { env } from '../config/env';
import { PaymentRepository } from '../repositories/payment.repository';
import { SessionRepository } from '../repositories/session.repository';
import { ParkingZoneRepository } from '../repositories/parkingZone.repository';
import {
  CustomerBookingPayload,
  CustomerBookingResponse,
  ParkingZonePublic,
} from '../types';

const parkingZoneRepo = new ParkingZoneRepository();
const sessionRepo = new SessionRepository();
const paymentRepo = new PaymentRepository();
const stripe = new Stripe(env.stripe.secretKey, { apiVersion: '2024-08-23' });

const formatDateTime = (date: Date): string =>
  date.toISOString().slice(0, 19).replace('T', ' ');

export class CustomerService {
  async getParkingZoneById(zoneId: string): Promise<ParkingZonePublic> {
    const zone = await parkingZoneRepo.findById(zoneId);
    if (!zone) {
      throw new Error('Parking zone not found');
    }

    return {
      id: zone.id,
      parking_name: zone.parking_name,
      address: zone.address,
      image_url: zone.image_url,
      hourly_rate: zone.hourly_rate,
      available_spots: zone.available_spots,
      total_spots: zone.total_spots,
      spot_id: zone.spot_id,
    };
  }

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

    const paymentIntent = await stripe.paymentIntents.retrieve(
      payload.stripePaymentIntentId,
    );

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Stripe payment intent is not completed');
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + payload.durationMinutes * 60000);
    const paidAt = formatDateTime(new Date());

    const sessionId = await sessionRepo.create({
      licensePlate: payload.plateNumber,
      planId: zone.id,
      planName: payload.durationLabel,
      startTime: formatDateTime(startTime),
      endTime: formatDateTime(endTime),
      durationMinutes: payload.durationMinutes,
      status: 'active',
      notes: `Vehicle: ${payload.vehicleModel} / ${payload.carColor}`,
      userId: null,
      vehicleId: null,
    });

    const totalAmount = Number(payload.price) + 2;
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

    await parkingZoneRepo.decrementAvailableSpots(zone.id);

    return {
      bookingId: sessionId,
      paymentId,
      receiptNumber: `RCP-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      amount: totalAmount,
      total: totalAmount,
    };
  }
}

export const customerService = new CustomerService();
