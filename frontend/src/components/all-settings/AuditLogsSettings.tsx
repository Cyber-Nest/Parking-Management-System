"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Calendar,
  RotateCcw,
  ListFilter,
  X,
  History,
  User,
  LayoutGrid,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  settingsService,
  AuditLog,
  AuditLogFilters,
} from "@/services/settings.service";

// Status Badge for actions
const ActionBadge = ({ action }: { action: string }) => {
  const getStyles = () => {
    if (action.includes("Login"))
      return "bg-blue-50 text-blue-600 border-blue-100";
    if (action.includes("Created") || action.includes("Processed"))
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (action.includes("Updated") || action.includes("Changed"))
      return "bg-amber-50 text-amber-600 border-amber-100";
    if (action.includes("Refund"))
      return "bg-purple-50 text-purple-600 border-purple-100";
    if (action.includes("Cancelled") || action.includes("Disabled"))
      return "bg-red-50 text-red-600 border-red-100";
    return "bg-gray-50 text-gray-500 border-gray-100";
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStyles()}`}
    >
      {action}
    </span>
  );
};

// Module Badge
const ModuleBadge = ({ module }: { module: string }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
      <span className="text-[12px] font-bold text-[var(--color-text-primary)]">
        {module}
      </span>
    </div>
  );
};

export const AuditLogsSettings = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState<AuditLogFilters>({
    startDate: "",
    endDate: "",
    user: "All Users",
    module: "All Modules",
    action: "All Actions",
  });

  const [users, setUsers] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [logsRes, usersRes, modulesRes] = await Promise.all([
          settingsService.getAuditLogs(filters),
          settingsService.getAuditLogUsers(),
          settingsService.getAuditLogModules(),
        ]);
        setLogs(logsRes);
        setUsers(usersRes);
        setModules(modulesRes);
      } catch (error) {
        toast.error("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  // Client side search filter
  const filteredLogs = useMemo(() => {
    return logs.filter(
      (log) =>
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.module.toLowerCase().includes(search.toLowerCase()),
    );
  }, [logs, search]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-[var(--color-surface)] p-5 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs by user, action or module..."
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm font-medium focus:border-[var(--color-primary)] outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                showFilters
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/20"
                  : "bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-soft)]"
              }`}
            >
              <ListFilter size={16} />
              Advanced Filters
            </button>

            <button
              onClick={() => {
                setExporting(true);
                setTimeout(() => {
                  setExporting(false);
                  toast.success("Logs exported to CSV");
                }, 1500);
              }}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-surface-soft)] text-[var(--color-primary)] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[var(--color-primary)] hover:text-white transition-all disabled:opacity-50"
            >
              {exporting ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Export
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--color-border)] animate-in slide-in-from-top-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase ml-1">
                User
              </label>
              <select className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs font-bold outline-none">
                <option>All Users</option>
                {users.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase ml-1">
                Module
              </label>
              <select className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs font-bold outline-none">
                <option>All Modules</option>
                {modules.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase ml-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs font-bold outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase ml-1">
                End Date
              </label>
              <input
                type="date"
                className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs font-bold outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
              <tr className="text-[11px] uppercase text-[var(--color-text-secondary)] font-bold tracking-wider">
                <th className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} /> Date & Time
                  </div>
                </th>
                <th className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <User size={14} /> Admin User
                  </div>
                </th>
                <th className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <LayoutGrid size={14} /> Module
                  </div>
                </th>
                <th className="px-6 py-5">Action</th>
                <th className="px-6 py-5">Old Value</th>
                <th className="px-6 py-5">New Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-6 bg-gray-100 rounded w-full" />
                      </td>
                    </tr>
                  ))
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <History size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold">
                      No history logs found matching your criteria
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[var(--color-surface-soft)]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--color-text-primary)]">
                        {log.dateTime.split(",")[0]}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
                        {log.dateTime.split(",")[1]}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-[var(--color-primary)]">
                        {log.user}
                      </div>
                      <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">
                        {log.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ModuleBadge module={log.module} />
                    </td>
                    <td className="px-6 py-4">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="max-w-[120px] truncate font-mono text-[11px] text-red-400 bg-red-50/50 px-2 py-1 rounded border border-red-100/50"
                        title={log.oldValue}
                      >
                        {log.oldValue || "--"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="max-w-[120px] truncate font-mono text-[11px] text-emerald-600 bg-emerald-50/50 px-2 py-1 rounded border border-emerald-100/50"
                        title={log.newValue}
                      >
                        {log.newValue || "--"}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Wrapper */}
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
          <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
            Showing{" "}
            <span className="font-bold text-[var(--color-text-primary)]">
              {Math.min(
                filteredLogs.length,
                (currentPage - 1) * itemsPerPage + 1,
              )}
            </span>{" "}
            to{" "}
            <span className="font-bold text-[var(--color-text-primary)]">
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
            </span>{" "}
            of {filteredLogs.length} logs
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 rounded-lg hover:bg-white border border-[var(--color-border)] transition-all disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  currentPage === i + 1
                    ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
                    : "hover:bg-white text-[var(--color-text-secondary)] border border-transparent"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 rounded-lg hover:bg-white border border-[var(--color-border)] transition-all disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
