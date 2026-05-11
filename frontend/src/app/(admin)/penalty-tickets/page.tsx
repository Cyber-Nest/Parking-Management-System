"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  RotateCcw,
  Image as ImageIcon,
  Printer,
  CheckCircle2,
  XCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Info,
  Calendar,
  Ticket,
  ReceiptText,
  BadgeCheck,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { getTicketSummary, listTickets, TicketStatus } from "@/services/tickets.service";

const StatCard = ({ icon, title, value, subValue, trend, trendUp }: any) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-5 bg-white rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col justify-between"
  >
    <div className="flex justify-between items-start">
      <div className="p-3 rounded-2xl bg-gray-50 flex items-center justify-center">
        {icon}
      </div>
      {trend && (
        <div
          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
        >
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </div>
      )}
    </div>

    <div className="mt-4">
      <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
        {title}
      </p>
      <div className="flex items-baseline gap-2 mt-1">
        <h3 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
          {value}
        </h3>
        {subValue && (
          <span className="text-sm font-bold text-[var(--color-text-secondary)] opacity-70">
            ({subValue})
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

export default function PenaltyTicketsPage() {
  const [activeTab, setActiveTab] = useState("Today");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All Status" | "Paid" | "Unpaid">("All Status");
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setShowCustomDate(tab === "Custom Period");
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      try {
        setIsLoading(true);

        const statusParam: TicketStatus | undefined =
          status === "All Status" ? undefined : status === "Paid" ? "paid" : "unpaid";

        const [summaryRes, listRes] = await Promise.all([
          getTicketSummary(),
          listTickets({ page: 1, limit: 20, q: q || undefined, status: statusParam }),
        ]);

        if (!isMounted) return;
        setSummary(summaryRes?.data ?? null);
        setTickets(listRes?.data?.items ?? []);
        setTotal(listRes?.data?.total ?? 0);
      } catch (e) {
        console.error("[PenaltyTicketsPage] load failed", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void fetchAll();
    return () => {
      isMounted = false;
    };
  }, [q, status, activeTab]);

  const rows = useMemo(() => (isLoading ? [] : tickets), [isLoading, tickets]);

  return (
    <div className="min-h-screen p-4 md:p-4 lg:p-4">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Penalty <span className="text-[var(--color-primary)]">Tickets</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Manage and track all issued penalty tickets
          </p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Ticket size={22} className="text-[var(--color-info)]" />}
          title="Total Tickets Today"
          value={String(summary?.totalToday ?? 0)}
          trend="12 from yesterday"
          trendUp
        />
        <StatCard
          icon={
            <ReceiptText size={22} className="text-[var(--color-accent)]" />
          }
          title="Unpaid Tickets"
          value={String(summary?.unpaidCount ?? 0)}
          subValue={`$${Number(summary?.unpaidAmount ?? 0).toFixed(2)}`}
        />
        <StatCard
          icon={
            <BadgeCheck size={22} className="text-[var(--color-success)]" />
          }
          title="Paid Tickets"
          value={String(summary?.paidCount ?? 0)}
          subValue={`$${Number(summary?.paidAmount ?? 0).toFixed(2)}`}
        />
        <StatCard
          icon={
            <Wallet size={22} className="text-[var(--color-primary-light)]" />
          }
          title="Total Penalty Amount"
          value={`$${Number(summary?.totalPenaltyAmount ?? 0).toFixed(2)}`}
          trend="18.5% last week"
          trendUp
        />
      </div>

      {/* Filter & Search */}
      <div className="bg-[var(--color-surface)] p-5 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)] mb-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex bg-[var(--color-bg)] p-1.5 rounded-[var(--radius-md)] overflow-x-auto no-scrollbar">
              {[
                "Today",
                "Yesterday",
                "This Week",
                "This Month",
                "Custom Period",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`px-5 py-2 text-xs font-semibold rounded-[var(--radius-sm)] whitespace-nowrap transition-all ${activeTab === tab ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <select
                className="input w-auto min-w-[140px] text-xs font-medium bg-[var(--color-surface-soft)]"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option>All Status</option>
                <option>Paid</option>
                <option>Unpaid</option>
              </select>
              <select className="input w-auto min-w-[160px] text-xs font-medium hidden lg:block bg-[var(--color-surface-soft)]">
                <option>Violation Types</option>
              </select>
              <select className="input w-auto min-w-[140px] text-xs font-medium bg-[var(--color-surface-soft)]">
                <option>All Officers</option>
                <option>John Smith</option>
                <option>Adam</option>
              </select>
            </div>
          </div>

          {/* Conditional Custom Date Picker & Search Row */}
          <div className="flex flex-wrap items-center gap-4 border-t border-[var(--color-bg)] pt-4">
            {showCustomDate && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  />
                  <input type="date" className="input pl-9 text-xs w-[150px]" />
                </div>
                <span className="text-[var(--color-text-muted)] text-xs font-bold">
                  TO
                </span>
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  />
                  <input type="date" className="input pl-9 text-xs w-[150px]" />
                </div>
              </div>
            )}

            <div className="flex-1 min-w-[280px] relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by ticket no. or license plate..."
                className="input pl-10 text-sm"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2.5 border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors">
                <RotateCcw size={18} />
              </button>
              <button className="btn-primary flex items-center gap-2 px-6">
                <Filter size={18} /> Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
              <tr className="text-[11px] uppercase text-[var(--color-text-secondary)] font-bold tracking-wider">
                <th className="px-6 py-5">Ticket No.</th>
                <th className="px-6 py-5">License Plate</th>
                <th className="px-6 py-5">Violation Type</th>
                <th className="px-6 py-5">Location / Zone</th>
                <th className="px-6 py-5">Officer</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Issue Date & Time</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[var(--color-surface-soft)]/50 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-[var(--color-primary)]">
                    {row.ticket_number}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[var(--color-text-primary)]">
                      {row.license_plate}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-secondary)]" />
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-orange-50 text-[var(--color-accent)] text-[11px] font-bold border border-orange-100">
                      {row.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-[var(--color-text-secondary)]">
                    -
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-bold text-[var(--color-text-primary)]">
                          {row.officer_name}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">
                          {row.officer_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-sm">
                    ${Number(row.amount ?? 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                        row.status === "unpaid"
                          ? "bg-orange-100 text-[var(--color-accent-dark)]"
                          : "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                      }`}
                    >
                      {String(row.status).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--color-text-primary)]">
                      {row.date_issued ? new Date(row.date_issued).toLocaleDateString() : "-"}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] font-bold">
                      {row.date_issued ? new Date(row.date_issued).toLocaleTimeString() : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <ActionButton icon={<ImageIcon size={15} />} />
                      <ActionButton icon={<Printer size={15} />} />
                      <ActionButton
                        icon={<CheckCircle2 size={15} />}
                        color="var(--color-success)"
                      />
                      <ActionButton
                        icon={<XCircle size={15} />}
                        color="#EF4444"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/*Pagination */}
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
          <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
            Showing{" "}
            <span className="text-[var(--color-text-primary)] font-bold">
              1 to {rows.length}
            </span>{" "}
            of {total} tickets
          </p>
          <div className="flex items-center gap-1.5">
            <button className="p-2 rounded-lg hover:bg-white border border-[var(--color-border)] transition-all">
              <ChevronLeft size={16} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold shadow-md shadow-[var(--color-primary)]/20">
              1
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white text-xs font-bold text-[var(--color-text-secondary)]">
              2
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white text-xs font-bold text-[var(--color-text-secondary)]">
              3
            </button>
            <button className="p-2 rounded-lg hover:bg-white border border-[var(--color-border)] transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  color,
}: {
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      className="p-2.5 rounded-xl border border-[var(--color-border)] bg-white hover:border-[var(--color-primary-light)] hover:shadow-sm transition-all group"
      style={{ color: color || "var(--color-primary)" }}
    >
      <div className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </button>
  );
}
