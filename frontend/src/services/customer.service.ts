import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";

export interface ParkingZone {
  zoneId: string;
  zoneName: string;
  hourlyRate: number;
  availableSpots: number;
  totalSpots: number;
  spotId: string;
}

export interface ParkingDetails {
  zoneId: string;
  parkingName: string;
  address: string;
  image: string;
  hourlyRate: number;
  availableSpots: number;
  totalSpots: number;
  spotId: string;

  zones?: ParkingZone[];
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

export interface PaymentIntentResponse {
  id: string;
  clientSecret: string;
  amount: number;
  status: string;
}

export interface BookingResponse {
  bookingId: string;
  paymentId: string;
  receiptNumber: string;
  amount: number;
  total: number;
  bookingReference?: string;
  transactionId?: string;
  transactionReference?: string;
  invoiceId?: string;
  invoiceNumber?: string;
}

export interface CustomerBookingDetails {
  id: string;
  bookingReference: string;
  parking_name: string;
  parking_location?: string;
  zone_name?: string;
  duration_label?: string;
  hourly_rate?: number;
  total_price?: number;
  end_time?: string;
  booking_status?: string;
  grace_period_minutes?: number;
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

export interface PenaltyVehicleDetails {
  vehicleModel: string;
  plateNumber: string;
  carColor: string;
}

export interface PenaltyDetails {
  penaltyId: string;

  parkingName: string;

  zoneName?: string;

  hasMultipleZones: boolean;

  vehicleDetails: PenaltyVehicleDetails;

  bookingStartTime: string;

  allowedEndTime: string;

  overtimeDuration: string;

  generatedPenalty: number;

  violationReason: string;

  status: "pending" | "paid" | "disputed";

  issuedAt: string;
}

export interface PenaltyDisputePayload {
  fullName: string;

  email: string;

  phone: string;

  explanation: string;

  proofImage?: string | null;
}

const DEFAULT_PARKING_IMAGE =
  "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80";

function sanitizeParkingImageUrl(url: string | undefined | null): string {
  if (!url?.trim()) return DEFAULT_PARKING_IMAGE;
  const trimmed = url.trim();
  if (/photo-15\d{10,}000000000/i.test(trimmed) || trimmed.includes("1510000000000")) {
    return DEFAULT_PARKING_IMAGE;
  }
  return trimmed;
}

class CustomerService {
  async getParkingZoneById(zoneId: string): Promise<ParkingDetails> {
    const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.PARKING_ZONE(zoneId));
    const data = response.data?.data;

    if (!data) {
      throw new Error("Parking zone not found");
    }

    const subZones = Array.isArray(data.sub_zones) ? data.sub_zones : [];
    const zones: ParkingZone[] | undefined =
      subZones.length > 0
        ? [
            {
              zoneId: data.id ?? zoneId,
              zoneName: data.parking_name ?? "Main",
              hourlyRate: Number(data.hourly_rate ?? 0),
              availableSpots: Number(data.available_spots ?? 0),
              totalSpots: Number(data.total_spots ?? 0),
              spotId: data.spot_id ?? "",
            },
            ...subZones.map((z: Record<string, unknown>) => ({
              zoneId: String(z.id),
              zoneName: String(z.parking_name ?? "Zone"),
              hourlyRate: Number(z.hourly_rate ?? 0),
              availableSpots: Number(z.available_spots ?? 0),
              totalSpots: Number(z.total_spots ?? 0),
              spotId: String(z.spot_id ?? ""),
            })),
          ]
        : undefined;

    return {
      zoneId: data.id ?? zoneId,
      parkingName: data.parking_name ?? "Parking Zone",
      address: data.address ?? "",
      image: sanitizeParkingImageUrl(data.image_url),
      hourlyRate: Number(data.hourly_rate ?? 0),
      availableSpots: Number(data.available_spots ?? 0),
      totalSpots: Number(data.total_spots ?? 0),
      spotId: data.spot_id ?? "",
      zones,
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
        label: "5H",
        value: "5h",
        price: 18,
        minutes: 300,
      },

      {
        label: "HALF DAY",
        value: "half-day",
        price: 30,
        minutes: 720,
      },

      {
        label: "FULL DAY",
        value: "full-day",
        price: 50,
        minutes: 1440,
      },

      {
        label: "WEEKLY",
        value: "weekly",
        price: 180,
        minutes: 10080,
      },

      {
        label: "CUSTOM",
        value: "custom",
        price: 0,
        minutes: 0,
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

  /** Amount in CAD dollars (e.g. 6.50). Backend converts to cents for Stripe. */
  async createPaymentIntent(amountInDollars: number): Promise<PaymentIntentResponse> {
    const response = await axiosInstance.post(API_ENDPOINTS.CUSTOMER.PAYMENT_INTENT, {
      amount: amountInDollars,
    });

    const data = response.data?.data;
    return {
      id: data?.id ?? "",
      clientSecret: data?.clientSecret ?? "",
      amount: data?.amount ?? 0,
      status: data?.status ?? "requires_payment_method",
    };
  }

  async getStripeConfig(): Promise<{ stripePublishableKey: string }> {
    const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.CONFIG);
    return response.data?.data as { stripePublishableKey: string };
  }

  async submitBooking(
    payload: CompleteBookingPayload,
    stripePaymentIntentId: string,
  ): Promise<BookingResponse> {
    const response = await axiosInstance.post(API_ENDPOINTS.CUSTOMER.BOOKINGS, {
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

  async getBookingWithInvoice(bookingId: string): Promise<{
    invoice?: { id: string; invoice_number?: string };
    invoiceId?: string;
  } | null> {
    const response = await axiosInstance.get(
      API_ENDPOINTS.CUSTOMER.BOOKING_BY_ID(bookingId),
    );
    const data = response.data?.data as {
      booking?: { id: string };
      invoice?: { id: string; invoice_number?: string };
    } | null;
    if (!data) return null;
    return {
      invoice: data.invoice,
      invoiceId: data.invoice?.id,
    };
  }

  async getBookingByReference(reference: string): Promise<CustomerBookingDetails | null> {
    const response = await axiosInstance.get(
      API_ENDPOINTS.CUSTOMER.BOOKING_BY_REFERENCE(reference),
    );
    return response.data?.data?.booking ?? null;
  }

  async extendBooking(
    bookingId: string,
    payload: {
      durationLabel: string;
      durationMinutes: number;
      amount: number;
    },
  ): Promise<CustomerBookingDetails> {
    const response = await axiosInstance.patch(
      API_ENDPOINTS.CUSTOMER.BOOKING_EXTEND(bookingId),
      {
        durationLabel: payload.durationLabel,
        durationMinutes: payload.durationMinutes,
        amount: payload.amount,
      },
    );
    return response.data?.data as CustomerBookingDetails;
  }

  async downloadInvoice(invoiceId: string): Promise<void> {
    const response = await axiosInstance.get(
      API_ENDPOINTS.CUSTOMER.INVOICE_DOWNLOAD(invoiceId),
      { responseType: "blob" },
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${invoiceId.slice(0, 8)}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async processDummyPayment(): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return true;
  }

  async getPenaltyById(penaltyId: string): Promise<PenaltyDetails | null> {
    const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.PENALTY(penaltyId));
    const data = response.data?.data;
    if (!data) return null;

    const startTime = data.start_time
      ? new Date(data.start_time)
      : data.date_issued
      ? new Date(data.date_issued)
      : null;
    const endTime = data.end_time
      ? new Date(data.end_time)
      : data.due_date
      ? new Date(data.due_date)
      : null;

    const overtimeMinutes = endTime
      ? Math.max(
          0,
          Math.round((Date.now() - endTime.getTime()) / 60000),
        )
      : 0;

    return {
      penaltyId: data.ticket_number,
      parkingName: data.parking_name || data.location_name || 'Parking Location',
      zoneName: data.zone_name || data.location_name || undefined,
      hasMultipleZones: Boolean(data.zone_name),
      vehicleDetails: {
        vehicleModel: data.vehicle_model || data.plan_name || 'Unknown',
        plateNumber: data.license_plate || 'N/A',
        carColor: data.vehicle_color || 'Unknown',
      },
      bookingStartTime: startTime
        ? startTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Unknown',
      allowedEndTime: endTime
        ? endTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Unknown',
      overtimeDuration: `${overtimeMinutes} Minutes`,
      generatedPenalty: Number(data.amount ?? 0),
      violationReason: data.reason || 'Violation details unavailable',
      status:
        data.status === 'paid'
          ? 'paid'
          : data.status === 'disputed'
          ? 'disputed'
          : 'pending',
      issuedAt: data.date_issued ?? new Date().toISOString(),
    };
  }

  async payPenalty(penaltyId: string): Promise<boolean> {
    const response = await axiosInstance.patch(
      API_ENDPOINTS.CUSTOMER.PENALTY_PAY(penaltyId),
    );
    return response.data?.success === true;
  }
}

export const customerService = new CustomerService();
