export interface OutstandingFilters {
  dateRange: string;
  dueAge: string;
  location: string;
  officer: string;
  violationType: string;
  vehiclePlate: string;
  ticketStatus: string;
}

export interface OutstandingStats {
  totalOutstanding: number;
  days0to7: number;
  days7to30: number;
  days30plus: number;
}

export interface OutstandingTicket {
  id: string;
  ticketId: string;
  ticketDate: string;
  plateNumber: string;
  violationType: string;
  location: string;
  dueDate: string;
  daysPending: number;
  amount: number;
  status: string;
  officerName?: string;
  officerId?: string;
  notes?: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Data
const mockTickets: OutstandingTicket[] = [
  { id: "1", ticketId: "TK-250521-001", ticketDate: "May 21, 2025 10:15 AM", plateNumber: "ABC-123", violationType: "Overtime Parking", location: "Downtown Lot", dueDate: "May 28, 2025", daysPending: 0, amount: 75.00, status: "Unpaid", officerName: "John Smith", officerId: "OF-1001", notes: "Customer requested extension" },
  { id: "2", ticketId: "TK-250520-018", ticketDate: "May 20, 2025 02:45 PM", plateNumber: "XYZ-789", violationType: "No Parking Zone", location: "Main Street", dueDate: "May 27, 2025", daysPending: 1, amount: 100.00, status: "Unpaid", officerName: "Sarah Wright", officerId: "OF-1002", notes: "" },
  { id: "3", ticketId: "TK-250519-034", ticketDate: "May 19, 2025 11:20 AM", plateNumber: "DEF-456", violationType: "Expired Meter", location: "City Center", dueDate: "May 26, 2025", daysPending: 2, amount: 60.00, status: "Unpaid", officerName: "John Smith", officerId: "OF-1001", notes: "" },
  { id: "4", ticketId: "TK-250516-067", ticketDate: "May 18, 2025 09:10 AM", plateNumber: "GHI-321", violationType: "No Parking Zone", location: "Market Street", dueDate: "May 23, 2025", daysPending: 5, amount: 100.00, status: "Unpaid", officerName: "Adam Milner", officerId: "OF-1003", notes: "" },
  { id: "5", ticketId: "TK-250514-072", ticketDate: "May 14, 2025 04:30 PM", plateNumber: "JKL-654", violationType: "Overtime Parking", location: "Airport Parking", dueDate: "May 21, 2025", daysPending: 7, amount: 75.00, status: "Unpaid", officerName: "Sarah Wright", officerId: "OF-1002", notes: "" },
  { id: "6", ticketId: "TK-250508-105", ticketDate: "May 8, 2025 03:25 PM", plateNumber: "MNO-987", violationType: "Blocking Driveway", location: "Residential Area", dueDate: "May 15, 2025", daysPending: 13, amount: 150.00, status: "Unpaid", officerName: "John Smith", officerId: "OF-1001", notes: "" },
  { id: "7", ticketId: "TK-250501-089", ticketDate: "May 1, 2025 08:30 AM", plateNumber: "PQR-234", violationType: "Overtime Parking", location: "Downtown Lot", dueDate: "May 8, 2025", daysPending: 20, amount: 75.00, status: "Unpaid", officerName: "Adam Milner", officerId: "OF-1003", notes: "" },
  { id: "8", ticketId: "TK-250425-056", ticketDate: "Apr 25, 2025 01:15 PM", plateNumber: "STU-567", violationType: "No Parking Zone", location: "Main Street", dueDate: "May 2, 2025", daysPending: 26, amount: 100.00, status: "Unpaid", officerName: "Sarah Wright", officerId: "OF-1002", notes: "" },
];

const getMockStats = (): OutstandingStats => ({
  totalOutstanding: 86450.00,
  days0to7: 12450.00,
  days7to30: 34120.00,
  days30plus: 39880.00,
});

export const outstandingDueService = {
  getStats: async (filters?: OutstandingFilters): Promise<OutstandingStats> => {
    await delay(400);
    console.log("Stats filters:", filters);
    return getMockStats();
  },

  getTickets: async (filters?: OutstandingFilters): Promise<OutstandingTicket[]> => {
    await delay(500);
    let filtered = [...mockTickets];
    
    if (filters?.dueAge && filters.dueAge !== "All") {
      if (filters.dueAge === "0-7 Days") {
        filtered = filtered.filter(t => t.daysPending >= 0 && t.daysPending <= 7);
      } else if (filters.dueAge === "7-30 Days") {
        filtered = filtered.filter(t => t.daysPending > 7 && t.daysPending <= 30);
      } else if (filters.dueAge === "30+ Days") {
        filtered = filtered.filter(t => t.daysPending > 30);
      }
    }
    
    if (filters?.location && filters.location !== "All Locations") {
      filtered = filtered.filter(t => t.location === filters.location);
    }
    if (filters?.officer && filters.officer !== "All Officers") {
      filtered = filtered.filter(t => t.officerName === filters.officer);
    }
    if (filters?.violationType && filters.violationType !== "All Violation Types") {
      filtered = filtered.filter(t => t.violationType === filters.violationType);
    }
    if (filters?.vehiclePlate) {
      filtered = filtered.filter(t => t.plateNumber.toLowerCase().includes(filters.vehiclePlate!.toLowerCase()));
    }
    
    return filtered;
  },

  getTicketById: async (id: string): Promise<OutstandingTicket | null> => {
    await delay(300);
    return mockTickets.find(t => t.id === id) || null;
  },

  exportReport: async (filters?: OutstandingFilters): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    console.log("Exporting outstanding report with filters:", filters);
    return { success: true, message: "Outstanding report exported successfully!" };
  },
};