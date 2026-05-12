"use client";

import { useEffect, useState } from "react";
import { getReport } from "@/services/reports.service";
import { Loader2, RefreshCcw, Search } from "lucide-react";

interface ReportViewerProps {
    reportType: string;
    title: string;
    description: string;
}

const summarizeReportData = (data: any) => {
    if (!data) return null;
    const keys = Object.keys(data);
    const hasObjects = keys.some((key) => typeof data[key] === "object");
    if (hasObjects) return null;
    return keys.map((key) => ({ key, value: data[key] }));
};

const renderTable = (rows: any[], columns: { key: string; label: string }[]) => (
    <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="min-w-full text-left text-sm">
            <thead>
                <tr className="border-b border-slate-200">
                    {columns.map((column) => (
                        <th key={column.key} className="py-2 pr-4">
                            {column.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, index) => (
                    <tr key={row.id ?? index} className="border-b border-slate-100">
                        {columns.map((column) => (
                            <td key={column.key} className="py-2 pr-4">
                                {column.key.includes("date") || column.key.includes("at")
                                    ? row[column.key]
                                        ? new Date(row[column.key]).toLocaleDateString()
                                        : "-"
                                    : String(row[column.key] ?? "-")}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const renderCards = (values: Record<string, any>) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(values).map(([key, value]) => (
            <div key={key} className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{key.replace(/_/g, " ")}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{String(value)}</p>
            </div>
        ))}
    </div>
);

const renderDetails = (data: any) => {
    if (!data) return <p className="text-sm text-gray-500">No report data available.</p>;

    if (Array.isArray(data)) {
        return (
            <div className="overflow-x-auto mt-4">
                <pre className="text-xs whitespace-pre-wrap bg-slate-950/5 p-4 rounded-lg">{JSON.stringify(data, null, 2)}</pre>
            </div>
        );
    }

    const sections: React.ReactNode[] = [];

    if (data.totals) {
        sections.push(
            <div key="totals">{renderCards(data.totals)}</div>
        );
    }

    if (data.summary) {
        sections.push(
            <div key="summary" className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Summary</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(data.summary).map(([key, value]) => (
                        <div key={key} className="p-3 rounded-2xl bg-slate-50">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{key.replace(/_/g, " ")}</p>
                            <p className="mt-1 text-base font-medium text-slate-900">{String(value)}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (data.statusSummary) {
        sections.push(
            <div key="statusSummary" className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Status Summary</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {data.statusSummary.map((item: any, index: number) => (
                        <div key={index} className="p-3 rounded-2xl bg-slate-50">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{item.status}</p>
                            <p className="mt-1 text-base font-medium text-slate-900">{item.count}</p>
                            <p className="text-xs text-slate-500">Total: {item.total_amount ?? item.totalAmount ?? "-"}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (data.daily) {
        sections.push(
            <div key="daily" className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">Daily Revenue</p>
                {renderTable(data.daily, [
                    { key: 'report_date', label: 'Date' },
                    { key: 'total_amount', label: 'Total Amount' },
                    { key: 'transaction_count', label: 'Tx Count' },
                ])}
            </div>
        );
    }

    if (data.sessionTotals) {
        sections.push(
            <div key="sessionTotals" className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Session Totals</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {data.sessionTotals.map((item: any, index: number) => (
                        <div key={index} className="p-3 rounded-2xl bg-slate-50">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{item.status}</p>
                            <p className="mt-1 text-base font-medium text-slate-900">{item.count}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (data.planBreakdown) {
        sections.push(
            <div key="planBreakdown" className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">Plan Breakdown</p>
                {renderTable(data.planBreakdown, [
                    { key: 'plan_name', label: 'Plan' },
                    { key: 'sessions', label: 'Sessions' },
                    { key: 'total_duration', label: 'Total Duration' },
                ])}
            </div>
        );
    }

    if (data.officerBreakdown) {
        sections.push(
            <div key="officerBreakdown" className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">Officer Breakdown</p>
                {renderTable(data.officerBreakdown, [
                    { key: 'officer_name', label: 'Officer' },
                    { key: 'count', label: 'Count' },
                    { key: 'total_amount', label: 'Amount' },
                ])}
            </div>
        );
    }

    if (data.officerPerformance) {
        sections.push(
            <div key="officerPerformance" className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">Officer Performance</p>
                {renderTable(data.officerPerformance, [
                    { key: 'officer_name', label: 'Officer' },
                    { key: 'tickets_issued', label: 'Tickets Issued' },
                    { key: 'total_penalty_amount', label: 'Penalty Amount' },
                ])}
            </div>
        );
    }

    if (data.dueTickets) {
        sections.push(
            <div key="dueTickets" className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">Due Tickets</p>
                {renderTable(data.dueTickets, [
                    { key: 'ticket_number', label: 'Ticket #' },
                    { key: 'license_plate', label: 'License' },
                    { key: 'amount', label: 'Amount' },
                    { key: 'officer_name', label: 'Officer' },
                    { key: 'due_date', label: 'Due Date' },
                    { key: 'status', label: 'Status' },
                ])}
            </div>
        );
    }

    if (data.occupancy) {
        sections.push(
            <div key="occupancy" className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">Occupancy</p>
                <div className="grid gap-4 md:grid-cols-2">
                    {renderTable(data.occupancy, [
                        { key: 'status', label: 'Status' },
                        { key: 'count', label: 'Count' },
                    ])}
                    <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-semibold text-slate-900">Average Duration</p>
                        <p className="mt-3 text-2xl font-semibold text-slate-900">{String(data.averageDuration ?? 0)}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (data.planData) {
        sections.push(
            <div key="planData" className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">Plan Performance</p>
                {renderTable(data.planData, [
                    { key: 'plan_name', label: 'Plan' },
                    { key: 'sessions_count', label: 'Sessions' },
                    { key: 'average_duration', label: 'Avg Duration' },
                ])}
            </div>
        );
    }

    if (data.recentActivity) {
        sections.push(
            <div key="recentActivity" className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">Recent Activity</p>
                {renderTable(data.recentActivity, [
                    { key: 'user_name', label: 'User' },
                    { key: 'action', label: 'Action' },
                    { key: 'module', label: 'Module' },
                    { key: 'status', label: 'Status' },
                    { key: 'created_at', label: 'Created At' },
                ])}
            </div>
        );
    }

    if (data.locationData) {
        sections.push(
            <div key="locationData" className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">Location Performance</p>
                {renderTable(data.locationData, [
                    { key: 'plan_name', label: 'Location' },
                    { key: 'sessions', label: 'Sessions' },
                    { key: 'total_duration', label: 'Total Duration' },
                ])}
            </div>
        );
    }

    if (data.history) {
        sections.push(
            <div key="history" className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">Vehicle History</p>
                {renderTable(data.history, [
                    { key: 'ticket_number', label: 'Ticket #' },
                    { key: 'officer_name', label: 'Officer' },
                    { key: 'amount', label: 'Amount' },
                    { key: 'status', label: 'Status' },
                    { key: 'date_issued', label: 'Date Issued' },
                ])}
            </div>
        );
    }

    if (data.records) {
        sections.push(
            <div key="records" className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">Refund Records</p>
                {renderTable(data.records, [
                    { key: 'license_plate', label: 'License' },
                    { key: 'amount', label: 'Amount' },
                    { key: 'payment_method', label: 'Method' },
                    { key: 'status', label: 'Status' },
                    { key: 'paid_at', label: 'Paid At' },
                ])}
            </div>
        );
    }

    if (data.reconciliation) {
        sections.push(
            <div key="reconciliation" className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">Reconciliation</p>
                {renderTable(data.reconciliation, [
                    { key: 'payment_type', label: 'Type' },
                    { key: 'status', label: 'Status' },
                    { key: 'count', label: 'Count' },
                    { key: 'total_amount', label: 'Amount' },
                ])}
            </div>
        );
    }

    if (data.statusSummary || data.summary || data.totals || data.history || data.records || data.locationData || data.daily || data.sessionTotals || data.planBreakdown || data.officerBreakdown || data.officerPerformance || data.dueTickets || data.occupancy || data.planData || data.recentActivity || data.reconciliation) {
        return <div className="space-y-6 mt-4">{sections}</div>;
    }

    return (
        <div className="overflow-x-auto mt-4">
            <pre className="text-xs whitespace-pre-wrap bg-slate-950/5 p-4 rounded-lg">{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

const renderDefaultObject = (data: any) => {
    if (!data) return null;
    const summary = summarizeReportData(data);
    if (!summary) return null;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {summary.map((item) => (
                <div key={item.key} className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.key.replace(/_/g, " ")}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{String(item.value)}</p>
                </div>
            ))}
        </div>
    );
};

export default function ReportViewer({ reportType, title, description }: ReportViewerProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [licensePlate, setLicensePlate] = useState("");
    const [selectedLicensePlate, setSelectedLicensePlate] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const abortController = new AbortController();
        const fetchData = async () => {
            if (reportType === "vehicle-history" && !selectedLicensePlate) {
                setData(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const params: Record<string, string | number> = {};
                if (reportType === "vehicle-history") {
                    params.license_plate = selectedLicensePlate;
                }

                const result = await getReport(reportType, params);
                if (!abortController.signal.aborted) {
                    setData(result);
                }
            } catch (err: any) {
                if (!abortController.signal.aborted) {
                    setError(err?.response?.data?.message ?? err.message ?? String(err));
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => abortController.abort();
    }, [reportType, selectedLicensePlate, refreshKey]);

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-2">{title}</h1>
                    <p className="text-gray-600 font-medium">{description}</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setRefreshKey((prev) => prev + 1)}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                    >
                        <RefreshCcw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {reportType === "vehicle-history" && (
                <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] items-end">
                    <label className="w-full">
                        <span className="block text-sm font-semibold text-slate-700 mb-2">License Plate</span>
                        <input
                            type="text"
                            value={licensePlate}
                            onChange={(event) => setLicensePlate(event.target.value)}
                            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                            placeholder="Enter vehicle license plate"
                        />
                    </label>
                    <button
                        type="button"
                        onClick={() => setSelectedLicensePlate(licensePlate.trim())}
                        className="inline-flex items-center justify-center gap-2 rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                    >
                        <Search size={16} /> Search
                    </button>
                </div>
            )}

            <div className="mt-8">
                {loading ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-slate-700" />
                        <p className="text-sm font-medium text-slate-700">Loading report data…</p>
                    </div>
                ) : error ? (
                    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div>
                        {data ? (
                            <>{renderDetails(data)}</>
                        ) : (
                            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                                <p className="text-sm text-slate-600">
                                    {reportType === "vehicle-history"
                                        ? "Enter a license plate and click Search to view vehicle history."
                                        : "No report data available for this report yet."}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
