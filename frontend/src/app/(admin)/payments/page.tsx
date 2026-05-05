"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  RotateCcw,
  Bell,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  Eye,
  FileText,
  MoreVertical,
  CreditCard,
  Car,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
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
          <span className="text-sm font-bold text-[var(--color-primary)] cursor-pointer hover:underline">
            {subValue}
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

// Payment Method Badge
const MethodBadge = ({ method }: { method: string }) => {
  if (method === "Card") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded">
          VISA
        </span>
        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
          Card
        </span>
      </div>
    );
  }
  if (method === "Cash") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded">
          $
        </span>
        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
          Cash
        </span>
      </div>
    );
  }
  if (method === "Stripe") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[9px] font-black flex items-center justify-center">
          S
        </span>
        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
          Stripe
        </span>
      </div>
    );
  }
  return (
    <span className="text-xs text-[var(--color-text-secondary)]">{method}</span>
  );
};

//Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Paid: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
    Pending: "bg-orange-100 text-orange-600",
    Failed: "bg-red-100 text-red-600",
    Refunded: "bg-pink-100 text-pink-600",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${styles[status] || "bg-gray-100 text-gray-500"}`}
    >
      {status}
    </span>
  );
};

//Type Badge
const TypeBadge = ({ type }: { type: string }) => {
  const styles: Record<string, string> = {
    Parking: "bg-blue-50 text-blue-600 border border-blue-100",
    Penalty: "bg-orange-50 text-[var(--color-accent)] border border-orange-100",
    Extension: "bg-purple-50 text-purple-600 border border-purple-100",
    Refund: "bg-pink-50 text-pink-600 border border-pink-100",
    Adjustment: "bg-gray-50 text-gray-600 border border-gray-200",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${styles[type] || "bg-gray-50 text-gray-600"}`}
    >
      {type}
    </span>
  );
};

//Action Button
function ActionButton({
  icon,
  color,
  label,
}: {
  icon: React.ReactNode;
  color?: string;
  label?: string;
}) {
  return (
    <button
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-white hover:border-[var(--color-primary-light)] hover:shadow-sm transition-all group text-[12px] font-semibold"
      style={{ color: color || "var(--color-primary)" }}
    >
      <div className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      {label && <span>{label}</span>}
    </button>
  );
}

//Table Data
const payments = [
  {
    id: "PAY-100501",
    date: "May 21, 2025",
    time: "09:45 AM",
    plate: "ABC-1234",
    sessionId: "PKG-10045",
    type: "Parking",
    amount: "$2.00",
    method: "Card",
    status: "Paid",
    processedBy: "Customer",
  },
  {
    id: "PAY-100500",
    date: "May 21, 2025",
    time: "09:20 AM",
    plate: "DEF-5678",
    sessionId: "PKG-10046",
    type: "Parking",
    amount: "$10.00",
    method: "Cash",
    status: "Paid",
    processedBy: "Admin",
  },
  {
    id: "PAY-100499",
    date: "May 21, 2025",
    time: "08:55 AM",
    plate: "GHI-9101",
    sessionId: "PEN-20015",
    type: "Penalty",
    amount: "$15.00",
    method: "Stripe",
    status: "Paid",
    processedBy: "Customer",
  },
  {
    id: "PAY-100498",
    date: "May 21, 2025",
    time: "08:35 AM",
    plate: "JKL-2345",
    sessionId: "PKG-10044",
    type: "Extension",
    amount: "$3.00",
    method: "Card",
    status: "Paid",
    processedBy: "Customer",
  },
  {
    id: "PAY-100497",
    date: "May 21, 2025",
    time: "08:15 AM",
    plate: "MNO-6789",
    sessionId: "PEN-20014",
    type: "Penalty",
    amount: "$20.00",
    method: "Cash",
    status: "Pending",
    processedBy: "Admin",
  },
  {
    id: "PAY-100496",
    date: "May 21, 2025",
    time: "07:50 AM",
    plate: "PQR-3456",
    sessionId: "PKG-10043",
    type: "Parking",
    amount: "$2.00",
    method: "Stripe",
    status: "Failed",
    processedBy: "Customer",
  },
  {
    id: "PAY-100495",
    date: "May 20, 2025",
    time: "06:40 PM",
    plate: "STU-7890",
    sessionId: "REF-30010",
    type: "Refund",
    amount: "$2.00",
    method: "Card",
    status: "Refunded",
    processedBy: "Admin",
  },
];

const TYPE_TABS = ["All Types", "Parking", "Penalty", "Extension", "Refund"];
const PERIOD_TABS = [
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
  "Custom Period",
];

export default function PaymentsPage() {
  const [activePeriod, setActivePeriod] = useState("Today");
  const [activeType, setActiveType] = useState("All Types");
  const [showCustomDate, setShowCustomDate] = useState(false);

  const handlePeriodClick = (tab: string) => {
    setActivePeriod(tab);
    setShowCustomDate(tab === "Custom Period");
  };

  return (
    <div className="min-h-screen px-2 md:px-4 lg:px-4">
      {/* Header*/}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pay<span className="text-[var(--color-primary)]">ments</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            View and manage all payments
          </p>
        </div>
      </header>

      {/*Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<CreditCard size={22} className="text-[var(--color-info)]" />}
          title="Today's Payments"
          value="$1,245.00"
          subValue="18 Transactions"
        />
        <StatCard
          icon={<Car size={22} className="text-emerald-500" />}
          title="Parking Revenue"
          value="$985.00"
          subValue="12 Transactions"
        />
        <StatCard
          icon={
            <AlertTriangle size={22} className="text-[var(--color-accent)]" />
          }
          title="Penalty Revenue"
          value="$260.00"
          subValue="6 Transactions"
        />
        <StatCard
          icon={<Clock size={22} className="text-orange-400" />}
          title="Pending / Failed"
          value="$75.00"
          subValue="2 Transactions"
        />
      </div>

      {/* Filter Section  */}
      <div className="bg-[var(--color-surface)] p-5 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)] mb-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex bg-[var(--color-bg)] p-1.5 rounded-[var(--radius-md)] overflow-x-auto no-scrollbar">
              {PERIOD_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handlePeriodClick(tab)}
                  className={`px-4 py-2 text-xs font-semibold rounded-[var(--radius-sm)] whitespace-nowrap transition-all ${activePeriod === tab ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Type tabs */}
            <div className="flex bg-[var(--color-bg)] p-1.5 rounded-[var(--radius-md)] overflow-x-auto no-scrollbar">
              {TYPE_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveType(tab)}
                  className={`px-4 py-2 text-xs font-semibold rounded-[var(--radius-sm)] whitespace-nowrap transition-all ${activeType === tab ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-bg)] pt-4">
            {/* Search */}
            <div className="flex-1 min-w-[240px] relative mt-4">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by license plate or payment ID..."
                className="input pl-9 text-sm w-full"
              />
            </div>

            {/* Payment Status */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider ml-1">
                Payment Status
              </span>
              <select className="input w-auto min-w-[150px] text-xs font-medium bg-[var(--color-surface-soft)] ">
                <option>All Status</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Failed</option>
                <option>Refunded</option>
              </select>
            </div>

            {/* Payment Method */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider ml-1">
                Payment Method
              </span>
              <select className="input w-auto min-w-[150px] text-xs font-medium bg-[var(--color-surface-soft)]">
                <option>All Methods</option>
                <option>Card</option>
                <option>Cash</option>
                <option>Stripe</option>
              </select>
            </div>

            {/* <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider ml-1">From Date</span>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input type="date" defaultValue="2025-05-21" className="input pl-9 text-xs w-[150px]" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider ml-1">To Date</span>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input type="date" defaultValue="2025-05-21" className="input pl-9 text-xs w-[150px]" />
              </div>
            </div>

            <div className="flex items-end gap-2 pt-0.5">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors text-xs font-semibold">
                <RotateCcw size={15} /> CLEAR
              </button>
              <button className="btn-primary flex items-center gap-2 px-6 py-2.5">
                <Filter size={15} /> Filter
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/*Table */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
              <tr className="text-[11px] uppercase text-[var(--color-text-secondary)] font-bold tracking-wider">
                <th className="px-6 py-5">Payment ID</th>
                <th className="px-6 py-5">Date & Time</th>
                <th className="px-6 py-5">Plate No.</th>
                <th className="px-6 py-5">ID</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Method</th>
                <th className="px-6 py-5">Status</th>
                {/* <th className="px-6 py-5">Processed By</th> */}
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
              {payments.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[var(--color-surface-soft)]/50 transition-colors"
                >
                  {/* Payment ID */}
                  <td className="px-6 py-4 font-bold text-[var(--color-primary)]">
                    {row.id}
                  </td>

                  {/* Date & Time */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--color-text-primary)]">
                      {row.date}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] font-bold">
                      {row.time}
                    </div>
                  </td>

                  {/* License Plate */}
                  <td className="px-6 py-4 font-bold text-[var(--color-text-primary)]">
                    {row.plate}
                  </td>

                  {/* Session ID */}
                  <td className="px-6 py-4 font-bold text-[var(--color-primary)]">
                    {row.sessionId}
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <TypeBadge type={row.type} />
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 font-black text-sm">{row.amount}</td>

                  {/* Method */}
                  <td className="px-6 py-4">{row.method}</td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={row.status} />
                  </td>

                  {/* Processed By */}
                  {/* <td className="px-6 py-4 font-medium text-[var(--color-text-secondary)]">{row.processedBy}</td> */}

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-1.5">
                      <ActionButton icon={<Eye size={14} />} label="View" />
                      <button className="p-2 rounded-xl border border-[var(--color-border)] bg-white hover:border-[var(--color-primary-light)] hover:shadow-sm transition-all text-[var(--color-text-secondary)]">
                        <FileText size={14} />
                      </button>
                      <button className="p-2 rounded-xl border border-[var(--color-border)] bg-white hover:border-[var(--color-primary-light)] hover:shadow-sm transition-all text-[var(--color-text-secondary)]">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
          <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
            Showing{" "}
            <span className="text-[var(--color-text-primary)] font-bold">
              1 to 7
            </span>{" "}
            of 78 payments
          </p>
          <div className="flex items-center gap-1.5">
            <button className="p-2 rounded-lg hover:bg-white border border-[var(--color-border)] transition-all">
              <ChevronLeft size={16} />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${page === 1 ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20" : "hover:bg-white text-[var(--color-text-secondary)]"}`}
              >
                {page}
              </button>
            ))}
            <span className="w-9 h-9 flex items-center justify-center text-[var(--color-text-muted)] text-xs font-bold">
              ...
            </span>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white text-xs font-bold text-[var(--color-text-secondary)]">
              11
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
