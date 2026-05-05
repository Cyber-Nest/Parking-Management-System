"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  XCircle,
  RefreshCw,
  Flag,
  Eye,
  Car,
  Wallet,
  TrendingUp,
  TrendingDown,
  Download,
  RotateCcw,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

//Stat Card
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

//Badges
const PlanBadge = ({ plan }: { plan: string }) => {
  const styles: Record<string, string> = {
    "2 Hours": "bg-blue-50 text-blue-600 border-blue-100",
    "1 Day": "bg-purple-50 text-purple-600 border-purple-100",
    "1 Hour": "bg-orange-50 text-orange-500 border-orange-100",
    "3 Hours": "bg-teal-50 text-teal-600 border-teal-100",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${styles[plan] || "bg-gray-50 text-gray-600 border-gray-200"}`}
    >
      {plan}
    </span>
  );
};

// Main Page
export default function ActiveParkingSessionsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="min-h-screen p-4 md:p-4 lg:p-4">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Active Parking{" "}
            <span className="text-[var(--color-primary)]">Sessions</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Manage and track all currently running parking sessions
          </p>
        </div>
      </header>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Car size={22} className="text-emerald-500" />}
          title="Total Active"
          value="124"
          trend="12 from yesterday"
          trendUp
        />
        <StatCard
          icon={<Clock size={22} className="text-orange-400" />}
          title="Expiring Soon"
          value="18"
          subValue="15%"
          trend="High Volume"
        />
        <StatCard
          icon={<XCircle size={22} className="text-red-400" />}
          title="Unpaid / Issues"
          value="06"
          trend="2 from yesterday"
        />
        <StatCard
          icon={<Wallet size={22} className="text-[var(--color-primary)]" />}
          title="Today's Revenue"
          value="$245.00"
          trend="18.5% last week"
          trendUp
        />
      </div>

      {/* Filter & Search Section*/}
      <div className="bg-[var(--color-surface)] p-4 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)] mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[280px] relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by plate number or session ID..."
              className="input pl-10 text-sm w-full bg-[var(--color-surface-soft)]/50"
            />
          </div>

          <div className="hidden lg:block w-[1px] h-8 bg-[var(--color-border)] mx-1" />

          {/*Filters Group  */}
          <div className="flex flex-wrap items-center gap-2">
            <select className="input w-auto min-w-[130px] text-xs font-bold bg-[var(--color-surface-soft)] cursor-pointer">
              <option>All Plans</option>
              <option>1 Hour</option>
              <option>1 Day</option>
            </select>

            <select className="input w-auto min-w-[130px] text-xs font-bold bg-[var(--color-surface-soft)] cursor-pointer">
              <option>All Status</option>
              <option>Active</option>
              <option>Expiring</option>
            </select>

            <div className="relative">
              <Calendar
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                type="date"
                defaultValue="2025-05-21"
                className="input pl-9 text-xs w-[150px] bg-[var(--color-surface-soft)]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                className="p-2.5 border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors"
                title="Reset"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*Main Data Table*/}
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
              {[
                {
                  id: "PKG-10045",
                  plate: "ABC-1234",
                  vehicle: "Toyota Vios (White)",
                  plan: "2 Hours",
                  remaining: "1h 20m",
                  status: "Paid",
                  amount: "$2.00",
                  urgent: false,
                },
                {
                  id: "PKG-10047",
                  plate: "GHI-9101",
                  vehicle: "Ford Ranger (Blue)",
                  plan: "1 Hour",
                  remaining: "25m",
                  status: "Unpaid",
                  amount: "$1.00",
                  urgent: true,
                },
                {
                  id: "PKG-10050",
                  plate: "PQR-3456",
                  vehicle: "Hyundai Accent (Red)",
                  plan: "2 Hours",
                  remaining: "Expired",
                  status: "Failed",
                  amount: "$2.00",
                  urgent: true,
                },
              ].map((row, idx) => (
                <tr
                  key={idx}
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
                    <div className="text-xs font-semibold text-[var(--color-text-primary)]">
                      May 21, 2025
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] font-bold uppercase mt-0.5">
                      08:15 AM - 10:15 AM
                    </div>
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
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${row.status === "Paid" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-sm text-[var(--color-text-primary)]">
                    {row.amount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <ActionButton icon={<Eye size={15} />} />
                      <ActionButton
                        icon={<RefreshCw size={15} />}
                        color="var(--color-success)"
                      />
                      <ActionButton
                        icon={<Flag size={15} />}
                        color="var(--color-accent)"
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
              1 to 6
            </span>{" "}
            of 124 sessions
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
