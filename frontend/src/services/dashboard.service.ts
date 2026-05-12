import { listSessions } from "@/services/sessions.service";
import { listTickets } from "@/services/tickets.service";
import { getSessionSummary } from "@/services/sessions.service";
import { getTicketSummary } from "@/services/tickets.service";
import { getPaymentSummary } from "@/services/payments.service";

export interface StatCard {
  id: number;
  label: string;
  value: string | number;
  icon: string; // lucide-react icon name
  color: string; // hex or css color
  bg: string;
}

export interface TableRow {
  id: string;
  plate: string;
  col2: string;
  col3: string;
  status: string;
  statusColor: string;
  col5: string;
}

const statusPill = (kind: "ok" | "warn" | "bad") => {
  if (kind === "ok")
    return "bg-emerald-50 text-emerald-600 border border-emerald-100";
  if (kind === "warn")
    return "bg-orange-50 text-orange-600 border border-orange-100";
  return "bg-red-50 text-red-600 border border-red-100";
};

const safeNum = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const usd = (value: unknown) =>
  `$${safeNum(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const dashboardService = {
  async getDashboardStats(): Promise<StatCard[]> {
    const [sessionSummary, ticketSummary, paymentSummary] = await Promise.all([
      getSessionSummary(),
      getTicketSummary(),
      getPaymentSummary(),
    ]);

    const active = safeNum(sessionSummary?.activeCount ?? sessionSummary?.active ?? 0);
    const ticketsUnpaid = safeNum(
      ticketSummary?.unpaidTickets ?? ticketSummary?.unpaidCount ?? 0,
    );
    const revenueToday = safeNum(
      paymentSummary?.todayRevenue ??
        paymentSummary?.todayAmount ??
        paymentSummary?.todayTotal ??
        0,
    );

    return [
      {
        id: 1,
        label: "Active Sessions",
        value: active,
        icon: "Car",
        color: "var(--color-primary)",
        bg: "var(--color-surface)",
      },
      {
        id: 2,
        label: "Unpaid Penalties",
        value: ticketsUnpaid,
        icon: "Ticket",
        color: "#F97316",
        bg: "var(--color-surface)",
      },
      {
        id: 3,
        label: "Today's Revenue",
        value: usd(revenueToday),
        icon: "DollarSign",
        color: "#10B981",
        bg: "var(--color-surface)",
      },
      {
        id: 4,
        label: "Sessions Today",
        value: safeNum(sessionSummary?.totalToday ?? 0),
        icon: "Clock",
        color: "#6366F1",
        bg: "var(--color-surface)",
      },
    ];
  },

  async getParkingSessions(): Promise<TableRow[]> {
    const res = await listSessions({ page: 1, limit: 30 });
    const items = (res?.items ?? res ?? []) as any[];

    return items.map((s) => {
      const status = String(s.status ?? "active");
      const kind =
        status === "active" ? "ok" : status === "extended" ? "warn" : "bad";
      const start = s.start_time ?? s.startTime;
      const end = s.end_time ?? s.endTime;

      return {
        id: String(s.id),
        plate: String(s.license_plate ?? s.licensePlate ?? "-"),
        col2: start ? new Date(start).toLocaleString() : "-",
        col3: end ? new Date(end).toLocaleString() : "-",
        status,
        statusColor: statusPill(kind),
        col5: usd(s.amount ?? s.total_amount ?? 0),
      };
    });
  },

  async getPenaltySessions(): Promise<TableRow[]> {
    const res = await listTickets({ page: 1, limit: 30 });
    const items = (res?.items ?? res ?? []) as any[];

    return items.map((t) => {
      const status = String(t.status ?? "unpaid");
      const kind = status === "paid" ? "ok" : status === "unpaid" ? "warn" : "bad";
      const issued = t.date_issued ?? t.dateIssued ?? t.created_at ?? t.createdAt;
      return {
        id: String(t.id),
        plate: String(t.license_plate ?? t.licensePlate ?? "-"),
        col2: String(t.reason ?? "-"),
        col3: usd(t.amount ?? 0),
        status,
        statusColor: statusPill(kind),
        col5: issued ? new Date(issued).toLocaleDateString() : "-",
      };
    });
  },
};

