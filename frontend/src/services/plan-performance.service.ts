// services/plan-performance.service.ts

export interface PlanPerformanceFilters {
  dateRange: string;
  location: string;
  planType: string;
  paymentMethod: string;
}

export interface PlanPerformanceSummary {
  totalRevenue: number;
  totalPlansSold: number;
  avgRevenuePerPlan: number;
  avgDuration: string;
}

export interface PlanData {
  id: string;
  name: string;
  type: string;
  price: number;
  sold: number;
  revenue: number;
  avgRevenue: number;
  sessions: number;
  duration: string;
  refunds: number;
  netRevenue: number;
  percentOfTotal: number;
}

export interface RevenueByPlanData {
  name: string;
  value: number;
  color: string;
}

export interface PlansSoldData {
  name: string;
  qty: number;
}

export interface RevenueTrendData {
  name: string;
  daily: number;
  hourly: number;
  monthly: number;
  evening: number;
}

// Plan Details for Drawer
export interface PlanDetails {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  features: string[];
  totalSold: number;
  totalRevenue: number;
  avgRevenue: number;
  totalSessions: number;
  avgDuration: string;
  refunds: number;
  netRevenue: number;
  recentTransactions: RecentTransaction[];
}

export interface RecentTransaction {
  id: string;
  date: string;
  customer: string;
  amount: number;
  status: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Data
const mockPlanData: PlanData[] = [
  { id: "1", name: "Daily Pass", type: "Daily", price: 20, sold: 1025, revenue: 20450, avgRevenue: 19.95, sessions: 1210, duration: "7h 12m", refunds: 220, netRevenue: 20230, percentOfTotal: 44.8 },
  { id: "2", name: "Hourly Pass", type: "Hourly", price: 5, sold: 620, revenue: 10230, avgRevenue: 16.50, sessions: 780, duration: "2h 15m", refunds: 120, netRevenue: 10110, percentOfTotal: 22.4 },
  { id: "3", name: "Monthly Pass", type: "Monthly", price: 120, sold: 410, revenue: 8760, avgRevenue: 21.37, sessions: 495, duration: "--", refunds: 180, netRevenue: 8580, percentOfTotal: 19.2 },
  { id: "4", name: "Evening Pass", type: "Evening", price: 8, sold: 250, revenue: 4210, avgRevenue: 16.84, sessions: 310, duration: "4h 05m", refunds: 90, netRevenue: 4120, percentOfTotal: 9.2 },
  { id: "5", name: "Weekend Pass", type: "Weekend", price: 15, sold: 110, revenue: 1378.5, avgRevenue: 12.53, sessions: 130, duration: "12h 30m", refunds: 40, netRevenue: 1338.5, percentOfTotal: 3.0 },
  { id: "6", name: "Other Plans", type: "Other", price: 0, sold: 43, revenue: 650, avgRevenue: 15.12, sessions: 60, duration: "3h 40m", refunds: 10, netRevenue: 640, percentOfTotal: 1.4 },
];

export const planPerformanceService = {
  getSummary: async (filters?: PlanPerformanceFilters): Promise<PlanPerformanceSummary> => {
    await delay(500);
    return {
      totalRevenue: 45678.5,
      totalPlansSold: 2458,
      avgRevenuePerPlan: 18.61,
      avgDuration: "6h 42m",
    };
  },

  getPlanData: async (filters?: PlanPerformanceFilters): Promise<PlanData[]> => {
    await delay(600);
    let filtered = [...mockPlanData];
    if (filters?.planType && filters.planType !== "All Plan Types") {
      filtered = filtered.filter(p => p.type === filters.planType);
    }
    return filtered;
  },

  getRevenueByPlan: async (filters?: PlanPerformanceFilters): Promise<RevenueByPlanData[]> => {
    await delay(400);
    return [
      { name: "Daily Pass", value: 20450, color: "var(--color-primary)" },
      { name: "Hourly Pass", value: 10230, color: "#10B981" },
      { name: "Monthly Pass", value: 8760, color: "#8B5CF6" },
      { name: "Evening Pass", value: 4210, color: "#F59E0B" },
      { name: "Weekend Pass", value: 1378, color: "#06B6D4" },
      { name: "Other Plans", value: 650, color: "#F43F5E" },
    ];
  },

  getPlansSoldData: async (filters?: PlanPerformanceFilters): Promise<PlansSoldData[]> => {
    await delay(400);
    return [
      { name: "Daily Pass", qty: 1025 },
      { name: "Hourly Pass", qty: 620 },
      { name: "Monthly Pass", qty: 410 },
      { name: "Evening Pass", qty: 250 },
      { name: "Weekend Pass", qty: 110 },
      { name: "Other Plans", qty: 43 },
    ];
  },

  getRevenueTrendData: async (filters?: PlanPerformanceFilters): Promise<RevenueTrendData[]> => {
    await delay(400);
    return [
      { name: "May 01", daily: 6000, hourly: 3000, monthly: 1500, evening: 800 },
      { name: "May 06", daily: 7500, hourly: 3500, monthly: 1800, evening: 1000 },
      { name: "May 11", daily: 6500, hourly: 3200, monthly: 1600, evening: 900 },
      { name: "May 16", daily: 8200, hourly: 4200, monthly: 2100, evening: 1200 },
      { name: "May 21", daily: 7800, hourly: 3800, monthly: 1900, evening: 1100 },
    ];
  },

  getPlanDetails: async (planId: string): Promise<PlanDetails> => {
    await delay(400);
    const plan = mockPlanData.find(p => p.id === planId);
    return {
      id: planId,
      name: plan?.name || "Unknown",
      type: plan?.type || "Unknown",
      price: plan?.price || 0,
      description: `${plan?.name} - Perfect for ${plan?.type.toLowerCase()} parking needs.`,
      features: [
        "24/7 Customer Support",
        "Easy Renewal",
        "Digital Receipt",
        "Parking Anywhere",
      ],
      totalSold: plan?.sold || 0,
      totalRevenue: plan?.revenue || 0,
      avgRevenue: plan?.avgRevenue || 0,
      totalSessions: plan?.sessions || 0,
      avgDuration: plan?.duration || "--",
      refunds: plan?.refunds || 0,
      netRevenue: plan?.netRevenue || 0,
      recentTransactions: [
        { id: "TXN-001", date: "May 21, 2025", customer: "John Doe", amount: plan?.price || 0, status: "Completed" },
        { id: "TXN-002", date: "May 20, 2025", customer: "Jane Smith", amount: plan?.price || 0, status: "Completed" },
        { id: "TXN-003", date: "May 19, 2025", customer: "Mike Johnson", amount: plan?.price || 0, status: "Pending" },
      ],
    };
  },

  exportReport: async (filters?: PlanPerformanceFilters): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    console.log("Exporting plan performance report with filters:", filters);
    return { success: true, message: "Plan performance report exported successfully!" };
  },
};