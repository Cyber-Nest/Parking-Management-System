import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "./api";

export interface ParkingZone {
  zoneId: string;
  zoneName: string;
  address: string;
  image: string;
  hourlyRate: number;
  availableSpots: number;
  totalSpots: number;
  spotId: string;
}

export interface ParkingDetails {
  lotId: any;
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
  type?: string;
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
  taxAmount?: number;
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
  planId?: string;
}

export interface PenaltyVehicleDetails {
  vehicleModel: string;
  plateNumber: string;
  carColor: string;
}

export interface PenaltyDetails {
  evidenceImage: string;
  proofImages: string[];
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

  receiptInvoiceId?: string | null;
}

export interface PenaltyPaymentResponse {
  payment_id: string;
  invoice_id?: string;
  invoice_number?: string;
}

export interface CustomerInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_email: string;
  customer_name?: string | null;
  vehicle_plate_number?: string | null;
  item_type: string;
  item_description?: string | null;
  subtotal?: number;
  tax_amount?: number;
  service_fee?: number;
  total_amount: number;
  currency?: string;
  payment_status: string;
  paid_amount: number;
  status: string;
}

export interface PenaltyDisputePayload {
  fullName: string;

  email: string;

  phone: string;

  address?: string;

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
  async getParkingZoneById(lotId: string): Promise<ParkingDetails> {
    const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.PARKING_ZONE(lotId));
    const data = response.data?.data;

    if (!data) {
      throw new Error("Parking lot not found");
    }

    const zonesArray = Array.isArray(data.zones) ? data.zones : [];
    const zones: ParkingZone[] | undefined =
      zonesArray.length > 0
        ? zonesArray.map((z: Record<string, unknown>) => ({
          zoneId: String(z.id),
          zoneName: String(z.parking_name ?? "Zone"),
          address: String(z.address ?? ""),
          image: sanitizeParkingImageUrl(String(z.image_url ?? "")),
          hourlyRate: Number(z.hourly_rate ?? 0),
          availableSpots: Number(z.available_spots ?? 0),
          totalSpots: Number(z.total_spots ?? 0),
          spotId: String(z.spot_id ?? ""),
        }))
        : undefined;

    return {
      lotId: data.lot_id ?? lotId,
      zoneId: data.lot_id ?? lotId,

      parkingName: data.lot_name ?? "Parking Lot",
      address: data.address ?? "",
      image: sanitizeParkingImageUrl(data.image_url),
      hourlyRate: zones?.[0]?.hourlyRate ?? 0,
      availableSpots: zones?.reduce((acc: number, z: ParkingZone) => acc + z.availableSpots, 0) ?? 0,
      totalSpots: zones?.reduce((acc: number, z: ParkingZone) => acc + z.totalSpots, 0) ?? 0,
      spotId: data.lot_id ?? "",
      zones,
    };
  }

  getDurationOptions(): DurationOption[] {
    return [
      {
        label: '1H',
        value: '1h',
        price: 4.5,
        minutes: 60,
        type: "short",
      },

      {
        label: "2H",
        value: "2h",
        price: 8.0,
        minutes: 120,
        type: "short",
      },

      {
        label: "4H",
        value: "4h",
        price: 15.0,
        minutes: 240,
        type: "short",
      },

      {
        label: "8H",
        value: "8h",
        price: 32.0,
        minutes: 480,
        type: "short",
      },

      // {
      //   label: "HALF DAY",
      //   value: "half-day",
      //   price: 30,
      //   minutes: 720,
      // },

      {
        label: "FULL DAY",
        value: "full-day",
        price: 50,
        minutes: 1440,
        type: "long",
      },

      {
        label: "WEEKLY",
        value: "weekly",
        price: 180,
        minutes: 10080,
        type: "long",
      },

      {
        label: "MONTHLY",
        value: "monthly",
        price: 600,
        minutes: 43200,
        type: "long",
      },
      {
        label: "QUARTERLY",
        value: "quarterly",
        price: 1500,
        minutes: 129600,
        type: "long",
      },

      // {
      //   label: "CUSTOM",
      //   value: "custom",
      //   price: 0,
      //   minutes: 0,
      // },
    ];
  }

  generateBookingSummary(payload: CompleteBookingPayload): BookingSummary {
    const now = new Date();
    const endDate = new Date(
      now.getTime() + payload.selectedDuration.minutes * 60 * 1000,
    );
    // Calculate subtotal from parking plan / zone hourly rate when available
    const hourlyRate = payload.parkingDetails?.hourlyRate ?? payload.selectedDuration.price;
    const subtotal = (payload.selectedDuration.minutes / 60) * hourlyRate;
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

  async getTaxPricing(parkingLotId?: string): Promise<{ taxRate: number; pricesIncludeTax: boolean; currency?: string }> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.SETTINGS.TAX_PRICING, {
        params: parkingLotId ? { parking_lot_id: parkingLotId } : undefined,
      });
      const data = response.data?.data ?? {};
      return {
        taxRate: Number(data.taxRate ?? 0),
        pricesIncludeTax: (data.pricesIncludeTax ?? 'no') === 'yes',
        currency: data.currency ?? 'CAD',
      };
    } catch (err) {
      return { taxRate: 0, pricesIncludeTax: true, currency: 'CAD' };
    }
  }

  async generateBookingSummaryWithTax(payload: CompleteBookingPayload): Promise<BookingSummary> {
    const now = new Date();
    const endDate = new Date(now.getTime() + payload.selectedDuration.minutes * 60 * 1000);
    const hourlyRate = payload.parkingDetails?.hourlyRate ?? payload.selectedDuration.price;
    const subtotal = (payload.selectedDuration.minutes / 60) * hourlyRate;
    const taxInfo = await this.getTaxPricing(payload.parkingDetails?.lotId);
    const serviceFee = 2;

    let taxAmount = 0;
    let total = 0;

    if (taxInfo.pricesIncludeTax) {
      taxAmount = subtotal - subtotal / (1 + taxInfo.taxRate / 100);
      total = subtotal + serviceFee;
    } else {
      taxAmount = (subtotal * taxInfo.taxRate) / 100;
      total = subtotal + taxAmount + serviceFee;
    }

    return {
      subtotal,
      serviceFee,
      taxAmount,
      total,
      startTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: payload.selectedDuration.label,
      transactionId: `PS-${Math.floor(100000 + Math.random() * 900000)}`,
    } as BookingSummary;
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

  async getParkingPlansByLot(lotId: string): Promise<DurationOption[]> {
    const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.PARKING_PLANS, {
      params: { lotId },
    });
    const plans = Array.isArray(response.data?.data) ? response.data.data : [];
    return plans.map((plan: any) => ({
      type: plan.plan_type ?? 'lot',
      label: plan.name ?? `${plan.duration}m`,
      value: String(plan.id ?? `${plan.duration}m-${plan.price}`),
      price: Number(plan.price ?? 0),
      minutes: Number(plan.duration ?? 0),
    }));
  }

  async submitBooking(
    payload: CompleteBookingPayload,
    stripePaymentIntentId: string,
  ): Promise<BookingResponse> {
    const price = payload.parkingDetails.hourlyRate
      ? (payload.selectedDuration.minutes / 60) * payload.parkingDetails.hourlyRate
      : payload.selectedDuration.price;

    const response = await axiosInstance.post(API_ENDPOINTS.CUSTOMER.BOOKINGS, {
      zoneId: payload.parkingDetails.zoneId,
      lotId: payload.parkingDetails.lotId,
      email: payload.vehicleDetails.email,
      vehicleModel: payload.vehicleDetails.vehicleModel,
      plateNumber: payload.vehicleDetails.plateNumber,
      carColor: payload.vehicleDetails.carColor,
      durationLabel: payload.selectedDuration.label,
      durationMinutes: payload.selectedDuration.minutes,
      price,
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

  async getBookingById(bookingId: string): Promise<CustomerBookingDetails | null> {
    const response = await axiosInstance.get(
      API_ENDPOINTS.CUSTOMER.BOOKING_BY_ID(bookingId),
    );
    return response.data?.data?.booking ?? null;
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
      stripePaymentIntentId: string;
    },
  ): Promise<CustomerBookingDetails> {
    const response = await axiosInstance.patch(
      API_ENDPOINTS.CUSTOMER.BOOKING_EXTEND(bookingId),
      {
        durationLabel: payload.durationLabel,
        durationMinutes: payload.durationMinutes,
        amount: payload.amount,
        stripePaymentIntentId: payload.stripePaymentIntentId,
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

  async downloadPenaltyReceipt(ticketNumber: string, email?: string): Promise<void> {
    const response = await axiosInstance.get(
      API_ENDPOINTS.CUSTOMER.PENALTY_RECEIPT(ticketNumber),
      {
        params: email ? { email } : undefined,
        responseType: "blob",
      },
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${ticketNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async getInvoice(invoiceId: string): Promise<CustomerInvoice | null> {
    const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.INVOICE(invoiceId));
    return response.data?.data ?? null;
  }

  async processDummyPayment(): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return true;
  }

  async getPenaltyById(penaltyId: string, email?: string): Promise<PenaltyDetails | null> {
    const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.PENALTY(penaltyId), {
      params: email ? { email } : undefined,
    });
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

    const rawProofImages = Array.isArray(data.photos)
      ? data.photos.map((item: unknown) => String(item)).filter(Boolean)
      : [];
    const proofImages = rawProofImages.length
      ? rawProofImages
      : data.evidence_image
        ? [String(data.evidence_image)]
        : [];

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
      evidenceImage: proofImages[0] ?? '',
      proofImages,
      receiptInvoiceId: data.receiptInvoiceId ?? null,
    };
  }

  async payPenalty(penaltyId: string, email?: string, transactionRef?: string): Promise<PenaltyPaymentResponse> {
    const response = await axiosInstance.patch(
      API_ENDPOINTS.CUSTOMER.PENALTY_PAY(penaltyId),
      {
        email,
        transaction_ref: transactionRef,
      },
    );
    if (response.data?.success !== true) {
      const message = response.data?.message || 'Penalty payment failed';
      throw new Error(message);
    }
    return response.data?.data as PenaltyPaymentResponse;
  }

  async submitPenaltyDispute(
    penaltyId: string,
    payload: PenaltyDisputePayload,
  ): Promise<boolean> {
    const response = await axiosInstance.post(
      API_ENDPOINTS.CUSTOMER.PENALTY_DISPUTE(penaltyId),
      {
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        explanation: payload.explanation,
        proofImage: payload.proofImage,
      },
    );
    return response.data?.success === true;
  }
}

export const customerService = new CustomerService();
