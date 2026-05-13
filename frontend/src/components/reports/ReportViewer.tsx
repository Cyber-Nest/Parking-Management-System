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

const renderDetails = (data: any) => {
    if (!data) return <p className="text-sm text-gray-500">No report data available.</p>;

    if (Array.isArray(data)) {
        return (
            <div className="overflow-x-auto mt-4">
                <pre className="text-xs whitespace-pre-wrap bg-slate-950/5 p-4 rounded-lg">{JSON.stringify(data, null, 2)}</pre>
            </div>
        );
    }

    if (data.summary || data.totals || data.statusSummary || data.reconciliation || data.history || data.records || data.locationData) {
        return (
            <div className="space-y-6 mt-4">
                {data.totals && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(data.totals).map(([key, value]) => (
                            <div key={key} className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{key.replace(/_/g, " ")}</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{String(value)}</p>
                            </div>
                        ))}
                    </div>
                )}

                {data.summary && (
                    <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
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
                )}

                {data.statusSummary && (
                    <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
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
                )}

                {data.reconciliation && (
                    <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-semibold text-slate-900">Reconciliation</p>
                        <div className="mt-3 overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="py-2 pr-4">Type</th>
                                        <th className="py-2 pr-4">Status</th>
                                        <th className="py-2 pr-4">Count</th>
                                        <th className="py-2 pr-4">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.reconciliation.map((item: any, index: number) => (
                                        <tr key={index} className="border-b border-slate-100">
                                            <td className="py-2 pr-4">{item.payment_type}</td>
                                            <td className="py-2 pr-4">{item.status}</td>
                                            <td className="py-2 pr-4">{item.count}</td>
                                            <td className="py-2 pr-4">{item.total_amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {data.history && (
                    <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-semibold text-slate-900">Vehicle History</p>
                        <div className="mt-3 overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="py-2 pr-4">Ticket #</th>
                                        <th className="py-2 pr-4">Officer</th>
                                        <th className="py-2 pr-4">Amount</th>
                                        <th className="py-2 pr-4">Status</th>
                                        <th className="py-2 pr-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.history.map((item: any) => (
                                        <tr key={item.id} className="border-b border-slate-100">
                                            <td className="py-2 pr-4">{item.ticket_number}</td>
                                            <td className="py-2 pr-4">{item.officer_name}</td>
                                            <td className="py-2 pr-4">{item.amount}</td>
                                            <td className="py-2 pr-4">{item.status}</td>
                                            <td className="py-2 pr-4">{item.date_issued ? new Date(item.date_issued).toLocaleDateString() : "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {data.records && (
                    <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-semibold text-slate-900">Refund Records</p>
                        <div className="mt-3 overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="py-2 pr-4">License</th>
                                        <th className="py-2 pr-4">Amount</th>
                                        <th className="py-2 pr-4">Method</th>
                                        <th className="py-2 pr-4">Status</th>
                                        <th className="py-2 pr-4">Paid At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.records.map((item: any) => (
                                        <tr key={item.id} className="border-b border-slate-100">
                                            <td className="py-2 pr-4">{item.license_plate}</td>
                                            <td className="py-2 pr-4">{item.amount}</td>
                                            <td className="py-2 pr-4">{item.payment_method}</td>
                                            <td className="py-2 pr-4">{item.status}</td>
                                            <td className="py-2 pr-4">{item.paid_at ? new Date(item.paid_at).toLocaleDateString() : "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {data.locationData && (
                    <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-semibold text-slate-900">Location Performance</p>
                        <div className="mt-3 overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="py-2 pr-4">Location</th>
                                        <th className="py-2 pr-4">Sessions</th>
                                        <th className="py-2 pr-4">Total Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.locationData.map((item: any) => (
                                        <tr key={item.plan_name} className="border-b border-slate-100">
                                            <td className="py-2 pr-4">{item.plan_name}</td>
                                            <td className="py-2 pr-4">{item.sessions}</td>
                                            <td className="py-2 pr-4">{item.total_duration}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {renderDefaultObject(data)}
            </div>
        );
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
