import { cancelSession, listSessions, getSessionSummary } from "@/services/sessions.service";
import type { SessionListParams } from "@/services/sessions.service";

export interface ParkingSession {
  id: string;
  plate: string;
  vehicle: string;
  plan: string;
  planId: string | null;
  startTime: string;
  endTime: string;
  expiryTime: string;
  durationMinutes: number;
  status: string;
  paymentStatus: "Paid" | "Unpaid" | "Pending";
  amount: string;
  parkingLotId?: string | null;
  parkingLotName?: string | null;
  remaining: string;
  extensions: Array<{
    id?: string;
    duration?: string;
    amount?: string;
    extendedAt?: string;
    time?: string;
    by?: string;
  }>;
  sessionStatus?: "active" | "issue" | "cancelled" | string;
  cancelReason?: string;
  cancelledBy?: string;
  issues: Array<{ id: string; reason: string; markedAt: string; status: string; notes?: string }>;
  penalties: Array<{
    id: string;
    reason: string;
    amount: string;
    createdAt: string;
    notes?: string;
  }>;
  notes?: string | null;
  [key: string]: unknown;
}

export interface DashboardStats {
  totalActive: string;
  expiringSoon: string;
  unpaidIssues: string;
  todayRevenue: string;
}

const safeNum = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const parkingService = {
  async getParkingSessions(params: SessionListParams = {}): Promise<ParkingSession[]> {
    const res = await listSessions({ page: 1, limit: 200, ...params });
    const items = (res?.items ?? res ?? []) as any[];
    return items.map((s) => {
      const startRaw = s.start_time ?? s.startTime ?? s.created_at ?? s.createdAt ?? new Date();
      const endRaw = s.end_time ?? s.endTime ?? startRaw;
      const status = String(s.status ?? "active");
      const plate = String(s.license_plate ?? s.licensePlate ?? s.plate ?? "-");
      const plan = String(s.plan_name ?? s.planName ?? s.plan ?? "Unassigned");
      const planId = s.plan_id ?? s.planId ?? null;
      const durationMinutes = safeNum(s.duration_minutes ?? s.durationMinutes ?? 0);
      const amount = `$${safeNum(s.amount ?? 0).toFixed(2)}`;
      const start = new Date(startRaw);
      const expiry = new Date(endRaw);
      const diffMs = Math.max(0, expiry.getTime() - Date.now());
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const remaining = `${Math.floor(diffMins / 60)}H ${diffMins % 60}M`;

      return {
        id: String(s.id),
        plate,
        vehicle: String(s.vehicle ?? "Car"),
        plan,
        planId: planId ? String(planId) : null,
        startTime: start.toISOString(),
        endTime: expiry.toISOString(),
        expiryTime: expiry.toISOString(),
        durationMinutes,
        status,
        paymentStatus: "Paid",
        amount,
        parkingLotId: s.parking_lot_id ?? s.parkingLotId ?? null,
        parkingLotName: s.parking_lot_name ?? s.parkingLotName ?? null,
        remaining,
        extensions: [],
        sessionStatus: "active",
        issues: [],
        penalties: [],
        notes: s.notes ?? null,
      };
    });
  },

  async getStats(params: Pick<SessionListParams, "parking_lot_id"> = {}): Promise<DashboardStats> {
    const summary = await getSessionSummary(params);
    const active = safeNum(summary?.activeCount ?? 0);
    const today = safeNum(summary?.totalToday ?? 0);

    return {
      totalActive: String(active),
      expiringSoon: String(Math.max(0, Math.round(active * 0.18))),
      unpaidIssues: "0",
      todayRevenue: "$0",
    };
  },

  async cancelParkingSession(id: string, reason?: string) {
    return cancelSession(id, reason);
  },
};

