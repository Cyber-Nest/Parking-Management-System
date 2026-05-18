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
  id: string;
  status: string;
  message: string;
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

class CustomerService {
  async getParkingZoneById(zoneId: string): Promise<ParkingDetails> {
    const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.PARKING_ZONE(zoneId));
    const data = response.data?.data;

    return {
      zoneId,

      parkingName: "Central Parking Tower",

      address: "123 Commerce St, Downtown Toronto, ON",

      image:
        "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80",

      hourlyRate: 4.5,

      availableSpots: 10,

      totalSpots: 10,

      spotId: "A-102",

      zones: [
        {
          zoneId: "ZONE-A",
          zoneName: "Basement A",
          hourlyRate: 4.5,
          availableSpots: 10,
          totalSpots: 15,
          spotId: "A-102",
        },

        {
          zoneId: "ZONE-B",
          zoneName: "VIP Floor",
          hourlyRate: 8,
          availableSpots: 4,
          totalSpots: 10,
          spotId: "VIP-09",
        },

        {
          zoneId: "ZONE-C",
          zoneName: "Open Terrace",
          hourlyRate: 3,
          availableSpots: 20,
          totalSpots: 25,
          spotId: "OT-22",
        },

        {
          zoneId: "ZONE-D",
          zoneName: "Covered Parking",
          hourlyRate: 3,
          availableSpots: 20,
          totalSpots: 25,
          spotId: "CP-05",
        },
      ],
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

  async createPaymentIntent(amount: number): Promise<PaymentIntentResponse> {
    const response = await axiosInstance.post(API_ENDPOINTS.CUSTOMER.PAYMENT_INTENT, {
      amount,
    });

    return response.data?.data as PaymentIntentResponse;
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

  private penalties: PenaltyDetails[] = [
    {
      penaltyId: "PN-1021",

      parkingName: "Central Parking Tower",

      zoneName: "VIP Floor",

      hasMultipleZones: false,

      vehicleDetails: {
        vehicleModel: "Tesla Model 3",

        plateNumber: "ONT-129",

        carColor: "Silver",
      },

      bookingStartTime: "10:00 AM",

      allowedEndTime: "10:30 AM",

      overtimeDuration: "42 Minutes",

      generatedPenalty: 40,

      violationReason:
        "Vehicle remained parked after booking expiration and grace window completion.",

      status: "pending",

      issuedAt: "2026-08-14T10:42:00Z",
    },

    {
      penaltyId: "PN-1022",

      parkingName: "Maple Street Parking Hub",

      hasMultipleZones: false,

      vehicleDetails: {
        vehicleModel: "BMW X5",

        plateNumber: "TOR-882",

        carColor: "Black",
      },

      bookingStartTime: "03:00 PM",

      allowedEndTime: "04:00 PM",

      overtimeDuration: "18 Minutes",

      generatedPenalty: 25,

      violationReason: "Vehicle exceeded permitted parking duration.",

      status: "pending",

      issuedAt: "2026-08-15T04:18:00Z",
    },
  ];

  async getPenaltyById(penaltyId: string): Promise<PenaltyDetails | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return this.penalties.find((item) => item.penaltyId === penaltyId) || null;
  }

  async payPenalty(penaltyId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const penalty = this.penalties.find((item) => item.penaltyId === penaltyId);

    if (!penalty) {
      return false;
    }

    penalty.status = "paid";

    return true;
  }

  async submitPenaltyDispute(
    penaltyId: string,
    payload: PenaltyDisputePayload,
  ): Promise<boolean> {
    console.log("Penalty Dispute Submitted:", penaltyId, payload);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const penalty = this.penalties.find((item) => item.penaltyId === penaltyId);

    if (!penalty) {
      return false;
    }

    penalty.status = "disputed";

    return true;
  }
}

export const customerService = new CustomerService();
