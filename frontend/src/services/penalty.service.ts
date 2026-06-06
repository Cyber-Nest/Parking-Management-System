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
      let parsedRemarks: any = {};
      try {
        if (t.remarks && typeof t.remarks === 'string' && t.remarks.trim().startsWith('{')) {
          parsedRemarks = JSON.parse(t.remarks);
        }
      } catch (e) {}

      const noteLines = [];
      if (t.note) noteLines.push({ id: 'r-note', note: t.note, createdBy: 'Officer', createdAt: '' });
      if (parsedRemarks.officerNotes) noteLines.push({ id: 'r-officer', note: parsedRemarks.officerNotes, createdBy: 'Officer', createdAt: '' });
      if (parsedRemarks.violationDetails) noteLines.push({ id: 'r-details', note: parsedRemarks.violationDetails, createdBy: 'System', createdAt: '' });

      let photoStrings: string[] = [];
      if (Array.isArray(t.photos)) photoStrings = t.photos;
      else if (typeof t.photos === 'string' && t.photos.startsWith('[')) {
        try { photoStrings = JSON.parse(t.photos); } catch(e){}
      }

      const mappedEvidencePhotos = [
        ...((t.evidence_photos ?? t.evidencePhotos ?? []) as EvidencePhoto[]),
        ...photoStrings.map((url, i) => ({ id: `photo-${Date.now()}-${i}`, image: url }))
      ];

      return {
        id: String(t.id ?? String(10000 + idx)),
        plate: String(t.license_plate ?? t.licensePlate ?? "-"),
        violation: String(t.reason ?? parsedRemarks.violationSubType ?? "-"),
        violationType: String(t.reason ?? parsedRemarks.violationSubType ?? "-"),
        amount: usd(t.amount ?? 0),
        status,
        officer: String(t.officer_name ?? t.officerName ?? "-"),
        officerId: String(t.officer_id ?? t.officerId ?? "-"),
        issuedAt: issued.toISOString(),
        issueDate,
        issueTime,
        dueDate: t.due_date ? new Date(t.due_date).toISOString() : undefined,
        ticketNo: t.ticket_number ?? t.ticketNo ?? "",
        location: t.location_name ?? t.location ?? t.zone ?? "-",
        vehicle: t.vehicle_type ?? t.vehicleType ?? parsedRemarks.vehicleType ?? parsedRemarks.vehicleMake ?? "Unknown",
        sessionId: t.session_id ?? t.sessionId ?? undefined,
        paymentId: t.payment_id ?? t.paymentId ?? undefined,
        paymentStatus: status,
        paymentMethod: t.payment_method ?? t.paymentMethod ?? undefined,
        transactionReference: t.transaction_ref ?? t.transactionReference ?? undefined,
        paidAt: t.paid_at ? new Date(t.paid_at).toLocaleString() : undefined,
        evidencePhotos: mappedEvidencePhotos,
        cancelledBy: t.cancelled_by ?? t.cancelledBy ?? undefined,
        cancelledAt: t.cancelled_at
          ? new Date(t.cancelled_at).toLocaleString()
          : undefined,
        cancelReason: t.cancel_reason ?? t.cancelReason ?? undefined,
        parkingPlan: t.plan_name ?? t.parking_plan ?? undefined,
        parkingStatus: t.session_status ?? t.parking_status ?? undefined,
        parkingStartTime: t.start_time
          ? new Date(t.start_time).toLocaleString()
          : undefined,
        parkingExpiryTime: t.end_time
          ? new Date(t.end_time).toLocaleString()
          : undefined,
        parkingLotId: t.parking_lot_id ?? t.parkingLotId ?? null,
        parkingLotName: t.parking_lot_name ?? t.parkingLotName ?? null,
        photos: photoStrings,
        notes: noteLines,
        raw: { ...t, parsedRemarks },
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
