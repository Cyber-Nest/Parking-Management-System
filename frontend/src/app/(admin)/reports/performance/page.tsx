"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Download,
  Users,
  Ticket,
  CheckCircle2,
  Clock,
  DollarSign,
  Search,
  Eye,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  Timer,
  BadgeCheck,
  ReceiptText,
  UsersRound,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { OfficerPerformanceCharts } from "@/components/reports/charts/OfficerPerformanceCharts";
import { OfficerDetailsDrawer } from "@/components/reports/drawers/OfficerDetailsDrawer";

// Services
import {
  officerPerformanceService,
  OfficerPerformanceFilters,
  OfficerPerformanceSummary,
  OfficerPerformanceData,
  PerformanceTrendData,
  TopOfficerData,
} from "@/services/officer-performance.service";

export default function OfficerPerformanceReport() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOfficer, setSelectedOfficer] =
    useState<OfficerPerformanceData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chartDays, setChartDays] = useState(7);

  const itemsPerPage = 10;

  const [summary, setSummary] = useState<OfficerPerformanceSummary | null>(
    null,
  );
  const [officersData, setOfficersData] = useState<OfficerPerformanceData[]>(
    [],
  );
  const [trendData, setTrendData] = useState<PerformanceTrendData[]>([]);
  const [topOfficersData, setTopOfficersData] = useState<TopOfficerData[]>([]);

  // Filters
  const [filters, setFilters] = useState<OfficerPerformanceFilters>({
    dateRange: "Last 30 Days",
    location: "All Locations",
    officer: "All Officers",
  });

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery) return officersData;
    const query = searchQuery.toLowerCase();
    return officersData.filter(
      (row) =>
        row.name.toLowerCase().includes(query) ||
        row.officerId.toLowerCase().includes(query),
    );
  }, [officersData, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, officersRes, trendRes, topRes] = await Promise.all([
        officerPerformanceService.getSummary(filters),
        officerPerformanceService.getOfficersData(filters),
        officerPerformanceService.getPerformanceTrend(filters),
        officerPerformanceService.getTopOfficers(filters),
      ]);
      setSummary(summaryRes);
      setOfficersData(officersRes);
      setTrendData(trendRes);
      setTopOfficersData(topRes);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load officer performance data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      dateRange: "Last 30 Days",
      location: "All Locations",
      officer: "All Officers",
    });
    setSearchQuery("");
    setCurrentPage(1);
    setShowFilters(false);
    toast.info("Filters reset");
  };

  // Export
  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await officerPerformanceService.exportReport(filters);
      toast.success(response.message);
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  // Handle view details
  const handleViewDetails = (officer: OfficerPerformanceData) => {
    setSelectedOfficer(officer);
    setIsDrawerOpen(true);
  };

  const handleChartFilterChange = (days: number) => {
    setChartDays(days);
    // Fetch new data based on days
    // fetchDataWithDays(days);
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
    "Lot A",
    "Lot B",
    "Zone 1",
    "Zone 2",
    "Downtown",
    "Airport",
  ];
  const officerOptions = [
    "All Officers",
    "John Smith",
    "Michael Brown",
    "David Johnson",
    "Robert Wilson",
    "James Taylor",
    "Sarah Wright",
    "Adam Milner",
  ];

  return (
    <div className="min-h-screen px-4 md:px-6 py-6 space-y-8 bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)]">
            Officer{" "}
            <span className="text-[var(--color-primary)]">
              Performance Report
            </span>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
            Analyze performance of officers based on tickets issued and revenue
            generated.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <StatCard key={i} loading={true} />
          ))}
        </div>
      ) : (
        summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={<UsersRound size={22} className="text-blue-500" />}
              title="Total Officers"
              value={summary.totalOfficers}
            />

            <StatCard
              icon={<ReceiptText size={22} className="text-emerald-500" />}
              title="Total Tickets Issued"
              value={summary.totalTickets.toLocaleString()}
            />

            <StatCard
              icon={<BadgeCheck size={22} className="text-purple-500" />}
              title="Paid Tickets"
              value={summary.paidTickets.toLocaleString()}
            />

            <StatCard
              icon={<Timer size={22} className="text-orange-500" />}
              title="Pending Tickets"
              value={summary.pendingTickets.toLocaleString()}
            />

            <StatCard
              icon={<HandCoins size={22} className="text-rose-500" />}
              title="Penalty Revenue"
              value={`$${summary.totalRevenue.toLocaleString()}`}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    Officer
                  </label>
                  <select
                    value={filters.officer}
                    onChange={(e) =>
                      setFilters({ ...filters, officer: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {officerOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-[var(--color-border)] hover:bg-red-50 hover:text-red-500 transition-all w-full"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts Section */}
      <OfficerPerformanceCharts
        trendData={trendData}
        topOfficersData={topOfficersData}
        loading={loading}
        onFilterChange={handleChartFilterChange}
      />

      {/* Table Section */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base sm:text-lg font-black tracking-tight text-[var(--color-text-primary)]">
            Officer Performance Details
          </h3>
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-all"
            />
          </div>
        </div>

        {/* Table  */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
              <tr className="text-[10px] uppercase text-[var(--color-text-muted)] font-black tracking-widest">
                <th className="px-4 sm:px-6 py-4">Officer Information</th>
                <th className="px-4 sm:px-6 py-4 text-center">
                  Tickets Issued
                </th>
                <th className="px-4 sm:px-6 py-4 text-center">Paid Tickets</th>
                <th className="px-4 sm:px-6 py-4 text-center">
                  Pending Tickets
                </th>
                <th className="px-4 sm:px-6 py-4 text-center">Cancelled</th>
                <th className="px-4 sm:px-6 py-4 text-right">
                  Penalty Revenue
                </th>
                <th className="px-4 sm:px-6 py-4 text-center">Avg/Day</th>
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
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white text-xs font-bold">
                          {row.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-[var(--color-text-primary)] font-bold text-sm">
                            {row.name}
                          </div>
                          <div className="text-[10px] text-[var(--color-text-muted)]">
                            {row.officerId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center font-semibold">
                      {row.ticketsIssued}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center font-semibold text-emerald-600">
                      {row.paidTickets}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center font-semibold text-orange-500">
                      {row.pendingTickets}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center font-semibold text-rose-500">
                      {row.cancelledTickets}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right font-black text-[var(--color-text-primary)]">
                      ${row.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center font-bold text-blue-600">
                      {row.avgPerDay}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetails(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
                      >
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
        {!loading && filteredData.length > itemsPerPage && (
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
            <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} entries
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
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page ? "bg-[var(--color-primary)] text-white" : "hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]"}`}
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
      <OfficerDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        officer={selectedOfficer}
      />
    </div>
  );
}
