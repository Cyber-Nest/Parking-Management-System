// services/parking-usage.service.ts

export interface ParkingUsageFilters {
  dateRange: string;
  location: string;
  planType: string;
  paymentMethod: string;
  status: string;
}

export interface ParkingUsageSummary {
  totalSessions: number;
  activeSessions: number;
  avgDuration: string;
  expiredSessions: number;
}

export interface ParkingUsageDaily {
  date: string;
  totalSessions: number;
  completed: number;
  active: number;
  expired: number;
  avgDuration: string;
  revenue: number;
}

export interface SessionsOverTime {
  name: string;
  sessions: number;
}

export interface HourlyUsage {
  hour: string;
  value: number;
}

export interface PlanTypeDistribution {
  name: string;
  value: number;
  color: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const parkingUsageService = {
  getSummary: async (filters?: ParkingUsageFilters): Promise<ParkingUsageSummary> => {
    await delay(500);
    console.log("Summary filters:", filters);
    return {
      totalSessions: 6782,
      activeSessions: 214,
      avgDuration: "2h 15m",
      expiredSessions: 256,
    };
  },

  getDailyData: async (filters?: ParkingUsageFilters): Promise<ParkingUsageDaily[]> => {
    await delay(600);
    return [
      { date: "May 21, 2025", totalSessions: 342, completed: 318, active: 12, expired: 12, avgDuration: "2h 10m", revenue: 2845.20 },
      { date: "May 20, 2025", totalSessions: 365, completed: 347, active: 8, expired: 10, avgDuration: "2h 18m", revenue: 2956.75 },
      { date: "May 19, 2025", totalSessions: 378, completed: 351, active: 10, expired: 17, avgDuration: "2h 21m", revenue: 3102.40 },
      { date: "May 18, 2025", totalSessions: 289, completed: 271, active: 6, expired: 12, avgDuration: "1h 59m", revenue: 2215.60 },
      { date: "May 17, 2025", totalSessions: 410, completed: 385, active: 15, expired: 10, avgDuration: "2h 32m", revenue: 3450.00 },
      { date: "May 16, 2025", totalSessions: 398, completed: 372, active: 14, expired: 12, avgDuration: "2h 25m", revenue: 3280.50 },
    ];
  },

  getSessionsOverTime: async (filters?: ParkingUsageFilters): Promise<SessionsOverTime[]> => {
    await delay(400);
    return [
      { name: "May 01", sessions: 450 },
      { name: "May 06", sessions: 620 },
      { name: "May 11", sessions: 850 },
      { name: "May 16", sessions: 540 },
      { name: "May 21", sessions: 710 },
    ];
  },

  getHourlyUsage: async (filters?: ParkingUsageFilters): Promise<HourlyUsage[]> => {
    await delay(400);
    return [
      { hour: "12 AM", value: 200 },
      { hour: "4 AM", value: 150 },
      { hour: "8 AM", value: 650 },
      { hour: "12 PM", value: 820 },
      { hour: "4 PM", value: 780 },
      { hour: "8 PM", value: 320 },
    ];
  },

  getPlanTypeDistribution: async (filters?: ParkingUsageFilters): Promise<PlanTypeDistribution[]> => {
    await delay(400);
    return [
      { name: "Hourly Parking", value: 3245, color: "var(--color-primary)" },
      { name: "Daily Pass", value: 1982, color: "var(--color-accent)" },
      { name: "Monthly Pass", value: 1125, color: "#F59E0B" },
      { name: "Event Parking", value: 430, color: "#8B5CF6" },
    ];
  },

  exportReport: async (filters?: ParkingUsageFilters): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    console.log("Exporting with filters:", filters);
    return { success: true, message: "Parking usage report exported successfully!" };
  },
};