// // services/penalty-report.service.ts

// export interface PenaltyReportFilters {
//   dateRange: string;
//   officer: string;
//   violationType: string;
//   location: string;
//   paymentMethod: string;
// }

// export interface PenaltyReportSummary {
//   totalTickets: number;
//   paidPenalties: number;
//   totalAmount: number;
// }

// export interface PenaltyDailyData {
//   date: string;
//   totalTickets: number;
//   paid: number;
//   unpaid: number;
//   cancelled: number;
//   revenue: number;
// }

// export interface PenaltyTrendData {
//   name: string;
//   count: number;
// }

// export interface ViolationTypeData {
//   name: string;
//   value: number;
//   color: string;
// }

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// export const penaltyReportService = {
//   getSummary: async (filters?: PenaltyReportFilters): Promise<PenaltyReportSummary> => {
//     await delay(500);
//     console.log("Summary filters:", filters);
//     return {
//       totalTickets: 1842,
//       paidPenalties: 1240,
//       totalAmount: 74250,
//     };
//   },

//   getDailyData: async (filters?: PenaltyReportFilters): Promise<PenaltyDailyData[]> => {
//     await delay(600);
//     return [
//       { date: "May 21, 2025", totalTickets: 124, paid: 85, unpaid: 32, cancelled: 7, revenue: 4850.0 },
//       { date: "May 20, 2025", totalTickets: 142, paid: 98, unpaid: 35, cancelled: 9, revenue: 5680.0 },
//       { date: "May 19, 2025", totalTickets: 115, paid: 72, unpaid: 38, cancelled: 5, revenue: 4200.0 },
//       { date: "May 18, 2025", totalTickets: 98, paid: 60, unpaid: 28, cancelled: 10, revenue: 3950.0 },
//       { date: "May 17, 2025", totalTickets: 156, paid: 110, unpaid: 38, cancelled: 8, revenue: 6200.0 },
//       { date: "May 16, 2025", totalTickets: 138, paid: 95, unpaid: 36, cancelled: 7, revenue: 5450.0 },
//     ];
//   },

//   getPenaltyTrend: async (filters?: PenaltyReportFilters): Promise<PenaltyTrendData[]> => {
//     await delay(400);
//     return [
//       { name: "May 01", count: 45 },
//       { name: "May 06", count: 52 },
//       { name: "May 11", count: 38 },
//       { name: "May 16", count: 65 },
//       { name: "May 21", count: 70 },
//     ];
//   },

//   getViolationTypes: async (filters?: PenaltyReportFilters): Promise<ViolationTypeData[]> => {
//     await delay(400);
//     return [
//       { name: "Overstay", value: 450, color: "var(--color-primary)" },
//       { name: "No Permit", value: 300, color: "#F43F5E" },
//       { name: "Wrong Zone", value: 150, color: "#F59E0B" },
//       { name: "Expired Parking", value: 120, color: "#8B5CF6" },
//     ];
//   },

//   exportReport: async (filters?: PenaltyReportFilters): Promise<{ success: boolean; message: string }> => {
//     await delay(1500);
//     console.log("Exporting penalty report with filters:", filters);
//     return { success: true, message: "Penalty report exported successfully!" };
//   },
// };

// services/penalty-report.service.ts

export interface PenaltyReportFilters {
  dateRange: string;
  location: string;
  officer: string;
  violationType: string;
  ticketStatus: string;
  paymentStatus: string;
  minAmount: string;
  maxAmount: string;
}

export interface PenaltyReportSummary {
  totalTickets: number;
  totalTicketsTrend: number;
  paidTickets: number;
  paidTicketsTrend: number;
  unpaidTickets: number;
  unpaidTicketsTrend: number;
  totalRevenue: number;
  revenueTrend: number;
}

export interface PenaltyTicketData {
  id: string;
  date: string;
  ticketId: string;
  violationType: string;
  location: string;
  amount: string;
  status: "Paid" | "Unpaid" | "Cancelled";
}

export interface PenaltyTrendData {
  name: string;
  count: number;
}

export interface ViolationTypeData {
  name: string;
  value: number;
  color: string;
}

// Add these interfaces and methods

export interface PenaltyTicketDetails {
  ticketId: string;
  issueDate: string;
  issueTime: string;
  location: string;
  officerName: string;
  officerId: string;
  amount: number;
  status: "Paid" | "Unpaid" | "Cancelled";
  plateNumber: string;
  vehicleModel: string;
  paymentInfo?: {
    amount: number;
    method: string;
    date: string;
    time: string;
    transactionId: string;
  };
  evidence: string[];
  notes: { content: string; createdBy: string; createdAt: string }[];
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const penaltyReportService = {
  getSummary: async (
    filters?: PenaltyReportFilters,
  ): Promise<PenaltyReportSummary> => {
    await delay(500);
    return {
      totalTickets: 1243,
      totalTicketsTrend: 20.1,
      paidTickets: 892,
      paidTicketsTrend: 18.7,
      unpaidTickets: 351,
      unpaidTicketsTrend: 25.4,
      totalRevenue: 11230,
      revenueTrend: 24.7,
    };
  },

  getTicketsData: async (
    filters?: PenaltyReportFilters,
  ): Promise<PenaltyTicketData[]> => {
    await delay(600);
    return [
      {
        id: "1",
        date: "May 21, 2025",
        ticketId: "TKT-100240",
        violationType: "Expired Parking",
        location: "Lot A",
        amount: "50.00",
        status: "Unpaid",
      },
      {
        id: "2",
        date: "May 21, 2025",
        ticketId: "TKT-100241",
        violationType: "Wrong Zone",
        location: "Zone B",
        amount: "80.00",
        status: "Paid",
      },
      {
        id: "3",
        date: "May 20, 2025",
        ticketId: "TKT-100239",
        violationType: "No Permit",
        location: "Lot A",
        amount: "75.00",
        status: "Paid",
      },
      {
        id: "4",
        date: "May 20, 2025",
        ticketId: "TKT-100238",
        violationType: "Overstay",
        location: "Lot C",
        amount: "45.00",
        status: "Cancelled",
      },
      {
        id: "5",
        date: "May 19, 2025",
        ticketId: "TKT-100237",
        violationType: "Expired Parking",
        location: "Zone B",
        amount: "50.00",
        status: "Unpaid",
      },
      {
        id: "6",
        date: "May 19, 2025",
        ticketId: "TKT-100236",
        violationType: "Blocking",
        location: "Lot A",
        amount: "100.00",
        status: "Paid",
      },
      {
        id: "7",
        date: "May 18, 2025",
        ticketId: "TKT-100235",
        violationType: "Wrong Zone",
        location: "Zone C",
        amount: "80.00",
        status: "Paid",
      },
      {
        id: "8",
        date: "May 18, 2025",
        ticketId: "TKT-100234",
        violationType: "No Permit",
        location: "Lot B",
        amount: "75.00",
        status: "Unpaid",
      },
      {
        id: "9",
        date: "May 17, 2025",
        ticketId: "TKT-100233",
        violationType: "Overstay",
        location: "Lot A",
        amount: "45.00",
        status: "Paid",
      },
      {
        id: "10",
        date: "May 17, 2025",
        ticketId: "TKT-100232",
        violationType: "Expired Parking",
        location: "Zone A",
        amount: "50.00",
        status: "Cancelled",
      },
      {
        id: "11",
        date: "May 16, 2025",
        ticketId: "TKT-100231",
        violationType: "Blocking",
        location: "Lot C",
        amount: "100.00",
        status: "Paid",
      },
      {
        id: "12",
        date: "May 16, 2025",
        ticketId: "TKT-100230",
        violationType: "Wrong Zone",
        location: "Zone B",
        amount: "80.00",
        status: "Unpaid",
      },
    ];
  },

  getPenaltyTrend: async (
    filters?: PenaltyReportFilters,
  ): Promise<PenaltyTrendData[]> => {
    await delay(400);
    return [
      { name: "May 01", count: 45 },
      { name: "May 06", count: 52 },
      { name: "May 11", count: 38 },
      { name: "May 16", count: 65 },
      { name: "May 21", count: 70 },
    ];
  },

  getViolationTypes: async (
    filters?: PenaltyReportFilters,
  ): Promise<ViolationTypeData[]> => {
    await delay(400);
    return [
      { name: "Overstay", value: 450, color: "var(--color-primary)" },
      { name: "No Permit", value: 300, color: "#F43F5E" },
      { name: "Wrong Zone", value: 150, color: "#F59E0B" },
      { name: "Expired Parking", value: 200, color: "#8B5CF6" },
      { name: "Blocking", value: 143, color: "#10B981" },
    ];
  },

  exportReport: async (
    filters?: any,
  ): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    console.log("Exporting penalty report with filters:", filters);
    return { success: true, message: "Penalty report exported successfully!" };
  },

  
  getTicketDetails: async (ticketId: string): Promise<PenaltyTicketDetails> => {
    await delay(500);
    // Mock data
    return {
      ticketId: ticketId,
      issueDate: "May 21, 2025",
      issueTime: "09:15 AM",
      location: "Lot A - Front",
      officerName: "John Smith",
      officerId: "OF-1001",
      amount: 50,
      status: "Unpaid",
      plateNumber: "ABC-1234",
      vehicleModel: "Toyota Vios (White)",
      evidence: [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=100",
      ],
      notes: [
        {
          content: "Customer requested review",
          createdBy: "Admin",
          createdAt: "May 21, 2025 - 09:30 AM",
        },
      ],
    };
  },
};
