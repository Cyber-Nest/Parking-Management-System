export interface RefundAdjustmentFilters {
  dateRange: string;
  type: string;
  reason: string;
  location: string;
  processedBy: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface RefundAdjustmentStats {
  totalRefunds: number;
  totalAdjustments: number;
  netAmount: number;
  totalTransactions: number;
}

export interface RefundAdjustmentData {
  id: string;
  dateTime: string;
  type: "Refund" | "Adjustment";
  referenceId: string;
  relatedTo: string;
  plateUser: string;
  reason: string;
  amount: number;
  processedBy: string;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}

export interface OverTimeData {
  name: string;
  refunds: number;
  adjustments: number;
}

export interface ReasonData {
  name: string;
  value: number;
  color: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Stats
const getMockStats = (): RefundAdjustmentStats => ({
  totalRefunds: 4850.0,
  totalAdjustments: 1250.0,
  netAmount: 3600.0,
  totalTransactions: 86,
});

// Mock Over Time Data
const getMockOverTimeData = (days: number = 30): OverTimeData[] => {
  const data: OverTimeData[] = [];
  const startDate = new Date(2025, 4, 1);
  const count = days === 7 ? 7 : days === 15 ? 15 : 21;
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i * 4);
    data.push({
      name: `May ${String(date.getDate()).padStart(2, '0')}`,
      refunds: 300 + Math.random() * 1500,
      adjustments: 150 + Math.random() * 700,
    });
  }
  return data;
};

// Mock Reason Data
const getMockReasonData = (): ReasonData[] => [
  { name: "Customer Request", value: 2450, color: "#F43F5E" },
  { name: "Duplicate Payment", value: 1350, color: "#3B82F6" },
  { name: "Overpayment", value: 1100, color: "#10B981" },
  { name: "System Adjustment", value: 800, color: "#F59E0B" },
  { name: "Other", value: 400, color: "#8B5CF6" },
];

// Mock Table Data
const mockTableData: RefundAdjustmentData[] = [
  { id: "1", dateTime: "May 21, 2025 10:25 AM", type: "Refund", referenceId: "RFN-2025-0056", relatedTo: "Penalty Ticket #PT-10048", plateUser: "ABC-123", reason: "Customer Request", amount: -120, processedBy: "Manager User", status: "Completed", paymentMethod: "Visa **** 4242", transactionId: "txn_123456", notes: "Customer requested refund due to wrong ticket" },
  { id: "2", dateTime: "May 21, 2025 09:15 AM", type: "Refund", referenceId: "RFN-2025-0055", relatedTo: "Parking Session #PS-98765", plateUser: "XYZ-789", reason: "Duplicate Payment", amount: -50, processedBy: "Admin User", status: "Completed", paymentMethod: "Mastercard **** 8888", transactionId: "txn_789012", notes: "Duplicate payment detected automatically" },
  { id: "3", dateTime: "May 20, 2025 04:40 PM", type: "Adjustment", referenceId: "ADJ-2025-0023", relatedTo: "Payment #PMT-77654", plateUser: "John Doe", reason: "Overpayment", amount: 75, processedBy: "Accountant User", status: "Completed", paymentMethod: "Manual", transactionId: null, notes: "Customer paid extra by mistake" },
  { id: "4", dateTime: "May 20, 2025 02:30 PM", type: "Adjustment", referenceId: "ADJ-2025-0022", relatedTo: "System", plateUser: "-", reason: "System Adjustment", amount: -30, processedBy: "System", status: "Completed", paymentMethod: "Manual", transactionId: null, notes: "Auto adjustment for overcharge" },
  { id: "5", dateTime: "May 19, 2025 11:00 AM", type: "Refund", referenceId: "RFN-2025-0054", relatedTo: "Penalty Ticket #PT-10047", plateUser: "DEF-456", reason: "Customer Request", amount: -80, processedBy: "Officer User", status: "Pending", paymentMethod: "Cash", transactionId: null, notes: "Awaiting manager approval" },
];

export const refundsAdjustmentsService = {
  getStats: async (filters?: RefundAdjustmentFilters): Promise<RefundAdjustmentStats> => {
    await delay(400);
    console.log("Stats filters:", filters);
    return getMockStats();
  },

  getTableData: async (filters?: RefundAdjustmentFilters): Promise<RefundAdjustmentData[]> => {
    await delay(600);
    let filtered = [...mockTableData];
    
    if (filters?.type && filters.type !== "All Types") {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    if (filters?.reason && filters.reason !== "All Reasons") {
      filtered = filtered.filter(t => t.reason === filters.reason);
    }
    if (filters?.status && filters.status !== "All Statuses") {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    if (filters?.processedBy && filters.processedBy !== "All Users") {
      filtered = filtered.filter(t => t.processedBy === filters.processedBy);
    }
    
    return filtered;
  },

  getOverTimeData: async (days?: number): Promise<OverTimeData[]> => {
    await delay(400);
    return getMockOverTimeData(days);
  },

  getReasonData: async (): Promise<ReasonData[]> => {
    await delay(400);
    return getMockReasonData();
  },

  getDetailsById: async (id: string): Promise<RefundAdjustmentData | null> => {
    await delay(300);
    return mockTableData.find(item => item.id === id) || null;
  },

  exportReport: async (filters?: RefundAdjustmentFilters): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    console.log("Exporting refunds report with filters:", filters);
    return { success: true, message: "Refunds report exported successfully!" };
  },
};