"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Car,
  Wallet,
  Flag,
  RefreshCw,
  Ban,
} from "lucide-react";

import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import toast from "react-hot-toast";
import { ActionDropdown } from "@/components/active-parking/ActionDropdown";
import { SessionDetailsDrawer } from "@/components/active-parking/SessionDetailsDrawer";

// Services
import {
  parkingService,
  ParkingSession,
  DashboardStats,
} from "@/services/parking.service";

// Helper Functions
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const isSameDay = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  return (
    s.getDate() === e.getDate() &&
    s.getMonth() === e.getMonth() &&
    s.getFullYear() === e.getFullYear()
  );
};

const PlanBadge = ({ plan }: { plan: string }) => {
  const styles: Record<string, string> = {
    "2 Hours": "bg-blue-50 text-blue-600 border-blue-100",
    "1 Day": "bg-purple-50 text-purple-600 border-purple-100",
    "1 Hour": "bg-orange-50 text-orange-500 border-orange-100",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${styles[plan] || "bg-gray-50 text-gray-600 border-gray-200"}`}
    >
      {plan}
    </span>
  );
};

export default function ActiveParkingSessionsPage() {
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalActive: "0",
    expiringSoon: "0",
    unpaidIssues: "0",
    todayRevenue: "$0",
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<ParkingSession | null>(
    null,
  );
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const itemsPerPage = 10;

  const showToast = (message: string, type: "success" | "error" | "info") => {
    if (type === "success") toast.success(message);
    else if (type === "error") toast.error(message);
    else toast(message, { icon: 'ℹ️' });
  };

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, sessionRes] = await Promise.all([
          parkingService.getStats(),
          parkingService.getParkingSessions(),
        ]);
        setStats(statsRes);
        setSessions(sessionRes);
      } catch (error) {
        console.error(error);
        showToast("Failed to load parking sessions", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch =
        session.plate.toLowerCase().includes(search.toLowerCase()) ||
        session.id.toLowerCase().includes(search.toLowerCase());
      const matchesPlan =
        planFilter === "All Plans" ? true : session.plan === planFilter;
      const matchesStatus =
        statusFilter === "All Status"
          ? true
          : session.paymentStatus === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [sessions, search, planFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSessions.slice(start, start + itemsPerPage);
  }, [filteredSessions, currentPage]);

  // Action Handlers
  const handleView = (session: ParkingSession) => {
    setSelectedSession(session);
    setIsDetailsDrawerOpen(true);
  };

  const handleExtend = (session: ParkingSession) => {
    const updated = sessions.map((item) => {
      if (item.id === session.id) {
        const newExpiryTime = new Date(
          new Date(item.expiryTime).getTime() + 60 * 60 * 1000,
        );
        return {
          ...item,
          expiryTime: newExpiryTime.toISOString(),
          remaining: `${Math.floor(newExpiryTime.getHours() - new Date().getHours())}H ${Math.abs(newExpiryTime.getMinutes() - new Date().getMinutes())}M`,
          extensions: [
            ...item.extensions,
            {
              id: Date.now().toString(),
              duration: "1 Hour",
              amount: "$1.00",
              extendedAt: new Date().toLocaleString(),
            },
          ],
        };
      }
      return item;
    });
    setSessions(updated);
    showToast(`Session ${session.id} extended by 1 hour`, "success");
  };

  const handleCancel = (session: ParkingSession) => {
    const updated = sessions.map((item) => {
      if (item.id === session.id) {
        return {
          ...item,
          sessionStatus: "cancelled" as const,
          cancelledAt: new Date().toLocaleString(),
          cancelledBy: "Admin",
          cancelReason: "Cancelled manually by admin.",
        };
      }
      return item;
    });
    setSessions(updated as any);
    showToast(`Session ${session.id} has been cancelled`, "success");
  };

  const handleIssue = (session: ParkingSession) => {
    const updated = sessions.map((item) => {
      if (item.id === session.id) {
        return {
          ...item,
          sessionStatus: "issue" as const,
          issues: [
            ...item.issues,
            {
              id: Date.now().toString(),
              reason: "Manual Review Required",
              notes: "Marked by admin.",
              markedAt: new Date().toLocaleString(),
              markedBy: "Admin",
            },
          ],
        };
      }
      return item;
    });
    setSessions(updated as any);
    showToast(`Issue marked for session ${session.id}`, "info");
  };

  const handleResetFilters = () => {
    setSearch("");
    setPlanFilter("All Plans");
    setStatusFilter("All Status");
    setCurrentPage(1);
    showToast("All filters cleared", "info");
  };

  return (
    <>
      <div className="min-h-screen px-4 bg-[var(--color-bg)]">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          {/* <div>
            <h1 className="text-2xl font-black tracking-tight">
              Active Parking{" "}
              <span className="text-[var(--color-primary)]">Sessions</span>
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Manage and track all currently running parking sessions
            </p>
          </div> */}
          <div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
              Active Parking{" "}
              <span className="text-[var(--color-primary)]">Sessions</span>
            </h1>

            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
              Manage and track all currently running parking sessions
            </p>
          </div>
        </header>

        {/* Stats - Using Common StatCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Car size={22} className="text-emerald-500" />}
            title="Total Active"
            value={stats.totalActive}
            trend="12 from yesterday"
            trendUp
          />
          <StatCard
            icon={<Clock size={22} className="text-orange-400" />}
            title="Expiring Soon"
            value={stats.expiringSoon}
            trend="High Volume"
          />
          <StatCard
            icon={<Flag size={22} className="text-red-400" />}
            title="Unpaid / Issues"
            value={stats.unpaidIssues}
            trend="2 from yesterday"
          />
          <StatCard
            icon={<Wallet size={22} className="text-[var(--color-primary)]" />}
            title="Today's Revenue"
            value={stats.todayRevenue}
            trend="18.5% last week"
            trendUp
          />
        </div>

        {/* Filters */}
        <div className="bg-[var(--color-surface)] p-4 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)] mb-6">
          <div className="flex flex-wrap items-center gap-3">
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
                placeholder="Search by plate number or session ID..."
                className="input pl-10 text-sm w-full bg-[var(--color-surface-soft)]/50"
              />
            </div>

            <div className="hidden lg:block w-[1px] h-8 bg-[var(--color-border)] mx-1" />

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={planFilter}
                onChange={(e) => {
                  setPlanFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input w-auto min-w-[130px] text-xs font-bold bg-[var(--color-surface-soft)] cursor-pointer"
              >
                <option>All Plans</option>
                <option>1 Hour</option>
                <option>2 Hours</option>
                <option>3 Hours</option>
                <option>1 Day</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input w-auto min-w-[130px] text-xs font-bold bg-[var(--color-surface-soft)] cursor-pointer"
              >
                <option>All Status</option>
                <option>Paid</option>
                <option>Unpaid</option>
                <option>Failed</option>
              </select>

              <button
                onClick={handleResetFilters}
                className="p-2.5 border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors"
                title="Reset Filters"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden border border-[var(--color-border)]">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
                <tr className="text-[11px] uppercase text-[var(--color-text-secondary)] font-bold tracking-wider">
                  <th className="px-6 py-5">Session & Plan</th>
                  <th className="px-6 py-5">License Plate</th>
                  <th className="px-6 py-5">Time Frame</th>
                  <th className="px-6 py-5">Remaining</th>
                  <th className="px-6 py-5 text-center">Payment</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
                {loading ? (
                  <TableSkeleton rows={5} cols={7} />
                ) : paginatedSessions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-16 text-sm font-semibold text-gray-400"
                    >
                      No parking sessions found.
                    </td>
                  </tr>
                ) : (
                  paginatedSessions.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-[var(--color-surface-soft)]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--color-primary)]">
                          {row.id}
                        </div>
                        <div className="mt-1">
                          <PlanBadge plan={row.plan} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--color-text-primary)]">
                          {row.plate}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-secondary)]">
                          {row.vehicle}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isSameDay(row.startTime, row.expiryTime) ? (
                          <>
                            <div className="text-xs font-semibold text-[var(--color-text-primary)]">
                              {formatDate(row.startTime)}
                            </div>
                            <div className="text-[11px] text-[var(--color-text-muted)] font-bold uppercase mt-0.5">
                              {formatTime(row.startTime)} -{" "}
                              {formatTime(row.expiryTime)}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-xs font-semibold text-[var(--color-text-primary)]">
                              {formatDate(row.startTime)} -{" "}
                              {formatTime(row.startTime)}
                            </div>
                            <div className="text-[11px] text-[var(--color-text-muted)] font-bold uppercase mt-0.5">
                              {formatDate(row.expiryTime)} -{" "}
                              {formatTime(row.expiryTime)}
                            </div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`flex items-center gap-1.5 ${row.urgent ? "text-red-500" : "text-emerald-600"}`}
                        >
                          <Clock size={14} />
                          <span className="font-black text-xs uppercase tracking-tight">
                            {row.remaining}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                            row.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {row.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-sm">
                        {row.amount}
                      </td>
                      <td className="px-6 py-4">
                        <ActionDropdown
                          session={row}
                          onView={handleView}
                          onExtend={handleExtend}
                          onCancel={handleCancel}
                          onIssue={handleIssue}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
            <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Showing{" "}
              <span className="font-bold text-[var(--color-text-primary)]">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-[var(--color-text-primary)]">
                {Math.min(currentPage * itemsPerPage, filteredSessions.length)}
              </span>{" "}
              of {filteredSessions.length} sessions
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
                disabled={currentPage === totalPages}
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

      {/* Session Details Drawer */}
      <SessionDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        session={selectedSession}
      />
    </>
  );
}
