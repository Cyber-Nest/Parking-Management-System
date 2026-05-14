"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Ticket,
  ReceiptText,
  BadgeCheck,
  Wallet,
  Filter,
  TrendingUp,
  TrendingDown,
  X,
} from "lucide-react";

import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { TicketActionDropdown } from "@/components/penalty/TicketActionDropdown";
import { TicketDetailsDrawer } from "@/components/penalty/TicketDetailsDrawer";
import { AddNoteDrawer } from "@/components/penalty/AddNoteDrawer";
import { PhotoGalleryDrawer } from "@/components/penalty/PhotoGalleryDrawer";

import {
  penaltyService,
  PenaltyTicket,
  PenaltyStats,
} from "@/services/penalty.service";
import {
  markTicketPaid,
  cancelTicket,
  addTicketNote,
} from "@/services/tickets.service";
import { EditTicketDrawer } from "@/components/penalty/EditTicketDrawer";
import toast from "react-hot-toast";

const PERIOD_TABS = [
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
  "Custom Period",
];

// Helper functions for date filtering
const isToday = (dateStr: string) => {
  const ticketDate = new Date(dateStr);
  const today = new Date();
  return ticketDate.toDateString() === today.toDateString();
};

const isYesterday = (dateStr: string) => {
  const ticketDate = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return ticketDate.toDateString() === yesterday.toDateString();
};

const isThisWeek = (dateStr: string) => {
  const ticketDate = new Date(dateStr);
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return ticketDate >= startOfWeek && ticketDate <= endOfWeek;
};

const isThisMonth = (dateStr: string) => {
  const ticketDate = new Date(dateStr);
  const today = new Date();
  return ticketDate.getMonth() === today.getMonth() && 
         ticketDate.getFullYear() === today.getFullYear();
};

const isInDateRange = (dateStr: string, startDate: Date, endDate: Date) => {
  const ticketDate = new Date(dateStr);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return ticketDate >= start && ticketDate <= end;
};

export default function PenaltyTicketsPage() {
  const [tickets, setTickets] = useState<PenaltyTicket[]>([]);
  const [stats, setStats] = useState<PenaltyStats>({
    totalTickets: "0",
    unpaidTickets: "0",
    paidTickets: "0",
    totalPenaltyAmount: "$0",
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Yesterday");
  const [showCustomDate, setShowCustomDate] = useState(false);
  
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [officerFilter, setOfficerFilter] = useState("All Officers");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<PenaltyTicket | null>(
    null,
  );
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [noteTicket, setNoteTicket] = useState<PenaltyTicket | null>(null);
  const [photoTicket, setPhotoTicket] = useState<PenaltyTicket | null>(null);

  const [editTicket, setEditTicket] = useState<PenaltyTicket | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const itemsPerPage = 10;

  const refreshTickets = async () => {
    const [statsRes, ticketsRes] = await Promise.all([
      penaltyService.getPenaltyStats(),
      penaltyService.getPenaltyTickets({ limit: 200, page: 1 }),
    ]);
    setStats(statsRes);
    setTickets(ticketsRes);
  };

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await refreshTickets();
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter by Period (Date Range)
  const filterByPeriod = (ticket: PenaltyTicket) => {
    const issueDateTime = `${ticket.issueDate} ${ticket.issueTime}`;
    
    switch(activeTab) {
      case "Today":
        return isToday(ticket.issueDate);
      case "Yesterday":
        return isYesterday(ticket.issueDate);
      case "This Week":
        return isThisWeek(ticket.issueDate);
      case "This Month":
        return isThisMonth(ticket.issueDate);
      case "Custom Period":
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          return isInDateRange(ticket.issueDate, start, end);
        }
        return true; // If dates not selected, show all
      default:
        return true;
    }
  };

  // Filtered Tickets with all filters applied
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.id.toLowerCase().includes(search.toLowerCase()) ||
        ticket.plate.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All Status" ? true : ticket.status === statusFilter;
      const matchesOfficer =
        officerFilter === "All Officers"
          ? true
          : ticket.officer === officerFilter;
      const matchesPeriod = filterByPeriod(ticket);
      
      return matchesSearch && matchesStatus && matchesOfficer && matchesPeriod;
    });
  }, [tickets, search, statusFilter, officerFilter, activeTab, customStartDate, customEndDate]);

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(start, start + itemsPerPage);
  }, [filteredTickets, currentPage]);

  // Handlers
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setShowCustomDate(tab === "Custom Period");
    setCurrentPage(1);
    // Reset custom dates when switching away from Custom Period
    if (tab !== "Custom Period") {
      setCustomStartDate("");
      setCustomEndDate("");
    }
  };

  const handleViewDetails = (ticket: PenaltyTicket) => {
    setSelectedTicket(ticket);
    setIsDetailsDrawerOpen(true);
  };

  const handleViewPhotos = (ticket: PenaltyTicket) => {
    setPhotoTicket(ticket);
    setIsPhotoGalleryOpen(true);
  };

  const handleReprint = (ticket: PenaltyTicket) => {
    console.log("Generate ticket PDF:", ticket.id);
    toast.success(`Reprinting ticket: ${ticket.id}`);
  };

<<<<<<< HEAD
  const handleMarkPaid = async (ticket: PenaltyTicket) => {
    try {
      await markTicketPaid(ticket.id, { payment_method: "visa" });
      toast.success(`Ticket ${ticket.ticketNo || ticket.id} marked as paid`);
      await refreshTickets();
    } catch (e) {
      console.error(e);
      toast.error("Could not mark ticket paid");
    }
  };

  const handleCancel = async (ticket: PenaltyTicket) => {
    try {
      await cancelTicket(ticket.id);
      toast.success(`Ticket ${ticket.ticketNo || ticket.id} cancelled`);
      await refreshTickets();
    } catch (e) {
      console.error(e);
      toast.error("Could not cancel ticket");
    }
=======
  const handleMarkPaid = (ticket: PenaltyTicket) => {
    const updated = tickets.map((item) => {
      if (item.id === ticket.id) {
        return {
          ...item,
          status: "Paid" as const,
          paymentStatus: "Paid",
          paymentMethod: "Cash",
          paymentId: "PAY-" + Date.now(),
          transactionReference:
            "txn_" + Math.random().toString(36).substring(2, 8),
          paidAt: new Date().toLocaleString(),
        };
      }
      return item;
    });
    setTickets(updated as any);
    toast.success(`Ticket ${ticket.id} marked as paid`);
  };

  const handleCancel = (ticket: PenaltyTicket) => {
    const updated = tickets.map((item) => {
      if (item.id === ticket.id) {
        return {
          ...item,
          status: "Cancelled" as const,
          cancelledBy: "Admin",
          cancelledAt: new Date().toLocaleString(),
          cancelReason: "Cancelled manually by admin.",
        };
      }
      return item;
    });
    setTickets(updated as any);
    toast.success(`Ticket ${ticket.id} has been cancelled`);
>>>>>>> 6d20be75aa1e0b07e3b0dfadc5ae76b7d82dce33
  };

  const handleEdit = (ticket: PenaltyTicket) => {
    setEditTicket(ticket);
    setIsEditOpen(true);
  };

  const handleAddNote = (ticket: PenaltyTicket) => {
    setNoteTicket(ticket);
    setIsNoteDrawerOpen(true);
  };

  const handleSaveNote = async (noteText: string) => {
    if (!noteTicket) return;
    try {
      await addTicketNote(noteTicket.id, noteText);
      toast.success("Note saved");
      setIsNoteDrawerOpen(false);
      setNoteTicket(null);
      await refreshTickets();
    } catch (e) {
      console.error(e);
      toast.error("Could not save note");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
    setOfficerFilter("All Officers");
    setCurrentPage(1);
    setActiveTab("Today");
    setShowCustomDate(false);
    setCustomStartDate("");
    setCustomEndDate("");
    toast("All filters cleared");
  };

  // Get unique officers from tickets for filter dropdown
  const uniqueOfficers = useMemo(() => {
    const officers = new Set(tickets.map(ticket => ticket.officer));
    return ["All Officers", ...Array.from(officers)];
  }, [tickets]);

  return (
    <>
      <div className="min-h-screen px-2 md:px-4 lg:px-4 bg-[var(--color-bg)]">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
              Penalty{" "}
              <span className="text-[var(--color-primary)]">Tickets</span>
            </h1>

            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
              Manage and track all issued penalty tickets
            </p>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Ticket size={22} className="text-[var(--color-info)]" />}
            title="Total Tickets"
            value={stats.totalTickets}
          />
          <StatCard
            icon={
              <ReceiptText size={22} className="text-[var(--color-accent)]" />
            }
            title="Unpaid Tickets"
            value={stats.unpaidTickets}
            subValue="$1,120.00"
          />
          <StatCard
            icon={
              <BadgeCheck size={22} className="text-[var(--color-success)]" />
            }
            title="Paid Tickets"
            value={stats.paidTickets}
            subValue="$720.00"
          />
          <StatCard
            icon={
              <Wallet size={22} className="text-[var(--color-primary-light)]" />
            }
            title="Total Penalty Amount"
            value={stats.totalPenaltyAmount}
          />
        </div>

        {/* Filters */}
        <div className="bg-[var(--color-surface)] p-5 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)] mb-6">
          <div className="flex flex-col gap-5">
            {/* Period Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex bg-[var(--color-bg)] p-1.5 rounded-[var(--radius-md)] overflow-x-auto no-scrollbar">
                {PERIOD_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabClick(tab)}
                    className={`px-5 py-2 text-xs font-semibold rounded-[var(--radius-sm)] whitespace-nowrap transition-all ${
                      activeTab === tab
                        ? "bg-white text-[var(--color-primary)] shadow-sm"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Status & Officer Filters */}
              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input w-auto min-w-[140px] text-xs font-medium bg-[var(--color-surface-soft)]"
                >
                  <option>All Status</option>
                  <option>Paid</option>
                  <option>Unpaid</option>
                  <option>Cancelled</option>
                </select>

                <select
                  value={officerFilter}
                  onChange={(e) => {
                    setOfficerFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input w-auto min-w-[140px] text-xs font-medium bg-[var(--color-surface-soft)]"
                >
                  {uniqueOfficers.map((officer) => (
                    <option key={officer} value={officer}>
                      {officer}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search & Custom Date */}
            <div className="flex flex-wrap items-center gap-4 border-t border-[var(--color-bg)] pt-4">
              {showCustomDate && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                    />
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => {
                        setCustomStartDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="input pl-9 text-xs w-[150px]"
                      placeholder="Start Date"
                    />
                  </div>
                  <span className="text-[var(--color-text-muted)] text-xs font-bold">
                    TO
                  </span>
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => {
                        setCustomEndDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="input pl-9 text-xs w-[150px]"
                      placeholder="End Date"
                    />
                  </div>
                  {(customStartDate || customEndDate) && (
                    <button
                      onClick={() => {
                        setCustomStartDate("");
                        setCustomEndDate("");
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}

              <div className="flex-1 min-w-[280px] relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  size={18}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by ticket no. or license plate..."
                  className="input pl-10 text-sm"
                />
              </div>

              <button
                onClick={handleClearFilters}
                className="btn-primary flex items-center gap-2 px-6"
              >
                <Filter size={18} />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden border border-[var(--color-border)]">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
                <tr className="text-[11px] uppercase text-[var(--color-text-secondary)] font-bold tracking-wider">
                  <th className="px-6 py-5">Ticket No.</th>
                  <th className="px-6 py-5">License Plate</th>
                  <th className="px-6 py-5">Violation Type</th>
                  <th className="px-6 py-5">Location</th>
                  <th className="px-6 py-5">Officer</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Issue Date & Time</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
                {loading ? (
                  <TableSkeleton rows={5} cols={9} />
                ) : paginatedTickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-16 text-sm font-semibold text-gray-400"
                    >
                      No tickets found for the selected period.
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((ticket, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-[var(--color-surface-soft)]/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-[var(--color-primary)]">
                        {ticket.ticketNo || ticket.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-[var(--color-text-primary)]">
                        {ticket.plate}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-orange-50 text-[var(--color-accent)] text-[11px] font-bold border border-orange-100">
                          {ticket.violationType}
                        </span>
                       </td>
                      <td className="px-6 py-4 font-medium text-[var(--color-text-secondary)]">
                        {ticket.location}
                       </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-[var(--color-text-primary)]">
                            {ticket.officer}
                          </div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">
                            {ticket.officerId}
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4 font-black text-sm">
                        {ticket.amount}
                       </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                            ticket.status === "Unpaid"
                              ? "bg-orange-100 text-[var(--color-accent-dark)]"
                              : ticket.status === "Cancelled"
                                ? "bg-red-100 text-red-600"
                                : "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                          }`}
                        >
                          {ticket.status}
                        </span>
                       </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[var(--color-text-primary)]">
                          {ticket.issueDate}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)] font-bold">
                          {ticket.issueTime}
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <TicketActionDropdown
                          ticket={ticket}
                          onViewDetails={handleViewDetails}
                          onViewPhotos={handleViewPhotos}
                          onReprint={handleReprint}
                          onMarkPaid={handleMarkPaid}
                          onCancel={handleCancel}
                          onEdit={handleEdit}
                          onAddNote={handleAddNote}
                        />
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
            <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Showing{" "}
              <span className="text-[var(--color-text-primary)] font-bold">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="text-[var(--color-text-primary)] font-bold">
                {Math.min(currentPage * itemsPerPage, filteredTickets.length)}
              </span>{" "}
              of {filteredTickets.length} tickets
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-lg hover:bg-white border border-[var(--color-border)] transition-all disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
                        : "hover:bg-white text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="p-2 rounded-lg hover:bg-white border border-[var(--color-border)] transition-all disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawers */}
      <TicketDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        ticket={selectedTicket}
      />
      <AddNoteDrawer
        isOpen={isNoteDrawerOpen}
        onClose={() => setIsNoteDrawerOpen(false)}
        onSave={handleSaveNote}
      />
      <PhotoGalleryDrawer
        isOpen={isPhotoGalleryOpen}
        onClose={() => setIsPhotoGalleryOpen(false)}
        photos={photoTicket?.evidencePhotos || []}
        ticketId={photoTicket?.id || ""}
      />
      <EditTicketDrawer
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditTicket(null);
        }}
        ticket={editTicket}
        onSaved={() => void refreshTickets()}
      />
    </>
  );
}