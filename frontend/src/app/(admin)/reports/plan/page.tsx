"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Download,
  Calendar,
  Tag,
  BarChart3,
  Users,
  Clock,
  Search,
  Filter,
  RotateCcw,
  Eye,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  File,
  SquaresExclude,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { ReportParkingLotFilter } from "@/components/reports/ReportParkingLotFilter";
import { PlanPerformanceCharts } from "@/components/reports/charts/PlanPerformanceCharts";
import { PlanDetailsDrawer } from "@/components/reports/drawers/PlanDetailsDrawer";

// Services
import {
  planPerformanceService,
  PlanPerformanceFilters,
  PlanPerformanceSummary,
  PlanData,
  RevenueByPlanData,
  PlansSoldData,
  RevenueTrendData,
} from "@/services/plan-performance.service";

export default function PlanPerformanceReport() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  const [summary, setSummary] = useState<PlanPerformanceSummary | null>(null);
  const [planData, setPlanData] = useState<PlanData[]>([]);
  const [revenueByPlan, setRevenueByPlan] = useState<RevenueByPlanData[]>([]);
  const [plansSoldData, setPlansSoldData] = useState<PlansSoldData[]>([]);
  const [revenueTrendData, setRevenueTrendData] = useState<RevenueTrendData[]>(
    [],
  );

  // Filters
  const [filters, setFilters] = useState<PlanPerformanceFilters>({
    dateRange: "Last 30 Days",
    location: "All Locations",
    planType: "All Plan Types",
    paymentMethod: "All Methods",
    startDate: "",
    endDate: "",
    parkingLotId: "",
  });

  // Close export dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-set dates based on dateRange selection
  useEffect(() => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    if (filters.dateRange === "Custom Range") return;
    
    let start = "";
    let end = "";
    
    switch(filters.dateRange) {
      case "Today":
        start = formatDate(today);
        end = formatDate(today);
        break;
      case "Yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        start = formatDate(yesterday);
        end = formatDate(yesterday);
        break;
      case "Last 7 Days":
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        start = formatDate(last7);
        end = formatDate(today);
        break;
      case "Last 30 Days":
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        start = formatDate(last30);
        end = formatDate(today);
        break;
      case "This Month":
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        start = formatDate(firstDay);
        end = formatDate(lastDay);
        break;
      case "Last Month":
        const firstDayLast = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLast = new Date(today.getFullYear(), today.getMonth(), 0);
        start = formatDate(firstDayLast);
        end = formatDate(lastDayLast);
        break;
      default:
        return;
    }
    
    setFilters(prev => ({ ...prev, startDate: start, endDate: end }));
  }, [filters.dateRange]);

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery) return planData;
    const query = searchQuery.toLowerCase();
    return planData.filter((row) => row.name.toLowerCase().includes(query));
  }, [planData, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, planRes, revenueRes, soldRes, trendRes] =
        await Promise.all([
          planPerformanceService.getSummary(filters),
          planPerformanceService.getPlanData(filters),
          planPerformanceService.getRevenueByPlan(filters),
          planPerformanceService.getPlansSoldData(filters),
          planPerformanceService.getRevenueTrendData(filters),
        ]);
      setSummary(summaryRes);
      setPlanData(planRes);
      setRevenueByPlan(revenueRes);
      setPlansSoldData(soldRes);
      setRevenueTrendData(trendRes);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load plan performance data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      dateRange: "Last 30 Days",
      location: "All Locations",
      planType: "All Plan Types",
      paymentMethod: "All Methods",
      startDate: "",
      endDate: "",
      parkingLotId: "",
    });
    setSearchQuery("");
    setCurrentPage(1);
    setShowFilters(false);
    toast("Filters reset");
  };

  // Export with format
  const handleExport = async (format: "pdf" | "excel") => {
    try {
      setExporting(true);
      setShowExportDropdown(false);
      const response = await planPerformanceService.exportReport({
        ...filters,
        format: format,
      });
      
      // Handle blob download
      if (response.blob) {
        const url = window.URL.createObjectURL(response.blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `plan_performance_${new Date().toISOString().split('T')[0]}.${format === "pdf" ? "pdf" : "xlsx"}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success(`Report exported as ${format.toUpperCase()}`);
      } else {
        toast.success(response.message || `Report exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setExporting(false);
    }
  };

  // Handle view details
  const handleViewDetails = (plan: PlanData) => {
    setSelectedPlanId(plan.id);
    setSelectedPlanName(plan.name);
    setIsDrawerOpen(true);
  };

  const dateRangeOptions = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "Last 30 Days",
    "This Month",
    "Last Month",
    "Custom Range",
  ];
  const locationOptions = [
    "All Locations",
    "Main Street",
    "City Center",
    "Airport",
  ];
  const planTypeOptions = [
    "All Plan Types",
    "Hourly",
    "Daily",
    "Monthly",
    "Evening",
    "Weekend",
  ];
  const paymentMethodOptions = ["All Methods", "Card", "Cash", "Wallet"];

  return (
    <div className="min-h-screen px-4 md:px-6 py-6 space-y-8 bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)]">
            Plan{" "}
            <span className="text-[var(--color-primary)]">
              Performance Report
            </span>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
            Analyze performance of all parking plans.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              showFilters
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
            }`}
          >
            <Filter size={16} />
            Filters
          </button>
          
          {/* Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
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
            
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-36 bg-[var(--color-surface)] rounded-xl shadow-lg border border-[var(--color-border)] overflow-hidden z-10">
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-[var(--color-surface-soft)] transition-colors flex items-center gap-2"
                >
                  <File size={16} className="text-red-500" /> PDF
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-[var(--color-surface-soft)] transition-colors flex items-center gap-2 border-t border-[var(--color-border)]"
                >
                  <SquaresExclude size={16} className="text-green-500" /> Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCard key={i} loading={true} icon={undefined} title={""} value={""} />
          ))}
        </div>
      ) : (
        summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Tag size={22} className="text-purple-500" />}
              title="Total Revenue"
              value={`$${summary.totalRevenue.toLocaleString()}`}
            />
            <StatCard
              icon={<BarChart3 size={22} className="text-blue-500" />}
              title="Total Plans Sold"
              value={summary.totalPlansSold.toLocaleString()}
            />
            <StatCard
              icon={<Users size={22} className="text-emerald-500" />}
              title="Avg. Revenue per Plan"
              value={`$${summary.avgRevenuePerPlan.toFixed(2)}`}
            />
            <StatCard
              icon={<Clock size={22} className="text-rose-500" />}
              title="Avg. Duration"
              value={summary.avgDuration}
            />
          </div>
        )
      )}

      {/* Filters Panel  */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) =>
                      setFilters({ ...filters, dateRange: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {dateRangeOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                
                {/* Parking Lot Filter */}
                 <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Parking Lot
                  </label>
                  <ReportParkingLotFilter
                    value={filters.parkingLotId ?? ""}
                    onChange={(value) => {
                      setFilters({ ...filters, parkingLotId: value });
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {filters.dateRange === "Custom Range" && (
                  <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                          setFilters({ ...filters, startDate: e.target.value })
                        }
                        className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                          setFilters({ ...filters, endDate: e.target.value })
                        }
                        className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                  </div>
                )}
                
                {/* <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Location
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {locationOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div> */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Plan Type
                  </label>
                  <select
                    value={filters.planType}
                    onChange={(e) =>
                      setFilters({ ...filters, planType: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {planTypeOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">
                    Payment Method
                  </label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) =>
                      setFilters({ ...filters, paymentMethod: e.target.value })
                    }
                    className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {paymentMethodOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
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

      {/* Charts Section */}
      <PlanPerformanceCharts
        revenueByPlan={revenueByPlan}
        plansSoldData={plansSoldData}
        revenueTrendData={revenueTrendData}
        loading={loading}
      />

      {/* Table Section */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base sm:text-lg font-black tracking-tight text-[var(--color-text-primary)]">
            Plan Performance Details
          </h3>
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              size={16}
            />
            <input
              type="text"
              placeholder="Search plan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[var(--color-surface-soft)] border-b border-[var(--color-border)]">
              <tr className="text-[10px] uppercase text-[var(--color-text-muted)] font-black tracking-widest">
                <th className="px-4 sm:px-6 py-4">Plan Name</th>
                <th className="px-4 sm:px-6 py-4">Plan Type</th>
                <th className="px-4 sm:px-6 py-4">Price</th>
                <th className="px-4 sm:px-6 py-4 text-center">Plans Sold</th>
                <th className="px-4 sm:px-6 py-4 text-right">Total Revenue</th>
                <th className="px-4 sm:px-6 py-4 text-center">Sessions</th>
                <th className="px-4 sm:px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
              {loading ? (
                <TableSkeleton rows={5} cols={7} />
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-[var(--color-text-muted)]"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[var(--color-surface-soft)]/30 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 font-bold text-[var(--color-text-primary)]">
                      {row.name}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="px-3 py-1 bg-green-400 dark:bg-[var(--color-primary)] rounded-lg text-[10px] font-black uppercase text-green-600 dark:text-white">
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      ${row.price.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center font-semibold">
                      {row.sold.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right font-black text-[var(--color-text-primary)]">
                      ${row.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      {row.sessions.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetails(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredData.length > itemsPerPage && (
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
            <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} entries
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

      {/* Plan Details Drawer */}
      <PlanDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        planId={selectedPlanId}
        planName={selectedPlanName}
      />
    </div>
  );
}