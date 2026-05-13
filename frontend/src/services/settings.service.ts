export interface GeneralSettings {
  companyName: string;
  phone: string;
  address: string;
  email: string;
  supportEmail: string;
  website: string;
}

export interface TaxSettings {
  taxRate: string;
  currency: string;
  roundingRule: string;
  pricesIncludeTax: "yes" | "no";
  refundAllowed: "yes" | "no";
  refundApprovalRequired: "yes" | "no";
}

export interface SystemSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  sessionExpiryDisplay: string;
}

export interface SecuritySettings {
  minPasswordLength: number;
  maxLoginAttempts: number;
  requireUppercase: "yes" | "no";
  requireNumber: "yes" | "no";
  requireSpecialChar: "yes" | "no" | "disabled";
  twoFactorAuth: "required" | "disabled";
  sessionTimeout: number;
}


export interface NotificationSettings {
  // Email Notifications
  paymentSuccessEmail: boolean;
  penaltyIssuedAlert: boolean;
  penaltyPaidEmail: boolean;
  expiredParkingAlert: boolean;

  // SMS Notifications
  smsNotifications: boolean;

  // Admin Alerts
  adminAlertEmail: boolean;
  adminAlertRecipient: string;
}


export interface IntegrationSettings {
  // Payment Gateways
  stripe: {
    enabled: boolean;
    apiKey: string;
    webhookSecret: string;
    status: "connected" | "disconnected" | "error";
  };
  paypal: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    status: "connected" | "disconnected" | "error";
  };
  // POS System
  pos: {
    enabled: boolean;
    integrationType: "none" | "square" | "clover" | "custom";
    apiEndpoint: string;
    status: "connected" | "disconnected" | "error";
  };
  // Camera System
  camera: {
    enabled: boolean;
    cameraType: "none" | "hikvision" | "dahua" | "generic";
    ipAddress: string;
    port: number;
    username: string;
    status: "connected" | "disconnected" | "error";
  };
  // SMS Provider
  sms: {
    enabled: boolean;
    provider: "none" | "twilio" | "vonage" | "aws";
    apiKey: string;
    apiSecret: string;
    phoneNumber: string;
    status: "connected" | "disconnected" | "error";
  };
}


export interface AuditLog {
  id: string;
  dateTime: string;
  user: string;
  role: string;
  module: string;
  action: string;
  oldValue: string;
  newValue: string;
  ipAddress: string;
  device: string;
}

export interface AuditLogFilters {
  startDate?: string;
  endDate?: string;
  user?: string;
  module?: string;
  action?: string;
}


export interface BrandingSettings {
  systemName: string;
  themeColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  darkMode: "light" | "dark" | "system";
  sidebarCollapsed: boolean;
}


export interface BrandingSettings {
  systemName: string;
  themeColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  darkMode: "light" | "dark" | "system";
  sidebarCollapsed: boolean;
}


export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastLogin: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  permissions: Permissions;
}

export interface Permissions {
  [module: string]: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
    settings: boolean;
  };
}

// Modules for permissions matrix
export const USER_MODULES = [
  { id: "dashboard", name: "Dashboard", hasSettings: false },
  { id: "activeParking", name: "Active Parking", hasSettings: false },
  { id: "payments", name: "Payments", hasSettings: false },
  { id: "penaltyTickets", name: "Penalty Tickets", hasSettings: false },
  { id: "vehicles", name: "Vehicles", hasSettings: false },
  { id: "reports", name: "Reports", hasSettings: false },
  { id: "settings", name: "Settings", hasSettings: true },
  { id: "usersRoles", name: "Users & Roles", hasSettings: true },
  { id: "auditLogs", name: "Audit Logs", hasSettings: false },
];

export const USER_PERMISSION_ACTIONS = [
  { id: "view", label: "View", width: "w-16" },
  { id: "create", label: "Create", width: "w-16" },
  { id: "edit", label: "Edit", width: "w-16" },
  { id: "delete", label: "Delete", width: "w-16" },
  { id: "export", label: "Export", width: "w-16" },
  { id: "settings", label: "Settings", width: "w-20" },
];

// Helper function to build default permissions
const buildDefaultPermissions = (
  isAdmin: boolean = false,
  isManager: boolean = false,
): Permissions => {
  const permissions = {} as Permissions;

  USER_MODULES.forEach((module) => {
    if (isAdmin) {
      permissions[module.id] = {
        view: true,
        create: true,
        edit: true,
        delete: true,
        export: true,
        settings: module.hasSettings,
      };
    } else if (isManager) {
      permissions[module.id] = {
        view: true,
        create: module.id !== "usersRoles",
        edit: module.id !== "usersRoles",
        delete: false,
        export: true,
        settings: false,
      };
    } else {
      permissions[module.id] = {
        view: module.id !== "usersRoles" && module.id !== "auditLogs",
        create: false,
        edit: false,
        delete: false,
        export: module.id === "reports",
        settings: false,
      };
    }
  });

  return permissions;
};

// Default roles
const DEFAULT_ROLES_DATA: Role[] = [
  {
    id: "role_admin",
    name: "Admin",
    description: "Full system access with all permissions",
    isDefault: true,
    permissions: buildDefaultPermissions(true, false),
  },
  {
    id: "role_manager",
    name: "Manager",
    description: "Can manage operations but not system settings",
    isDefault: true,
    permissions: buildDefaultPermissions(false, true),
  },
  {
    id: "role_accountant",
    name: "Accountant",
    description: "Can view and manage financial transactions",
    isDefault: true,
    permissions: buildDefaultPermissions(false, false),
  },
  {
    id: "role_support",
    name: "Support Staff",
    description: "Can assist customers but limited admin access",
    isDefault: true,
    permissions: buildDefaultPermissions(false, false),
  },
  {
    id: "role_viewer",
    name: "Viewer / Auditor",
    description: "Read-only access to most modules",
    isDefault: true,
    permissions: buildDefaultPermissions(false, false),
  },
];

// Default users data
const DEFAULT_USERS_DATA: User[] = [
  {
    id: "user_1",
    name: "Administrator",
    email: "admin@cybernest.com",
    role: "Admin",
    status: "active",
    lastLogin: "May 12, 2025 10:30 AM",
    createdAt: "Jan 1, 2025",
  },
  {
    id: "user_2",
    name: "Manager User",
    email: "manager@cybernest.com",
    role: "Manager",
    status: "active",
    lastLogin: "May 12, 2025 08:15 AM",
    createdAt: "Jan 15, 2025",
  },
  {
    id: "user_3",
    name: "Accountant User",
    email: "accountant@cybernest.com",
    role: "Accountant",
    status: "active",
    lastLogin: "May 11, 2025 04:45 PM",
    createdAt: "Feb 1, 2025",
  },
  {
    id: "user_4",
    name: "Support Staff",
    email: "support@cybernest.com",
    role: "Support Staff",
    status: "inactive",
    lastLogin: "May 10, 2025 02:10 PM",
    createdAt: "Mar 1, 2025",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const settingsService = {
  //GENERAL SETTINGS
  getGeneralSettings: async (): Promise<GeneralSettings> => {
    await delay(500);
    return {
      companyName: "ParkSmart Pvt Ltd",
      phone: "+1 (647) 123-4567",
      address: "123 Park Street, Suite 100, Toronto, Ontario, Canada, M5V 2T6",
      email: "admin@parksmart.com",
      supportEmail: "support@parksmart.com",
      website: "www.parksmart.com",
    };
  },

  updateGeneralSettings: async (
    data: GeneralSettings,
  ): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    console.log("GENERAL SETTINGS UPDATED:", data);
    return { success: true, message: "General settings updated successfully!" };
  },

  //TAX SETTINGS
  getTaxSettings: async (): Promise<TaxSettings> => {
    await delay(500);
    return {
      taxRate: "5",
      currency: "CAD",
      roundingRule: "nearest_cent",
      pricesIncludeTax: "yes",
      refundAllowed: "yes",
      refundApprovalRequired: "yes",
    };
  },

  updateTaxSettings: async (
    data: TaxSettings,
  ): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    console.log("TAX SETTINGS UPDATED:", data);
    return { success: true, message: "Tax settings updated successfully!" };
  },

  //system settings
  getSystemSettings: async (): Promise<SystemSettings> => {
    await delay(500);
    return {
      timezone: "America/Toronto",
      language: "en",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "12h",
      sessionExpiryDisplay: "countdown",
    };
  },

  updateSystemSettings: async (
    data: SystemSettings,
  ): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    console.log("SYSTEM SETTINGS UPDATED:", data);
    return { success: true, message: "System settings updated successfully!" };
  },

  //security settings
  getSecuritySettings: async (): Promise<SecuritySettings> => {
    await delay(500);
    return {
      minPasswordLength: 8,
      maxLoginAttempts: 15,
      requireUppercase: "yes",
      requireNumber: "yes",
      requireSpecialChar: "disabled",
      twoFactorAuth: "disabled",
      sessionTimeout: 30,
    };
  },

  updateSecuritySettings: async (
    data: SecuritySettings,
  ): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    console.log("SECURITY SETTINGS UPDATED:", data);
    return {
      success: true,
      message: "Security settings updated successfully!",
    };
  },

  //notification settings
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    await delay(500);
    return {
      paymentSuccessEmail: true,
      penaltyIssuedAlert: true,
      penaltyPaidEmail: true,
      expiredParkingAlert: true,
      smsNotifications: false,
      adminAlertEmail: true,
      adminAlertRecipient: "alerts@parksmart.com",
    };
  },

  updateNotificationSettings: async (
    data: NotificationSettings,
  ): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    console.log("NOTIFICATION SETTINGS UPDATED:", data);
    return {
      success: true,
      message: "Notification settings updated successfully!",
    };
  },

  //integration settings
  getIntegrationSettings: async (): Promise<IntegrationSettings> => {
    await delay(500);
    return {
      stripe: {
        enabled: true,
        apiKey: "sk_test_********************",
        webhookSecret: "whsec_********************",
        status: "connected",
      },
      paypal: {
        enabled: false,
        clientId: "",
        clientSecret: "",
        status: "disconnected",
      },
      pos: {
        enabled: false,
        integrationType: "none",
        apiEndpoint: "",
        status: "disconnected",
      },
      camera: {
        enabled: false,
        cameraType: "none",
        ipAddress: "",
        port: 80,
        username: "",
        status: "disconnected",
      },
      sms: {
        enabled: false,
        provider: "none",
        apiKey: "",
        apiSecret: "",
        phoneNumber: "",
        status: "disconnected",
      },
    };
  },

  updateIntegrationSettings: async (
    data: IntegrationSettings,
  ): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    console.log("INTEGRATION SETTINGS UPDATED:", data);
    return {
      success: true,
      message: "Integration settings updated successfully!",
    };
  },

  testIntegrationConnection: async (
    type: string,
    config: any,
  ): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    console.log(`TESTING ${type} CONNECTION:`, config);
    // Simulate random success/failure
    const success = Math.random() > 0.3;
    return {
      success,
      message: success
        ? `${type} connection successful!`
        : `Failed to connect to ${type}. Please check your credentials.`,
    };
  },

  //audit logs
  getAuditLogs: async (filters?: AuditLogFilters): Promise<AuditLog[]> => {
    await delay(800);

    // Mock data
    const logs: AuditLog[] = [
      {
        id: "1",
        dateTime: "May 12, 2025 10:30 AM",
        user: "Admin User",
        role: "Admin",
        module: "Security",
        action: "Login",
        oldValue: "-",
        newValue: "-",
        ipAddress: "190.768.1.10",
        device: "Chrome / Windows",
      },
      {
        id: "2",
        dateTime: "May 12, 2025 10:15 AM",
        user: "Manager User",
        role: "Manager",
        module: "Penalty Tickets",
        action: "Created Ticket",
        oldValue: "-",
        newValue: "Ticket #TICK-10645",
        ipAddress: "190.768.1.12",
        device: "Chrome / Windows",
      },
      {
        id: "3",
        dateTime: "May 12, 2025 09:45 AM",
        user: "Admin User",
        role: "Admin",
        module: "Plans & Rules",
        action: "Updated Plan",
        oldValue: "$0.00",
        newValue: "$0.00",
        ipAddress: "190.768.1.10",
        device: "Chrome / Windows",
      },
      {
        id: "4",
        dateTime: "May 11, 2025 04:30 PM",
        user: "Accountant User",
        role: "Accountant",
        module: "Payments",
        action: "Refund issued",
        oldValue: "$20.00",
        newValue: "$20.00",
        ipAddress: "190.768.1.15",
        device: "Safari / macOS",
      },
      {
        id: "5",
        dateTime: "May 11, 2025 03:30 PM",
        user: "Supervisor User",
        role: "Supervisor",
        module: "Penalty Tickets",
        action: "Cancelled Ticket",
        oldValue: "Active",
        newValue: "Active",
        ipAddress: "190.768.1.18",
        device: "Edge / Windows",
      },
      {
        id: "6",
        dateTime: "May 10, 2025 02:00 PM",
        user: "Admin User",
        role: "Admin",
        module: "Settings",
        action: "Updated Tax Rate",
        oldValue: "5%",
        newValue: "8%",
        ipAddress: "190.768.1.10",
        device: "Chrome / Windows",
      },
      {
        id: "7",
        dateTime: "May 10, 2025 11:20 AM",
        user: "Manager User",
        role: "Manager",
        module: "Officers",
        action: "Disabled Officer",
        oldValue: "Active",
        newValue: "Disabled",
        ipAddress: "190.768.1.12",
        device: "Chrome / Windows",
      },
      {
        id: "8",
        dateTime: "May 09, 2025 09:00 AM",
        user: "Admin User",
        role: "Admin",
        module: "Payments",
        action: "Processed Refund",
        oldValue: "$50.00",
        newValue: "$0.00",
        ipAddress: "190.768.1.10",
        device: "Firefox / Windows",
      },
      {
        id: "9",
        dateTime: "May 08, 2025 04:45 PM",
        user: "Support User",
        role: "Support",
        module: "Customers",
        action: "Updated Profile",
        oldValue: "user@example.com",
        newValue: "newuser@example.com",
        ipAddress: "190.768.1.20",
        device: "Chrome / Windows",
      },
      {
        id: "10",
        dateTime: "May 08, 2025 11:30 AM",
        user: "Admin User",
        role: "Admin",
        module: "Security",
        action: "Changed Password",
        oldValue: "-",
        newValue: "-",
        ipAddress: "190.768.1.10",
        device: "Chrome / Windows",
      },
    ];

    // Apply filters
    let filteredLogs = [...logs];

    if (filters?.user && filters.user !== "All Users") {
      filteredLogs = filteredLogs.filter((log) => log.user === filters.user);
    }
    if (filters?.module && filters.module !== "All Modules") {
      filteredLogs = filteredLogs.filter(
        (log) => log.module === filters.module,
      );
    }
    if (filters?.action && filters.action !== "All Actions") {
      filteredLogs = filteredLogs.filter(
        (log) => log.action === filters.action,
      );
    }

    return filteredLogs;
  },

  getAuditLogModules: async (): Promise<string[]> => {
    await delay(200);
    return [
      "Security",
      "Penalty Tickets",
      "Plans & Rules",
      "Payments",
      "Settings",
      "Officers",
      "Customers",
    ];
  },

  getAuditLogUsers: async (): Promise<string[]> => {
    await delay(200);
    return [
      "Admin User",
      "Manager User",
      "Accountant User",
      "Supervisor User",
      "Support User",
    ];
  },

  getAuditLogActions: async (): Promise<string[]> => {
    await delay(200);
    return [
      "Login",
      "Created Ticket",
      "Updated Plan",
      "Refund issued",
      "Cancelled Ticket",
      "Updated Tax Rate",
      "Disabled Officer",
      "Processed Refund",
      "Updated Profile",
      "Changed Password",
    ];
  },

  exportAuditLogs: async (
    filters?: AuditLogFilters,
  ): Promise<{ success: boolean; message: string; data?: AuditLog[] }> => {
    await delay(1500);
    console.log("EXPORTING AUDIT LOGS with filters:", filters);
    return { success: true, message: "Audit logs exported successfully!" };
  },

  //branding settings
  getBrandingSettings: async (): Promise<BrandingSettings> => {
    await delay(500);
    return {
      systemName: "ParkSmart",
      themeColor: "#0F766E",
      logoUrl: null,
      faviconUrl: null,
      darkMode: "light",
      sidebarCollapsed: false,
    };
  },

  updateBrandingSettings: async (
    data: BrandingSettings,
  ): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    console.log("BRANDING SETTINGS UPDATED:", data);
    return {
      success: true,
      message: "Branding settings updated successfully!",
    };
  },

  uploadLogo: async (
    file: File,
  ): Promise<{ success: boolean; url: string; message: string }> => {
    await delay(1500);
    console.log("UPLOADING LOGO:", file.name);
    // Simulate upload and return a fake URL
    const fakeUrl = URL.createObjectURL(file);
    return {
      success: true,
      url: fakeUrl,
      message: "Logo uploaded successfully!",
    };
  },

  uploadFavicon: async (
    file: File,
  ): Promise<{ success: boolean; url: string; message: string }> => {
    await delay(1000);
    console.log("UPLOADING FAVICON:", file.name);
    const fakeUrl = URL.createObjectURL(file);
    return {
      success: true,
      url: fakeUrl,
      message: "Favicon uploaded successfully!",
    };
  },

  removeLogo: async (): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    return { success: true, message: "Logo removed successfully!" };
  },

  removeFavicon: async (): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    return { success: true, message: "Favicon removed successfully!" };
  },


  //user management
  getUsers: async (): Promise<User[]> => {
    await delay(500);
    return [...DEFAULT_USERS_DATA];
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    await delay(300);
    return DEFAULT_USERS_DATA.find((user) => user.id === id);
  },

  createUser: async (
    data: Omit<User, "id" | "lastLogin" | "createdAt">,
  ): Promise<{ success: boolean; message: string; user: User }> => {
    await delay(1000);
    const newUser: User = {
      id: `user_${Date.now()}`,
      ...data,
      lastLogin: "Never",
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    console.log("USER CREATED:", newUser);
    return {
      success: true,
      message: "User created successfully!",
      user: newUser,
    };
  },

  updateUser: async (
    id: string,
    data: Partial<User>,
  ): Promise<{ success: boolean; message: string; user: User }> => {
    await delay(1000);
    console.log("USER UPDATED:", id, data);
    return {
      success: true,
      message: "User updated successfully!",
      user: { id, ...data } as User,
    };
  },

  deleteUser: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    await delay(800);
    console.log("USER DELETED:", id);
    return { success: true, message: "User deleted successfully!" };
  },

  toggleUserStatus: async (
    id: string,
    currentStatus: "active" | "inactive",
  ): Promise<{
    success: boolean;
    message: string;
    newStatus: "active" | "inactive";
  }> => {
    await delay(500);
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    console.log("USER STATUS TOGGLED:", id, newStatus);
    return {
      success: true,
      message: `User ${newStatus === "active" ? "activated" : "deactivated"} successfully!`,
      newStatus,
    };
  },

  getRoles: async (): Promise<Role[]> => {
    await delay(400);
    return [...DEFAULT_ROLES_DATA];
  },

  getRoleById: async (id: string): Promise<Role | undefined> => {
    await delay(300);
    return DEFAULT_ROLES_DATA.find((role) => role.id === id);
  },

  createRole: async (
    data: Omit<Role, "id" | "isDefault">,
  ): Promise<{ success: boolean; message: string; role: Role }> => {
    await delay(1000);
    const newRole: Role = {
      id: `role_${Date.now()}`,
      ...data,
      isDefault: false,
    };
    console.log("ROLE CREATED:", newRole);
    return {
      success: true,
      message: "Role created successfully!",
      role: newRole,
    };
  },

  updateRole: async (
    id: string,
    data: Partial<Role>,
  ): Promise<{ success: boolean; message: string; role: Role }> => {
    await delay(1000);
    console.log("ROLE UPDATED:", id, data);
    return {
      success: true,
      message: "Role updated successfully!",
      role: { id, ...data } as Role,
    };
  },

  deleteRole: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    await delay(800);
    console.log("ROLE DELETED:", id);
    // Check if it's a default role
    const isDefaultRole = DEFAULT_ROLES_DATA.some((role) => role.id === id);
    if (isDefaultRole) {
      return { success: false, message: "Cannot delete default roles!" };
    }
    return { success: true, message: "Role deleted successfully!" };
  },

  updateRolePermissions: async (
    roleId: string,
    permissions: Permissions,
  ): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    console.log("ROLE PERMISSIONS UPDATED:", roleId, permissions);
    return { success: true, message: "Role permissions updated successfully!" };
  },
};
