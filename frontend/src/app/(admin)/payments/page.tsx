"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Car,
  AlertTriangle,
  Clock,
} from "lucide-react";

import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { Toast } from "@/components/common/Toast";
import { PaymentActionDropdown } from "@/components/payment/PaymentActionDropdown";
import { PaymentDetailsDrawer } from "@/components/payment/PaymentDetailsDrawer";

import {
  paymentService,
  Payment,
  PaymentStats,
} from "@/services/payment.service";

const TYPE_TABS = ["All Types", "Parking", "Penalty", "Extension", "Refund"];
const PERIOD_TABS = ["Today", "Yesterday", "This Week", "This Month"];

const MethodBadge = ({ method }: { method: string }) => (
  <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
    {method}
  </span>
);

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

const TypeBadge = ({ type }: { type: string }) => {
  const styles: Record<string, string> = {
    Parking: "bg-blue-50 text-blue-600 border border-blue-100",
    Penalty: "bg-orange-50 text-[var(--color-accent)] border border-orange-100",
    Extension: "bg-purple-50 text-purple-600 border border-purple-100",
    Refund: "bg-pink-50 text-pink-600 border border-pink-100",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${styles[type] || "bg-gray-50 text-gray-600"}`}
    >
      {type}
    </span>
  );
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    todayPayments: "$0",
    parkingRevenue: "$0",
    penaltyRevenue: "$0",
    pendingFailed: "$0",
  });
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState("Today");
  const [activeType, setActiveType] = useState("All Types");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    isOpen: boolean;
  }>({
    message: "",
    type: "success",
    isOpen: false,
  });

  const itemsPerPage = 10; // 10 items per page

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type, isOpen: true });
  };

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, paymentsRes] = await Promise.all([
          paymentService.getPaymentStats(),
          paymentService.getPayments(),
        ]);
        setStats(statsRes);
        setPayments(paymentsRes);
      } catch (error) {
        console.error(error);
        showToast("Failed to load payment data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.plate.toLowerCase().includes(search.toLowerCase()) ||
        payment.id.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        activeType === "All Types" ? true : payment.type === activeType;
      const matchesStatus =
        statusFilter === "All Status" ? true : payment.status === statusFilter;
      const matchesMethod =
        methodFilter === "All Methods" ? true : payment.method === methodFilter;
      return matchesSearch && matchesType && matchesStatus && matchesMethod;
    });
  }, [payments, search, activeType, statusFilter, methodFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  // Handlers
  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailsDrawerOpen(true);
  };

  const handleReceipt = (payment: Payment) => {
    console.log("Generate Receipt:", payment);
    showToast(`Receipt generated for ${payment.id}`, "success");
  };

  const handleRefund = (payment: Payment) => {
    if (payment.status !== "Paid") return;

    const updated = payments.map((item) => {
      if (item.id === payment.id) {
        return {
          ...item,
          status: "Refunded" as const,
          refundInfo: {
            refunded: true,
            refundedAt: new Date().toLocaleString(),
            refundedBy: "Admin",
            refundReason: "Refund processed by admin",
          },
        };
      }
      return item;
    });
    setPayments(updated as any);
    showToast(`Payment ${payment.id} has been refunded`, "success");
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
    setMethodFilter("All Methods");
    setActiveType("All Types");
    setActivePeriod("Today");
    setCurrentPage(1);
    showToast("All filters cleared", "info");
  };

  return (
    <>
      <div className="min-h-screen px-2 md:px-4 lg:px-4 bg-[var(--color-bg)]">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 ">
          {/* <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Pay<span className="text-[var(--color-primary)]">ments</span>
            </h1>
            <p className="text-[var(--color-text-secondary)] text-sm">
              View and manage all payments
            </p>
          </div> */}
          <div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
              Pay<span className="text-[var(--color-primary)]">ments</span>
            </h1>

            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-semibold mt-1">
              View and manage all payments
            </p>
          </div>
        </header>

        {/* Stats  */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<CreditCard size={22} className="text-[var(--color-info)]" />}
            title="Today's Payments"
            value={stats.todayPayments}
            subValue=""
          />
          <StatCard
            icon={<Car size={22} className="text-emerald-500" />}
            title="Parking Revenue"
            value={stats.parkingRevenue}
            subValue="12 Transactions"
          />
          <StatCard
            icon={
              <AlertTriangle size={22} className="text-[var(--color-accent)]" />
            }
            title="Penalty Revenue"
            value={stats.penaltyRevenue}
            subValue="6 Transactions"
          />
          <StatCard
            icon={<Clock size={22} className="text-orange-400" />}
            title="Pending / Failed"
            value={stats.pendingFailed}
            subValue="2 Transactions"
          />
        </div>

        {/* Filters */}
        <div className="bg-[var(--color-surface)] p-5 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)] mb-6">
          <div className="flex flex-col gap-5">
            {/* Period & Type Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex bg-[var(--color-bg)] p-1.5 rounded-[var(--radius-md)] overflow-x-auto no-scrollbar">
                {PERIOD_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActivePeriod(tab)}
                    className={`px-4 py-2 text-xs font-semibold rounded-[var(--radius-sm)] whitespace-nowrap transition-all ${
                      activePeriod === tab
                        ? "bg-white text-[var(--color-primary)] shadow-sm"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex bg-[var(--color-bg)] p-1.5 rounded-[var(--radius-md)] overflow-x-auto no-scrollbar">
                {TYPE_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveType(tab);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 text-xs font-semibold rounded-[var(--radius-sm)] whitespace-nowrap transition-all ${
                      activeType === tab
                        ? "bg-white text-[var(--color-primary)] shadow-sm"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-end gap-3 border-t border-[var(--color-bg)] pt-4">
              <div className="flex-1 min-w-[240px] relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  size={16}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by license plate or payment ID..."
                  className="input pl-9 text-sm w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider ml-1">
                  Payment Status
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input w-auto min-w-[150px] text-xs font-medium bg-[var(--color-surface-soft)]"
                >
                  <option>All Status</option>
                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Failed</option>
                  <option>Refunded</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider ml-1">
                  Payment Method
                </span>
                <select
                  value={methodFilter}
                  onChange={(e) => {
                    setMethodFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input w-auto min-w-[150px] text-xs font-medium bg-[var(--color-surface-soft)]"
                >
                  <option>All Methods</option>
                  <option>Card</option>
                  <option>Cash</option>
                  <option>Stripe</option>
                </select>
              </div>

              <button
                onClick={handleClearFilters}
                className="px-4 py-2.5 text-sm font-semibold border border-[var(--color-border)] rounded-xl hover:bg-white transition-all"
              >
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
                  <th className="px-6 py-5">Payment ID</th>
                  <th className="px-6 py-5">Date & Time</th>
                  <th className="px-6 py-5">Plate No.</th>
                  <th className="px-6 py-5">Session ID</th>
                  <th className="px-6 py-5">Type</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5">Method</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
                {loading ? (
                  <TableSkeleton rows={5} cols={9} />
                ) : paginatedPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-16 text-sm font-semibold text-gray-400"
                    >
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  paginatedPayments.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-[var(--color-surface-soft)]/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-[var(--color-primary)]">
                        {row.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[var(--color-text-primary)]">
                          {row.date}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)] font-bold">
                          {row.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-[var(--color-text-primary)]">
                        {row.plate}
                      </td>
                      <td className="px-6 py-4 font-bold text-[var(--color-primary)]">
                        {row.sessionId}
                      </td>
                      <td className="px-6 py-4">
                        <TypeBadge type={row.type} />
                      </td>
                      <td className="px-6 py-4 font-black text-sm">
                        {row.amount}
                      </td>
                      <td className="px-6 py-4">
                        <MethodBadge method={row.method} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <PaymentActionDropdown
                            payment={row}
                            onView={handleView}
                            onReceipt={handleReceipt}
                            onRefund={handleRefund}
                          />
                        </div>
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
                {Math.min(currentPage * itemsPerPage, filteredPayments.length)}
              </span>{" "}
              of {filteredPayments.length} payments
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
                      page === currentPage
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

      {/* Payment Details Drawer */}
      <PaymentDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        payment={selectedPayment}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
