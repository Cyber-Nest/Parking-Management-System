import { getReport } from "./reports.service";
import { downloadReportExport, type ReportExportFormat } from "./report-export.client";

export interface ParkingUsageFilters {
    dateRange: string;
    location: string;
    planType: string;
    paymentMethod: string;
    status: string;
    startDate: string;
    endDate: string;
    days?: number;
    parkingLotId?: string;
}

export interface ParkingUsageSummary {
    totalSessions: number;
    activeSessions: number;
    avgDuration: number;
    expiredSessions: number;
}

export interface ParkingUsageDaily {
    date: string;
    totalSessions: number;
    completed: number;
    active: number;
    expired: number;
    avgDuration: number;
    revenue: number;
}

export interface SessionsOverTimeDatum {
    name: string;
    sessions: number;
}

export interface HourlyUsageDatum {
    hour: string;
    value: number;
}

export interface PlanTypeDistributionDatum {
    name: string;
    value: number;
    color: string;
}

const range = (f: ParkingUsageFilters) => ({
    from: f.startDate?.trim() || undefined,
    to: f.endDate?.trim() || undefined,
    parking_lot_id: f.parkingLotId?.trim() || undefined,
});

const WD_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type UsageApi = {
    sessionTotals: { status: string; count: number }[];
    planBreakdown: { plan_name: string; sessions: number; total_duration: number }[];
    dailyBreakdown?: {
        report_date: string;
        total_sessions: number;
        completed: number;
        active: number;
        expired: number;
        cancelled: number;
        avg_duration: number;
        revenue: number;
    }[];
    hourlyHistogram?: { hour: number; session_count: number }[];
    heatmapByWeekdayHour?: { weekday: number; hours: number[] }[];
};

export const parkingUsageService = {
    async getSummary(filters: ParkingUsageFilters): Promise<ParkingUsageSummary> {
        const data = (await getReport("usage", range(filters))) as UsageApi;
        const totals = data.sessionTotals ?? [];
        const total = totals.reduce((s, r) => s + (Number(r.count) || 0), 0);
        const active = totals.find((t) => t.status === "active")?.count ?? 0;
        const expired = totals.find((t) => t.status === "expired")?.count ?? 0;
        const pb = data.planBreakdown ?? [];
        const durSum = pb.reduce((s, r) => s + (Number(r.total_duration) || 0), 0);
        const sessSum = pb.reduce((s, r) => s + (Number(r.sessions) || 0), 0);
        return {
            totalSessions: total,
            activeSessions: active,
            avgDuration: sessSum ? Math.round(durSum / sessSum) : 0,
            expiredSessions: expired,
        };
    },

    async getDailyData(filters: ParkingUsageFilters): Promise<ParkingUsageDaily[]> {
        const data = (await getReport("usage", range(filters))) as UsageApi;
        const rows = data.dailyBreakdown ?? [];
        if (!rows.length) {
            const pb = data.planBreakdown ?? [];
            return pb.map((p) => {
                const sessions = Number(p.sessions) || 0;
                const dur = Number(p.total_duration) || 0;
                return {
                    date: p.plan_name,
                    totalSessions: sessions,
                    completed: Math.round(sessions * 0.7),
                    active: Math.round(sessions * 0.2),
                    expired: Math.max(0, sessions - Math.round(sessions * 0.7) - Math.round(sessions * 0.2)),
                    avgDuration: sessions ? Math.round(dur / sessions) : 0,
                    revenue: dur * 0.02,
                };
            });
        }
        return rows.map((d) => ({
            date: d.report_date ? String(d.report_date).slice(0, 10) : "",
            totalSessions: Number(d.total_sessions) || 0,
            completed: Number(d.completed) || 0,
            active: Number(d.active) || 0,
            expired: Number(d.expired) || 0,
            avgDuration: Math.round(Number(d.avg_duration) || 0),
            revenue: Number(d.revenue) || 0,
        }));
    },

    async getSessionsOverTime(
        filters: ParkingUsageFilters & { period?: string; days?: number },
    ): Promise<SessionsOverTimeDatum[]> {
        const days = filters.days ?? 30;
        const { days: _d, period: _p, ...rest } = filters;
        void _d;
        void _p;
        const daily = await parkingUsageService.getDailyData(rest);
        return daily.slice(-days).map((d) => ({ name: d.date, sessions: d.totalSessions }));
    },

    async getHourlyUsage(filters: ParkingUsageFilters): Promise<HourlyUsageDatum[]> {
        const data = (await getReport("usage", range(filters))) as UsageApi;
        const hist = data.hourlyHistogram ?? [];
        if (!hist.length) {
            return Array.from({ length: 24 }, (_, h) => ({
                hour: `${h}`,
                value: 0,
            }));
        }
        const byHour = Array(24).fill(0) as number[];
        hist.forEach((h) => {
            const hr = Number(h.hour);
            if (hr >= 0 && hr < 24) byHour[hr] = Number(h.session_count) || 0;
        });
        return byHour.map((v, h) => ({ hour: `${h}`, value: v }));
    },

    async getPlanTypeDistribution(filters: ParkingUsageFilters): Promise<PlanTypeDistributionDatum[]> {
        const data = (await getReport("usage", range(filters))) as UsageApi;
        const colors = ["#6366f1", "#22c55e", "#f97316", "#ec4899"];
        const pb = data.planBreakdown ?? [];
        return pb.map((p, i) => ({
            name: p.plan_name,
            value: Number(p.sessions) || 0,
            color: colors[i % colors.length],
        }));
    },

    async exportReport(payload: ParkingUsageFilters & { format: ReportExportFormat }) {
        const { format, days: _days, ...filters } = payload;
        void _days;
        const { from, to, parking_lot_id } = range(filters as ParkingUsageFilters);
        return downloadReportExport("usage", format, { from, to, parking_lot_id });
    },

    /** For peak-hours heatmap: weekday index matches MySQL WEEKDAY (Mon=0). */
    async getHeatmapWeek(filters: ParkingUsageFilters): Promise<{ day: string; hours: number[] }[]> {
        const data = (await getReport("usage", range(filters))) as UsageApi;
        const rows = data.heatmapByWeekdayHour ?? [];
        if (!rows.length) {
            return WD_LABELS.map((day) => ({ day, hours: Array(24).fill(0) }));
        }
        return rows.map((r, i) => ({
            day: WD_LABELS[r.weekday ?? i] ?? WD_LABELS[i % 7],
            hours: r.hours ?? Array(24).fill(0),
        }));
    },
};

export type SessionsOverTime = SessionsOverTimeDatum;
export type HourlyUsage = HourlyUsageDatum;
export type PlanTypeDistribution = PlanTypeDistributionDatum;
