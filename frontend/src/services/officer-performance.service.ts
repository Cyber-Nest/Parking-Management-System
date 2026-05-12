// services/officer-performance.service.ts

export interface OfficerPerformanceFilters {
  dateRange: string;
  location: string;
  officer: string;
}

export interface OfficerPerformanceSummary {
  totalOfficers: number;
  totalTickets: number;
  paidTickets: number;
  pendingTickets: number;
  totalRevenue: number;
}

export interface OfficerPerformanceData {
  id: string;
  name: string;
  officerId: string;
  avatar?: string;
  ticketsIssued: number;
  paidTickets: number;
  pendingTickets: number;
  cancelledTickets: number;
  revenue: number;
  avgPerDay: number;
}

export interface PerformanceTrendData {
  name: string;
  tickets: number;
}

export interface TopOfficerData {
  name: string;
  count: number;
}

// Add these interfaces and methods to existing service file

export interface OfficerTicketData {
  id: string;
  ticketId: string;
  date: string;
  violationType: string;
  location: string;
  amount: number;
  status: "Paid" | "Unpaid" | "Cancelled";
}

export interface OfficerEvidenceData {
  id: string;
  ticketId: string;
  imageUrl: string;
  uploadedAt: string;
}

export interface OfficerActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface OfficerTicketBreakdown {
  paid: number;
  unpaid: number;
  cancelled: number;
  paidAmount: number;
  unpaidAmount: number;
  cancelledAmount: number;
}

// Add to officerPerformanceService object

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data
const mockOfficers: OfficerPerformanceData[] = [
  {
    id: "1",
    name: "John Smith",
    officerId: "OFF-1001",
    ticketsIssued: 186,
    paidTickets: 152,
    pendingTickets: 28,
    cancelledTickets: 6,
    revenue: 1860,
    avgPerDay: 8.86,
  },
  {
    id: "2",
    name: "Michael Brown",
    officerId: "OFF-1002",
    ticketsIssued: 153,
    paidTickets: 122,
    pendingTickets: 25,
    cancelledTickets: 6,
    revenue: 1530,
    avgPerDay: 7.29,
  },
  {
    id: "3",
    name: "David Johnson",
    officerId: "OFF-1003",
    ticketsIssued: 132,
    paidTickets: 104,
    pendingTickets: 20,
    cancelledTickets: 8,
    revenue: 1320,
    avgPerDay: 6.29,
  },
  {
    id: "4",
    name: "Robert Wilson",
    officerId: "OFF-1004",
    ticketsIssued: 98,
    paidTickets: 78,
    pendingTickets: 15,
    cancelledTickets: 5,
    revenue: 980,
    avgPerDay: 4.67,
  },
  {
    id: "5",
    name: "James Taylor",
    officerId: "OFF-1005",
    ticketsIssued: 87,
    paidTickets: 65,
    pendingTickets: 18,
    cancelledTickets: 4,
    revenue: 870,
    avgPerDay: 4.14,
  },
  {
    id: "6",
    name: "Sarah Wright",
    officerId: "OFF-1006",
    ticketsIssued: 210,
    paidTickets: 175,
    pendingTickets: 28,
    cancelledTickets: 7,
    revenue: 2100,
    avgPerDay: 10.0,
  },
  {
    id: "7",
    name: "Adam Milner",
    officerId: "OFF-1007",
    ticketsIssued: 145,
    paidTickets: 118,
    pendingTickets: 20,
    cancelledTickets: 7,
    revenue: 1450,
    avgPerDay: 6.9,
  },
];

export const officerPerformanceService = {
  getSummary: async (
    filters?: OfficerPerformanceFilters,
  ): Promise<OfficerPerformanceSummary> => {
    await delay(500);
    console.log("Summary filters:", filters);
    return {
      totalOfficers: 24,
      totalTickets: 1243,
      paidTickets: 985,
      pendingTickets: 258,
      totalRevenue: 11230,
    };
  },

  getOfficersData: async (
    filters?: OfficerPerformanceFilters,
  ): Promise<OfficerPerformanceData[]> => {
    await delay(600);
    let filtered = [...mockOfficers];
    if (filters?.officer && filters.officer !== "All Officers") {
      filtered = filtered.filter((o) => o.name === filters.officer);
    }
    return filtered;
  },

  getPerformanceTrend: async (
    filters?: OfficerPerformanceFilters,
  ): Promise<PerformanceTrendData[]> => {
    await delay(400);
    return [
      { name: "May 01", tickets: 110 },
      { name: "May 05", tickets: 130 },
      { name: "May 09", tickets: 105 },
      { name: "May 13", tickets: 160 },
      { name: "May 17", tickets: 120 },
      { name: "May 21", tickets: 155 },
    ];
  },

  getTopOfficers: async (
    filters?: OfficerPerformanceFilters,
  ): Promise<TopOfficerData[]> => {
    await delay(400);
    return [
      { name: "John Smith", count: 186 },
      { name: "Michael Brown", count: 153 },
      { name: "David Johnson", count: 132 },
      { name: "Robert Wilson", count: 98 },
      { name: "James Taylor", count: 87 },
    ];
  },

  exportReport: async (
    filters?: OfficerPerformanceFilters,
  ): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    console.log("Exporting officer performance report with filters:", filters);
    return {
      success: true,
      message: "Officer performance report exported successfully!",
    };
  },

  getOfficerTickets: async (
    officerId: string,
  ): Promise<OfficerTicketData[]> => {
    await delay(500);
    // Mock data based on officerId
    const mockTickets: Record<string, OfficerTicketData[]> = {
      "1": [
        {
          id: "t1",
          ticketId: "TKT-100240",
          date: "May 21, 2025",
          violationType: "Expired Parking",
          location: "Lot A",
          amount: 50,
          status: "Unpaid",
        },
        {
          id: "t2",
          ticketId: "TKT-100241",
          date: "May 20, 2025",
          violationType: "Wrong Zone",
          location: "Zone B",
          amount: 80,
          status: "Paid",
        },
        {
          id: "t3",
          ticketId: "TKT-100238",
          date: "May 19, 2025",
          violationType: "No Permit",
          location: "Lot A",
          amount: 75,
          status: "Paid",
        },
      ],
      "2": [
        {
          id: "t4",
          ticketId: "TKT-100239",
          date: "May 20, 2025",
          violationType: "Overstay",
          location: "Lot C",
          amount: 45,
          status: "Paid",
        },
        {
          id: "t5",
          ticketId: "TKT-100237",
          date: "May 19, 2025",
          violationType: "Expired Parking",
          location: "Zone B",
          amount: 50,
          status: "Unpaid",
        },
      ],
    };
    return mockTickets[officerId] || [];
  },

  getOfficerEvidence: async (
    officerId: string,
  ): Promise<OfficerEvidenceData[]> => {
    await delay(400);
    return [
      {
        id: "e1",
        ticketId: "TKT-100240",
        imageUrl:
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100",
        uploadedAt: "May 21, 2025 - 09:15 AM",
      },
      {
        id: "e2",
        ticketId: "TKT-100241",
        imageUrl:
          "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=100",
        uploadedAt: "May 20, 2025 - 10:30 AM",
      },
    ];
  },

  getOfficerActivities: async (
    officerId: string,
  ): Promise<OfficerActivityLog[]> => {
    await delay(400);
    return [
      {
        id: "a1",
        action: "Logged into dashboard",
        details: "Successful login from Chrome",
        timestamp: "May 21, 2025 - 08:55 AM",
      },
      {
        id: "a2",
        action: "Issued penalty ticket",
        details: "Issued ticket #TKT-100240",
        timestamp: "May 21, 2025 - 09:10 AM",
      },
      {
        id: "a3",
        action: "Marked ticket as paid",
        details: "Marked ticket #TKT-100241 as paid",
        timestamp: "May 21, 2025 - 09:45 AM",
      },
    ];
  },

  getOfficerTicketBreakdown: async (
    officerId: string,
  ): Promise<OfficerTicketBreakdown> => {
    await delay(300);
    const tickets =
      await officerPerformanceService.getOfficerTickets(officerId);
    const breakdown = {
      paid: 0,
      unpaid: 0,
      cancelled: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      cancelledAmount: 0,
    };
    tickets.forEach((t) => {
      if (t.status === "Paid") {
        breakdown.paid++;
        breakdown.paidAmount += t.amount;
      } else if (t.status === "Unpaid") {
        breakdown.unpaid++;
        breakdown.unpaidAmount += t.amount;
      } else if (t.status === "Cancelled") {
        breakdown.cancelled++;
        breakdown.cancelledAmount += t.amount;
      }
    });
    return breakdown;
  },
};
