export interface VehicleHistoryFilters {
  licensePlate: string;
  customerName?: string;
  dateRange: string;
  location: string;
  searchIn: string;
  startDate?: string;
  endDate?: string;
}

export interface VehicleHistoryStats {
  totalSessions: number;
  totalPayments: number;
  totalPenalties: number;
  totalPenaltyAmount: number;
  refunds: number;
}

export interface ParkingSession {
  id: string;
  entryTime: string;
  exitTime: string;
  location: string;
  planType: string;
  duration: string;
  amount: number;
  paymentMethod: string;
  status: "active" | "completed" | "expired" | "cancelled";
  receiptId: string;
}

export interface PenaltyTicket {
  id: string;
  ticketNo: string;
  issuedDate: string;
  issuedTime: string;
  location: string;
  violationType: string;
  amount: number;
  status: "unpaid" | "paid" | "cancelled" | "disputed";
  paidDate?: string;
  receiptId?: string;
}

export interface PaymentRecord {
  id: string;
  paymentId: string;
  dateTime: string;
  type: string;
  description: string;
  amount: number;
  method: string;
  status: string;
  receiptId: string;
}

export interface RefundRecord {
  id: string;
  refundId: string;
  relatedTo: string;
  relatedType: string;
  refundType: string;
  dateTime: string;
  originalAmount: number;
  refundAmount: number;
  reason: string;
  status: string;
  processedBy: string;
  paymentMethod: string;
  receiptId: string;
}

export interface NoteActivity {
  id: string;
  content: string;
  addedBy: string;
  dateTime: string;
  type: "note" | "activity";
  visibility?: string;
}

export interface VehicleSummary {
  licensePlate: string;
  province: string;
  vehicleColor: string;
  vehicleMake: string;
  vehicleModel: string;
  firstSeen: string;
  lastSeen: string;
  totalTimeParked: string;
  favoriteLocation: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  registeredDate: string;
  customerType: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Data
const mockParkingSessions: ParkingSession[] = [
  { id: "1", entryTime: "May 21, 2025 10:15 AM", exitTime: "May 21, 2025 12:45 PM", location: "Downtown Park", planType: "Hourly", duration: "2h 30m", amount: 25, paymentMethod: "Credit Card", status: "completed", receiptId: "RCP-000023" },
  { id: "2", entryTime: "May 20, 2025 08:05 AM", exitTime: "May 20, 2025 11:05 AM", location: "Central Plaza", planType: "Daily", duration: "3h 00m", amount: 15, paymentMethod: "Credit Card", status: "completed", receiptId: "RCP-000022" },
  { id: "3", entryTime: "May 17, 2025 09:20 AM", exitTime: "May 17, 2025 09:50 AM", location: "Airport Parking", planType: "Hourly", duration: "2h 30m", amount: 6, paymentMethod: "Credit Card", status: "completed", receiptId: "RCP-000021" },
  { id: "4", entryTime: "May 15, 2025 07:15 PM", exitTime: "May 15, 2025 09:15 PM", location: "Downtown Park", planType: "Hourly", duration: "2h 00m", amount: 4, paymentMethod: "Credit Card", status: "completed", receiptId: "RCP-000019" },
];

const mockPenaltyTickets: PenaltyTicket[] = [
  { id: "1", ticketNo: "PT-10048", issuedDate: "May 21, 2025", issuedTime: "10:30 AM", location: "Downtown Park", violationType: "Expired Parking", amount: 25, status: "paid", paidDate: "May 21, 2025", receiptId: "RCP-000024" },
  { id: "2", ticketNo: "PT-10047", issuedDate: "May 20, 2025", issuedTime: "02:15 PM", location: "Central Plaza", violationType: "No Parking Zone", amount: 20, status: "paid", paidDate: "May 20, 2025", receiptId: "RCP-000025" },
  { id: "3", ticketNo: "PT-10046", issuedDate: "May 18, 2025", issuedTime: "09:00 AM", location: "Airport Parking", violationType: "Overstay", amount: 15, status: "unpaid", paidDate: undefined, receiptId: undefined },
];

const mockPayments: PaymentRecord[] = [
  { id: "1", paymentId: "PAY-000245", dateTime: "May 21, 2025 10:15 AM", type: "Parking", description: "Hourly Parking - Downtown Park", amount: 25, method: "Credit Card", status: "Paid", receiptId: "RCP-000023" },
  { id: "2", paymentId: "PAY-000244", dateTime: "May 20, 2025 08:05 AM", type: "Parking", description: "Daily Parking - Central Plaza", amount: 15, method: "Credit Card", status: "Paid", receiptId: "RCP-000022" },
  { id: "3", paymentId: "PAY-000243", dateTime: "May 17, 2025 09:20 AM", type: "Parking", description: "Hourly Parking - City Mall", amount: 6, method: "Cash", status: "Paid", receiptId: "RCP-000021" },
  { id: "4", paymentId: "PAY-000230", dateTime: "May 15, 2025 07:15 PM", type: "Parking", description: "Hourly Parking - Downtown Park", amount: 4, method: "Credit Card", status: "Paid", receiptId: "RCP-000019" },
];

const mockRefunds: RefundRecord[] = [
  { id: "1", refundId: "REF-000045", relatedTo: "Parking Session", relatedType: "RCP-000003", refundType: "Partial Refund", dateTime: "May 21, 2025 09:10 PM", originalAmount: 10, refundAmount: 5, reason: "Session cancelled early", status: "Approved", processedBy: "Admin User", paymentMethod: "Credit Card", receiptId: "REF-000045" },
  { id: "2", refundId: "REF-000021", relatedTo: "Penalty Ticket", relatedType: "PT-100021", refundType: "Full Refund", dateTime: "May 15, 2025 03:45 PM", originalAmount: 30, refundAmount: 30, reason: "Ticket issued in error", status: "Approved", processedBy: "Admin User", paymentMethod: "Credit Card", receiptId: "REF-000021" },
];

const mockNotesActivities: NoteActivity[] = [
  { id: "1", content: "Customer called to dispute ticket PT-10012. Reviewed evidence and agreed it was issued in error. Refund processed.", addedBy: "Manager User", dateTime: "May 21, 2025 02:15 PM", type: "note", visibility: "internal" },
  { id: "2", content: "VIP customer - Provided free parking for over 6 months.", addedBy: "Admin User", dateTime: "May 18, 2025 01:06 PM", type: "note", visibility: "internal" },
  { id: "3", content: "Payment made for session #PKG-10045", addedBy: "System", dateTime: "May 21, 2025 10:15 AM", type: "activity" },
];

const mockVehicleSummary: VehicleSummary = {
  licensePlate: "ABC-123",
  province: "Ontario",
  vehicleColor: "White",
  vehicleMake: "Toyota",
  vehicleModel: "Camry",
  firstSeen: "May 15, 2025 07:15 PM",
  lastSeen: "May 21, 2025 12:45 PM",
  totalTimeParked: "2h 30m",
  favoriteLocation: "Downtown Park",
};

const mockCustomerInfo: CustomerInfo = {
  name: "John Doe",
  phone: "+1 (547) 123-4567",
  email: "john.doe@example.com",
  registeredDate: "Apr 20, 2025 02:30 PM",
  customerType: "Registered User",
};

export const vehicleHistoryService = {
  getStats: async (filters?: VehicleHistoryFilters): Promise<VehicleHistoryStats> => {
    await delay(400);
    return {
      totalSessions: 18,
      totalPayments: 215,
      totalPenalties: 3,
      totalPenaltyAmount: 60,
      refunds: 35,
    };
  },

  getParkingSessions: async (filters?: VehicleHistoryFilters): Promise<ParkingSession[]> => {
    await delay(500);
    return mockParkingSessions;
  },

  getPenaltyTickets: async (filters?: VehicleHistoryFilters): Promise<PenaltyTicket[]> => {
    await delay(500);
    return mockPenaltyTickets;
  },

  getPayments: async (filters?: VehicleHistoryFilters): Promise<PaymentRecord[]> => {
    await delay(500);
    return mockPayments;
  },

  getRefunds: async (filters?: VehicleHistoryFilters): Promise<RefundRecord[]> => {
    await delay(500);
    return mockRefunds;
  },

  getNotesActivities: async (filters?: VehicleHistoryFilters): Promise<NoteActivity[]> => {
    await delay(500);
    return mockNotesActivities;
  },

  getVehicleSummary: async (licensePlate: string): Promise<VehicleSummary> => {
    await delay(300);
    return mockVehicleSummary;
  },

  getCustomerInfo: async (licensePlate: string): Promise<CustomerInfo> => {
    await delay(300);
    return mockCustomerInfo;
  },

  addNote: async (note: string): Promise<{ success: boolean; message: string }> => {
    await delay(800);
    console.log("Note added:", note);
    return { success: true, message: "Note added successfully!" };
  },
};