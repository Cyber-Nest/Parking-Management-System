// services/peak-hours.service.ts

export interface PeakHoursFilters {
  dateRange: string;
  location: string;
  planType: string;
  dayType: string;
  groupBy: string;
}

export interface PeakHoursSummary {
  peakHour: string;
  peakDay: string;
  maxOccupancy: number;
  maxOccupancyTime: string;
  avgOccupancy: number;
  totalSessions: number;
}

export interface OccupancyByHourData {
  hour: string;
  rate: number;
}

export interface HeatmapData {
  day: string;
  hours: number[];
}

export interface HourlyOccupancyData {
  hour: string;
  capacity: number;
  occupied: number;
  occupancyRate: number;
  sessions: number;
  entries: number;
  exits: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Data
const mockHourlyData: HourlyOccupancyData[] = [
  { hour: "12:00 AM - 1:00 AM", capacity: 2450, occupied: 245, occupancyRate: 10, sessions: 120, entries: 68, exits: 65 },
  { hour: "1:00 AM - 2:00 AM", capacity: 2450, occupied: 176, occupancyRate: 7, sessions: 98, entries: 42, exits: 50 },
  { hour: "2:00 AM - 3:00 AM", capacity: 2450, occupied: 196, occupancyRate: 8, sessions: 110, entries: 35, exits: 45 },
  { hour: "3:00 AM - 4:00 AM", capacity: 2450, occupied: 209, occupancyRate: 9, sessions: 115, entries: 40, exits: 48 },
  { hour: "4:00 AM - 5:00 AM", capacity: 2450, occupied: 233, occupancyRate: 10, sessions: 130, entries: 52, exits: 55 },
  { hour: "5:00 AM - 6:00 AM", capacity: 2450, occupied: 410, occupancyRate: 17, sessions: 210, entries: 95, exits: 88 },
  { hour: "6:00 AM - 7:00 AM", capacity: 2450, occupied: 612, occupancyRate: 25, sessions: 310, entries: 145, exits: 120 },
  { hour: "7:00 AM - 8:00 AM", capacity: 2450, occupied: 980, occupancyRate: 40, sessions: 520, entries: 260, exits: 210 },
  { hour: "8:00 AM - 9:00 AM", capacity: 2450, occupied: 1421, occupancyRate: 58, sessions: 680, entries: 340, exits: 290 },
  { hour: "9:00 AM - 10:00 AM", capacity: 2450, occupied: 1715, occupancyRate: 70, sessions: 820, entries: 410, exits: 350 },
];

const getHeatmapColor = (rate: number): string => {
  if (rate >= 80) return "bg-red-500";
  if (rate >= 60) return "bg-orange-400";
  if (rate >= 40) return "bg-yellow-300";
  if (rate >= 20) return "bg-emerald-300";
  return "bg-emerald-100";
};

export const peakHoursService = {
  getSummary: async (filters?: PeakHoursFilters): Promise<PeakHoursSummary> => {
    await delay(500);
    return {
      peakHour: "6:00 PM",
      peakDay: "Saturday",
      maxOccupancy: 92,
      maxOccupancyTime: "6:00 PM, May 17",
      avgOccupancy: 58,
      totalSessions: 6782,
    };
  },

  getOccupancyByHour: async (filters?: PeakHoursFilters): Promise<OccupancyByHourData[]> => {
    await delay(400);
    return [
      { hour: "12 AM", rate: 10 }, { hour: "3 AM", rate: 8 }, { hour: "6 AM", rate: 25 },
      { hour: "9 AM", rate: 55 }, { hour: "12 PM", rate: 70 }, { hour: "3 PM", rate: 85 },
      { hour: "6 PM", rate: 92 }, { hour: "9 PM", rate: 65 }, { hour: "11 PM", rate: 30 },
    ];
  },

  getHeatmapData: async (filters?: PeakHoursFilters): Promise<HeatmapData[]> => {
    await delay(400);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, dayIdx) => ({
      day,
      hours: Array.from({ length: 24 }, (_, hourIdx) => {
        // Generate realistic occupancy patterns
        let baseRate = 30;
        if (hourIdx >= 8 && hourIdx <= 18) baseRate = 65; // Daytime
        if (hourIdx >= 18 && hourIdx <= 22) baseRate = 85; // Evening peak
        if (hourIdx >= 22 || hourIdx <= 5) baseRate = 15; // Night
        if (dayIdx >= 5) baseRate = Math.min(baseRate + 15, 95); // Weekend higher
        return Math.min(baseRate + Math.floor(Math.random() * 20), 100);
      }),
    }));
  },

  getHourlyOccupancyData: async (filters?: PeakHoursFilters): Promise<HourlyOccupancyData[]> => {
    await delay(600);
    let data = [...mockHourlyData];
    if (filters?.location && filters.location !== "All Locations") {
      data = data.map(d => ({ ...d, occupied: Math.floor(d.occupied * 0.8) }));
    }
    return data;
  },

  exportReport: async (filters?: PeakHoursFilters): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    console.log("Exporting peak hours report with filters:", filters);
    return { success: true, message: "Peak hours report exported successfully!" };
  },
};

export { getHeatmapColor };