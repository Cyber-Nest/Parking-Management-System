import { getReport } from "./reports.service";
import {
  downloadReportExport,
  type ReportExportFormat,
} from "./report-export.client";
import { listParkingZones } from "./parking-zones.service";

export interface LocationPerformanceFilters {
  dateRange: string;
  startDate: string;
  endDate: string;
  [key: string]: string;
}

export interface LocationPerformanceSummary {
  totalRevenue: number;
  totalSessions: number;
  totalTickets: number;
  totalLocations: number;
}

export interface LocationTableData {
  id: string;
  location: string;
  revenue: number;
  sessions: number;
  avgDuration: number;
  occupancyRate: number;
  ticketsIssued: number;
  penaltyRevenue: number;
}

export interface LocationChartDatum {
  name: string;
  value: number;
  color: string;
  rate: number;
}

export type LocationRevenueData = LocationChartDatum;
export type LocationOccupancyData = LocationChartDatum;

export interface LocationDetails {
  name?: string;
  address?: string;
  locationType?: string;
  totalSpots?: number;
}

export interface LocationPerformanceMetrics {
  dailyRevenue: number;
  totalSessions: number;
  ticketsIssued: number;
  occupancyRate: number;
}

export interface LocationRevenueTrend {
  date: string;
  revenue: number;
}

export interface LocationSessionTrend {
  date: string;
  sessions: number;
}

export interface LocationTicketData {
  ticketId: string;
  date: string;
  violationType: string;
  amount: number;
  status: string;
}

export interface LocationOfficerData {
  name: string;
  officerId: string;
  ticketsIssued: number;
  revenue: number;
  lastActive: string;
}

export interface LocationVehicleHistory {
  plateNumber: string;
  vehicleType: string;
  sessionDate: string;
  duration: string;
  amountPaid: number;
}

export interface PeakHourData {
  hour: string;
  vehicles: number;
}

const range = (f: LocationPerformanceFilters) => ({
  from: f.startDate?.trim() || undefined,
  to: f.endDate?.trim() || undefined,
  parking_lot_id: f.parkingLotId?.trim() || undefined,
});

export const locationPerformanceService = {
  async getSummary(
    filters: LocationPerformanceFilters,
  ): Promise<LocationPerformanceSummary> {
    const data = (await getReport("location", range(filters))) as {
      locationData: {
        plan_name?: string;
        sessions: number;
        total_duration: number;
        revenue?: number;
        location_key?: string;
      }[];
    };
    const rows = data.locationData ?? [];
    const totalSessions = rows.reduce(
      (s, r) => s + (Number(r.sessions) || 0),
      0,
    );
    const totalDuration = rows.reduce(
      (s, r) => s + (Number(r.total_duration) || 0),
      0,
    );
    const totalRev = rows.reduce((s, r) => s + (Number(r.revenue) || 0), 0);
    return {
      totalRevenue: totalRev || totalDuration * 0.05,
      totalSessions,
      totalTickets: Math.round(totalSessions * 0.1),
      totalLocations: rows.length,
    };
  },

  async getLocationsData(
    filters: LocationPerformanceFilters,
  ): Promise<LocationTableData[]> {
    const data = (await getReport("location", range(filters))) as {
      locationData: {
        location_key?: string;
        plan_name?: string;
        sessions: number;
        total_duration: number;
        revenue?: number;
      }[];
    };
    return (data.locationData ?? []).map((r) => {
      const sessions = Number(r.sessions) || 0;
      const dur = Number(r.total_duration) || 0;
      const loc = r.location_key || r.plan_name || "Location";
      const revenue = Number(r.revenue) || dur * 0.05;
      return {
        id: loc,
        location: loc,
        revenue,
        sessions,
        avgDuration: sessions ? Math.round(dur / sessions) : 0,
        occupancyRate: Math.min(100, sessions * 3),
        ticketsIssued: Math.round(sessions * 0.08),
        penaltyRevenue: dur * 0.01,
      };
    });
  },

  async getRevenueByLocation(
    filters: LocationPerformanceFilters,
  ): Promise<LocationChartDatum[]> {
    const rows = await locationPerformanceService.getLocationsData(filters);
    const colors = ["#6366f1", "#22c55e", "#f97316", "#ec4899"];
    return rows.map((r, i) => ({
      name: r.location,
      value: r.revenue,
      rate: r.revenue,
      color: colors[i % colors.length],
    }));
  },

  async getOccupancyData(
    filters: LocationPerformanceFilters,
  ): Promise<LocationChartDatum[]> {
    const rows = await locationPerformanceService.getLocationsData(filters);
    return rows.map((r, i) => ({
      name: r.location,
      value: r.occupancyRate,
      rate: r.occupancyRate,
      color: ["#6366f1", "#22c55e"][i % 2],
    }));
  },

  async exportReport(
    payload: LocationPerformanceFilters & { format: ReportExportFormat },
  ) {
    const { format, ...filters } = payload;
    const { from, to } = range(filters as LocationPerformanceFilters);
    return downloadReportExport("location", format, { from, to });
  },

  async getLocationDetails(locationId: string): Promise<LocationDetails> {
    const zones = await listParkingZones({ limit: 200 });
    const match = zones.find(
      (zone) => zone.id === locationId || zone.parking_name === locationId,
    );

    if (match) {
      return {
        name: match.parking_name,
        address: match.address || "—",
        locationType: "Parking Zone",
        totalSpots: match.total_spots,
      };
    }

    return {
      name: locationId,
      address: "—",
      locationType: "Parking Location",
      totalSpots: 0,
    };
  },
  async getLocationMetrics(
    _locationId: string,
  ): Promise<LocationPerformanceMetrics> {
    void _locationId;
    return {
      dailyRevenue: 0,
      totalSessions: 0,
      ticketsIssued: 0,
      occupancyRate: 0,
    };
  },
  async getLocationRevenueTrend(
    _locationId: string,
  ): Promise<LocationRevenueTrend[]> {
    void _locationId;
    return Array.from({ length: 7 }, (_, i) => ({
      date: `Day ${i + 1}`,
      revenue: Math.round(100 + i * 20),
    }));
  },
  async getLocationSessionTrend(
    _locationId: string,
  ): Promise<LocationSessionTrend[]> {
    void _locationId;
    return Array.from({ length: 7 }, (_, i) => ({
      date: `Day ${i + 1}`,
      sessions: Math.round(5 + i * 2),
    }));
  },
  async getLocationTickets(_locationId: string): Promise<LocationTicketData[]> {
    void _locationId;
    return [];
  },
  async getLocationOfficers(
    _locationId: string,
  ): Promise<LocationOfficerData[]> {
    void _locationId;
    return [];
  },
  async getLocationVehicleHistory(
    _locationId: string,
  ): Promise<LocationVehicleHistory[]> {
    void _locationId;
    return [];
  },
  async getLocationPeakHours(_locationId: string): Promise<PeakHourData[]> {
    void _locationId;
    return Array.from({ length: 24 }, (_, h) => ({
      hour: `${h}`,
      vehicles: Math.round(5 + (h % 6) * 2),
    }));
  },
};
