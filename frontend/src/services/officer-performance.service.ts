import { getReport } from "./reports.service";
import {
  downloadReportExport,
  type ReportExportFormat,
} from "./report-export.client";
import { listOfficers } from "./officers.service";
import { listTickets } from "./tickets.service";

export interface OfficerPerformanceFilters {
  dateRange: string;
  location: string;
  officer: string;
  startDate: string;
  endDate: string;
  parkingLotId?: string;
}

export interface OfficerPerformanceSummary {
  totalOfficers: number;
  totalTickets: number;
  paidTickets: number;
  pendingTickets: number;
  totalRevenue: number;
}

export interface OfficerPerformanceData {
  id: string;
  name: string;
  officerId: string;
  ticketsIssued: number;
  paidTickets: number;
  pendingTickets: number;
  cancelledTickets: number;
  revenue: number;
  avgPerDay: number;
  email: string;
  phone: string;
  addressStreet: string;
  addressCity: string;
  addressProvince: string;
  role: string;
}

export interface PerformanceTrendData {
  name: string;
  tickets: number;
}

export interface TopOfficerData {
  name: string;
  count: number;
}

export interface OfficerTicketData {
  ticketId: string;
  violationType: string;
  amount: number;
  status: string;
}

export interface OfficerEvidenceData {
  id: string;
  url: string;
  imageUrl: string;
}

export interface OfficerActivityLog {
  id: string;
  message: string;
  at: string;
  action: string;
  timestamp: string;
  details: string;
}

const range = (f: OfficerPerformanceFilters) => ({
  from: f.startDate?.trim() || undefined,
  to: f.endDate?.trim() || undefined,
  parking_lot_id: f.parkingLotId?.trim() || undefined,
});

const loadPerformance = async (filters: OfficerPerformanceFilters) =>
  getReport("performance", range(filters)) as Promise<{
    officerPerformance: {
      officer_id: string;
      officer_name: string;
      officer_email?: string;
      officer_phone?: string | null;
      officer_role?: string;
      tickets_issued: number;
      paid_tickets?: number;
      pending_tickets?: number;
      cancelled_tickets?: number;
      total_penalty_amount: number;
    }[];
  }>;

const isAllOfficers = (value?: string) =>
  !value || value === "All Officers";

const filterSelectedOfficer = <
  T extends { officer_id: string; officer_name: string },
>(
  rows: T[],
  filters: OfficerPerformanceFilters,
) => {
  if (isAllOfficers(filters.officer)) return rows;
  const selected = filters.officer.trim().toLowerCase();
  return rows.filter(
    (row) =>
      row.officer_id.toLowerCase() === selected ||
      row.officer_name.toLowerCase() === selected,
  );
};

const getOfficerTicketStats = async (
  officerId: string,
  filters: OfficerPerformanceFilters,
) => {
  const stats = {
    paid: 0,
    pending: 0,
    cancelled: 0,
    paidAmount: 0,
    pendingAmount: 0,
    cancelledAmount: 0,
  };

  const limit = 100;
  let page = 1;

  while (true) {
    const { items } = await listTickets({
      officer_id: officerId,
      limit,
      page,
      from: filters.startDate,
      to: filters.endDate,
      parking_lot_id: filters.parkingLotId,
    });

    if (!items?.length) break;

    items.forEach((t: any) => {
      const status = String(t.status || "").toLowerCase();
      const amount = Number(t.amount) || 0;
      if (status === "paid") {
        stats.paid += 1;
        stats.paidAmount += amount;
      } else if (status === "cancelled") {
        stats.cancelled += 1;
        stats.cancelledAmount += amount;
      } else {
        stats.pending += 1;
        stats.pendingAmount += amount;
      }
    });

    if (items.length < limit || page >= 10) break;
    page += 1;
  }

  return stats;
};

const mapOfficerRow = (
  row: {
    officer_id: string;
    officer_name: string;
    officer_email?: string;
    officer_phone?: string | null;
    officer_role?: string;
    tickets_issued: number;
    paid_tickets?: number;
    pending_tickets?: number;
    cancelled_tickets?: number;
    total_penalty_amount: number;
  },
  stats?: {
    paid: number;
    pending: number;
    cancelled: number;
    paidAmount: number;
    pendingAmount: number;
    cancelledAmount: number;
  },
): OfficerPerformanceData => {
  const t = Number(row.tickets_issued) || 0;
  const paid = Number(row.paid_tickets ?? stats?.paid ?? 0);
  const cancelled = Number(row.cancelled_tickets ?? stats?.cancelled ?? 0);
  const pending = Number(
    row.pending_tickets ?? stats?.pending ?? Math.max(0, t - paid - cancelled),
  );
  const revenue =
    Number(row.total_penalty_amount) ||
    (stats?.paidAmount ?? 0) +
      (stats?.pendingAmount ?? 0) +
      (stats?.cancelledAmount ?? 0);
  return {
    id: row.officer_id,
    name: row.officer_name,
    officerId: row.officer_id,
    ticketsIssued: t,
    paidTickets: paid,
    pendingTickets: pending,
    cancelledTickets: cancelled,
    revenue,
    avgPerDay: t > 0 ? Number((t / 30).toFixed(1)) : 0,
    email: row.officer_email ?? "",
    phone: row.officer_phone ?? "",
    addressStreet: "",
    addressCity: "",
    addressProvince: "",
    role: row.officer_role ?? "Officer",
  };
};

export const officerPerformanceService = {
  async getSummary(
    filters: OfficerPerformanceFilters,
  ): Promise<OfficerPerformanceSummary> {
    const officers = await officerPerformanceService.getOfficersData(filters);
    const totalTickets = officers.reduce(
      (sum, officer) => sum + officer.ticketsIssued,
      0,
    );
    const paid = officers.reduce(
      (sum, officer) => sum + officer.paidTickets,
      0,
    );
    const pending = officers.reduce(
      (sum, officer) => sum + officer.pendingTickets,
      0,
    );
    const revenue = officers.reduce((sum, officer) => sum + officer.revenue, 0);
    return {
      totalOfficers: officers.length,
      totalTickets,
      paidTickets: paid,
      pendingTickets: pending,
      totalRevenue: revenue,
    };
  },

  async getOfficersData(
    filters: OfficerPerformanceFilters,
  ): Promise<OfficerPerformanceData[]> {
    const { officerPerformance } = await loadPerformance(filters);
    const selectedRows = filterSelectedOfficer(officerPerformance, filters);
    return selectedRows.map((row, index) =>
      mapOfficerRow(row),
    );
  },

  async getOfficerOptions(
    filters: Pick<OfficerPerformanceFilters, "parkingLotId"> = {},
  ): Promise<{ id: string; name: string; email: string; phone: string }[]> {
    const response = await listOfficers({
      page: 1,
      limit: 100,
      parking_lot_id: filters.parkingLotId?.trim() || undefined,
    });
    const items = (response?.items ?? response ?? []) as Array<{
      id: string;
      full_name?: string;
      email?: string;
      phone?: string;
    }>;
    return items.map((officer) => ({
      id: officer.id,
      name: officer.full_name ?? officer.id,
      email: officer.email ?? "",
      phone: officer.phone ?? "",
    }));
  },

  async getPerformanceTrend(
    filters: OfficerPerformanceFilters,
  ): Promise<PerformanceTrendData[]> {
    const rows = await officerPerformanceService.getOfficersData(filters);
    return rows
      .slice(0, 10)
      .map((r) => ({
        name: r.name,
        tickets: r.ticketsIssued,
      }));
  },

  async getTopOfficers(
    filters: OfficerPerformanceFilters,
  ): Promise<TopOfficerData[]> {
    const rows = await officerPerformanceService.getOfficersData(filters);
    return rows
      .slice()
      .sort((a, b) => b.ticketsIssued - a.ticketsIssued)
      .slice(0, 5)
      .map((r) => ({ name: r.name, count: r.ticketsIssued }));
  },

  async exportReport(
    payload: OfficerPerformanceFilters & { format: ReportExportFormat },
  ) {
    const { format, ...filters } = payload;
    const { from, to, parking_lot_id } = range(
      filters as OfficerPerformanceFilters,
    );
    return downloadReportExport("performance", format, {
      from,
      to,
      parking_lot_id,
    });
  },

  async getOfficerTickets(officerId: string): Promise<OfficerTicketData[]> {
    const { items } = await listTickets({
      officer_id: officerId,
      limit: 50,
      page: 1,
    });
    return items.map((t: any) => ({
      ticketId: t.ticket_number || t.id,
      violationType: t.reason || "—",
      amount: Number(t.amount) || 0,
      status: String(t.status),
    }));
  },

  async getOfficerEvidence(_officerId: string): Promise<OfficerEvidenceData[]> {
    return [];
  },

  async getOfficerActivities(
    _officerId: string,
  ): Promise<OfficerActivityLog[]> {
    return [];
  },

  async getOfficerTicketBreakdown(officerId: string) {
    const tickets =
      await officerPerformanceService.getOfficerTickets(officerId);
    let paid = 0;
    let unpaid = 0;
    let cancelled = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;
    let cancelledAmount = 0;
    tickets.forEach((t) => {
      const s = t.status.toLowerCase();
      if (s === "paid") {
        paid += 1;
        paidAmount += t.amount;
      } else if (s === "cancelled") {
        cancelled += 1;
        cancelledAmount += t.amount;
      } else {
        unpaid += 1;
        unpaidAmount += t.amount;
      }
    });
    return {
      paid,
      unpaid,
      cancelled,
      paidAmount,
      unpaidAmount,
      cancelledAmount,
    };
  },
};
