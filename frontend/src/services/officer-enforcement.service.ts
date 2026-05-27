import axiosInstance from "@/lib/axios";
import { uploadFilesToCloudinary } from "@/lib/upload-media";
import { uploadMedia } from "@/services/media.service";
import { API_ENDPOINTS } from "./api";

export interface OfficerSession {
  id: string;
  license_plate: string;
  plan_name?: string | null;
  location_name?: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  notes?: string | null;
  amount_paid?: number;
  payment_method?: string | null;
  paid_at?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  source?: string;
}

export interface PlateScanCustomer {
  user_id: string | null;
  name: string;
  email: string | null;
}

export interface OfficerTicket {
  id: string;
  ticket_number: string;
  officer_id: string;
  officer_name: string;
  session_id?: string | null;
  license_plate: string;
  location_name?: string | null;
  amount: number;
  reason: string;
  status: string;
  date_issued: string;
  due_date?: string | null;
  remarks?: string | null;
  note?: string | null;
  photos?: string[];
}

export interface EvidencePhoto {
  id: string;
  ticket_id?: string | null;
  ticket_number?: string | null;
  license_plate: string;
  reason: string;
  photo_url: string;
  photo_taken_at: string;
  uploaded_at: string;
  source?: "ticket" | "standalone";
  location_name?: string | null;
  officer_name?: string | null;
  notes?: string | null;
}

export interface OfficerDashboard {
  ticketsToday: number;
  activeSessions: number;
  collectedToday: number;
  onDutyMinutes: number;
  onDutySeconds?: number;
  shift?: {
    onDuty: boolean;
    onDutySecondsToday: number;
    pendingOfflineCount: number;
  };
  recentScans: Array<{
    license_plate: string;
    location_name?: string | null;
    checked_at: string;
    scan_status: string;
  }>;
  activeSession: OfficerSession | null;
  violationSummary: Array<{ reason: string; total: number }>;
}

export interface PlateScanResult {
  plate: string;
  status: "valid" | "violation" | "expired" | "not_found";
  session: OfficerSession | null;
  openTicket: OfficerTicket | null;
  recentTickets: OfficerTicket[];
  customer?: PlateScanCustomer | null;
}

export interface CreateOfficerTicketPayload {
  officerId?: string;
  officerName?: string;
  licensePlate: string;
  provinceState?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  vehicleType?: string;
  violationType: string;
  violationSubType?: string;
  fineAmount: number;
  lateFee?: number;
  locationName?: string;
  violationDateTime?: string;
  sessionId?: string | null;
  officerNotes?: string;
  violationDetails?: string;
  meterNumber?: string;
  zoneArea?: string;
  beatArea?: string;
  photos?: string[];
}

export interface UpdateOfficerTicketPayload {
  licensePlate?: string;
  violationType?: string;
  fineAmount?: number;
  locationName?: string;
  dueDate?: string | null;
}

export interface UploadedOfficerPhoto {
  id: string;
  photoUrl: string;
  label: string;
  uploadedAt: string;
}

export interface CaptureEvidencePayload {
  officerId?: string;
  officerName?: string;
  licensePlate: string;
  locationName?: string;
  evidenceType?: string;
  notes?: string;
  photos: string[];
}

export interface UpdateEvidencePayload {
  licensePlate?: string;
  locationName?: string;
  reason?: string;
  notes?: string;
}

export interface ManualEntryPayload {
  officerId?: string;
  licensePlate: string;
  provinceState?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  vehicleType?: string;
  locationName?: string;
  planName?: string;
  durationMinutes: number;
  notes?: string;
}

export interface VehicleHistory {
  plate: string;
  sessions: OfficerSession[];
  tickets: OfficerTicket[];
  evidence: EvidencePhoto[];
}

export interface TicketPrintPayload {
  ticketId: string;
  ticketNumber: string;
  issuedAt: string;
  dueDate?: string | null;
  officerName: string;
  officerId: string;
  licensePlate: string;
  locationName?: string | null;
  violationType: string;
  totalAmount: number;
  status: string;
  details: Record<string, unknown>;
  photos: string[];
  receiptLines: string[];
}

const unwrap = <T>(response: { data?: { data?: T } }) => response.data?.data as T;

export const officerEnforcementService = {
  async getDashboard(): Promise<OfficerDashboard> {
    return unwrap<OfficerDashboard>(await axiosInstance.get(API_ENDPOINTS.OFFICER.DASHBOARD));
  },

  async scanPlate(plate: string): Promise<PlateScanResult> {
    return unwrap<PlateScanResult>(
      await axiosInstance.get(API_ENDPOINTS.OFFICER.SCAN, { params: { plate } }),
    );
  },

  async scanQr(qr: string): Promise<PlateScanResult> {
    return unwrap<PlateScanResult>(
      await axiosInstance.get(API_ENDPOINTS.OFFICER.SCAN, { params: { qr } }),
    );
  },

  async getTickets(filters: {
    limit?: number;
    status?: string;
    violationType?: string;
    location?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
  } = {}): Promise<OfficerTicket[]> {
    return unwrap<OfficerTicket[]>(
      await axiosInstance.get(API_ENDPOINTS.OFFICER.TICKETS, { params: filters }),
    );
  },

  async createTicket(payload: CreateOfficerTicketPayload): Promise<OfficerTicket> {
    return unwrap<OfficerTicket>(
      await axiosInstance.post(API_ENDPOINTS.OFFICER.TICKETS, payload),
    );
  },

  async getTicket(id: string): Promise<OfficerTicket> {
    return unwrap<OfficerTicket>(
      await axiosInstance.get(API_ENDPOINTS.OFFICER.TICKET_BY_ID(id)),
    );
  },

  async updateTicket(id: string, payload: UpdateOfficerTicketPayload): Promise<OfficerTicket> {
    return unwrap<OfficerTicket>(
      await axiosInstance.patch(API_ENDPOINTS.OFFICER.TICKET_BY_ID(id), payload),
    );
  },

  async deleteTicket(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.OFFICER.TICKET_BY_ID(id));
  },

  async getTicketPrint(id: string): Promise<TicketPrintPayload> {
    return unwrap<TicketPrintPayload>(
      await axiosInstance.get(API_ENDPOINTS.OFFICER.TICKET_PRINT(id)),
    );
  },

  async payTicket(id: string, payload: { payment_method?: string; transaction_ref?: string; customer_email?: string } = {}) {
    return unwrap<unknown>(
      await axiosInstance.patch(API_ENDPOINTS.OFFICER.TICKET_PAY(id), payload),
    );
  },

  async addTicketEvidence(id: string, payload: { photos: string[]; note?: string }) {
    return unwrap<unknown>(
      await axiosInstance.post(API_ENDPOINTS.OFFICER.TICKET_EVIDENCE(id), payload),
    );
  },

  async reviewTicket(id: string, note?: string) {
    return unwrap<unknown>(
      await axiosInstance.patch(API_ENDPOINTS.OFFICER.TICKET_REVIEW(id), { note }),
    );
  },

  async getSessions(filters: {
    limit?: number;
    status?: string;
    zone?: string;
    location?: string;
    search?: string;
    sort?: string;
  } | number = {}): Promise<OfficerSession[]> {
    const params = typeof filters === 'number' ? { limit: filters } : filters;
    return unwrap<OfficerSession[]>(
      await axiosInstance.get(API_ENDPOINTS.OFFICER.SESSIONS, { params }),
    );
  },

  async getEvidence(limit = 50): Promise<EvidencePhoto[]> {
    return unwrap<EvidencePhoto[]>(
      await axiosInstance.get(API_ENDPOINTS.OFFICER.EVIDENCE, { params: { limit } }),
    );
  },

  async uploadPhoto(
    photo: string,
    label = "Evidence Photo",
    folder = "parksmart/officer/evidence",
  ): Promise<UploadedOfficerPhoto> {
    const result = await uploadMedia(photo, { folder, label });
    return {
      id: `PHOTO-${Date.now()}`,
      photoUrl: result.photoUrl,
      label: result.label ?? label,
      uploadedAt: result.uploadedAt ?? new Date().toISOString(),
    };
  },

  /** Upload local data URLs / files to Cloudinary on submit (skips already-remote URLs). */
  async uploadPhotosForSubmit(sources: string[], folder: string): Promise<string[]> {
    if (!sources.length) return [];
    return uploadFilesToCloudinary(sources, folder);
  },

  async captureEvidence(payload: CaptureEvidencePayload): Promise<EvidencePhoto[]> {
    return unwrap<EvidencePhoto[]>(
      await axiosInstance.post(API_ENDPOINTS.OFFICER.EVIDENCE, payload),
    );
  },

  async updateEvidence(id: string, payload: UpdateEvidencePayload): Promise<EvidencePhoto> {
    return unwrap<EvidencePhoto>(
      await axiosInstance.patch(API_ENDPOINTS.OFFICER.EVIDENCE_BY_ID(id), payload),
    );
  },

  async deleteEvidence(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.OFFICER.EVIDENCE_BY_ID(id));
  },

  async createManualEntry(payload: ManualEntryPayload): Promise<OfficerSession> {
    return unwrap<OfficerSession>(
      await axiosInstance.post(API_ENDPOINTS.OFFICER.MANUAL_ENTRY, payload),
    );
  },

  async getVehicleHistory(plate: string, limit = 10): Promise<VehicleHistory> {
    return unwrap<VehicleHistory>(
      await axiosInstance.get(API_ENDPOINTS.OFFICER.VEHICLE_HISTORY(plate), { params: { limit } }),
    );
  },
};
