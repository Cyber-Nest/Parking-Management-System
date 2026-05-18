import axios from '@/lib/axios';
import { API_ENDPOINTS } from './api';

export interface ParkingDetails {
  zoneId: string;
  parkingName: string;
  address: string;
  image: string;
  hourlyRate: number;
  availableSpots: number;
  totalSpots: number;
  spotId: string;
}

export interface VehicleDetails {
  email: string;
  vehicleModel: string;
  plateNumber: string;
  carColor: string;
}

export interface DurationOption {
  label: string;
  value: string;
  price: number;
  minutes: number;
}

export interface BookingSummary {
  subtotal: number;
  serviceFee: number;
  total: number;
  startTime: string;
  endTime: string;
  duration: string;
  transactionId: string;
}

export interface CompleteBookingPayload {
  parkingDetails: ParkingDetails;
  vehicleDetails: VehicleDetails;
  selectedDuration: DurationOption;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface BookingResponse {
  bookingId: string;
  paymentId: string;
  receiptNumber: string;
  amount: number;
  total: number;
}

class CustomerService {
  async getParkingZoneById(zoneId: string): Promise<ParkingDetails> {
    const response = await axios.get(API_ENDPOINTS.CUSTOMER.PARKING_ZONE(zoneId));
    const data = response.data?.data;

    return {
      zoneId: data.id,
      parkingName: data.parking_name,
      address: data.address,
      image: data.image_url,
      hourlyRate: Number(data.hourly_rate),
      availableSpots: Number(data.available_spots),
      totalSpots: Number(data.total_spots),
      spotId: data.spot_id,
    };
  }

  getDurationOptions(): DurationOption[] {
    return [
      {
        label: '30M',
        value: '30m',
        price: 2.5,
        minutes: 30,
      },
      {
        label: '1H',
        value: '1h',
        price: 4.5,
        minutes: 60,
      },
      {
        label: '3H',
        value: '3h',
        price: 12,
        minutes: 180,
      },
      {
        label: 'DAY',
        value: 'day',
        price: 25,
        minutes: 1440,
      },
    ];
  }

  generateBookingSummary(payload: CompleteBookingPayload): BookingSummary {
    const now = new Date();
    const endDate = new Date(
      now.getTime() + payload.selectedDuration.minutes * 60 * 1000,
    );

    const subtotal = payload.selectedDuration.price;
    const serviceFee = 2;
    const total = subtotal + serviceFee;

    return {
      subtotal,
      serviceFee,
      total,
      startTime: now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      endTime: endDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration: payload.selectedDuration.label,
      transactionId: `PS-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }

  async createPaymentIntent(amount: number): Promise<PaymentIntentResponse> {
    const response = await axios.post(API_ENDPOINTS.CUSTOMER.PAYMENT_INTENT, {
      amount,
    });

    return response.data?.data as PaymentIntentResponse;
  }

  async getStripeConfig(): Promise<{ stripePublishableKey: string }> {
    const response = await axios.get(API_ENDPOINTS.CUSTOMER.CONFIG);
    return response.data?.data as { stripePublishableKey: string };
  }

  async submitBooking(
    payload: CompleteBookingPayload,
    stripePaymentIntentId: string,
  ): Promise<BookingResponse> {
    const response = await axios.post(API_ENDPOINTS.CUSTOMER.BOOKINGS, {
      zoneId: payload.parkingDetails.zoneId,
      email: payload.vehicleDetails.email,
      vehicleModel: payload.vehicleDetails.vehicleModel,
      plateNumber: payload.vehicleDetails.plateNumber,
      carColor: payload.vehicleDetails.carColor,
      durationLabel: payload.selectedDuration.label,
      durationMinutes: payload.selectedDuration.minutes,
      price: payload.selectedDuration.price,
      stripePaymentIntentId,
    });

    return response.data?.data as BookingResponse;
  }
}

export const customerService = new CustomerService();
