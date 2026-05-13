export interface LocationPerformanceFilters {
  dateRange: string;
  location: string;
  paymentMethod: string;
  planType: string;
  status: string;
}

export interface LocationPerformanceSummary {
  totalRevenue: number;
  totalSessions: number;
  totalTickets: number;
  totalLocations: number;
}

export interface LocationRevenueData {
  name: string;
  value: number;
}

export interface LocationOccupancyData {
  name: string;
  rate: number;
}

export interface LocationTableData {
  id: string;
  location: string;
  revenue: number;
  sessions: number;
  avgDuration: string;
  occupancyRate: string;
  ticketsIssued: number;
  penaltyRevenue: number;
}

//DETAILS DRAWER TYPES 

export interface LocationDetails {
  id: string;
  name: string;
  address: string;
  totalSpots: number;
  locationType: "Indoor" | "Outdoor" | "Garage";
  imageUrl?: string;
}

export interface LocationPerformanceMetrics {
  dailyRevenue: number;
  totalSessions: number;
  ticketsIssued: number;
  occupancyRate: number;
  dailyRevenueTrend: number;
  sessionsTrend: number;
  ticketsTrend: number;
}

export interface LocationRevenueTrend {
  date: string;
  revenue: number;
}

export interface LocationSessionTrend {
  date: string;
  sessions: number;
}

export interface LocationTicketData {
  id: string;
  ticketId: string;
  date: string;
  violationType: string;
  amount: number;
  status: "Paid" | "Unpaid" | "Cancelled";
}

export interface LocationOfficerData {
  id: string;
  name: string;
  officerId: string;
  ticketsIssued: number;
  revenue: number;
  lastActive: string;
}

export interface LocationVehicleHistory {
  id: string;
  plateNumber: string;
  vehicleType: string;
  sessionDate: string;
  duration: string;
  amountPaid: number;
}

export interface PeakHourData {
  hour: string;
  vehicles: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Data
const mockLocations: LocationTableData[] = [
  { id: "loc1", location: "Main Street Parking", revenue: 12450, sessions: 1842, avgDuration: "1h 32m", occupancyRate: "82.6%", ticketsIssued: 356, penaltyRevenue: 3210 },
  { id: "loc2", location: "City Center Garage", revenue: 9875.5, sessions: 1523, avgDuration: "1h 18m", occupancyRate: "74.3%", ticketsIssued: 289, penaltyRevenue: 2540 },
  { id: "loc3", location: "Airport Parking", revenue: 7890, sessions: 1128, avgDuration: "1h 45m", occupancyRate: "71.2%", ticketsIssued: 198, penaltyRevenue: 1980 },
  { id: "loc4", location: "West Side Lot", revenue: 5620, sessions: 864, avgDuration: "1h 25m", occupancyRate: "63.5%", ticketsIssued: 156, penaltyRevenue: 1450 },
  { id: "loc5", location: "Shopping Mall Lot", revenue: 4320, sessions: 712, avgDuration: "1h 15m", occupancyRate: "59.0%", ticketsIssued: 98, penaltyRevenue: 890 },
  { id: "loc6", location: "University Parking", revenue: 3210, sessions: 543, avgDuration: "1h 08m", occupancyRate: "48.0%", ticketsIssued: 67, penaltyRevenue: 610 },
];

export const locationPerformanceService = {
  getSummary: async (filters?: LocationPerformanceFilters): Promise<LocationPerformanceSummary> => {
    await delay(500);
    return {
      totalRevenue: 45678.5,
      totalSessions: 6782,
      totalTickets: 1243,
      totalLocations: 12,
    };
  },

  getRevenueByLocation: async (filters?: LocationPerformanceFilters): Promise<LocationRevenueData[]> => {
    await delay(400);
    return [
      { name: "Main Street Parking", value: 12450 },
      { name: "City Center Garage", value: 9875 },
      { name: "Airport Parking", value: 7890 },
      { name: "West Side Lot", value: 5620 },
      { name: "Shopping Mall Lot", value: 4320 },
      { name: "University Parking", value: 3210 },
      { name: "Riverfront Parking", value: 2312 },
    ];
  },

  getOccupancyData: async (filters?: LocationPerformanceFilters): Promise<LocationOccupancyData[]> => {
    await delay(400);
    return [
      { name: "Main Street", rate: 82 },
      { name: "City Center", rate: 74 },
      { name: "Airport", rate: 71 },
      { name: "West Side", rate: 63 },
      { name: "Shopping Mall", rate: 59 },
      { name: "University", rate: 48 },
      { name: "Riverfront", rate: 41 },
    ];
  },

  getLocationsData: async (filters?: LocationPerformanceFilters): Promise<LocationTableData[]> => {
    await delay(600);
    let filtered = [...mockLocations];
    if (filters?.location && filters.location !== "All Locations") {
      filtered = filtered.filter(l => l.location === filters.location);
    }
    return filtered;
  },

  // DETAILS DRAWER METHODS

  getLocationDetails: async (locationId: string): Promise<LocationDetails> => {
    await delay(400);
    const location = mockLocations.find(l => l.id === locationId);
    return {
      id: locationId,
      name: location?.location || "Unknown Location",
      address: `${location?.location || "Unknown"}, Downtown, Toronto, ON M5V 2T6`,
      totalSpots: 250 + Math.floor(Math.random() * 200),
      locationType: locationId === "loc1" ? "Indoor" : locationId === "loc2" ? "Garage" : "Outdoor",
    };
  },

  getLocationMetrics: async (locationId: string): Promise<LocationPerformanceMetrics> => {
    await delay(400);
    return {
      dailyRevenue: 1250 + Math.random() * 500,
      totalSessions: 180 + Math.floor(Math.random() * 100),
      ticketsIssued: 25 + Math.floor(Math.random() * 30),
      occupancyRate: 65 + Math.random() * 25,
      dailyRevenueTrend: 12.5,
      sessionsTrend: 8.3,
      ticketsTrend: -5.2,
    };
  },

  getLocationRevenueTrend: async (locationId: string): Promise<LocationRevenueTrend[]> => {
    await delay(400);
    return [
      { date: "May 15", revenue: 1120 }, { date: "May 16", revenue: 1350 },
      { date: "May 17", revenue: 1280 }, { date: "May 18", revenue: 1420 },
      { date: "May 19", revenue: 1580 }, { date: "May 20", revenue: 1650 },
      { date: "May 21", revenue: 1720 },
    ];
  },

  getLocationSessionTrend: async (locationId: string): Promise<LocationSessionTrend[]> => {
    await delay(400);
    return [
      { date: "May 15", sessions: 142 }, { date: "May 16", sessions: 158 },
      { date: "May 17", sessions: 165 }, { date: "May 18", sessions: 172 },
      { date: "May 19", sessions: 188 }, { date: "May 20", sessions: 195 },
      { date: "May 21", sessions: 210 },
    ];
  },

  getLocationTickets: async (locationId: string): Promise<LocationTicketData[]> => {
    await delay(400);
    return [
      { id: "t1", ticketId: "TKT-100240", date: "May 21, 2025", violationType: "Expired Parking", amount: 50, status: "Unpaid" },
      { id: "t2", ticketId: "TKT-100241", date: "May 20, 2025", violationType: "Wrong Zone", amount: 80, status: "Paid" },
      { id: "t3", ticketId: "TKT-100238", date: "May 19, 2025", violationType: "No Permit", amount: 75, status: "Paid" },
      { id: "t4", ticketId: "TKT-100237", date: "May 18, 2025", violationType: "Overstay", amount: 45, status: "Unpaid" },
    ];
  },

  getLocationOfficers: async (locationId: string): Promise<LocationOfficerData[]> => {
    await delay(400);
    return [
      { id: "off1", name: "John Smith", officerId: "OFF-1001", ticketsIssued: 86, revenue: 2150, lastActive: "May 21, 2025" },
      { id: "off2", name: "Michael Brown", officerId: "OFF-1002", ticketsIssued: 62, revenue: 1550, lastActive: "May 20, 2025" },
      { id: "off3", name: "David Johnson", officerId: "OFF-1003", ticketsIssued: 48, revenue: 1200, lastActive: "May 21, 2025" },
    ];
  },

  getLocationVehicleHistory: async (locationId: string): Promise<LocationVehicleHistory[]> => {
    await delay(400);
    return [
      { id: "vh1", plateNumber: "ABC-1234", vehicleType: "Sedan", sessionDate: "May 21, 2025", duration: "2h 15m", amountPaid: 4.50 },
      { id: "vh2", plateNumber: "XYZ-7890", vehicleType: "SUV", sessionDate: "May 21, 2025", duration: "1h 30m", amountPaid: 3.00 },
      { id: "vh3", plateNumber: "DEF-5678", vehicleType: "Truck", sessionDate: "May 20, 2025", duration: "3h 00m", amountPaid: 6.00 },
      { id: "vh4", plateNumber: "GHI-9101", vehicleType: "Sedan", sessionDate: "May 20, 2025", duration: "45m", amountPaid: 1.50 },
    ];
  },

  getLocationPeakHours: async (locationId: string): Promise<PeakHourData[]> => {
    await delay(400);
    return [
      { hour: "12 AM", vehicles: 45 }, { hour: "4 AM", vehicles: 32 }, { hour: "8 AM", vehicles: 180 },
      { hour: "12 PM", vehicles: 210 }, { hour: "4 PM", vehicles: 195 }, { hour: "8 PM", vehicles: 120 },
    ];
  },

  exportReport: async (filters?: LocationPerformanceFilters): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    console.log("Exporting location performance report with filters:", filters);
    return { success: true, message: "Location performance report exported successfully!" };
  },
};