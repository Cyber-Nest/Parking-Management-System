"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Download,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Search,
  DollarSign,
  Eye,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SquaresExclude,
  File,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { ReportParkingLotFilter } from "@/components/reports/ReportParkingLotFilter";
import { PenaltyReportCharts } from "@/components/reports/charts/PenaltyReportCharts";
import { PenaltyDetailsDrawer } from "@/components/reports/drawers/PenaltyDetailsDrawer";
import { truncateId } from "@/lib/truncateId";

import {
  penaltyReportService,
  PenaltyReportFilters,
  PenaltyReportSummary,
  PenaltyTicketData,
  PenaltyTrendData,
  ViolationTypeData,
} from "@/services/penalty-report.service";

// Tab Component
const TabButton = ({ active, onClick, label, count }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
      active
        ? "bg-[var(--color-primary)] text-white shadow-sm"
        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-soft)]"
    }`}
  >
    {label}
    {count !== undefined && (
      <span
        className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
          active
            ? "bg-white/20 text-white"
            : "bg-[var(--color-surface-soft)] text-[var(--color-text-muted)]"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

const defaultLast30Range = () => {
  const today = new Date();
  const end = today.toISOString().split("T")[0];
  const start = new Date(today);
  start.setDate(start.getDate() - 30);
  return { startDate: start.toISOString().split("T")[0], endDate: end };
};

export default function PenaltyReport() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "paid" | "unpaid" | "cancelled"
  >("all");
  const [chartPeriod, setChartPeriod] = useState("daily");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  const [summary, setSummary] = useState<PenaltyReportSummary | null>(null);
  const [ticketsData, setTicketsData] = useState<PenaltyTicketData[]>([]);
  const [trendData, setTrendData] = useState<PenaltyTrendData[]>([]);
  const [violationData, setViolationData] = useState<ViolationTypeData[]>([]);

  // Filters
  const penaltyInitialRange = defaultLast30Range();
  const [filters, setFilters] = useState<PenaltyReportFilters>({
    dateRange: "Last 30 Days",
    location: "All Locations",
    officer: "All Officers",
    violationType: "All Types",
    ticketStatus: "All Statuses",
    paymentStatus: "All Payments",
    minAmount: "",
    maxAmount: "",
    startDate: penaltyInitialRange.startDate,
    endDate: penaltyInitialRange.endDate,
    parkingLotId: "",
  });

  // Close export dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-set dates based on dateRange selection
  useEffect(() => {
    const today = new Date();
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (filters.dateRange === "Custom Range") {
      setFilters((prev) => ({
        ...prev,
        startDate: "",
        endDate: "",
      }));
      return;
    }

    let start = "";
    let end = "";

    switch (filters.dateRange) {
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
        const firstDayLast = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1,
        );
        const lastDayLast = new Date(today.getFullYear(), today.getMonth(), 0);
        start = formatDate(firstDayLast);
        end = formatDate(lastDayLast);
        break;
      default:
        return;
    }

    setFilters((prev) => ({ ...prev, startDate: start, endDate: end }));
  }, [filters.dateRange]);

  // Filter data based on active tab
  const filteredByTab = useMemo(() => {
    if (activeTab === "all") return ticketsData;
    if (activeTab === "paid")
      return ticketsData.filter((t) => t.status === "Paid");
    if (activeTab === "unpaid")
      return ticketsData.filter((t) => t.status === "Unpaid");
    return ticketsData.filter((t) => t.status === "Cancelled");
  }, [ticketsData, activeTab]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    return filteredByTab.filter((row) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        row.ticketId.toLowerCase().includes(query) ||
        row.date.toLowerCase().includes(query) ||
        row.violationType.toLowerCase().includes(query);

      const matchesOfficer =
        filters.officer === "All Officers" ||
        (row.officerName ?? "").toLowerCase() === filters.officer.toLowerCase();

      const matchesLocation =
        filters.location === "All Locations" ||
        row.location.toLowerCase().includes(filters.location.toLowerCase());

      const matchesViolationType =
        filters.violationType === "All Types" ||
        row.violationType.toLowerCase() === filters.violationType.toLowerCase();

      const matchesStatus =
        filters.ticketStatus === "All Statuses" ||
        row.status === filters.ticketStatus;

      const amountValue = Number(row.amount) || 0;
      const minAmountValue = Number(filters.minAmount);
      const maxAmountValue = Number(filters.maxAmount);
      const matchesMinAmount =
        filters.minAmount === "" || amountValue >= minAmountValue;
      const matchesMaxAmount =
        filters.maxAmount === "" || amountValue <= maxAmountValue;

      return (
        matchesSearch &&
        matchesOfficer &&
        matchesLocation &&
        matchesViolationType &&
        matchesStatus &&
        matchesMinAmount &&
        matchesMaxAmount
      );
    });
  }, [filteredByTab, filters, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: ticketsData.length,
      paid: ticketsData.filter((t) => t.status === "Paid").length,
      unpaid: ticketsData.filter((t) => t.status === "Unpaid").length,
      cancelled: ticketsData.filter((t) => t.status === "Cancelled").length,
    };
  }, [ticketsData]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, ticketsRes, trendRes, violationRes] =
        await Promise.all([
          penaltyReportService.getSummary(filters),
          penaltyReportService.getTicketsData(filters),
          penaltyReportService.getPenaltyTrend({
            ...filters,
            period: chartPeriod,
          }),
          penaltyReportService.getViolationTypes(filters),
        ]);
      setSummary(summaryRes);
      setTicketsData(ticketsRes);
      setTrendData(trendRes);
      setViolationData(violationRes);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load penalty data");
    } finally {
      setLoading(false);
    }
  }, [filters, chartPeriod]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Reset filters
  const handleResetFilters = () => {
    const range = defaultLast30Range();
    setFilters({
      dateRange: "Last 30 Days",
      location: "All Locations",
      officer: "All Officers",
      violationType: "All Types",
      ticketStatus: "All Statuses",
      paymentStatus: "All Payments",
      minAmount: "",
      maxAmount: "",
      startDate: range.startDate,
      endDate: range.endDate,
      parkingLotId: "",
    });
    setSearchQuery("");
    setCurrentPage(1);
    setShowFilters(false);
    toast("Filters reset");
  };

  // Export with format
  const handleExport = async (format: "pdf" | "excel") => {
    try {
      setExporting(true);
      setShowExportDropdown(false);
      const response = await penaltyReportService.exportReport({
        ...filters,
        tab: activeTab,
        format: format,
      });

      // Handle blob download
      if (response.blob) {
        const url = window.URL.createObjectURL(response.blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `penalty_report_${new Date().toISOString().split("T")[0]}.${format === "pdf" ? "pdf" : "xlsx"}`,
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

  // Handle view details
  const handleViewDetails = (row: any) => {
    setSelectedTicketId(row.ticketId);
    setIsDrawerOpen(true);
  };

  // Handle chart period change
  const handleChartPeriodChange = (period: string) => {
    setChartPeriod(period);
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
  const locationOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        ticketsData
          .map((row) => row.location)
          .filter((value) => value && value !== "—"),
      ),
    );
    return ["All Locations", ...unique];
  }, [ticketsData]);

  const officerOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        ticketsData
          .map((row) => row.officerName)
          .filter((value): value is string => Boolean(value && value !== "—")),
      ),
    );
    return ["All Officers", ...unique];
  }, [ticketsData]);

  const violationTypeOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        ticketsData
          .map((row) => row.violationType)
          .filter((value) => Boolean(value)),
      ),
    );
    return ["All Types", ...unique];
  }, [ticketsData]);
  const ticketStatusOptions = ["All Statuses", "Paid", "Unpaid", "Cancelled"];
  const paymentStatusOptions = [
    "All Payments",
    "Completed",
    "Pending",
    "Failed",
    "Refunded",
  ];

  return (
    <div className="min-h-screen px-4 md:px-6 py-6 space-y-8 bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)]">
            Penalty <span className="text-[var(--color-primary)]">Report</span>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
            Track and analyze penalty tickets, violations and penalty
            collections.
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
        summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Ticket size={22} className="text-blue-500" />}
              title="Total Tickets Issued"
              value={summary.totalTickets.toLocaleString()}
            />
            <StatCard
              icon={<CheckCircle2 size={22} className="text-emerald-500" />}
              title="Paid Tickets"
              value={summary.paidTickets.toLocaleString()}
            />
            <StatCard
              icon={<AlertCircle size={22} className="text-orange-500" />}
              title="Unpaid Tickets"
              value={summary.unpaidTickets.toLocaleString()}
            />
            <StatCard
              icon={<DollarSign size={22} className="text-rose-500" />}
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

                {/* Parking Lot Filter */}
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
                  <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Violation Type
                  </label>
                  <select
                    value={filters.violationType}
                    onChange={(e) =>
                      setFilters({ ...filters, violationType: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {violationTypeOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Ticket Status
                  </label>
                  <select
                    value={filters.ticketStatus}
                    onChange={(e) =>
                      setFilters({ ...filters, ticketStatus: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {ticketStatusOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Payment Status
                  </label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) =>
                      setFilters({ ...filters, paymentStatus: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {paymentStatusOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Fine Amount (Min)
                  </label>
                  <input
                    type="number"
                    placeholder="Min Amount"
                    value={filters.minAmount}
                    onChange={(e) =>
                      setFilters({ ...filters, minAmount: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Max Amount"
                    value={filters.maxAmount}
                    onChange={(e) =>
                      setFilters({ ...filters, maxAmount: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  />
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

      {/* Charts Section  */}
      <PenaltyReportCharts
        trendData={trendData}
        violationData={violationData}
        totalTickets={summary?.totalTickets}
        loading={loading}
        onPeriodChange={handleChartPeriodChange}
      />

      {/* Table Section with 4 Tabs */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm overflow-hidden border border-[var(--color-border)]">
        {/* Table Tabs */}
        <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              label="All Tickets"
              count={tabCounts.all}
            />
            <TabButton
              active={activeTab === "paid"}
              onClick={() => setActiveTab("paid")}
              label="Paid"
              count={tabCounts.paid}
            />
            <TabButton
              active={activeTab === "unpaid"}
              onClick={() => setActiveTab("unpaid")}
              label="Unpaid"
              count={tabCounts.unpaid}
            />
            <TabButton
              active={activeTab === "cancelled"}
              onClick={() => setActiveTab("cancelled")}
              label="Cancelled"
              count={tabCounts.cancelled}
            />
          </div>
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by ID, date or violation..."
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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
              <tr className="text-[10px] uppercase text-[var(--color-text-muted)] font-black tracking-widest">
                <th className="px-4 sm:px-6 py-4">Date</th>
                <th className="px-4 sm:px-6 py-4">Ticket ID</th>
                <th className="px-4 sm:px-6 py-4">Violation Type</th>
                <th className="px-4 sm:px-6 py-4">Location</th>
                <th className="px-4 sm:px-6 py-4">Amount</th>
                <th className="px-4 sm:px-6 py-4">Status</th>
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
                    <td className="px-4 sm:px-6 py-4 font-medium text-[var(--color-text-primary)]">
                      {row.date}
                    </td>
                    <td
                      className="px-4 sm:px-6 py-4 font-bold text-[var(--color-primary)]"
                      title={row.ticketId}
                    >
                      {truncateId(row.ticketId)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-[var(--color-text-primary)]">
                      {row.violationType}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-[var(--color-text-primary)]">
                      {row.location}
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-bold text-rose-500">
                      ${row.amount}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${
                          row.status === "Paid"
                            ? "bg-emerald-100 text-emerald-600"
                            : row.status === "Unpaid"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        {row.status}
                      </span>
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
      <PenaltyDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        ticketId={selectedTicketId}
      />
    </div>
  );
}
