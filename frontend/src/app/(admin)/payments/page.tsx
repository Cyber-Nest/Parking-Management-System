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
  Calendar,
} from "lucide-react";

import { StatCard } from "@/components/common/StatCard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import toast from "react-hot-toast";
import { PaymentActionDropdown } from "@/components/payment/PaymentActionDropdown";
import { PaymentDetailsDrawer } from "@/components/payment/PaymentDetailsDrawer";
import { PaymentReceiptDrawer } from "@/components/payment/PaymentReceiptDrawer";
import { ParkingLotFilter } from "@/components/common/ParkingLotFilter";
import { listParkingLots, ParkingLotRecord } from "@/services/parking-lots.service";

import {
  paymentService,
  Payment,
  PaymentStats,
} from "@/services/payment.service";
import { truncateId } from "@/lib/truncateId";

const TYPE_TABS = ["All Types", "Parking", "Penalty", "Extension", "Refund"];
const PERIOD_TABS = ["Today", "Yesterday", "This Week", "This Month", "Custom Range"];

// Payment method options
const PAYMENT_METHODS = [
  "All Methods",
  "Visa",
  "Mastercard",
  "Debit Card",
  "Credit Card",
  "Stripe",
];

const MethodBadge = ({ method }: { method: string }) => {
  const getMethodColor = (method: string) => {
    switch(method.toLowerCase()) {
      case 'visa': return 'text-blue-600 bg-blue-50';
      case 'mastercard': return 'text-red-600 bg-red-50';
      case 'debit card': return 'text-green-600 bg-green-50';
      case 'credit card': return 'text-purple-600 bg-purple-50';
      default: return 'text-[var(--color-text-secondary)] bg-gray-50';
    }
  };
  
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getMethodColor(method)}`}>
      {method}
    </span>
  );
};

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

// Helper function to check if date is today
const isToday = (dateStr: string) => {
  const paymentDate = new Date(dateStr);
  const today = new Date();
  return paymentDate.toDateString() === today.toDateString();
};

// Helper function to check if date is yesterday
const isYesterday = (dateStr: string) => {
  const paymentDate = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return paymentDate.toDateString() === yesterday.toDateString();
};

// Helper function to check if date is within current week
const isThisWeek = (dateStr: string) => {
  const paymentDate = new Date(dateStr);
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return paymentDate >= startOfWeek && paymentDate <= endOfWeek;
};

// Helper function to check if date is within current month
const isThisMonth = (dateStr: string) => {
  const paymentDate = new Date(dateStr);
  const today = new Date();
  return paymentDate.getMonth() === today.getMonth() && 
         paymentDate.getFullYear() === today.getFullYear();
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
  const [activePeriod, setActivePeriod] = useState("Yesterday");
  const [activeType, setActiveType] = useState("All Types");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [receiptPaymentId, setReceiptPaymentId] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [parkingLots, setParkingLots] = useState<ParkingLotRecord[]>([]);
  const [parkingLotId, setParkingLotId] = useState("");

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
        const [statsRes, paymentsRes] = await Promise.all([
          paymentService.getPaymentStats({ parking_lot_id: parkingLotId || undefined }),
          paymentService.getPayments({ parking_lot_id: parkingLotId || undefined }),
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
  }, [parkingLotId]);

  useEffect(() => {
    listParkingLots().then(setParkingLots).catch((error) => console.error("Failed to load parking lots", error));
  }, []);

  // Filter by Period (Date Range)
  const filterByPeriod = (payment: Payment) => {
    const paymentDate = new Date(payment.date);
    
    switch(activePeriod) {
      case "Today":
        return isToday(payment.date);
      case "Yesterday":
        return isYesterday(payment.date);
      case "This Week":
        return isThisWeek(payment.date);
      case "This Month":
        return isThisMonth(payment.date);
      case "Custom Range":
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return paymentDate >= start && paymentDate <= end;
        }
        return true; // If dates not selected, show all
      default:
        return true;
    }
  };

  // Filtered Payments with all filters applied
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
      const matchesPeriod = filterByPeriod(payment);
      
      return matchesSearch && matchesType && matchesStatus && matchesMethod && matchesPeriod;
    });
  }, [payments, search, activeType, statusFilter, methodFilter, activePeriod, customStartDate, customEndDate]);

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
    setReceiptPaymentId(payment.id);
    setReceiptOpen(true);
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
    setParkingLotId("");
    setActiveType("All Types");
    setActivePeriod("Today");
    setCustomStartDate("");
    setCustomEndDate("");
    setCurrentPage(1);
    showToast("All filters cleared", "info");
  };

  const handlePeriodChange = (period: string) => {
    setActivePeriod(period);
    setCurrentPage(1);
    // Reset custom dates when switching away from Custom Range
    if (period !== "Custom Range") {
      setCustomStartDate("");
      setCustomEndDate("");
    }
  };

  return (
    <>
      <div className="min-h-screen px-2 md:px-4 lg:px-4 bg-[var(--color-bg)]">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 ">
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
            subValue="Transactions"
          />
          <StatCard
            icon={
              <AlertTriangle size={22} className="text-[var(--color-accent)]" />
            }
            title="Penalty Revenue"
            value={stats.penaltyRevenue}
            subValue="Transactions"
          />
          <StatCard
            icon={<Clock size={22} className="text-orange-400" />}
            title="Pending / Failed"
            value={stats.pendingFailed}
            subValue="Transactions"
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
                    onClick={() => handlePeriodChange(tab)}
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

            {/* Custom Range Picker */}
            {activePeriod === "Custom Range" && (
              <div className="flex flex-wrap items-center gap-3 p-3 bg-[var(--color-bg)] rounded-[var(--radius-md)] border border-[var(--color-border)]">
                <Calendar size={18} className="text-[var(--color-primary)]" />
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)]">From:</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input text-sm px-3 py-1.5"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)]">To:</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input text-sm px-3 py-1.5"
                  />
                </div>
                {(customStartDate || customEndDate) && (
                  <button
                    onClick={() => {
                      setCustomStartDate("");
                      setCustomEndDate("");
                    }}
                    className="text-xs text-red-500 hover:text-red-600 font-semibold"
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            )}

            {/* Search & Filters */}
            <div className="flex flex-wrap items-end gap-3 border-t border-[var(--color-bg)] pt-4">
              <ParkingLotFilter
                lots={parkingLots}
                value={parkingLotId}
                onChange={(value) => {
                  setParkingLotId(value);
                  setCurrentPage(1);
                }}
                className="self-end"
              />
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
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
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
                  <th className="px-6 py-5">Parking Lot</th>
                  <th className="px-6 py-5">Type</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5">Method</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[13px]">
                {loading ? (
                  <TableSkeleton rows={5} cols={10} />
                ) : paginatedPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
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
                      <td className="px-6 py-4 font-bold text-[var(--color-primary)]" title={row.id}>
                        {truncateId(row.id)}
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
                      <td className="px-6 py-4 font-bold text-[var(--color-primary)]" title={row.sessionId}>
                        {truncateId(row.sessionId)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--color-text-primary)]">
                          {row.parkingLotName || "Unassigned"}
                        </div>
                        {row.parkingLotId ? (
                          <div className="text-[10px] text-[var(--color-text-muted)] font-mono" title={row.parkingLotId}>
                            {truncateId(row.parkingLotId)}
                          </div>
                        ) : null}
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
                disabled={currentPage === totalPages || totalPages === 0}
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
      <PaymentReceiptDrawer
        isOpen={receiptOpen}
        onClose={() => {
          setReceiptOpen(false);
          setReceiptPaymentId(null);
        }}
        paymentId={receiptPaymentId}
      />
    </>
  );
}
