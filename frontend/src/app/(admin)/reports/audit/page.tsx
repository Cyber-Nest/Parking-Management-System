"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Download,
  Calendar,
  ShieldCheck,
  Info,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Logs,
  BadgeCheck,
  ShieldX,
  ShieldBan,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton } from "@/components/common/TableSkeleton";

// Services
import {
  auditLogsService,
  AuditLogFilters,
  AuditLog,
  AuditLogStats,
  getStatusColor,
} from "@/services/audit-logs.service";

export default function AuditLogsReport() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const [users, setUsers] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);

  // Filters
  const [filters, setFilters] = useState<AuditLogFilters>({
    search: "",
    dateRange: "Last 30 Days",
    user: "All Users",
    role: "All Roles",
    module: "All Modules",
    action: "All Actions",
    status: "All Status",
    startDate: "",
    endDate: "",
  });

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, logsRes, usersRes, modulesRes, actionsRes] =
        await Promise.all([
          auditLogsService.getStats(filters),
          auditLogsService.getLogs(filters),
          auditLogsService.getUsers(),
          auditLogsService.getModules(),
          auditLogsService.getActions(),
        ]);
      setStats(statsRes);
      setLogs(logsRes);
      setUsers(usersRes);
      setModules(modulesRes);
      setActions(actionsRes);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Pagination
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return logs.slice(start, start + itemsPerPage);
  }, [logs, currentPage]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: "",
      dateRange: "Last 30 Days",
      user: "All Users",
      role: "All Roles",
      module: "All Modules",
      action: "All Actions",
      status: "All Status",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
    setShowFilters(false);
    toast.info("Filters reset");
  };

  // Export
  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await auditLogsService.exportLogs(filters);
      toast.success(response.message);
    } catch (error) {
      toast.error("Failed to export logs");
    } finally {
      setExporting(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const dateRangeOptions = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "Last 30 Days",
    "This Month",
    "Custom Range",
  ];
  const roleOptions = [
    "All Roles",
    "Super Admin",
    "Admin",
    "Manager",
    "Accountant",
    "Officer",
    "Support",
    "System",
  ];
  const statusOptions = ["All Status", "success", "failed", "blocked"];

  // Active filters count
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search" && value) return true;
    if (key === "user" && value !== "All Users") return true;
    if (key === "role" && value !== "All Roles") return true;
    if (key === "module" && value !== "All Modules") return true;
    if (key === "action" && value !== "All Actions") return true;
    if (key === "status" && value !== "All Status") return true;
    return false;
  }).length;

  return (
    <div className="min-h-screen px-4 md:px-6 py-6 space-y-6 bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)]">
            Audit Logs{" "}
            <span className="text-[var(--color-primary)]">Report</span>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
            Track every important action performed in the system.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              showFilters || activeFiltersCount > 0
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
            }`}
          >
            <Filter size={16} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded-full">
                {activeFiltersCount}
              </span>
            )}
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCard key={i} loading={true} />
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard
              title="Total Logs"
              value={stats.totalLogs.toLocaleString()}
              icon={<Logs size={22} className="text-blue-500" />}
            />

            <StatCard
              title="Successful"
              value={stats.successCount.toLocaleString()}
              icon={<BadgeCheck size={22} className="text-emerald-500" />}
            />

            <StatCard
              title="Failed"
              value={stats.failedCount.toLocaleString()}
              icon={<ShieldX size={22} className="text-red-500" />}
            />

            <StatCard
              title="Blocked"
              value={stats.blockedCount.toLocaleString()}
              icon={<ShieldBan size={22} className="text-orange-500" />}
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
              {/* Quick Search Row */}
              <div className="mb-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Quick Search
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search by user, action, module or record ID..."
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) =>
                      handleFilterChange("dateRange", e.target.value)
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
                    User
                  </label>
                  <select
                    value={filters.user}
                    onChange={(e) => handleFilterChange("user", e.target.value)}
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    <option>All Users</option>
                    {users.map((user) => (
                      <option key={user}>{user}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Role
                  </label>
                  <select
                    value={filters.role}
                    onChange={(e) => handleFilterChange("role", e.target.value)}
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Module
                  </label>
                  <select
                    value={filters.module}
                    onChange={(e) =>
                      handleFilterChange("module", e.target.value)
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    <option>All Modules</option>
                    {modules.map((module) => (
                      <option key={module}>{module}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Action
                  </label>
                  <select
                    value={filters.action}
                    onChange={(e) =>
                      handleFilterChange("action", e.target.value)
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    <option>All Actions</option>
                    {actions.map((action) => (
                      <option key={action}>{action}</option>
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
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reset Button */}
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

      {/* Table Section */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
              <tr className="text-[10px] uppercase text-[var(--color-text-muted)] font-black tracking-widest">
                <th className="px-4 sm:px-6 py-4">Date & Time</th>
                <th className="px-4 sm:px-6 py-4">User</th>
                <th className="px-4 sm:px-6 py-4">Role</th>
                <th className="px-4 sm:px-6 py-4">Module</th>
                <th className="px-4 sm:px-6 py-4">Action</th>
                <th className="px-4 sm:px-6 py-4">Old Value</th>
                <th className="px-4 sm:px-6 py-4">New Value</th>
                <th className="px-4 sm:px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
              {loading ? (
                <TableSkeleton rows={5} cols={8} />
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-[var(--color-text-muted)]"
                  >
                    No audit logs available
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[var(--color-surface-soft)]/30 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 text-[11px] text-[var(--color-text-muted)] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-bold text-[var(--color-text-primary)]">
                      {log.user}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                          log.role === "Super Admin"
                            ? "bg-purple-600/40 text-white"
                            : log.role === "Manager"
                              ? "bg-emerald-600 text-white"
                              : log.role === "Accountant"
                                ? "bg-blue-600/70 text-white"
                                : log.role === "Officer"
                                  ? "bg-orange-500 text-white"
                                  : "bg-slate-600 text-white"
                        }`}
                      >
                        {log.role}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-[var(--color-text-primary)]">
                      {log.module}
                    </td>
                    <td
                      className={`px-4 sm:px-6 py-4 font-bold ${
                        log.action === "Created"
                          ? "text-emerald-600"
                          : log.action === "Updated"
                            ? "text-blue-600"
                            : log.action === "Deleted" ||
                                log.action === "Cancelled" ||
                                log.action === "User Disabled"
                              ? "text-rose-600"
                              : log.action === "Refund Issued"
                                ? "text-orange-500"
                                : "text-[var(--color-text-primary)]"
                      }`}
                    >
                      {log.action}
                    </td>
                    <td className="px-4 sm:px-6 py-4 max-w-[150px] truncate italic text-[var(--color-text-muted)]">
                      {log.oldValue}
                    </td>
                    <td className="px-4 sm:px-6 py-4 max-w-[150px] truncate font-bold text-[var(--color-primary)]">
                      {log.newValue}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${getStatusColor(log.status)}`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && logs.length > itemsPerPage && (
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
            <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, logs.length)} of{" "}
              {logs.length} logs
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
    </div>
  );
}
