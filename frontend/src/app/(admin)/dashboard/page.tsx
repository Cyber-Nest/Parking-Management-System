"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

// Components
import { TableSkeleton } from "@/components/common/TableSkeleton";
import DashboardCharts from "@/components/chart/DashboardCharts";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { DashboardStatsSkeleton } from "@/components/dashboard/DashboardStatsSkeleton";

//Services
import { dashboardService } from "@/services/dashboard.service";
import type { StatCard, TableRow } from "@/services/dashboard.service";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"parking" | "penalties">(
    "parking",
  );
  const [stats, setStats] = useState<StatCard[]>([]);
  const [allParkingData, setAllParkingData] = useState<TableRow[]>([]);
  const [allPenaltyData, setAllPenaltyData] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();
  const itemsPerPage = 10; //10 items per page for table

  const currentAllData = useMemo(() => {
    return activeTab === "parking" ? allParkingData : allPenaltyData;
  }, [activeTab, allParkingData, allPenaltyData]);

  const totalPages = Math.max(1, Math.ceil(currentAllData.length / itemsPerPage));

  const paginatedTableData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentAllData.slice(start, start + itemsPerPage);
  }, [currentAllData, currentPage]);

  const handleTabChange = (tab: "parking" | "penalties") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  //data fetching
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [statsRes, parkingRes, penaltiesRes] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getParkingSessions(),
          dashboardService.getPenaltySessions(),
        ]);

        setStats(statsRes);
        setAllParkingData(parkingRes);
        setAllPenaltyData(penaltiesRes);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="px-4 md:px-4 space-y-8 bg-[var(--color-bg)] min-h-screen max-w-[1600px] mx-auto">
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

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-2xl p-4">
          {error}
        </div>
      )}

      {/* Stats  */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-5">
        {loading ? (
          <DashboardStatsSkeleton />
        ) : (
          stats.map((stat, i) => (
            <DashboardStatCard key={stat.id} stat={stat} index={i} />
          ))
        )}
      </div>

      {/* Charts*/}
      <DashboardCharts />

      {/* Tabs Table Section */}
      <div className="bg-[var(--color-surface)] rounded-2xl sm:rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex flex-wrap justify-between items-center gap-4">
          <div className="flex bg-[var(--color-surface-soft)] p-1 rounded-2xl">
            <button
              onClick={() => handleTabChange("parking")}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${activeTab === "parking"
                ? "bg-[var(--color-surface)] shadow-sm text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
            >
              Recent Parking Sessions
            </button>
            <button
              onClick={() => handleTabChange("penalties")}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${activeTab === "penalties"
                ? "bg-[var(--color-surface)] shadow-sm text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
            >
              Recent Penalties
            </button>
          </div>

          <button
            onClick={() => {
              if (activeTab === "parking") {
                router.push("/active-parking");
              } else {
                router.push("/penalty-tickets");
              }
            }}
            className="text-[var(--color-primary)] text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        {/* Mobile Card View (< 768px) */}
        <div className="block md:hidden divide-y divide-[var(--color-border)]">
          {loading ? (
            <TableSkeleton rows={4} cols={5} variant="card" />
          ) : paginatedTableData.length === 0 ? (
            <div className="text-center py-16 text-sm font-semibold text-[var(--color-text-muted)]">
              No records found.
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {paginatedTableData.map((row, i) => (
                <motion.div
                  key={`${activeTab}-${row.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 space-y-3 hover:bg-[var(--color-surface-soft)]/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                        Plate Number
                      </p>
                      <p className="font-black text-[var(--color-text-primary)] text-base">
                        {row.plate}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${row.statusColor}`}
                    >
                      {row.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                        {activeTab === "parking" ? "Start Time" : "Violation"}
                      </p>
                      <p className="text-sm font-semibold text-[var(--color-text-secondary)] break-words">
                        {row.col2}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                        {activeTab === "parking" ? "Expiry Time" : "Amount"}
                      </p>
                      <p className="text-sm font-semibold text-[var(--color-text-secondary)] break-words">
                        {row.col3}
                      </p>
                    </div>
                  </div>

                  <div className="pt-1">
                    <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      {activeTab === "parking" ? "Amount" : "Date"}
                    </p>
                    <p className="font-black text-[var(--color-text-primary)]">
                      {row.col5}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Desktop Table View (≥ 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-[var(--color-surface-soft)]">
              <tr className="text-[10px] uppercase font-black text-[var(--color-text-muted)] tracking-widest">
                <th className="px-6 sm:px-8 py-4 sm:py-5">Plate Number</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">
                  {activeTab === "parking" ? "Start Time" : "Violation"}
                </th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">
                  {activeTab === "parking" ? "Expiry Time" : "Amount"}
                </th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Status</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">
                  {activeTab === "parking" ? "Amount" : "Date"}
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[var(--color-border)]">
              {loading ? (
                <TableSkeleton rows={4} cols={5} />
              ) : paginatedTableData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-16 text-sm font-semibold text-[var(--color-text-muted)]"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="wait">
                  {paginatedTableData.map((row, i) => (
                    <motion.tr
                      key={`${activeTab}-${row.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-[var(--color-surface-soft)]/50 transition-colors group"
                    >
                      <td className="px-6 sm:px-8 py-4 font-black text-[var(--color-text-primary)]">
                        {row.plate}
                      </td>
                      <td className="px-6 sm:px-8 py-4 font-semibold text-[var(--color-text-secondary)]">
                        {row.col2}
                      </td>
                      <td className="px-6 sm:px-8 py-4 font-semibold text-[var(--color-text-secondary)]">
                        {row.col3}
                      </td>
                      <td className="px-6 sm:px-8 py-4">
                        <span
                          className={`px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-tight ${row.statusColor}`}
                        >
                          {String(row.status)}
                        </span>
                      </td>
                      <td className="px-6 sm:px-8 py-4 font-black text-[var(--color-text-primary)]">
                        {row.col5}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && currentAllData.length > itemsPerPage && (
          <div className="px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
            <p className="text-[11px] sm:text-[12px] font-medium text-[var(--color-text-secondary)]">
              Showing{" "}
              <span className="font-bold text-[var(--color-text-primary)]">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-[var(--color-text-primary)]">
                {Math.min(currentPage * itemsPerPage, currentAllData.length)}
              </span>{" "}
              of {currentAllData.length} records
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-lg hover:bg-[var(--color-surface)] border border-[var(--color-border)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="rotate-180" size={16} />
              </button>
              {Array.from(
                { length: Math.min(totalPages, 5) },
                (_, i) => i + 1,
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === page
                    ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
                    : "hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
                    }`}
                >
                  {page}
                </button>
              ))}
              {totalPages > 5 && (
                <>
                  <span className="text-[var(--color-text-muted)]">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === totalPages
                      ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
                      : "hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
                      }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="p-2 rounded-lg hover:bg-[var(--color-surface)] border border-[var(--color-border)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
