// src/types/index.ts
import { Request } from 'express';

export type RoleName = 'owner' | 'inspector' | 'user';
export type UserType = 'admin' | 'officer' | 'user';
export type TicketStatus = 'unpaid' | 'paid' | 'cancelled' | 'disputed' | 'resolved';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'apple_pay' | 'visa' | 'mastercard' | 'amex' | 'cash';
export type PaymentType = 'parking' | 'penalty' | 'extension';
export type SessionStatus = 'active' | 'expired' | 'extended' | 'cancelled';
export type OfficerStatus = 'active' | 'inactive' | 'suspended';
export type OfficerRole = 'OFFICER' | 'SUPERVISOR';

// ─── JWT ────────────────────────────────────────────────────
export interface JwtPayload {
  id: string;
  email: string;
  userType: UserType;
  role?: RoleName;
  iat?: number;
  exp?: number;
}

// ─── Admin ───────────────────────────────────────────────────
export interface AdminPublic {
  id: string;
  email: string;
  full_name: string;
  role: RoleName;
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
}

// ─── Officer ─────────────────────────────────────────────────
export interface OfficerPublic {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  badge_number: string | null;
  role?: OfficerRole;
  status: OfficerStatus;
  tickets_issued?: number;
  last_login_at: Date | null;
  created_at: Date;
}

export interface CreateOfficerBody {
  full_name: string;
  email: string;
  phone?: string;
  badge_number?: string;
  password: string;
}

export interface UpdateOfficerBody {
  full_name?: string;
  phone?: string;
  status?: OfficerStatus;
}

// ─── Parking Session ─────────────────────────────────────────
export interface SessionPublic {
  id: string;
  license_plate: string;
  plan_name: string | null;
  start_time: Date;
  end_time: Date;
  duration_minutes: number;
  status: SessionStatus;
  notes: string | null;
  amount: number;
  created_at: Date;
  parking_lot_id?: string | null;
  parking_lot_name?: string | null;
}

export interface CreateSessionBody {
  license_plate: string;
  plan_id: string;
  duration_minutes?: number;
  notes?: string;
  user_id?: string;
}

// ─── Penalty Ticket ──────────────────────────────────────────
export interface TicketPublic {
  id: string;
  ticket_number: string;
  officer_id: string;
  officer_name: string;
  license_plate: string;
  amount: number;
  reason: string;
  status: TicketStatus;
  date_issued: Date;
  due_date: Date | null;
  paid_at: Date | null;
  remarks: string | null;
  note: string | null;
  dispute_raised: boolean;
  photos: string[];
  evidence_photos?: { id: string; image: string }[];
  location_name?: string | null;
  payment_id?: string | null;
  parking_lot_id?: string | null;
  parking_lot_name?: string | null;
  session_id?: string | null;
  plan_name?: string | null;
  start_time?: Date | null;
  end_time?: Date | null;
  payment_method?: string | null;
  transaction_ref?: string | null;
}

export interface CreateTicketBody {
  license_plate: string;
  amount: number;
  reason: string;
  session_id?: string;
  due_date?: string;
}

export interface DisputeTicketBody {
  dispute_message: string;
}

export interface ResolveDisputeBody {
  dispute_response: string;
  new_status: 'resolved' | 'cancelled' | 'unpaid';
}

// ─── Payment ─────────────────────────────────────────────────
export interface PaymentPublic {
  id: string;
  license_plate: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  status: PaymentStatus;
  transaction_ref: string | null;
  paid_at: Date | null;
  created_at: Date;
  parking_lot_id?: string | null;
  parking_lot_name?: string | null;
}

export interface ParkingZoneSubZone {
  id: string;
  parking_name: string;
  hourly_rate: number;
  available_spots: number;
  total_spots: number;
  spot_id: string;
}

export interface ParkingZonePublic {
  id: string;
  parking_name: string;
  address: string;
  image_url: string;
  hourly_rate: number;
  available_spots: number;
  total_spots: number;
  spot_id: string;
  parking_lot_id?: string | null;
  sub_zones?: ParkingZoneSubZone[];
}

export interface ParkingLotCustomerResponse {
  lot_id: string;
  lot_name: string;
  address: string;
  image_url: string;
  zones: {
    id: string;
    parking_name: string;
    address: string;
    image_url: string;
    hourly_rate: number;
    available_spots: number;
    total_spots: number;
    spot_id: string;
    parking_lot_id?: string | null;
  }[];
}

export interface ParkingZoneRow extends ParkingZonePublic { }

export interface ParkingLotPublic {
  id: string;
  owner_id?: string | null;
  lot_name: string;
  address?: string | null;
  image_url?: string | null;
  qr_code_url?: string | null;
}

export interface ParkingLotRow extends ParkingLotPublic { }

export interface CustomerBookingPayload {
  zoneId: string;
  lotId?: string;
  planId?: string;
  email: string;
  vehicleModel: string;
  plateNumber: string;
  carColor: string;
  durationLabel: string;
  durationMinutes: number;
  price: number;
  stripePaymentIntentId: string;
}

export interface CustomerBookingResponse {
  bookingId: string;
  paymentId: string;
  receiptNumber: string;
  amount: number;
  total: number;
  bookingReference?: string;
  parkingPlanId?: string;
  transactionId?: string;
  transactionReference?: string;
  invoiceId?: string;
  invoiceNumber?: string;
}

export interface CreatePaymentBody {
  session_id?: string;
  ticket_id?: string;
  license_plate: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  transaction_ref?: string;
}

// ─── Auth ────────────────────────────────────────────────────
export interface LoginBody { email: string; password: string; }
export interface ForgotPasswordBody { email: string; }
export interface ResetPasswordBody { token: string; adminId: string; newPassword: string; }

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: AdminPublic;
}

export interface OfficerLoginResponse {
  accessToken: string;
  refreshToken: string;
  officer: OfficerPublic;
}

// ─── API Response ────────────────────────────────────────────
export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Authenticated Request ───────────────────────────────────
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

// ─── Email ───────────────────────────────────────────────────
export type EmailType =
  | 'payment_receipt' | 'penalty_notice' | 'dispute_response'
  | 'password_reset' | 'session_expiry_warning' | 'session_started'
  | 'officer_created' | 'extension_receipt' | 'penalty_payment';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  emailType: EmailType;
  relatedId?: string;
  attachments?: Array<{ filename: string; path: string }>;
}