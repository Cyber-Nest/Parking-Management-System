export interface ReconciliationFilters {
  dateRange: string;
  location: string;
  paymentMethod: string;
  status: string;
}

export interface ReconciliationStats {
  totalCollected: number;
  deposited: number;
  refunds: number;
  adjustments: number;
}

export interface ReconciliationData {
  id: string;
  date: string;
  totalCollected: number;
  cardAmount: number;
  otherAmount: number;
  refunds: number;
  adjustment: number;
  deposited: number;
  netExpected: number;
  variance: number;
  status: string;
  bankReference?: string;
  notes?: string;
}

export interface ChartData {
  name: string;
  collected: number;
  deposited: number;
  variance: number;
}

export interface PaymentMethodData {
  name: string;
  value: number;
  color: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Stats
const getMockStats = (): ReconciliationStats => ({
  totalCollected: 45678.50,
  deposited: 44850.00,
  refunds: 2350.00,
  adjustments: 200.00,
});

// Mock Chart Data
const getMockChartData = (): ChartData[] => [
  { name: "May 01", collected: 12000, deposited: 11500, variance: 500 },
  { name: "May 04", collected: 15000, deposited: 14800, variance: 200 },
  { name: "May 07", collected: 11000, deposited: 11000, variance: 0 },
  { name: "May 10", collected: 18000, deposited: 17500, variance: 500 },
  { name: "May 13", collected: 14000, deposited: 13900, variance: 100 },
  { name: "May 16", collected: 16000, deposited: 15800, variance: 200 },
  { name: "May 19", collected: 13000, deposited: 12800, variance: 200 },
];

// Mock Payment Method Data
const getMockPaymentMethodData = (): PaymentMethodData[] => [
  { name: "Credit / Debit Card", value: 32450, color: "var(--color-primary)" },
  { name: "Other Methods", value: 13228, color: "#94A3B8" },
];

// Mock Table Data
const mockTableData: ReconciliationData[] = [
  { id: "1", date: "May 21, 2025", totalCollected: 3245, cardAmount: 2450, otherAmount: 795, refunds: -120, adjustment: 0, deposited: 3125, netExpected: 3125, variance: 0, status: "Reconciled", bankReference: "REF-001", notes: "All good" },
  { id: "2", date: "May 20, 2025", totalCollected: 3980.5, cardAmount: 2950, otherAmount: 1030.5, refunds: -100, adjustment: 0, deposited: 3880.5, netExpected: 3880.5, variance: 0, status: "Reconciled", bankReference: "REF-002", notes: "" },
  { id: "3", date: "May 19, 2025", totalCollected: 4120, cardAmount: 3120, otherAmount: 1000, refunds: -200, adjustment: 0, deposited: 3920, netExpected: 3920, variance: 0, status: "Reconciled", bankReference: "REF-003", notes: "" },
  { id: "4", date: "May 18, 2025", totalCollected: 2875, cardAmount: 2150, otherAmount: 725, refunds: -75, adjustment: 0, deposited: 2800, netExpected: 2800, variance: 0, status: "Reconciled", bankReference: "REF-004", notes: "" },
  { id: "5", date: "May 17, 2025", totalCollected: 4530, cardAmount: 3420, otherAmount: 1110, refunds: -150, adjustment: 0, deposited: 4380, netExpected: 4380, variance: 0, status: "Reconciled", bankReference: "REF-005", notes: "" },
  { id: "6", date: "May 16, 2025", totalCollected: 5210, cardAmount: 3980, otherAmount: 1230, refunds: -80, adjustment: 0, deposited: 5130, netExpected: 5130, variance: 0, status: "Pending", bankReference: "REF-006", notes: "Awaiting bank confirmation" },
];

export const paymentReconciliationService = {
  getStats: async (filters?: ReconciliationFilters): Promise<ReconciliationStats> => {
    await delay(400);
    return getMockStats();
  },

  getTableData: async (filters?: ReconciliationFilters): Promise<ReconciliationData[]> => {
    await delay(500);
    let filtered = [...mockTableData];
    
    if (filters?.status && filters.status !== "All Status") {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    if (filters?.paymentMethod && filters.paymentMethod !== "All Methods") {
      // Filter logic for payment method
      if (filters.paymentMethod === "Card") {
        filtered = filtered.filter(t => t.cardAmount > 0);
      }
    }
    
    return filtered;
  },

  getChartData: async (filters?: ReconciliationFilters): Promise<ChartData[]> => {
    await delay(400);
    return getMockChartData();
  },

  getPaymentMethodData: async (filters?: ReconciliationFilters): Promise<PaymentMethodData[]> => {
    await delay(400);
    return getMockPaymentMethodData();
  },

  getDetailsById: async (id: string): Promise<ReconciliationData | null> => {
    await delay(300);
    return mockTableData.find(item => item.id === id) || null;
  },

  exportReport: async (filters?: ReconciliationFilters): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    console.log("Exporting reconciliation report with filters:", filters);
    return { success: true, message: "Reconciliation report exported successfully!" };
  },
};