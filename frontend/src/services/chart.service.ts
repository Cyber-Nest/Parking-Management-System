export type RevenueFilter = "1 Month" | "3 Months" | "6 Months" | "12 Months";
export type ParkingFilter = "7 Days" | "15 Days" | "30 Days";

export interface RevenueItem {
  name: string;
  value: number;
}

export interface ParkingItem {
  day: string;
  count: number;
}

export interface PenaltyItem {
  name: string;
  value: number;
  color: string;
}

export interface DashboardChartsResponse {
  revenue: Record<RevenueFilter, RevenueItem[]>;
  parking: Record<ParkingFilter, ParkingItem[]>;
  penalties: PenaltyItem[];
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const chartService = {
  getChartsData: async (): Promise<DashboardChartsResponse> => {
    await delay(500);

    return {
      revenue: {
        "1 Month": [
          { name: "Week 1", value: 4500 },
          { name: "Week 2", value: 5200 },
          { name: "Week 3", value: 4800 },
          { name: "Week 4", value: 6100 },
        ],
        "3 Months": [
          { name: "Jan", value: 15000 },
          { name: "Feb", value: 18500 },
          { name: "Mar", value: 16200 },
        ],
        "6 Months": [
          { name: "Jan", value: 12000 },
          { name: "Feb", value: 15000 },
          { name: "Mar", value: 14000 },
          { name: "Apr", value: 17000 },
          { name: "May", value: 19000 },
          { name: "Jun", value: 21000 },
        ],
        "12 Months": [
          { name: "Q1", value: 45000 },
          { name: "Q2", value: 52000 },
          { name: "Q3", value: 48000 },
          { name: "Q4", value: 65000 },
        ],
      },
      parking: {
        "7 Days": [
          { day: "Mon", count: 120 },
          { day: "Tue", count: 150 },
          { day: "Wed", count: 180 },
          { day: "Thu", count: 140 },
          { day: "Fri", count: 210 },
          { day: "Sat", count: 250 },
          { day: "Sun", count: 190 },
        ],
        "15 Days": [
          { day: "Day 1-5", count: 750 },
          { day: "Day 6-10", count: 890 },
          { day: "Day 11-15", count: 1020 },
        ],
        "30 Days": [
          { day: "Week 1", count: 1400 },
          { day: "Week 2", count: 1650 },
          { day: "Week 3", count: 1300 },
          { day: "Week 4", count: 1850 },
        ],
      },
      penalties: [
        {
          name: "Unpaid",
          value: 320,
          color: "#ef4444",
        },
        {
          name: "Paid",
          value: 680,
          color: "var(--color-success)",
        },
      ],
    };
  },
};
