"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ParkingCircle,
  Ticket,
  Undo2,
  Eye,
  RotateCcw,
  File,
  SquaresExclude,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { RevenueCharts } from "@/components/reports/charts/RevenueCharts";
import ViewDetailsDrawer from "@/components/reports/drawers/RevenueDrawer";
import {
  reportsService,
  RevenueFilters,
  RevenueSummary,
  RevenueDaily,
  RevenueByType,
  RevenueByPaymentMethod,
  RevenueTimeData,
} from "@/services/reports.service";

export default function RevenueReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const itemsPerPage = 10;

  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [dailyData, setDailyData] = useState<RevenueDaily[]>([]);
  const [revenueByType, setRevenueByType] = useState<RevenueByType[]>([]);
  const [revenueByPayment, setRevenueByPayment] = useState<
    RevenueByPaymentMethod[]
  >([]);
  const [timeData, setTimeData] = useState<RevenueTimeData[]>([]);
  const [selectedDateOption, setSelectedDateOption] = useState(""); // Filters
  const [filters, setFilters] = useState<RevenueFilters>({
    paymentMethod: "All Methods",
    revenueType: "All Types",
    planType: "All Plans",
    startDate: "",
    endDate: "",
  });

  const [chartPeriod, setChartPeriod] = useState("daily");

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, dailyRes, byTypeRes, byPaymentRes, timeRes] =
        await Promise.all([
          reportsService.getRevenueSummary(filters),
          reportsService.getRevenueDaily(filters),
          reportsService.getRevenueByType(filters),
          reportsService.getRevenueByPaymentMethod(filters),
          reportsService.getRevenueTimeData({
            ...filters,
            period: chartPeriod,
          }),
        ]);
      setSummary(summaryRes);
      setDailyData(dailyRes);
      setRevenueByType(byTypeRes);
      setRevenueByPayment(byPaymentRes);
      setTimeData(timeRes);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  }, [filters, chartPeriod]);

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
      paymentMethod: "All Methods",
      revenueType: "All Types",
      planType: "All Plans",
      startDate: "",
      endDate: "",
    });
    setSelectedDateOption("");
    setChartPeriod("daily");
    setCurrentPage(1);
    setShowFilters(false);
    toast("Filters reset");
  };

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      setExporting(true);

      // Close dropdown
      const dropdown = document.getElementById("exportDropdown");
      if (dropdown) dropdown.classList.add("hidden");

      // Call API with format parameter
      const response = await reportsService.exportRevenueReport({
        ...filters,
        format: format,
      });

      // Handle file download
      if (response.blob) {
        const url = window.URL.createObjectURL(response.blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `revenue_report_${new Date().toISOString().split("T")[0]}.${format === "pdf" ? "pdf" : "xlsx"}`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success(`Report exported as ${format.toUpperCase()}`);
      } else {
        toast.success(
          response.message || `Report exported as ${format.toUpperCase()}`,
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setExporting(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById("exportDropdown");
      const target = event.target as HTMLElement;
      if (
        dropdown &&
        !dropdown.contains(target) &&
        !target.closest(".relative")
      ) {
        dropdown.classList.add("hidden");
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle chart period change
  const handlePeriodChange = (period: string) => {
    setChartPeriod(period);
  };

  // Handle view details
  const handleViewDetails = (row: any) => {
    setSelectedRow(row);
    setIsDrawerOpen(true);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Prepare chart data from API
  const lineChartData = timeData.map((item) => ({
    name: item.date,
    revenue: item.revenue,
  }));

  const typeChartData = revenueByType.map((item) => ({
    name: item.name,
    value: item.value,
    color: item.color,
  }));

  const paymentChartData = revenueByPayment.map((item) => ({
    name: item.name,
    value: item.value,
    color: item.color,
  }));

  return (
    <div className="min-h-screen px-4 md:px-6 py-6 space-y-8 bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
            Revenue <span className="text-[var(--color-primary)]">Reports</span>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
            Track all revenue and financial performance.
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

          <div className="relative">
            <button
              onClick={() => {
                // Show dropdown
                const dropdown = document.getElementById("exportDropdown");
                if (dropdown) dropdown.classList.toggle("hidden");
              }}
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

            {/* Dropdown Menu */}
            <div
              id="exportDropdown"
              className="hidden absolute right-0 mt-2 w-36 bg-[var(--color-surface)] rounded-xl shadow-lg border border-[var(--color-border)] overflow-hidden z-10"
            >
              <button
                onClick={() => handleExport("pdf")}
                className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-[var(--color-surface-soft)] transition-colors flex items-center gap-2"
              >
                <File size={16} /> PDF
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-[var(--color-surface-soft)] transition-colors flex items-center gap-2 border-t border-[var(--color-border)]"
              >
                <SquaresExclude size={16} /> Excel
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCard
              key={i}
              loading={true}
              title={""}
              value={""}
              icon={<></>}
            />
          ))}
        </div>
      ) : (
        summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<DollarSign size={22} className="text-emerald-500" />}
              title="Total Revenue"
              value={formatCurrency(summary.totalRevenue)}
            />
            <StatCard
              icon={<ParkingCircle size={22} className="text-blue-500" />}
              title="Parking Revenue"
              value={formatCurrency(summary.parkingRevenue)}
            />
            <StatCard
              icon={<Ticket size={22} className="text-rose-500" />}
              title="Penalty Revenue"
              value={formatCurrency(summary.penaltyRevenue)}
            />
            <StatCard
              icon={<Undo2 size={22} className="text-orange-500" />}
              title="Refunds"
              value={formatCurrency(Math.abs(summary.refunds))}
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <option>All Methods</option>
                    <option>Card</option>
                    <option>Cash</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Revenue Type
                  </label>
                  <select
                    value={filters.revenueType}
                    onChange={(e) =>
                      setFilters({ ...filters, revenueType: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    <option>All Types</option>
                    <option>Parking</option>
                    <option>Penalty</option>
                    <option>Refund</option>
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
                    <option>All Plans</option>
                    <option>Hourly</option>
                    <option>Daily</option>
                    <option>Monthly</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Date Range
                  </label>
                  <select
                    value={selectedDateOption}
                    onChange={(e) => {
                      setSelectedDateOption(e.target.value);
                      if (e.target.value !== "custom") {
                        // Reset custom dates if not custom
                        setFilters({ ...filters, startDate: "", endDate: "" });
                      }
                    }}
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    <option value="">Select Date Range</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last7">Last 7 Days</option>
                    <option value="last30">Last 30 Days</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="custom">📅 Custom Range</option>
                  </select>
                </div>
              </div>

              {/* Custom Date Range Inputs  Show only when custom is selected */}
              {selectedDateOption === "custom" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-5 pt-4 border-t border-[var(--color-border)]"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                          setFilters({ ...filters, startDate: e.target.value })
                        }
                        className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                          setFilters({ ...filters, endDate: e.target.value })
                        }
                        className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                  </div>

                  {/* Show selected range preview */}
                  {filters.startDate && filters.endDate && (
                    <div className="mt-3 text-xs text-[var(--color-text-secondary)] bg-[var(--color-primary)]/5 p-2 rounded-lg">
                      📅 Selected:{" "}
                      {new Date(filters.startDate).toLocaleDateString()} -{" "}
                      {new Date(filters.endDate).toLocaleDateString()}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Reset Button Row */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleResetFilters}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-[var(--color-border)] hover:bg-red-50 hover:text-red-500 transition-all"
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
      <RevenueCharts
        lineData={lineChartData}
        typeData={typeChartData}
        paymentData={paymentChartData}
        loading={loading}
        onPeriodChange={handlePeriodChange}
      />
      {/* Table Section */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
              <tr className="text-[10px] uppercase text-[var(--color-text-muted)] font-black tracking-widest">
                <th className="px-4 sm:px-6 py-4">Date</th>
                <th className="px-4 sm:px-6 py-4">Parking Revenue</th>
                <th className="px-4 sm:px-6 py-4">Penalty Revenue</th>
                <th className="px-4 sm:px-6 py-4">Refunds</th>
                <th className="px-4 sm:px-6 py-4">Net Revenue</th>
                <th className="px-4 sm:px-6 py-4">Transactions</th>
                <th className="px-4 sm:px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
              {loading ? (
                <TableSkeleton rows={5} cols={7} />
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
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
                      ${row.parkingRevenue.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      ${row.penaltyRevenue.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-red-500">
                      -${Math.abs(row.refunds).toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-bold text-emerald-600">
                      ${row.netRevenue.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {row.transactions.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          handleViewDetails({
                            date: row.date,
                            parking: row.parkingRevenue,
                            penalty: row.penaltyRevenue,
                            refund: row.refunds,
                            net: row.netRevenue,
                            txns: row.transactions,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
                      >
                        <Eye size={12} />
                        View Detail
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
      <ViewDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={selectedRow}
      />
    </div>
  );
}
