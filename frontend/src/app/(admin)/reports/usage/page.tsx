"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Download,
  Filter,
  Calendar,
  Clock,
  Car,
  CheckCircle,
  AlertCircle,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { ParkingUsageCharts } from "@/components/reports/charts/ParkingUsageCharts";
import { ParkingUsageDrawer } from "@/components/reports/drawers/ParkingUsageDrawer";

// Services
import {
  parkingUsageService,
  ParkingUsageFilters,
  ParkingUsageSummary,
  ParkingUsageDaily,
  SessionsOverTime,
  HourlyUsage,
  PlanTypeDistribution,
} from "@/services/parking-usage.service";

export default function ParkingUsageReport() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const itemsPerPage = 10;

  const [summary, setSummary] = useState<ParkingUsageSummary | null>(null);
  const [dailyData, setDailyData] = useState<ParkingUsageDaily[]>([]);
  const [sessionsOverTime, setSessionsOverTime] = useState<SessionsOverTime[]>(
    [],
  );
  const [hourlyUsage, setHourlyUsage] = useState<HourlyUsage[]>([]);
  const [planTypeData, setPlanTypeData] = useState<PlanTypeDistribution[]>([]);

  // Filters
  const [filters, setFilters] = useState<ParkingUsageFilters>({
    dateRange: "Last 30 Days",
    location: "All Locations",
    planType: "All Plans",
    paymentMethod: "All Methods",
    status: "All Status",
  });

  // Chart days filter
  const [chartDays, setChartDays] = useState(30);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, dailyRes, sessionsRes, hourlyRes, planRes] =
        await Promise.all([
          parkingUsageService.getSummary(filters),
          parkingUsageService.getDailyData(filters),
          parkingUsageService.getSessionsOverTime({
            ...filters,
            days: chartDays,
          }),
          parkingUsageService.getHourlyUsage(filters),
          parkingUsageService.getPlanTypeDistribution(filters),
        ]);
      setSummary(summaryRes);
      setDailyData(dailyRes);
      setSessionsOverTime(sessionsRes);
      setHourlyUsage(hourlyRes);
      setPlanTypeData(planRes);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load parking usage data");
    } finally {
      setLoading(false);
    }
  }, [filters, chartDays]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Pagination
  const totalPages = Math.ceil(dailyData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return dailyData.slice(start, start + itemsPerPage);
  }, [dailyData, currentPage]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      dateRange: "Last 30 Days",
      location: "All Locations",
      planType: "All Plans",
      paymentMethod: "All Methods",
      status: "All Status",
    });
    setChartDays(30);
    setCurrentPage(1);
    setShowFilters(false);
    toast.info("Filters reset");
  };

  // Export
  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await parkingUsageService.exportReport(filters);
      toast.success(response.message);
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  // Handle chart days change
  const handleDaysChange = (days: number) => {
    setChartDays(days);
  };

  // Handle view details
  const handleViewDetails = (row: any) => {
    setSelectedRow(row);
    setIsDrawerOpen(true);
  };

  const dateRangeOptions = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "Last 30 Days",
    "This Month",
    "Last Month",
    "Custom Range",
  ];
  const locationOptions = [
    "All Locations",
    "Downtown",
    "Airport",
    "Mall",
    "Stadium",
  ];
  const planTypeOptions = ["All Plans", "Hourly", "Daily", "Monthly", "Event"];
  const paymentMethodOptions = ["All Methods", "Card", "Cash", "Wallet"];
  const statusOptions = [
    "All Status",
    "Completed",
    "Active",
    "Expired",
    "Cancelled",
  ];

  return (
    <div className="min-h-screen px-4 md:px-6 py-6 space-y-8 bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)]">
            Parking{" "}
            <span className="text-[var(--color-primary)]">Usage Report</span>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
            Analyze parking session activity and utilization trends.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              showFilters
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
            }`}
          >
            <Filter size={16} />
            Filters
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-all disabled:opacity-50"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Export
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCard key={i} loading={true} />
          ))}
        </div>
      ) : (
        summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Car size={22} className="text-blue-500" />}
              title="Total Sessions"
              value={summary.totalSessions.toLocaleString()}
            />
            <StatCard
              icon={<RefreshCcw size={22} className="text-emerald-500" />}
              title="Active Sessions"
              value={summary.activeSessions.toLocaleString()}
            />
            <StatCard
              icon={<Clock size={22} className="text-orange-500" />}
              title="Average Duration"
              value={summary.avgDuration}
            />
            <StatCard
              icon={<AlertCircle size={22} className="text-rose-500" />}
              title="Expired Sessions"
              value={summary.expiredSessions.toLocaleString()}
            />
          </div>
        )
      )}

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) =>
                      setFilters({ ...filters, dateRange: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {dateRangeOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Location
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {locationOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Plan Type
                  </label>
                  <select
                    value={filters.planType}
                    onChange={(e) =>
                      setFilters({ ...filters, planType: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {planTypeOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Payment Method
                  </label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) =>
                      setFilters({ ...filters, paymentMethod: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {paymentMethodOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-[var(--color-border)] hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <RotateCcw size={16} />
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts Section */}
      <ParkingUsageCharts
        sessionsData={sessionsOverTime}
        hourlyData={hourlyUsage}
        planTypeData={planTypeData}
        loading={loading}
        onDaysChange={handleDaysChange}
      />

      {/* Table Section */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
              <tr className="text-[10px] uppercase text-[var(--color-text-muted)] font-black tracking-widest">
                <th className="px-4 sm:px-6 py-4">Date</th>
                <th className="px-4 sm:px-6 py-4">Total Sessions</th>
                <th className="px-4 sm:px-6 py-4">Completed</th>
                <th className="px-4 sm:px-6 py-4">Active</th>
                <th className="px-4 sm:px-6 py-4">Expired</th>
                <th className="px-4 sm:px-6 py-4">Avg Duration</th>
                <th className="px-4 sm:px-6 py-4">Revenue (CAD)</th>
                <th className="px-4 sm:px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
              {loading ? (
                <TableSkeleton rows={5} cols={8} />
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-[var(--color-text-muted)]"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[var(--color-surface-soft)]/30 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 font-bold text-[var(--color-text-primary)]">
                      {row.date}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {row.totalSessions.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-emerald-600">
                      {row.completed.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-blue-600">
                      {row.active.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-rose-500">
                      {row.expired.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4">{row.avgDuration}</td>
                    <td className="px-4 sm:px-6 py-4 font-bold text-[var(--color-text-primary)]">
                      ${row.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetails(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
                      >
                        <Eye size={12} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && dailyData.length > itemsPerPage && (
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
            <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, dailyData.length)} of{" "}
              {dailyData.length} entries
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 rounded-lg hover:bg-[var(--color-surface)] border border-[var(--color-border)] transition-all disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from(
                { length: Math.min(totalPages, 5) },
                (_, i) => i + 1,
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === page
                      ? "bg-[var(--color-primary)] text-white"
                      : "hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  {page}
                </button>
              ))}
              {totalPages > 5 && (
                <span className="text-[var(--color-text-muted)]">...</span>
              )}
              {totalPages > 5 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 rounded-lg text-xs font-bold hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
                >
                  {totalPages}
                </button>
              )}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 rounded-lg hover:bg-[var(--color-surface)] border border-[var(--color-border)] transition-all disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Drawer */}
      <ParkingUsageDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={selectedRow}
      />
    </div>
  );
}
