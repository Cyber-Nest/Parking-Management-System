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

class CustomerService {
  async getParkingZoneById(zoneId: string): Promise<ParkingDetails> {
    await new Promise((resolve) => setTimeout(resolve, 500));

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
        label: "30M",
        value: "30m",
        price: 2.5,
        minutes: 30,
      },

      {
        label: "1H",
        value: "1h",
        price: 4.5,
        minutes: 60,
      },

      {
        label: "3H",
        value: "3h",
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
        hour: "2-digit",
        minute: "2-digit",
      }),

      endTime: endDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),

      duration: payload.selectedDuration.label,

      transactionId: `PS-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }

  async processDummyPayment(): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return true;
  }
}

export const customerService = new CustomerService();
