export interface RevenueFilters {
  paymentMethod: string;
  revenueType: string;
  planType: string;
  startDate?: string;
  endDate?: string;
  period?: string; // Add period parameter
  days?: number;   // Add days parameter for chart filter
}

export interface RevenueSummary {
  totalRevenue: number;
  parkingRevenue: number;
  penaltyRevenue: number;
  refunds: number;
  totalRevenueTrend: number;
  parkingRevenueTrend: number;
  penaltyRevenueTrend: number;
  refundsTrend: number;
}

export interface RevenueDaily {
  date: string;
  parkingRevenue: number;
  penaltyRevenue: number;
  refunds: number;
  netRevenue: number;
  transactions: number;
}

export interface RevenueByType {
  name: string;
  value: number;
  color: string;
}

export interface RevenueByPaymentMethod {
  name: string;
  value: number;
  color: string;
}

export interface RevenueTimeData {
  date: string;
  revenue: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data for different periods
const getMockRevenueTimeDataDaily = (): RevenueTimeData[] => {
  const data: RevenueTimeData[] = [];
  const startDate = new Date(2025, 4, 1);
  for (let i = 0; i < 21; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    data.push({
      date: `May ${String(date.getDate()).padStart(2, '0')}`,
      revenue: 1500 + Math.random() * 2500,
    });
  }
  return data;
};

const getMockRevenueTimeDataWeekly = (): RevenueTimeData[] => {
  return [
    { date: "Week 1", revenue: 12500 },
    { date: "Week 2", revenue: 14800 },
    { date: "Week 3", revenue: 13200 },
    { date: "Week 4", revenue: 15600 },
  ];
};

const getMockRevenueTimeDataMonthly = (): RevenueTimeData[] => {
  return [
    { date: "Jan", revenue: 45200 },
    { date: "Feb", revenue: 49800 },
    { date: "Mar", revenue: 52300 },
    { date: "Apr", revenue: 47800 },
    { date: "May", revenue: 45678 },
  ];
};

// Mock data for chart days filter (7D, 15D, 30D)
const getMockRevenueTimeDataByDays = (days: number): RevenueTimeData[] => {
  const data: RevenueTimeData[] = [];
  const startDate = new Date(2025, 4, days === 30 ? 1 : days === 15 ? 7 : 15);
  const count = days === 30 ? 30 : days === 15 ? 15 : 7;
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    data.push({
      date: `May ${String(date.getDate()).padStart(2, '0')}`,
      revenue: 1500 + Math.random() * 2500,
    });
  }
  return data;
};

const getMockRevenueSummary = (): RevenueSummary => ({
  totalRevenue: 45678.50,
  parkingRevenue: 32450.00,
  penaltyRevenue: 11230.00,
  refunds: -2001.50,
  totalRevenueTrend: 16.6,
  parkingRevenueTrend: 15.3,
  penaltyRevenueTrend: 24.7,
  refundsTrend: -8.4,
});

const getMockRevenueDaily = (): RevenueDaily[] => {
  const data: RevenueDaily[] = [];
  const startDate = new Date(2025, 4, 1);
  for (let i = 0; i < 21; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      parkingRevenue: 1500 + Math.random() * 1000,
      penaltyRevenue: 400 + Math.random() * 600,
      refunds: -(50 + Math.random() * 100),
      netRevenue: 0,
      transactions: 80 + Math.floor(Math.random() * 80),
    });
  }
  return data.map(d => ({ ...d, netRevenue: d.parkingRevenue + d.penaltyRevenue + d.refunds }));
};

const getMockRevenueByType = (): RevenueByType[] => [
  { name: "Parking Revenue", value: 32450.00, color: "var(--color-primary)" },
  { name: "Penalty Revenue", value: 11230.00, color: "var(--color-accent)" },
  { name: "Refunds", value: 2001.50, color: "#EF4444" },
];

const getMockRevenueByPaymentMethod = (): RevenueByPaymentMethod[] => [
  { name: "Card Payments", value: 28765.00, color: "var(--color-primary)" },
  { name: "Cash Payments", value: 12450.00, color: "var(--color-accent)" },
  { name: "Other Payments", value: 4463.50, color: "#8B5CF6" },
];

export const reportsService = {
  getRevenueSummary: async (filters?: RevenueFilters): Promise<RevenueSummary> => {
    await delay(500);
    console.log("Revenue summary filters:", filters);
    return getMockRevenueSummary();
  },

  getRevenueDaily: async (filters?: RevenueFilters): Promise<RevenueDaily[]> => {
    await delay(600);
    console.log("Revenue daily filters:", filters);
    return getMockRevenueDaily();
  },

  getRevenueByType: async (filters?: RevenueFilters): Promise<RevenueByType[]> => {
    await delay(400);
    return getMockRevenueByType();
  },

  getRevenueByPaymentMethod: async (filters?: RevenueFilters): Promise<RevenueByPaymentMethod[]> => {
    await delay(400);
    return getMockRevenueByPaymentMethod();
  },

  getRevenueTimeData: async (params?: { period?: string; days?: number }): Promise<RevenueTimeData[]> => {
    await delay(500);
    console.log("Revenue time data params:", params);
    
    if (params?.days) {
      return getMockRevenueTimeDataByDays(params.days);
    }
    
    if (params?.period === "weekly") {
      return getMockRevenueTimeDataWeekly();
    }
    if (params?.period === "monthly") {
      return getMockRevenueTimeDataMonthly();
    }
    
    return getMockRevenueTimeDataDaily();
  },

  exportRevenueReport: async (filters?: RevenueFilters): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    console.log("Exporting revenue report with filters:", filters);
    return { success: true, message: "Revenue report exported successfully!" };
  },
};