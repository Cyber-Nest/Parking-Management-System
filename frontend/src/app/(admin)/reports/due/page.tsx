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
  Calendar,
  AlertCircle,
  Clock,
  Search,
  Eye,
  RefreshCcw,
  ShieldAlert,
  CalendarClock,
  History,
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
import { OutstandingDetailsDrawer } from "@/components/reports/drawers/OutstandingDetailsDrawer";

// Services
import {
  outstandingDueService,
  OutstandingFilters,
  OutstandingStats,
  OutstandingTicket,
} from "@/services/outstanding-due.service";

// Helper for Days Pending Color
const getDaysColor = (days: number) => {
  if (days === 0)
    return "text-emerald-500 bg-emerald-600 dark:bg-emerald-900/40 dark:text-white";
  if (days <= 5)
    return "text-yellow-600 bg-yellow-600 dark:bg-yellow-900/40 dark:text-white";
  if (days <= 15)
    return "text-orange-500 bg-orange-600 dark:bg-orange-900/40 dark:text-white";
  return "text-rose-500 bg-rose-600 dark:bg-rose-900/40 dark:text-white";
};

export default function OutstandingDueReport() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchPlate, setSearchPlate] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  const [stats, setStats] = useState<OutstandingStats | null>(null);
  const [tickets, setTickets] = useState<OutstandingTicket[]>([]);

  // Filters
  const [filters, setFilters] = useState<OutstandingFilters>({
    dateRange: "Last 30 Days",
    dueAge: "All",
    location: "All Locations",
    officer: "All Officers",
    violationType: "All Violation Types",
    vehiclePlate: "",
    ticketStatus: "Unpaid",
    startDate: "",
    endDate: "",
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
    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    if (filters.dateRange === "Custom Range") return;

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

    setFilters((prev: OutstandingFilters) => ({
      ...prev,
      startDate: start,
      endDate: end,
    }));
  }, [filters.dateRange]);

  const filteredData = useMemo(() => {
    if (!searchPlate) return tickets;
    return tickets.filter((t) =>
      t.plateNumber.toLowerCase().includes(searchPlate.toLowerCase()),
    );
  }, [tickets, searchPlate]);

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
      const [statsRes, ticketsRes] = await Promise.all([
        outstandingDueService.getStats(filters),
        outstandingDueService.getTickets({
          ...filters,
          vehiclePlate: searchPlate,
        }),
      ]);
      setStats(statsRes);
      setTickets(ticketsRes);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load outstanding data");
    } finally {
      setLoading(false);
    }
  }, [filters, searchPlate]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      dateRange: "Last 30 Days",
      dueAge: "All",
      location: "All Locations",
      officer: "All Officers",
      violationType: "All Violation Types",
      vehiclePlate: "",
      ticketStatus: "Unpaid",
      startDate: "",
      endDate: "",
      parkingLotId: "",
    });
    setSearchPlate("");
    setCurrentPage(1);
    setShowFilters(false);
    toast("Filters reset", {
      icon: <FilterIcon />,
    });
  };

  // Export with format
  const handleExport = async (format: "pdf" | "excel") => {
    try {
      setExporting(true);
      setShowExportDropdown(false);
      const response = await outstandingDueService.exportReport({
        ...filters,
        format: format,
      });

      // Handle blob download
      if (response.blob) {
        const url = window.URL.createObjectURL(response.blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `outstanding_due_${new Date().toISOString().split("T")[0]}.${format === "pdf" ? "pdf" : "xlsx"}`,
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
  const handleViewDetails = (ticket: OutstandingTicket) => {
    setSelectedTicketId(ticket.id);
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
  const dueAgeOptions = ["All", "0-7 Days", "7-30 Days", "30+ Days"];
  const locationOptions = [
    "All Locations",
    "Downtown Lot",
    "Main Street",
    "City Center",
    "Market Street",
    "Airport Parking",
    "Residential Area",
  ];
  const officerOptions = [
    "All Officers",
    "John Smith",
    "Sarah Wright",
    "Adam Milner",
  ];
  const violationTypeOptions = [
    "All Violation Types",
    "Overtime Parking",
    "No Parking Zone",
    "Expired Meter",
    "Blocking Driveway",
  ];

  return (
    <div className="min-h-screen px-4 md:px-6 py-6 space-y-8 bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)]">
            Outstanding /{" "}
            <span className="text-[var(--color-primary)]">Due Report</span>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
            Track all unpaid penalty tickets and amounts due.
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
              icon={<AlertCircle size={22} className="text-rose-500" />}
              title={""}
              value={""}
            />
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<ShieldAlert size={22} className="text-rose-500" />}
              title="Total Outstanding Amount"
              value={`$${stats.totalOutstanding.toLocaleString()}`}
            />
            <StatCard
              icon={<CalendarClock size={22} className="text-orange-500" />}
              title="0 - 7 Days"
              value={`$${stats.days0to7.toLocaleString()}`}
            />
            <StatCard
              icon={<Clock size={22} className="text-yellow-500" />}
              title="7 - 30 Days"
              value={`$${stats.days7to30.toLocaleString()}`}
            />
            <StatCard
              icon={<History size={22} className="text-purple-500" />}
              title="30+ Days"
              value={`$${stats.days30plus.toLocaleString()}`}
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Due Age
                  </label>
                  <select
                    value={filters.dueAge}
                    onChange={(e) =>
                      setFilters({ ...filters, dueAge: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {dueAgeOptions.map((opt) => (
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
                {/* <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Vehicle Plate
                  </label>
                  <input
                    type="text"
                    placeholder="Enter plate number"
                    value={filters.vehiclePlate}
                    onChange={(e) =>
                      setFilters({ ...filters, vehiclePlate: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                </div> */}
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
                    <option>Unpaid</option>
                    <option>Paid</option>
                    <option>Cancelled</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleResetFilters}
                    className="flex-1 text-xs font-black text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-500 py-2.5 rounded-xl transition-all border border-[var(--color-border)]"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Section */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base sm:text-lg font-black tracking-tight text-[var(--color-text-primary)]">
            Outstanding Tickets
          </h3>
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by plate..."
              value={searchPlate}
              onChange={(e) => {
                setSearchPlate(e.target.value);
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
                <th className="px-4 sm:px-6 py-4">Ticket #</th>
                <th className="px-4 sm:px-6 py-4">Ticket Date</th>
                <th className="px-4 sm:px-6 py-4">Plate Number</th>
                <th className="px-4 sm:px-6 py-4">Violation Type</th>
                <th className="px-4 sm:px-6 py-4">Location</th>
                <th className="px-4 sm:px-6 py-4">Due Date</th>
                <th className="px-4 sm:px-6 py-4 text-center">Days Pending</th>
                <th className="px-4 sm:px-6 py-4 text-right">Amount</th>
                <th className="px-4 sm:px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
              {loading ? (
                <TableSkeleton rows={5} cols={9} />
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
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
                    <td className="px-4 sm:px-6 py-4 font-bold text-[var(--color-primary)]">
                      {row.ticketId}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-[11px]">
                      {row.ticketDate}
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-bold text-[var(--color-text-primary)]">
                      {row.plateNumber}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-[11px]">
                      {row.violationType}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-[11px]">
                      {row.location}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-[11px]">
                      {row.dueDate}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-black text-[10px] ${getDaysColor(row.daysPending)}`}
                      >
                        {row.daysPending}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right font-black text-[var(--color-text-primary)]">
                      ${row.amount.toFixed(2)}
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
      <OutstandingDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        ticketId={selectedTicketId}
        exportFilters={filters}
      />
    </div>
  );
}
