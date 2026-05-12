export interface TicketNote {
  id: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface EvidencePhoto {
  id: string;
  image: string;
}

export interface PenaltyTicket {
  id: string;
  plate: string;
  vehicle: string;
  violationType: string;
  location: string;
  officer: string;
  officerId: string;
  amount: string;
  status: "Paid" | "Unpaid" | "Cancelled";
  issueDate: string;
  issueTime: string;
  sessionId: string;
  parkingPlan: string;
  parkingStartTime: string;
  parkingExpiryTime: string;
  parkingStatus: string;
  paymentId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  transactionReference?: string;
  paidAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  notes: TicketNote[];
  evidencePhotos: EvidencePhoto[];
}

export interface PenaltyStats {
  totalTickets: string;
  unpaidTickets: string;
  paidTickets: string;
  totalPenaltyAmount: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const penaltyService = {
  getPenaltyStats: async (): Promise<PenaltyStats> => {
    await delay(500);
    return {
      totalTickets: "28",
      unpaidTickets: "16",
      paidTickets: "9",
      totalPenaltyAmount: "$1,840.00",
    };
  },

  getPenaltyTickets: async (): Promise<PenaltyTicket[]> => {
    await delay(700);
    return [
      {
        id: "TKT-100240",
        plate: "ABC-1234",
        vehicle: "Toyota Vios (White)",
        violationType: "Expired Parking",
        location: "Lot A - Front",
        officer: "John Smith",
        officerId: "OF-1001",
        amount: "$50.00",
        status: "Unpaid",
        issueDate: "May 21, 2025",
        issueTime: "09:15 AM",
        sessionId: "PKG-10045",
        parkingPlan: "2 Hours",
        parkingStartTime: "May 21, 2025 - 08:15 AM",
        parkingExpiryTime: "May 21, 2025 - 10:15 AM",
        parkingStatus: "Expired",
        paymentId: "",
        paymentMethod: "",
        paymentStatus: "Unpaid",
        transactionReference: "",
        notes: [
          {
            id: "NOTE-1",
            note: "Customer requested review.",
            createdBy: "Admin",
            createdAt: "May 21, 2025 - 09:30 AM",
          },
        ],
        evidencePhotos: [
          {
            id: "IMG-1",
            image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
          },
          {
            id: "IMG-2",
            image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
          },
        ],
      },
      {
        id: "TKT-100241",
        plate: "DEF-5678",
        vehicle: "Honda City (Black)",
        violationType: "Wrong Parking",
        location: "Zone B",
        officer: "Adam Milner",
        officerId: "OF-1003",
        amount: "$80.00",
        status: "Paid",
        issueDate: "May 21, 2025",
        issueTime: "08:45 AM",
        sessionId: "PKG-10046",
        parkingPlan: "1 Day",
        parkingStartTime: "May 21, 2025 - 12:00 AM",
        parkingExpiryTime: "May 22, 2025 - 12:00 AM",
        parkingStatus: "Completed",
        paymentId: "PAY-100500",
        paymentMethod: "Card",
        paymentStatus: "Paid",
        transactionReference: "txn_873722",
        paidAt: "May 21, 2025 - 09:00 AM",
        notes: [],
        evidencePhotos: [
          {
            id: "IMG-3",
            image: "https://images.unsplash.com/photo-1502877338535-766e1452684a",
          },
        ],
      },
    ];
  },
};