import { listTickets, getTicketSummary } from "@/services/tickets.service";
import type { TicketListParams } from "@/services/tickets.service";

export interface EvidencePhoto {
  id: string;
  image: string;
  caption?: string;
}

export interface PenaltyTicket {
  id: string;
  plate: string;
  violation: string;
  violationType?: string;
  amount: string;
  status: "Paid" | "Unpaid" | "Cancelled" | "Disputed" | "Resolved" | string;
  officer: string;
  officerId?: string;
  issuedAt: string;
  issueDate: string;
  issueTime: string;
  dueDate?: string;
  ticketNo?: string;
  photos?: string[];
  evidencePhotos: EvidencePhoto[];
  notes: any[];
  raw?: any;
  location?: string;
  vehicle?: string;
  sessionId?: string;
  paymentId?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  transactionReference?: string;
  paidAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancelReason?: string;
  parkingPlan?: string;
  parkingStatus?: string;
  parkingStartTime?: string;
  parkingExpiryTime?: string;
  parkingLotId?: string | null;
  parkingLotName?: string | null;
}

export interface PenaltyStats {
  totalTickets: string;
  unpaidTickets: string;
  paidTickets: string;
  totalPenaltyAmount: string;
}

const safeNum = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const usd = (value: unknown) =>
  `$${safeNum(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const penaltyService = {
  async getPenaltyTickets(params: TicketListParams = {}): Promise<PenaltyTicket[]> {
    const res = await listTickets({ limit: 200, page: 1, ...params });
    const items = (res?.items ?? res ?? []) as any[];
    return items.map((t, idx) => {
      const issued = new Date(t.date_issued ?? t.dateIssued ?? t.created_at ?? t.createdAt ?? Date.now());
      const statusRaw = String(t.status ?? "unpaid");
      const status =
        statusRaw === "paid"
          ? "Paid"
          : statusRaw === "unpaid"
            ? "Unpaid"
            : statusRaw === "cancelled"
              ? "Cancelled"
              : statusRaw === "disputed"
                ? "Disputed"
                : statusRaw === "resolved"
                  ? "Resolved"
                  : statusRaw;

      const issueDate = issued.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const issueTime = issued.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const remarks = String(t.remarks ?? "");
      const noteLines = remarks
        ? remarks.split(/\n+/).map((line: string, i: number) => ({
            id: `r-${i}`,
            note: line,
            createdBy: "System",
            createdAt: "",
          }))
        : [];

      return {
        id: String(t.id ?? String(10000 + idx)),
        plate: String(t.license_plate ?? t.licensePlate ?? "-"),
        violation: String(t.reason ?? "-"),
        violationType: String(t.reason ?? "-"),
        amount: usd(t.amount ?? 0),
        status,
        officer: String(t.officer_name ?? t.officerName ?? "-"),
        officerId: String(t.officer_id ?? t.officerId ?? "-"),
        issuedAt: issued.toISOString(),
        issueDate,
        issueTime,
        dueDate: t.due_date ? new Date(t.due_date).toISOString() : undefined,
        ticketNo: String(t.ticket_number ?? t.ticketNo ?? ""),
        location: String(t.location ?? t.zone ?? "-"),
        vehicle: String(t.vehicle_type ?? t.vehicleType ?? "Unknown"),
        sessionId: String(t.session_id ?? t.sessionId ?? ""),
        paymentId: String(t.payment_id ?? t.paymentId ?? ""),
        paymentStatus: status,
        paymentMethod: String(t.payment_method ?? t.paymentMethod ?? "Cash"),
        transactionReference: String(
          t.transaction_ref ?? t.transactionReference ?? ""
        ),
        paidAt: t.paid_at ? new Date(t.paid_at).toLocaleString() : undefined,
        evidencePhotos: (t.evidence_photos ?? t.evidencePhotos ?? []) as EvidencePhoto[],
        cancelledBy: String(t.cancelled_by ?? t.cancelledBy ?? ""),
        cancelledAt: t.cancelled_at
          ? new Date(t.cancelled_at).toLocaleString()
          : undefined,
        cancelReason: String(t.cancel_reason ?? t.cancelReason ?? ""),
        parkingPlan: String(t.plan_name ?? t.parking_plan ?? "N/A"),
        parkingStatus: String(t.session_status ?? t.parking_status ?? "N/A"),
        parkingStartTime: t.start_time
          ? new Date(t.start_time).toLocaleString()
          : "",
        parkingExpiryTime: t.end_time
          ? new Date(t.end_time).toLocaleString()
          : "",
        parkingLotId: t.parking_lot_id ?? t.parkingLotId ?? null,
        parkingLotName: t.parking_lot_name ?? t.parkingLotName ?? null,
        photos: [],
        notes: noteLines,
        raw: t,
      };
    });
  },

  async getPenaltyStats(params: Pick<TicketListParams, "parking_lot_id"> = {}): Promise<PenaltyStats> {
    const summary = await getTicketSummary(params);
    return {
      totalTickets: String(summary?.totalTickets ?? summary?.totalCount ?? 0),
      unpaidTickets: String(summary?.unpaidTickets ?? summary?.unpaidCount ?? 0),
      paidTickets: String(summary?.paidTickets ?? summary?.paidCount ?? 0),
      totalPenaltyAmount: usd(summary?.totalPenaltyAmount ?? summary?.totalAmount ?? 0),
    };
  },
};

