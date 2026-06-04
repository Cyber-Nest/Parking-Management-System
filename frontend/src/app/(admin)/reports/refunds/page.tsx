"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Download,
  Calendar,
  RefreshCcw,
  Undo2,
  GitCompare,
  Wallet,
  ArrowDownUp,
  Search,
  Eye,
  Printer,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  FilterIcon,
  File,
  SquaresExclude,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { ReportParkingLotFilter } from "@/components/reports/ReportParkingLotFilter";
import { RefundsCharts } from "@/components/reports/charts/RefundsCharts";
import { RefundDetailsDrawer } from "@/components/reports/drawers/RefundDetailsDrawer";

// Services
import {
  refundsAdjustmentsService,
  RefundAdjustmentFilters,
  RefundAdjustmentStats,
  RefundAdjustmentData,
  OverTimeData,
  ReasonData,
} from "@/services/refunds-adjustments.service";

export default function RefundsAdjustmentsReport() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  // Data states
  const [stats, setStats] = useState<RefundAdjustmentStats | null>(null);
  const [tableData, setTableData] = useState<RefundAdjustmentData[]>([]);
  const [overTimeData, setOverTimeData] = useState<OverTimeData[]>([]);
  const [reasonData, setReasonData] = useState<ReasonData[]>([]);
  const [chartDays, setChartDays] = useState(30);

  // Filters
  const [filters, setFilters] = useState<RefundAdjustmentFilters>({
    dateRange: "Last 30 Days",
    type: "All Types",
    reason: "All Reasons",
    location: "All Locations",
    processedBy: "All Users",
    status: "All Statuses",
    startDate: "",
    endDate: "",
    parkingLotId: "",
  });

  // Close export dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-set dates based on dateRange selection
  useEffect(() => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    if (filters.dateRange === "Custom Range") return;
    
    let start = "";
    let end = "";
    
    switch(filters.dateRange) {
      case "Today":
        start = formatDate(today);
        end = formatDate(today);
        break;
      case "Yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        start = formatDate(yesterday);
        end = formatDate(yesterday);
        break;
      case "Last 7 Days":
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        start = formatDate(last7);
        end = formatDate(today);
        break;
      case "Last 30 Days":
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        start = formatDate(last30);
        end = formatDate(today);
        break;
      case "This Month":
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        start = formatDate(firstDay);
        end = formatDate(lastDay);
        break;
      case "Last Month":
        const firstDayLast = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLast = new Date(today.getFullYear(), today.getMonth(), 0);
        start = formatDate(firstDayLast);
        end = formatDate(lastDayLast);
        break;
      default:
        return;
    }
    
    setFilters((prev: RefundAdjustmentFilters) => ({ ...prev, startDate: start, endDate: end }));
  }, [filters.dateRange]);

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery) return tableData;
    const query = searchQuery.toLowerCase();
    return tableData.filter(
      (row) =>
        row.referenceId.toLowerCase().includes(query) ||
        row.plateUser.toLowerCase().includes(query) ||
        row.reason.toLowerCase().includes(query),
    );
  }, [tableData, searchQuery]);

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
      const [statsRes, tableRes, overTimeRes, reasonRes] = await Promise.all([
        refundsAdjustmentsService.getStats(filters),
        refundsAdjustmentsService.getTableData(filters),
        refundsAdjustmentsService.getOverTimeData(chartDays),
        refundsAdjustmentsService.getReasonData(),
      ]);
      setStats(statsRes);
      setTableData(tableRes);
      setOverTimeData(overTimeRes);
      setReasonData(reasonRes);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load refunds data");
    } finally {
      setLoading(false);
    }
  }, [filters, chartDays]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      dateRange: "Last 30 Days",
      type: "All Types",
      reason: "All Reasons",
      location: "All Locations",
      processedBy: "All Users",
      status: "All Statuses",
      startDate: "",
      endDate: "",
      parkingLotId: "",
    });
    setChartDays(30);
    setSearchQuery("");
    setCurrentPage(1);
    setShowFilters(false);
    toast("Filters reset", {
      icon: (
        <RotateCcw size={16} className="text-[var(--color-text-secondary)]" />
      ),
    });
  };

  // Export with format
  const handleExport = async (format: "pdf" | "excel") => {
    try {
      setExporting(true);
      setShowExportDropdown(false);
      const response = await refundsAdjustmentsService.exportReport({
        ...filters,
        format: format,
      });
      
      // Handle blob download
      if (response.blob) {
        const url = window.URL.createObjectURL(response.blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `refunds_adjustments_${new Date().toISOString().split('T')[0]}.${format === "pdf" ? "pdf" : "xlsx"}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success(`Report exported as ${format.toUpperCase()}`);
      } else {
        toast.success(response.message || `Report exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setExporting(false);
    }
  };

  // Handle chart days change
  const handleChartDaysChange = (days: number) => {
    setChartDays(days);
  };

  // Handle view details
  const handleViewDetails = (item: RefundAdjustmentData) => {
    setSelectedItemId(item.id);
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
  const typeOptions = ["All Types", "Refund", "Adjustment"];
  const reasonOptions = [
    "All Reasons",
    "Customer Request",
    "Duplicate Payment",
    "Overpayment",
    "System Adjustment",
    "Other",
  ];
  const locationOptions = [
    "All Locations",
    "Lot A",
    "Lot B",
    "Downtown",
    "Airport",
  ];
  const userOptions = [
    "All Users",
    "Admin User",
    "Manager User",
    "Accountant User",
    "Officer User",
    "System",
  ];
  const statusOptions = ["All Statuses", "Completed", "Pending", "Failed"];

  const totalAmount = reasonData.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className="min-h-screen px-4 md:px-4 space-y-8 bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)]">
            Refunds &{" "}
            <span className="text-[var(--color-primary)]">
              Adjustments Report
            </span>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
            Review all refunds and manual adjustments processed in the system.
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
          
          {/* Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
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
            
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-36 bg-[var(--color-surface)] rounded-xl shadow-lg border border-[var(--color-border)] overflow-hidden z-10">
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-[var(--color-surface-soft)] transition-colors flex items-center gap-2"
                >
                  <File size={16} className="text-red-500" /> PDF
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-[var(--color-surface-soft)] transition-colors flex items-center gap-2 border-t border-[var(--color-border)]"
                >
                  <SquaresExclude size={16} className="text-green-500" /> Excel
                </button>
              </div>
            )}
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
              icon={undefined}
              title={""}
              value={""}
            />
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Undo2 size={22} className="text-rose-500" />}
              title="Total Refunds"
              value={`$${stats.totalRefunds.toLocaleString()}`}
            />
            <StatCard
              icon={<GitCompare size={22} className="text-emerald-500" />}
              title="Total Adjustments"
              value={`$${stats.totalAdjustments.toLocaleString()}`}
            />
            <StatCard
              icon={<Wallet size={22} className="text-purple-500" />}
              title="Net Amount"
              value={`$${stats.netAmount.toLocaleString()}`}
            />
            <StatCard
              icon={<ArrowDownUp size={22} className="text-blue-500" />}
              title="Total Transactions"
              value={stats.totalTransactions}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                
                {/* Custom Date Range Inputs */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Parking Lot
                  </label>
                  <ReportParkingLotFilter
                    value={filters.parkingLotId ?? ""}
                    onChange={(value) => {
                      setFilters({ ...filters, parkingLotId: value });
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {filters.dateRange === "Custom Range" && (
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                )}
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Reason
                  </label>
                  <select
                    value={filters.reason}
                    onChange={(e) =>
                      setFilters({ ...filters, reason: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {reasonOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                {/* <div className="space-y-1.5">
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
                </div> */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Processed By
                  </label>
                  <select
                    value={filters.processedBy}
                    onChange={(e) =>
                      setFilters({ ...filters, processedBy: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {userOptions.map((opt) => (
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
                  <RotateCcw size={16} /> Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts Section */}
      <RefundsCharts
        overTimeData={overTimeData}
        reasonData={reasonData}
        loading={loading}
        totalAmount={totalAmount}
        onDaysChange={handleChartDaysChange}
      />

      {/* Table Section */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base sm:text-lg font-black tracking-tight text-[var(--color-text-primary)]">
            Refunds & Adjustments Details
          </h3>
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by ID, plate or reason..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
              <tr className="text-[10px] uppercase text-[var(--color-text-muted)] font-black tracking-widest">
                <th className="px-4 sm:px-6 py-4">Date & Time</th>
                {/* <th className="px-4 sm:px-6 py-4">Type</th> */}
                <th className="px-4 sm:px-6 py-4">Reference ID</th>
                <th className="px-4 sm:px-6 py-4">Related To</th>
                <th className="px-4 sm:px-6 py-4">Plate / User</th>
                <th className="px-4 sm:px-6 py-4 text-right">Amount</th>
                <th className="px-4 sm:px-6 py-4">Status</th>
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
                    <td className="px-4 sm:px-6 py-4 text-[11px] whitespace-nowrap">
                      {row.dateTime}
                    </td>
                    {/* <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${row.type === "Refund" ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"}`}
                      >
                        {row.type}
                      </span>
                    </td> */}
                    <td className="px-4 sm:px-6 py-4 font-mono text-[11px] font-bold text-[var(--color-primary)]">
                      {row.referenceId}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-[11px] text-[var(--color-text-muted)]">
                      {row.relatedTo}
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-bold text-[11px]">
                      {row.plateUser}
                    </td>
                    <td
                      className={`px-4 sm:px-6 py-4 text-right font-black text-[12px] ${row.amount < 0 ? "text-rose-500" : "text-emerald-600"}`}
                    >
                      {row.amount < 0
                        ? `-$${Math.abs(row.amount).toFixed(2)}`
                        : `+$${row.amount.toFixed(2)}`}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-600">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetails(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
                      >
                        <Eye size={12} /> View
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
      <RefundDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        itemId={selectedItemId}
      />
    </div>
  );
}