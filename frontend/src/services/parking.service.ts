export interface ExtensionHistory {
  id: string;
  duration: string;
  amount: string;
  extendedAt: string;
}

export interface IssueHistory {
  id: string;
  reason: string;
  notes: string;
  markedAt: string;
  markedBy: string;
}

export interface PenaltyHistory {
  id: string;
  reason: string;
  amount: string;
  createdAt: string;
}

export interface ParkingSession {
  id: string;
  plate: string;
  vehicle: string;
  plan: string;
  startTime: string;
  expiryTime: string;
  remaining: string;
  paymentStatus: "Paid" | "Unpaid" | "Failed";
  sessionStatus: "active" | "cancelled" | "issue";
  amount: string;
  urgent: boolean;
  paymentMethod: string;
  extensions: ExtensionHistory[];
  issues: IssueHistory[];
  penalties: PenaltyHistory[];
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
}

export interface DashboardStats {
  totalActive: string;
  expiringSoon: string;
  unpaidIssues: string;
  todayRevenue: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const parkingService = {
  getStats: async (): Promise<DashboardStats> => {
    await delay(400);
    return {
      totalActive: "124",
      expiringSoon: "18",
      unpaidIssues: "06",
      todayRevenue: "$245.00",
    };
  },

  getParkingSessions: async (): Promise<ParkingSession[]> => {
    await delay(500);
    return [
      {
        id: "PKG-10045",
        plate: "ABC-1234",
        vehicle: "Toyota Vios (White)",
        plan: "2 Hours",
        startTime: "2025-05-21T08:15:00",
        expiryTime: "2025-05-21T10:15:00",
        remaining: "1H 20M",
        paymentStatus: "Paid",
        sessionStatus: "active",
        amount: "$2.00",
        urgent: false,
        paymentMethod: "Card",
        extensions: [
          {
            id: "EXT-1",
            duration: "1 Hour",
            amount: "$1.00",
            extendedAt: "May 21, 2025 - 08:40 AM",
          },
        ],
        issues: [],
        penalties: [],
      },
      {
        id: "PKG-10047",
        plate: "GHI-9101",
        vehicle: "Ford Ranger (Blue)",
        plan: "1 Hour",
        startTime: "2025-05-21T09:00:00",
        expiryTime: "2025-05-21T10:00:00",
        remaining: "25M",
        paymentStatus: "Unpaid",
        sessionStatus: "active",
        amount: "$1.00",
        urgent: true,
        paymentMethod: "Cash",
        extensions: [],
        issues: [],
        penalties: [],
      },
      {
        id: "PKG-10050",
        plate: "PQR-3456",
        vehicle: "Hyundai Accent (Red)",
        plan: "2 Hours",
        startTime: "2025-05-21T07:00:00",
        expiryTime: "2025-05-21T09:00:00",
        remaining: "EXPIRED",
        paymentStatus: "Failed",
        sessionStatus: "issue",
        amount: "$2.00",
        urgent: true,
        paymentMethod: "Wallet",
        extensions: [],
        issues: [
          {
            id: "ISS-1",
            reason: "Payment Issue",
            notes: "Payment gateway timeout issue.",
            markedAt: "May 21, 2025 - 09:10 AM",
            markedBy: "Admin",
          },
        ],
        penalties: [],
      },
      {
        id: "PKG-10051",
        plate: "XYZ-4567",
        vehicle: "Honda City (Black)",
        plan: "1 Day",
        startTime: "2025-05-21T12:10:00",
        expiryTime: "2025-05-22T12:10:00",
        remaining: "12H 10M",
        paymentStatus: "Paid",
        sessionStatus: "active",
        amount: "$12.00",
        urgent: false,
        paymentMethod: "Card",
        extensions: [],
        issues: [],
        penalties: [
          {
            id: "PEN-1",
            reason: "Late Exit",
            amount: "$4.00",
            createdAt: "May 22, 2025 - 01:00 PM",
          },
        ],
      },
    ];
  },
};