import { getReport } from "./reports.service";
import { downloadReportExport, type ReportExportFormat } from "./report-export.client";

export interface AuditLogFilters {
    search: string;
    dateRange: string;
    user: string;
    role: string;
    module: string;
    action: string;
    status: string;
    startDate: string;
    endDate: string;
}

export interface AuditLogStats {
    totalLogs: number;
    successCount: number;
    failedCount: number;
    blockedCount: number;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    user: string;
    role: string;
    module: string;
    action: string;
    oldValue: string;
    newValue: string;
    status: string;
}

export const getStatusColor = (status: string): string => {
    const s = status.toLowerCase();
    if (s === "success") return "bg-emerald-500/10 text-emerald-600";
    if (s === "failure" || s === "failed") return "bg-red-500/10 text-red-600";
    return "bg-slate-500/10 text-slate-600";
};

const mapRow = (row: any): AuditLog => ({
    id: row.id,
    timestamp: row.created_at ? new Date(row.created_at).toLocaleString() : "",
    user: row.user_name || "—",
    role: "Admin",
    module: row.module || "—",
    action: row.action || "—",
    oldValue: row.old_value ?? "—",
    newValue: row.new_value ?? "—",
    status: row.status || "—",
});

const loadAudit = async (limit = 200) =>
    getReport("audit", { limit }) as Promise<{
        summary: { total_logs: number; success_count: number; failure_count: number };
        recentActivity: any[];
    }>;

export const auditLogsService = {
    async getStats(_filters: AuditLogFilters): Promise<AuditLogStats> {
        const { summary } = await loadAudit(500);
        return {
            totalLogs: Number(summary.total_logs) || 0,
            successCount: Number(summary.success_count) || 0,
            failedCount: Number(summary.failure_count) || 0,
            blockedCount: 0,
        };
    },

    async getLogs(filters: AuditLogFilters): Promise<AuditLog[]> {
        const { recentActivity } = await loadAudit(200);
        let rows = recentActivity.map(mapRow);
        if (filters.search.trim()) {
            const q = filters.search.toLowerCase();
            rows = rows.filter(
                (l) =>
                    l.user.toLowerCase().includes(q) ||
                    l.module.toLowerCase().includes(q) ||
                    l.action.toLowerCase().includes(q) ||
                    l.id.toLowerCase().includes(q),
            );
        }
        if (filters.user !== "All Users") {
            rows = rows.filter((l) => l.user === filters.user);
        }
        if (filters.module !== "All Modules") {
            rows = rows.filter((l) => l.module === filters.module);
        }
        if (filters.action !== "All Actions") {
            rows = rows.filter((l) => l.action === filters.action);
        }
        if (filters.status !== "All Status") {
            rows = rows.filter((l) => l.status.toLowerCase() === filters.status.toLowerCase());
        }
        return rows;
    },

    async getUsers(): Promise<string[]> {
        const { recentActivity } = await loadAudit(200);
        const names = new Set<string>(["All Users"]);
        recentActivity.forEach((r: any) => {
            if (r.user_name) names.add(r.user_name);
        });
        return Array.from(names);
    },

    async getModules(): Promise<string[]> {
        const { recentActivity } = await loadAudit(200);
        const mods = new Set<string>(["All Modules"]);
        recentActivity.forEach((r: any) => {
            if (r.module) mods.add(r.module);
        });
        return Array.from(mods);
    },

    async getActions(): Promise<string[]> {
        const { recentActivity } = await loadAudit(200);
        const acts = new Set<string>(["All Actions"]);
        recentActivity.forEach((r: any) => {
            if (r.action) acts.add(r.action);
        });
        return Array.from(acts);
    },

    async exportLogs(payload: AuditLogFilters & { format: ReportExportFormat }) {
        const { format, ..._rest } = payload;
        return downloadReportExport("audit", format, { limit: 200 });
    },
};
