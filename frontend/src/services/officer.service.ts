import {
  listOfficers,
  getOfficerSummary,
  setOfficerStatus,
  type OfficerListParams,
  type OfficerRoleUi,
  type OfficerStatusUi,
} from "@/services/officers.service";

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
  activityLogs?: any[];

  // Revocation fields
  disabledBy?: string;
  disabledAt?: string;
  disableReason?: string;

  // UI-only fields used by forms (optional)
  employeeId?: string;
  employmentType?: string;
  hireDate?: string;
  emergencyContactName?: string;
  emergencyPhone?: string;
  emergencyRelationship?: string;
  addressStreet?: string;
  addressCity?: string;
  addressProvince?: string;
  addressPostalCode?: string;
  profilePhoto?: string | null;

  // Raw backend fields (optional passthrough)
  full_name?: string;
  status?: string;
  created_at?: string;
}

export const officerService = {
  async getOfficers(params: OfficerListParams = {}): Promise<Officer[]> {
    const res = await listOfficers(params);
    const items = (res?.items ?? res ?? []) as any[];
    return items.map((o, idx) => {
      const created = new Date(o.created_at ?? Date.now());
      const status = String(o.status ?? "active");
      return {
        id: String(o.id ?? `OF-${1000 + idx}`),
        name: String(o.full_name ?? o.name ?? "Officer"),
        email: String(o.email ?? ""),
        phone: String(o.phone ?? ""),
        role: String(o.role ?? "OFFICER"),
        loginStatus: status === "active" ? "Active" : "Inactive",
        accessStatus: status === "active" ? "Enabled" : "Disabled",
        tickets: Number(o.tickets_issued ?? o.tickets ?? 0),
        date: created.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: created.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        full_name: o.full_name,
        status: o.status,
        created_at: o.created_at,
      } as Officer;
    });
  },

  async getSummary() {
    return await getOfficerSummary();
  },

  async setOfficerStatus(id: string, status: "ACTIVE" | "DISABLED") {
    return await setOfficerStatus(id, status);
  },

  // Convenience re-exports for screens that need filters
  roleValues: ["OFFICER", "SUPERVISOR"] as OfficerRoleUi[],
  statusValues: ["ACTIVE", "DISABLED"] as OfficerStatusUi[],
};

