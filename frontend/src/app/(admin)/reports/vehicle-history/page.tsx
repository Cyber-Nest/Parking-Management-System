"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Car,
  DollarSign,
  Ticket,
  Undo2,
  Eye,
  FileText,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  Receipt,
  User,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { VehicleDetailsDrawer } from "@/components/reports/drawers/VehicleDetailsDrawer";
import { AddNoteDrawer } from "@/components/reports/drawers/AddNoteDrawer";

// Services
import {
  vehicleHistoryService,
  VehicleHistoryFilters,
  VehicleHistoryStats,
  ParkingSession,
  PenaltyTicket,
  PaymentRecord,
  RefundRecord,
  NoteActivity,
  VehicleSummary,
  CustomerInfo,
} from "@/services/vehicle-history.service";

//Note Action Dropdown
const NoteActionDropdown = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-soft)] transition-all"
      >
        <MoreVertical size={14} className="text-[var(--color-text-muted)]" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 top-8 z-50 w-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden"
          >
            <button
              onClick={() => {
                onEdit();
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-[var(--color-surface-soft)] flex items-center gap-2"
            >
              <Edit2 size={12} /> Edit
            </button>
            <button
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <Trash2 size={12} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

//Tab Component
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
    {count !== undefined && count > 0 && (
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

//Status Badge
const StatusBadge = ({ status, type }: { status: string; type?: string }) => {
  const getStyles = () => {
    if (status === "completed" || status === "paid" || status === "Approved")
      return "bg-emerald-500 text-emerald-600 dark:bg-emerald-900/50 dark:text-white";
    if (status === "active")
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-white";
    if (status === "expired" || status === "unpaid")
      return "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-white";
    if (status === "cancelled")
      return "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-white";
    if (status === "pending")
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-white";
    return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-white";
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${getStyles()}`}
    >
      {status}
    </span>
  );
};

export default function VehicleHistoryReport() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "sessions" | "penalties" | "payments" | "refunds" | "notes"
  >("sessions");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isVehicleDrawerOpen, setIsVehicleDrawerOpen] = useState(false);
  const [isAddNoteDrawerOpen, setIsAddNoteDrawerOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<{
    id: string;
    content: string;
    visibility: string;
  } | null>(null);
  const itemsPerPage = 10;

  const [licensePlate, setLicensePlate] = useState("");
  const [searchedPlate, setSearchedPlate] = useState("");

  // Data states
  const [stats, setStats] = useState<VehicleHistoryStats | null>(null);
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [penalties, setPenalties] = useState<PenaltyTicket[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [notesActivities, setNotesActivities] = useState<NoteActivity[]>([]);
  const [vehicleSummary, setVehicleSummary] = useState<VehicleSummary | null>(
    null,
  );
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  // Filters
  const [filters, setFilters] = useState<VehicleHistoryFilters>({
    licensePlate: "",
    customerName: "",
    dateRange: "Last 30 Days",
    location: "All Locations",
    searchIn: "All Records",
    startDate: "",
    endDate: "",
  });

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "sessions":
        return sessions;
      case "penalties":
        return penalties;
      case "payments":
        return payments;
      case "refunds":
        return refunds;
      case "notes":
        return notesActivities;
      default:
        return sessions;
    }
  };

  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentData.slice(start, start + itemsPerPage);
  }, [currentData, currentPage]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!searchedPlate) return;

    try {
      setLoading(true);
      const [
        statsRes,
        sessionsRes,
        penaltiesRes,
        paymentsRes,
        refundsRes,
        notesRes,
        vehicleRes,
        customerRes,
      ] = await Promise.all([
        vehicleHistoryService.getStats({
          ...filters,
          licensePlate: searchedPlate,
        }),
        vehicleHistoryService.getParkingSessions({
          ...filters,
          licensePlate: searchedPlate,
        }),
        vehicleHistoryService.getPenaltyTickets({
          ...filters,
          licensePlate: searchedPlate,
        }),
        vehicleHistoryService.getPayments({
          ...filters,
          licensePlate: searchedPlate,
        }),
        vehicleHistoryService.getRefunds({
          ...filters,
          licensePlate: searchedPlate,
        }),
        vehicleHistoryService.getNotesActivities({
          ...filters,
          licensePlate: searchedPlate,
        }),
        vehicleHistoryService.getVehicleSummary(searchedPlate),
        vehicleHistoryService.getCustomerInfo(searchedPlate),
      ]);
      setStats(statsRes);
      setSessions(sessionsRes);
      setPenalties(penaltiesRes);
      setPayments(paymentsRes);
      setRefunds(refundsRes);
      setNotesActivities(notesRes);
      setVehicleSummary(vehicleRes);
      setCustomerInfo(customerRes);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load vehicle history");
    } finally {
      setLoading(false);
    }
  }, [filters, searchedPlate]);

  useEffect(() => {
    if (searchedPlate) {
      fetchAllData();
    }
  }, [fetchAllData]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Handle search
  const handleSearch = () => {
    if (!licensePlate.trim()) {
      toast.error("Please enter a license plate");
      return;
    }
    setSearchedPlate(licensePlate);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      licensePlate: "",
      customerName: "",
      dateRange: "Last 30 Days",
      location: "All Locations",
      searchIn: "All Records",
      startDate: "",
      endDate: "",
    });
    toast("Filters reset");
  };

  // Add note
  const handleAddNote = async (note: string, visibility: string) => {
    const response = await vehicleHistoryService.addNote(note);
    if (response.success) {
      // Refresh notes
      const newNotes = await vehicleHistoryService.getNotesActivities({
        ...filters,
        licensePlate: searchedPlate,
      });
      setNotesActivities(newNotes);
      toast.success(response.message);
    }
  };

  // Edit note
  const handleEditNote = (note: NoteActivity) => {
    setEditingNote({
      id: note.id,
      content: note.content,
      visibility: note.visibility || "internal",
    });
    setIsAddNoteDrawerOpen(true);
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      // API call to delete note
      toast.success("Note deleted successfully");
      const newNotes = await vehicleHistoryService.getNotesActivities({
        ...filters,
        licensePlate: searchedPlate,
      });
      setNotesActivities(newNotes);
    }
  };

  const dateRangeOptions = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "Last 30 Days",
    "This Month",
    "Custom Range",
  ];
  const locationOptions = [
    "All Locations",
    "Downtown Park",
    "Central Plaza",
    "Airport Parking",
    "City Mall",
  ];
  const searchInOptions = [
    "All Records",
    "Parking Sessions",
    "Penalty Tickets",
    "Payments",
    "Refunds",
    "Notes & Activity",
  ];

  return (
    <div className="min-h-screen px-4 md:px-6 py-6 space-y-8 bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)]">
            Vehicle / Customer{" "}
            <span className="text-[var(--color-primary)]">History Report</span>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
            View complete history of a vehicle or customer across parking,
            penalties and payments.
          </p>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* License Plate */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider flex items-center gap-1.5">
                <Car size={12} /> License Plate / Vehicle Number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Car
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="ABC-123"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-all flex items-center gap-2 shadow-sm"
                >
                  <Search size={16} /> Search
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider flex items-center gap-1.5">
                <Calendar size={12} /> Date Range
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  size={16}
                />
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    setFilters({ ...filters, dateRange: e.target.value })
                  }
                  className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all appearance-none cursor-pointer"
                >
                  {dateRangeOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider flex items-center gap-1.5">
                <MapPin size={12} /> Location
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  size={16}
                />
                <select
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                  className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all appearance-none cursor-pointer"
                >
                  {locationOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                />
              </div>
            </div>

            {/* Search In */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider flex items-center gap-1.5">
                <Search size={12} /> Search In
              </label>
              <div className="relative">
                <FileText
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  size={16}
                />
                <select
                  value={filters.searchIn}
                  onChange={(e) =>
                    setFilters({ ...filters, searchIn: e.target.value })
                  }
                  className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all appearance-none cursor-pointer"
                >
                  {searchInOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="px-5 py-4 bg-[var(--color-surface-soft)]/50 border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
          >
            <RotateCcw size={16} /> Reset Filters
          </button>

          {/* View Details Button - Only shows after search */}
          {searchedPlate && (
            <button
              onClick={() => setIsVehicleDrawerOpen(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-[var(--color-primary)] text-white hover:shadow-lg transition-all"
            >
              <Eye size={16} /> View Vehicle Details
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards  */}
      {searchedPlate && !loading && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Car size={22} className="text-blue-500" />}
            title="Total Sessions"
            value={stats.totalSessions}
            subValue="Parking sessions"
          />
          <StatCard
            icon={<DollarSign size={22} className="text-emerald-500" />}
            title="Total Payments"
            value={`$${stats.totalPayments}`}
          />
          <StatCard
            icon={<Ticket size={22} className="text-orange-500" />}
            title="Total Penalties"
            value={`${stats.totalPenalties} tickets • $${stats.totalPenaltyAmount}`}
          />
          <StatCard
            icon={<Undo2 size={22} className="text-purple-500" />}
            title="Refunds"
            value={`$${stats.refunds}`}
            subValue="Amount refunded"
          />
        </div>
      )}

      {/* No Data State */}
      {!searchedPlate && (
        <div className="text-center py-16 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
          <Car
            size={48}
            className="mx-auto text-[var(--color-text-muted)] opacity-30 mb-4"
          />
          <p className="text-[var(--color-text-muted)] font-medium">
            Enter a license plate to view vehicle history
          </p>
        </div>
      )}

      {/* Main Content */}
      {searchedPlate && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)] flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap gap-2">
                <TabButton
                  active={activeTab === "sessions"}
                  onClick={() => setActiveTab("sessions")}
                  label="Parking Sessions"
                  count={sessions.length}
                />
                <TabButton
                  active={activeTab === "penalties"}
                  onClick={() => setActiveTab("penalties")}
                  label="Penalty Tickets"
                  count={penalties.length}
                />
                <TabButton
                  active={activeTab === "payments"}
                  onClick={() => setActiveTab("payments")}
                  label="Payments"
                  count={payments.length}
                />
                <TabButton
                  active={activeTab === "refunds"}
                  onClick={() => setActiveTab("refunds")}
                  label="Refunds"
                  count={refunds.length}
                />
                <TabButton
                  active={activeTab === "notes"}
                  onClick={() => setActiveTab("notes")}
                  label="Notes & Activity"
                  count={notesActivities.length}
                />
              </div>
              {activeTab === "notes" && (
                <button
                  onClick={() => {
                    setEditingNote(null);
                    setIsAddNoteDrawerOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-all"
                >
                  <Plus size={14} /> Add Note
                </button>
              )}
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
                  <tr className="text-[10px] uppercase text-[var(--color-text-muted)] font-black tracking-widest">
                    {activeTab === "sessions" && (
                      <>
                        <th className="px-4 py-4">Entry Time</th>
                        <th className="px-4 py-4">Exit Time</th>
                        <th className="px-4 py-4">Location</th>
                        <th className="px-4 py-4">Plan Type</th>
                        <th className="px-4 py-4">Duration</th>
                        <th className="px-4 py-4">Amount</th>
                        <th className="px-4 py-4">Payment Method</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Receipt</th>
                      </>
                    )}
                    {activeTab === "penalties" && (
                      <>
                        <th className="px-4 py-4">Ticket No.</th>
                        <th className="px-4 py-4">Issued Date</th>
                        <th className="px-4 py-4">Location</th>
                        <th className="px-4 py-4">Violation Type</th>
                        <th className="px-4 py-4">Amount</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Paid Date</th>
                        <th className="px-4 py-4">Receipt</th>
                      </>
                    )}
                    {activeTab === "payments" && (
                      <>
                        <th className="px-4 py-4">Payment ID</th>
                        <th className="px-4 py-4">Date & Time</th>
                        <th className="px-4 py-4">Type</th>
                        <th className="px-4 py-4">Description</th>
                        <th className="px-4 py-4">Amount</th>
                        <th className="px-4 py-4">Method</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Receipt</th>
                      </>
                    )}
                    {activeTab === "refunds" && (
                      <>
                        <th className="px-4 py-4">Refund ID</th>
                        <th className="px-4 py-4">Related To</th>
                        <th className="px-4 py-4">Type</th>
                        <th className="px-4 py-4">Date & Time</th>
                        <th className="px-4 py-4">Refund Amount</th>
                        <th className="px-4 py-4">Reason</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Processed By</th>
                      </>
                    )}
                    {activeTab === "notes" && (
                      <>
                        <th className="px-4 py-4">Note / Activity</th>
                        <th className="px-4 py-4">Added By</th>
                        <th className="px-4 py-4">Date & Time</th>
                        <th className="px-4 py-4">Visibility</th>
                        <th className="px-4 py-4 text-center">Actions</th>
                      </>
                    )}
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
                        No records found
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((row: any, idx: number) => (
                      <tr
                        key={idx}
                        className="hover:bg-[var(--color-surface-soft)]/30 transition-colors"
                      >
                        {activeTab === "sessions" && (
                          <>
                            <td className="px-4 py-3 text-[11px]">
                              {row.entryTime}
                            </td>
                            <td className="px-4 py-3 text-[11px]">
                              {row.exitTime}
                            </td>
                            <td className="px-4 py-3">{row.location}</td>
                            <td className="px-4 py-3">{row.planType}</td>
                            <td className="px-4 py-3">{row.duration}</td>
                            <td className="px-4 py-3 font-bold">
                              ${row.amount}
                            </td>
                            <td className="px-4 py-3">{row.paymentMethod}</td>
                            <td className="px-4 py-3">
                              <StatusBadge status={row.status} />
                            </td>
                            <td className="px-4 py-3 text-[var(--color-primary)]">
                              {row.receiptId}
                            </td>
                          </>
                        )}
                        {activeTab === "penalties" && (
                          <>
                            <td className="px-4 py-3 font-bold text-[var(--color-primary)]">
                              {row.ticketNo}
                            </td>
                            <td className="px-4 py-3 text-[11px]">
                              {row.issuedDate} {row.issuedTime}
                            </td>
                            <td className="px-4 py-3">{row.location}</td>
                            <td className="px-4 py-3">{row.violationType}</td>
                            <td className="px-4 py-3 font-bold text-rose-500">
                              ${row.amount}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={row.status} />
                            </td>
                            <td className="px-4 py-3 text-[11px]">
                              {row.paidDate || "-"}
                            </td>
                            <td className="px-4 py-3 text-[var(--color-primary)]">
                              {row.receiptId || "-"}
                            </td>
                          </>
                        )}
                        {activeTab === "payments" && (
                          <>
                            <td className="px-4 py-3 font-bold text-[var(--color-primary)]">
                              {row.paymentId}
                            </td>
                            <td className="px-4 py-3 text-[11px]">
                              {row.dateTime}
                            </td>
                            <td className="px-4 py-3">{row.type}</td>
                            <td className="px-4 py-3 text-[11px]">
                              {row.description}
                            </td>
                            <td className="px-4 py-3 font-bold">
                              ${row.amount}
                            </td>
                            <td className="px-4 py-3">{row.method}</td>
                            <td className="px-4 py-3">
                              <StatusBadge status={row.status} />
                            </td>
                            <td className="px-4 py-3 text-[var(--color-primary)]">
                              {row.receiptId}
                            </td>
                          </>
                        )}
                        {activeTab === "refunds" && (
                          <>
                            <td className="px-4 py-3 font-bold text-[var(--color-primary)]">
                              {row.refundId}
                            </td>
                            <td className="px-4 py-3">
                              {row.relatedTo} {row.relatedType}
                            </td>
                            <td className="px-4 py-3">{row.refundType}</td>
                            <td className="px-4 py-3 text-[11px]">
                              {row.dateTime}
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-600">
                              ${row.refundAmount}
                            </td>
                            <td className="px-4 py-3 text-[11px]">
                              {row.reason}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={row.status} />
                            </td>
                            <td className="px-4 py-3">{row.processedBy}</td>
                          </>
                        )}
                        {activeTab === "notes" && (
                          <>
                            <td className="px-4 py-3 text-sm max-w-[300px] break-words">
                              {row.content}
                            </td>
                            <td className="px-4 py-3">{row.addedBy}</td>
                            <td className="px-4 py-3 text-[11px]">
                              {row.dateTime}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                                  row.visibility === "internal"
                                    ? "bg-gray-100 text-gray-600"
                                    : row.visibility === "manager_only"
                                      ? "bg-orange-100 text-orange-600"
                                      : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                {row.visibility === "internal"
                                  ? "Internal"
                                  : row.visibility === "manager_only"
                                    ? "Manager Only"
                                    : "Public"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <NoteActionDropdown
                                onEdit={() => handleEditNote(row)}
                                onDelete={() => handleDeleteNote(row.id)}
                              />
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && currentData.length > itemsPerPage && (
              <div className="px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
                <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, currentData.length)} of{" "}
                  {currentData.length} entries
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
        </div>
      )}

      {/* Vehicle Details Drawer */}
      <VehicleDetailsDrawer
        isOpen={isVehicleDrawerOpen}
        onClose={() => setIsVehicleDrawerOpen(false)}
        vehicleSummary={vehicleSummary}
        customerInfo={customerInfo}
      />

      {/* Add/Edit Note Drawer */}
      <AddNoteDrawer
        isOpen={isAddNoteDrawerOpen}
        onClose={() => {
          setIsAddNoteDrawerOpen(false);
          setEditingNote(null);
        }}
        onSave={handleAddNote}
        editingNote={editingNote}
      />
    </div>
  );
}
