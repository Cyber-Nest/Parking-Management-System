"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Car,
  CircleDollarSign,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import DashboardCharts from "@/components/chart/DashboardCharts";
import { getTicketSummary, listTickets } from "@/services/tickets.service";
import { getPaymentSummary } from "@/services/payments.service";
import { getOfficerSummary } from "@/services/officers.service";
import { listParkingPlans } from "@/services/parkingPlans.service";
import { listSessions } from "@/services/sessions.service";
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("parking");
  const [isLoading, setIsLoading] = useState(true);
  const [ticketSummary, setTicketSummary] = useState<any>(null);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [officerSummary, setOfficerSummary] = useState<any>(null);
  const [planCount, setPlanCount] = useState<number>(0);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const [tSum, pSum, oSum, plansRes, recentRes, sessionsRes] = await Promise.all([
          getTicketSummary(),
          getPaymentSummary(),
          getOfficerSummary(),
          listParkingPlans(),
          listTickets({ page: 1, limit: 5 }),
          listSessions({ page: 1, limit: 5 }),
        ]);

        if (!isMounted) return;
        setTicketSummary(tSum?.data ?? null);
        setPaymentSummary(pSum?.data ?? null);
        setOfficerSummary(oSum?.data ?? null);
        setPlanCount((plansRes?.data ?? []).length);
        setRecentTickets(recentRes?.data?.items ?? []);
        setRecentSessions(sessionsRes?.data?.items ?? []);
      } catch (e) {
        console.error("[DashboardPage] load failed", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => [
    {
      label: "Total Bookings",
      value: String(planCount),
      icon: LayoutDashboard,
      color: "var(--color-primary)",
    },
    {
      label: "Active Parking",
      value: "—",
      icon: Car,
      color: "var(--color-success)",
    },
    {
      label: "Total Payment",
      value: `$${Number(paymentSummary?.todayAmount ?? 0).toFixed(2)}`,
      icon: CircleDollarSign,
      color: "var(--color-info)",
    },
    {
      label: "Unpaid Penalty",
      value: String(ticketSummary?.unpaidCount ?? 0),
      icon: AlertCircle,
      color: "var(--color-accent)",
    },
    {
      label: "Paid Penalty",
      value: String(ticketSummary?.paidCount ?? 0),
      icon: CheckCircle2,
      color: "var(--color-success)",
    },
    {
      label: "Total Revenue",
      value: `$${Number((paymentSummary?.parkingRevenue ?? 0) + (paymentSummary?.penaltyRevenue ?? 0)).toFixed(2)}`,
      icon: TrendingUp,
      color: "var(--color-primary-dark)",
    },
    {
      label: "Expired Session",
      value: "—",
      icon: Clock,
      color: "var(--color-text-muted)",
    },
    {
      label: "Today's Vehicles",
      value: String(officerSummary?.ticketsIssuedToday ?? 0),
      icon: Car,
      color: "var(--color-info)",
    },
  ], [officerSummary?.ticketsIssuedToday, paymentSummary?.todayAmount, paymentSummary?.parkingRevenue, paymentSummary?.penaltyRevenue, planCount, ticketSummary?.paidCount, ticketSummary?.unpaidCount]);

  return (
    <div className="px-4 md:px-6 py-8 space-y-8 bg-[var(--color-bg)] min-h-screen max-w-[1600px] mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h2 className="text-xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
          Dashboard{" "}
          <span className="text-[var(--color-primary)]">Overview</span>
        </h2>
        <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-semibold">
          Welcome back,{" "}
          <span className="text-[var(--color-primary)]">Admin</span>.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-5">
        {stats.map((stat, i) => {
          const IconComponent = stat.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 md:p-5 bg-white rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all flex flex-col justify-between min-h-[140px] md:min-h-[160px]"
            >
              <div className="flex justify-between items-start">
                <div
                  className="p-2 md:p-3 rounded-xl bg-opacity-10 shadow-sm"
                  style={{ backgroundColor: stat.color }}
                >
                  <IconComponent
                    size={20}
                    className="md:w-6 md:h-6"
                    style={{ color: "white" }}
                  />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[10px] md:text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider truncate">
                  {stat.label}
                </p>
                <h3 className="text-lg md:text-xl xl:text-2xl font-black text-[var(--color-text-primary)] mt-0.5 tracking-tight">
                  {stat.value}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <DashboardCharts />

      {/*Tabs Table Section */}
      <div className="bg-white rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab("parking")}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "parking"
                  ? "bg-white shadow-sm text-[var(--color-primary)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Recent Parking Sessions
            </button>
            <button
              onClick={() => setActiveTab("penalties")}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "penalties"
                  ? "bg-white shadow-sm text-[var(--color-primary)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Recent Penalties
            </button>
          </div>
          <button className="text-[var(--color-primary)] text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:opacity-80 transition-opacity">
            View All <ChevronRight size={14} />
          </button>
        </div>

        {/* Table Area */}
        <div className="overflow-x-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                <th className="px-8 py-5">Plate Number</th>
                <th className="px-8 py-5">
                  {activeTab === "parking" ? "Start Time" : "Violation"}
                </th>
                <th className="px-8 py-5">
                  {activeTab === "parking" ? "Expiry Time" : "Amount"}
                </th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">
                  {activeTab === "parking" ? "Amount" : "Date"}
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              <AnimatePresence mode="wait">
                {(activeTab === "parking"
                  ? (isLoading ? [] : recentSessions)
                  : (isLoading ? [] : recentTickets)
                ).map(
                  (row, i) => (
                    <motion.tr
                      key={`${activeTab}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-8 py-4 font-black text-[var(--color-text-primary)]">
                        {activeTab === "parking" ? row.license_plate : row.license_plate}
                      </td>
                      <td className="px-8 py-4 font-semibold text-[var(--color-text-secondary)]">
                        {activeTab === "parking"
                          ? (row.start_time ? new Date(row.start_time).toLocaleString() : "-")
                          : row.reason}
                      </td>
                      <td className="px-8 py-4 font-semibold text-[var(--color-text-secondary)]">
                        {activeTab === "parking"
                          ? (row.end_time ? new Date(row.end_time).toLocaleString() : "-")
                          : `$${Number(row.amount ?? 0).toFixed(2)}`}
                      </td>
                      <td className="px-8 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                            activeTab === "parking"
                              ? row.status === "active"
                                ? "bg-emerald-50 text-emerald-600"
                                : row.status === "expired"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-gray-100 text-gray-600"
                              : row.status === "unpaid"
                                ? "bg-red-50 text-red-600"
                                : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {String(row.status)}
                        </span>
                      </td>
                      <td className="px-8 py-4 font-black text-[var(--color-text-primary)]">
                        {activeTab === "parking"
                          ? (row.plan_name ?? "-")
                          : row.date_issued
                            ? new Date(row.date_issued).toLocaleString()
                            : "-"}
                      </td>
                    </motion.tr>
                  ),
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const mockParking = [
  {
    plate: "ABC-1234",
    col2: "May 21, 2025 08:15 AM",
    col3: "May 21, 2025 10:15 AM",
    status: "Active",
    statusColor: "bg-emerald-50 text-emerald-600",
    col5: "$2.00",
  },
  {
    plate: "GHI-9101",
    col2: "May 21, 2025 06:30 AM",
    col3: "May 21, 2025 08:30 AM",
    status: "Expired",
    statusColor: "bg-red-50 text-red-600",
    col5: "$2.00",
  },
  {
    plate: "MNO-6789",
    col2: "May 21, 2025 09:10 AM",
    col3: "May 21, 2025 11:10 AM",
    status: "Active",
    statusColor: "bg-emerald-50 text-emerald-600",
    col5: "$2.00",
  },
];

const mockPenalties = [
  {
    plate: "GHI-9101",
    col2: "Overstay Parking",
    col3: "$20.00",
    status: "Unpaid",
    statusColor: "bg-red-50 text-red-600",
    col5: "May 21, 2025 08:35 AM",
  },
  {
    plate: "STU-5678",
    col2: "Expired Ticket",
    col3: "$10.00",
    status: "Paid",
    statusColor: "bg-emerald-50 text-emerald-600",
    col5: "May 20, 2025 06:15 PM",
  },
];
