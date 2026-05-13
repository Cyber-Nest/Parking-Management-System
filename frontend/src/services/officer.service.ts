export interface ActivityLog {
  id: string;
  action: string;
  createdAt: string;
  type?: "login" | "ticket" | "parking" | "payment" | "evidence";  // Added type
  details?: string;  // Added details for more context
}

export interface Officer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  loginStatus: "Active" | "Inactive";
  accessStatus: "Enabled" | "Disabled";
  tickets: number;
  date: string;
  time: string;
  disabledBy?: string;
  disabledAt?: string;
  disableReason?: string;
  activityLogs: ActivityLog[];
  
  // New fields
  employeeId?: string;
  employmentType?: "Full-Time" | "Part-Time" | "Contractor" | "Temporary";
  hireDate?: string;
  emergencyContactName?: string;
  emergencyPhone?: string;
  emergencyRelationship?: string;
  addressStreet?: string;
  addressCity?: string;
  addressProvince?: string;
  addressPostalCode?: string;
  profilePhoto?: string;
}

// Activity Types
export interface LoginActivityData {
  officerId: string;
  action: "logged_in" | "logged_out" | "failed_login" | "password_changed" | "password_reset_requested";
}

export interface TicketActivityData {
  ticketId: string;
  officerId: string;
  action: "issued" | "cancelled" | "edited_amount" | "marked_paid" | "added_note" | "uploaded_evidence";
  details: string;
}

export interface ParkingActivityData {
  sessionId: string;
  officerId: string;
  action: "extended" | "cancelled" | "marked_issue" | "created_manual";
  details: string;
}

export interface PaymentActivityData {
  paymentId: string;
  officerId: string;
  action: "marked_paid" | "created_refund" | "added_manual_cash";
  amount: string;
  details?: string;
}

export interface EvidenceActivityData {
  ticketId: string;
  officerId: string;
  action: "uploaded" | "removed" | "updated_gps";
  details: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data store 
let mockOfficers: Officer[] = [
  {
    id: "OF-1001",
    name: "John Smith",
    email: "john.smith@parking.com",
    phone: "+1234567890",
    role: "Officer",
    loginStatus: "Active",
    accessStatus: "Enabled",
    tickets: 156,
    date: "May 21, 2025",
    time: "09:15 AM",
    employeeId: "EMP-001",
    employmentType: "Full-Time",
    hireDate: "2024-01-15",
    emergencyContactName: "Jane Smith",
    emergencyPhone: "+1234567891",
    emergencyRelationship: "Spouse",
    addressStreet: "123 Main St",
    addressCity: "Toronto",
    addressProvince: "Ontario",
    addressPostalCode: "M5V 2T6",
    activityLogs: [
      {
        id: "LOG-1",
        action: "Issued ticket TKT-1001",
        createdAt: "May 21, 2025 - 09:10 AM",
        type: "ticket",
        details: "Penalty ticket issued for expired parking",
      },
      {
        id: "LOG-2",
        action: "Logged into dashboard",
        createdAt: "May 21, 2025 - 08:55 AM",
        type: "login",
        details: "Successful login",
      },
    ],
  },
  {
    id: "OF-1002",
    name: "Sarah Wright",
    email: "sarah.w@parking.com",
    phone: "+1987654321",
    role: "Supervisor",
    loginStatus: "Inactive",
    accessStatus: "Enabled",
    tickets: 92,
    date: "May 20, 2025",
    time: "10:30 AM",
    employeeId: "EMP-002",
    employmentType: "Full-Time",
    hireDate: "2024-03-10",
    emergencyContactName: "Mike Wright",
    emergencyPhone: "+1987654322",
    emergencyRelationship: "Brother",
    addressStreet: "456 Oak Ave",
    addressCity: "Vancouver",
    addressProvince: "British Columbia",
    addressPostalCode: "V6B 2T6",
    activityLogs: [
      {
        id: "LOG-3",
        action: "Approved penalty cancellation",
        createdAt: "May 20, 2025 - 07:30 PM",
        type: "ticket",
        details: "Cancelled ticket TKT-1002",
      },
    ],
  },
  {
    id: "OF-1003",
    name: "Adam Milner",
    email: "adam.m@parking.com",
    phone: "+1555012345",
    role: "Officer",
    loginStatus: "Inactive",
    accessStatus: "Disabled",
    tickets: 210,
    date: "May 20, 2025",
    time: "11:45 AM",
    disabledBy: "Admin",
    disabledAt: "May 21, 2025 - 11:00 AM",
    disableReason: "Violation misuse detected.",
    employeeId: "EMP-003",
    employmentType: "Contractor",
    hireDate: "2024-06-01",
    emergencyContactName: "Emma Milner",
    emergencyPhone: "+1555012346",
    emergencyRelationship: "Sister",
    addressStreet: "789 Pine Rd",
    addressCity: "Montreal",
    addressProvince: "Quebec",
    addressPostalCode: "H2X 3T6",
    activityLogs: [
      {
        id: "LOG-4",
        action: "Officer account disabled",
        createdAt: "May 21, 2025 - 11:00 AM",
        type: "login",
        details: "Account disabled by Admin",
      },
    ],
  },
];

export const officerService = {
  getOfficers: async (): Promise<Officer[]> => {
    await delay(500);
    return [...mockOfficers];
  },

  getOfficerById: async (id: string): Promise<Officer | undefined> => {
    await delay(300);
    return mockOfficers.find(o => o.id === id);
  },

  createOfficer: async (data: Partial<Officer>): Promise<Officer> => {
    await delay(800);
    const newOfficer: Officer = {
      id: `OF-${1000 + mockOfficers.length + 1}`,
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      role: data.role || "Officer",
      loginStatus: "Inactive",
      accessStatus: "Enabled",
      tickets: 0,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      employeeId: `EMP-${String(mockOfficers.length + 1).padStart(3, "0")}`,
      employmentType: data.employmentType,
      hireDate: data.hireDate,
      emergencyContactName: data.emergencyContactName,
      emergencyPhone: data.emergencyPhone,
      emergencyRelationship: data.emergencyRelationship,
      addressStreet: data.addressStreet,
      addressCity: data.addressCity,
      addressProvince: data.addressProvince,
      addressPostalCode: data.addressPostalCode,
      profilePhoto: data.profilePhoto,
      activityLogs: [],
    };
    mockOfficers.push(newOfficer);
    return newOfficer;
  },

  updateOfficer: async (id: string, data: Partial<Officer>): Promise<Officer> => {
    await delay(600);
    const index = mockOfficers.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Officer not found");
    
    mockOfficers[index] = { ...mockOfficers[index], ...data };
    return mockOfficers[index];
  },

  deleteOfficer: async (id: string): Promise<void> => {
    await delay(500);
    mockOfficers = mockOfficers.filter(o => o.id !== id);
  },

  toggleOfficerStatus: async (id: string): Promise<Officer> => {
    await delay(400);
    const index = mockOfficers.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Officer not found");
    
    const currentStatus = mockOfficers[index].accessStatus;
    mockOfficers[index].accessStatus = currentStatus === "Enabled" ? "Disabled" : "Enabled";
    
    // Add activity log for status change
    const activityLog: ActivityLog = {
      id: `LOG-${Date.now()}`,
      action: `Account ${mockOfficers[index].accessStatus === "Enabled" ? "enabled" : "disabled"}`,
      createdAt: new Date().toLocaleString(),
      type: "login",
      details: `Account status changed by Admin`,
    };
    mockOfficers[index].activityLogs.unshift(activityLog);
    
    return mockOfficers[index];
  },


  // Add general activity log to officer
  addActivityLog: async (officerId: string, action: string, type: ActivityLog["type"], details?: string): Promise<void> => {
    await delay(200);
    const officer = mockOfficers.find(o => o.id === officerId);
    if (officer) {
      const newLog: ActivityLog = {
        id: `LOG-${Date.now()}`,
        action,
        createdAt: new Date().toLocaleString(),
        type,
        details,
      };
      officer.activityLogs.unshift(newLog);
      console.log(`Activity log added for ${officerId}: ${action}`);
    }
  },

  // Login Activity
  recordLoginActivity: async (officerId: string, action: LoginActivityData["action"]): Promise<void> => {
    await delay(300);
    const actionMap: Record<string, string> = {
      logged_in: "Logged into system",
      logged_out: "Logged out of system",
      failed_login: "Failed login attempt",
      password_changed: "Password changed",
      password_reset_requested: "Password reset requested",
    };
    await officerService.addActivityLog(officerId, actionMap[action], "login");
  },

  // Ticket Activity
  recordTicketActivity: async (data: TicketActivityData): Promise<void> => {
    await delay(300);
    const actionMap: Record<string, string> = {
      issued: `Issued penalty ticket #${data.ticketId}`,
      cancelled: `Cancelled ticket #${data.ticketId}`,
      edited_amount: `Edited violation amount for ticket #${data.ticketId}`,
      marked_paid: `Marked ticket #${data.ticketId} as paid`,
      added_note: `Added note to ticket #${data.ticketId}`,
      uploaded_evidence: `Uploaded evidence photo for ticket #${data.ticketId}`,
    };
    await officerService.addActivityLog(data.officerId, actionMap[data.action], "ticket", data.details);
  },

  // Parking Session Activity
  recordParkingActivity: async (data: ParkingActivityData): Promise<void> => {
    await delay(300);
    const actionMap: Record<string, string> = {
      extended: `Extended parking session #${data.sessionId}`,
      cancelled: `Cancelled parking session #${data.sessionId}`,
      marked_issue: `Marked issue on session #${data.sessionId}`,
      created_manual: `Created manual parking session #${data.sessionId}`,
    };
    await officerService.addActivityLog(data.officerId, actionMap[data.action], "parking", data.details);
  },

  // Payment Activity
  recordPaymentActivity: async (data: PaymentActivityData): Promise<void> => {
    await delay(300);
    const actionMap: Record<string, string> = {
      marked_paid: `Marked payment #${data.paymentId} as paid (${data.amount})`,
      created_refund: `Created refund for payment #${data.paymentId} (${data.amount})`,
      added_manual_cash: `Added manual cash payment #${data.paymentId} (${data.amount})`,
    };
    await officerService.addActivityLog(data.officerId, actionMap[data.action], "payment", data?.details);
  },

  // Evidence Activity
  recordEvidenceActivity: async (data: EvidenceActivityData): Promise<void> => {
    await delay(300);
    const actionMap: Record<string, string> = {
      uploaded: `Uploaded evidence photo for ticket #${data.ticketId}`,
      removed: `Removed evidence photo for ticket #${data.ticketId}`,
      updated_gps: `Updated GPS/location for evidence on ticket #${data.ticketId}`,
    };
    await officerService.addActivityLog(data.officerId, actionMap[data.action], "evidence", data.details);
  },

  // Get all activities for an officer
  getOfficerActivities: async (officerId: string): Promise<ActivityLog[]> => {
    await delay(300);
    const officer = mockOfficers.find(o => o.id === officerId);
    return officer?.activityLogs || [];
  },
};