// services/audit-logs.service.ts

export interface AuditLogFilters {
  search: string;
  dateRange: string;
  user: string;
  role: string;
  module: string;
  action: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  module: string;
  action: string;
  oldValue: string;
  newValue: string;
  status: "success" | "failed" | "blocked";
  recordId?: string;
}

export interface AuditLogStats {
  totalLogs: number;
  successCount: number;
  failedCount: number;
  blockedCount: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Data
const mockAuditLogs: AuditLog[] = [
  { id: "1", timestamp: "May 21, 2025 10:30:45 AM", user: "Admin User", role: "Super Admin", module: "Penalty Tickets", action: "Created", oldValue: "-", newValue: "Ticket #TKT-10048", status: "success", recordId: "TKT-10048" },
  { id: "2", timestamp: "May 21, 2025 10:25:12 AM", user: "Manager User", role: "Manager", module: "Parking Plans", action: "Updated", oldValue: "Price: $10.00", newValue: "Price: $12.00", status: "success", recordId: "PLAN-101" },
  { id: "3", timestamp: "May 21, 2025 09:15:33 AM", user: "Accountant User", role: "Accountant", module: "Payments", action: "Refund Issued", oldValue: "-", newValue: "Refund #RF-2055", status: "success", recordId: "PAY-100500" },
  { id: "4", timestamp: "May 20, 2025 06:20:17 PM", user: "Admin User", role: "Super Admin", module: "Users & Roles", action: "User Disabled", oldValue: "Status: Active", newValue: "Status: Disabled", status: "success", recordId: "USR-1001" },
  { id: "5", timestamp: "May 20, 2025 02:10:33 PM", user: "Officer User", role: "Officer", module: "Penalty Tickets", action: "Created", oldValue: "-", newValue: "Ticket #TKT-10047", status: "success", recordId: "TKT-10047" },
  { id: "6", timestamp: "May 20, 2025 11:45:22 AM", user: "Admin User", role: "Super Admin", module: "Settings", action: "Updated", oldValue: "Tax Rate: 5%", newValue: "Tax Rate: 8%", status: "success", recordId: "SET-001" },
  { id: "7", timestamp: "May 19, 2025 04:30:15 PM", user: "System", role: "System", module: "Payments", action: "Failed", oldValue: "-", newValue: "Payment failed for TKT-10046", status: "failed", recordId: "PAY-100498" },
  { id: "8", timestamp: "May 19, 2025 09:00:00 AM", user: "Admin User", role: "Super Admin", module: "Security", action: "Login", oldValue: "-", newValue: "Successful login", status: "success", recordId: null },
  { id: "9", timestamp: "May 18, 2025 10:15:30 PM", user: "Officer User", role: "Officer", module: "Penalty Tickets", action: "Cancelled", oldValue: "Status: Unpaid", newValue: "Status: Cancelled", status: "success", recordId: "TKT-10045" },
  { id: "10", timestamp: "May 18, 2025 03:20:45 PM", user: "Manager User", role: "Manager", module: "Reports", action: "Exported", oldValue: "-", newValue: "Revenue Report", status: "success", recordId: null },
  { id: "11", timestamp: "May 17, 2025 08:45:12 AM", user: "Accountant User", role: "Accountant", module: "Payments", action: "Marked Paid", oldValue: "Status: Unpaid", newValue: "Status: Paid", status: "success", recordId: "PAY-100497" },
  { id: "12", timestamp: "May 17, 2025 01:30:50 PM", user: "Support User", role: "Support", module: "Parking Plans", action: "Updated", oldValue: "Duration: 60 mins", newValue: "Duration: 90 mins", status: "blocked", recordId: "PLAN-102" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "success": return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-white";
    case "failed": return "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-white";
    case "blocked": return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-white";
    default: return "bg-gray-100 text-gray-600";
  }
};

export const auditLogsService = {
  getStats: async (filters?: AuditLogFilters): Promise<AuditLogStats> => {
    await delay(300);
    const logs = await auditLogsService.getLogs(filters);
    return {
      totalLogs: logs.length,
      successCount: logs.filter(l => l.status === "success").length,
      failedCount: logs.filter(l => l.status === "failed").length,
      blockedCount: logs.filter(l => l.status === "blocked").length,
    };
  },

  getLogs: async (filters?: AuditLogFilters): Promise<AuditLog[]> => {
    await delay(500);
    let filtered = [...mockAuditLogs];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log =>
        log.user.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.module.toLowerCase().includes(searchLower) ||
        (log.recordId && log.recordId.toLowerCase().includes(searchLower))
      );
    }

    if (filters?.user && filters.user !== "All Users") {
      filtered = filtered.filter(log => log.user === filters.user);
    }
    if (filters?.role && filters.role !== "All Roles") {
      filtered = filtered.filter(log => log.role === filters.role);
    }
    if (filters?.module && filters.module !== "All Modules") {
      filtered = filtered.filter(log => log.module === filters.module);
    }
    if (filters?.action && filters.action !== "All Actions") {
      filtered = filtered.filter(log => log.action === filters.action);
    }
    if (filters?.status && filters.status !== "All Status") {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    return filtered;
  },

  getUsers: async (): Promise<string[]> => {
    await delay(200);
    return ["Admin User", "Manager User", "Accountant User", "Officer User", "Support User", "System"];
  },

  getModules: async (): Promise<string[]> => {
    await delay(200);
    return ["Penalty Tickets", "Payments", "Parking Plans", "Users & Roles", "Settings", "Reports", "Security"];
  },

  getActions: async (): Promise<string[]> => {
    await delay(200);
    return ["Created", "Updated", "Deleted", "Cancelled", "Refund Issued", "User Disabled", "Login", "Exported", "Marked Paid", "Failed"];
  },

  exportLogs: async (filters?: AuditLogFilters): Promise<{ success: boolean; message: string; data?: AuditLog[] }> => {
    await delay(1000);
    const logs = await auditLogsService.getLogs(filters);
    console.log("Exporting logs:", logs);
    return { success: true, message: "Audit logs exported successfully!", data: logs };
  },
};

export { getStatusColor };