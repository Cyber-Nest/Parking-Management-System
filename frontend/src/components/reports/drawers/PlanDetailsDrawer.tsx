"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Tag,
  Calendar,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  Info,
  Briefcase,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import {
  planPerformanceService,
  PlanDetails,
} from "@/services/plan-performance.service";

const SectionTitle = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="flex items-center gap-2.5 mt-10 mb-5 pb-2 border-b border-[var(--color-border)]">
    <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center border border-[var(--color-primary)]/10 shadow-inner">
      {icon}
    </div>
    <h3 className="text-sm font-black uppercase tracking-[0.1em] text-[var(--color-text-primary)]">
      {title}
    </h3>
  </div>
);

const KpiCard = ({ icon: Icon, title, value, color }: any) => (
  <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/20 hover:border-[var(--color-primary)]/20 transition-all group">
    <div className="flex items-center gap-2 mb-2 opacity-60">
      {Icon && <Icon size={14} className="text-[var(--color-primary)]" />}
      <span className="text-[10px] font-black uppercase tracking-wider">
        {title}
      </span>
    </div>
    <p
      className={`text-xl font-black tracking-tighter ${color || "text-[var(--color-text-primary)]"}`}
    >
      {value}
    </p>
  </div>
);

const TransactionStatus = ({ status }: { status: string }) => {
  const s = status.toLowerCase();
  const styles: Record<string, string> = {
    completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    pending: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    refunded: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${styles[s] || "bg-gray-100 text-gray-500 border-gray-200"}`}
    >
      {status}
    </span>
  );
};

export const PlanDetailsDrawer = ({
  isOpen,
  onClose,
  planId,
  planName,
}: any) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<PlanDetails | null>(null);

  useEffect(() => {
    if (isOpen && planId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await planPerformanceService.getPlanDetails(planId);
          setDetails(data);
        } catch (error) {
          toast.error("Failed to load plan intelligence");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, planId]);

  if (!planId) return null;

  const trendData = details
    ? [
        { name: "W1", revenue: details.totalRevenue * 0.2 },
        { name: "W2", revenue: details.totalRevenue * 0.3 },
        { name: "W3", revenue: details.totalRevenue * 0.25 },
        { name: "W4", revenue: details.totalRevenue * 0.25 },
      ]
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[var(--color-surface)] shadow-2xl z-50 flex flex-col border-l border-[var(--color-border)]"
          >
            {/* Header */}
            <div className="p-8 py-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface)] sticky top-0 z-10 shadow-sm">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)] uppercase flex items-center gap-2">
                  <Tag size={24} className="text-[var(--color-primary)]" />
                  Plan Intelligence
                </h2>
                <p className="text-xs font-mono bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] px-2 py-0.5 rounded inline-block mt-1 tracking-tighter">
                  ID: {planId}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-2 custom-scrollbar">
              {loading ? (
                <div className="animate-pulse space-y-6">
                  <div className="h-40 bg-[var(--color-surface-soft)] rounded-[2.5rem]" />
                  <div className="grid grid-cols-4 gap-4">
                    <div className="h-24 bg-[var(--color-surface-soft)] rounded-2xl" />
                    <div className="h-24 bg-[var(--color-surface-soft)] rounded-2xl" />
                    <div className="h-24 bg-[var(--color-surface-soft)] rounded-2xl" />
                    <div className="h-24 bg-[var(--color-surface-soft)] rounded-2xl" />
                  </div>
                </div>
              ) : (
                details && (
                  <>
                    {/* Plan Hero Card */}
                    <div className="mb-8 p-6 rounded-[1rem] bg-[var(--color-primary)] text-white shadow-xl relative overflow-hidden">
                      <div className="relative z-10 flex justify-between items-start">
                        <div>
                          <p className="text-[10px] uppercase font-black opacity-50 tracking-[0.3em] mb-2">
                            Service Package
                          </p>
                          <h1 className="text-3xl font-black tracking-tighter mb-1">
                            {planName}
                          </h1>
                          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold">
                            <RefreshCcw size={12} className="text-gray-400" />{" "}
                            {details.type}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-black opacity-50 mb-1">
                            Standard Price
                          </p>
                          <h2 className="text-3xl font-black text-white">
                            ${details.price.toFixed(2)}
                          </h2>
                        </div>
                      </div>
                      <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-indigo-600/20 rounded-full blur-[80px]" />
                    </div>

                    {/* Quick Metadata */}
                    <div className="p-5 rounded-2xl bg-[var(--color-surface-soft)]/20 border border-[var(--color-border)] mb-6">
                      <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase mb-2 flex items-center gap-1.5">
                        <FileText size={12} /> Description
                      </p>
                      <p className="text-sm font-medium leading-relaxed text-[var(--color-text-primary)] opacity-80 italic">
                        "{details.description}"
                      </p>
                    </div>

                    {/* KPI Grid */}
                    <SectionTitle
                      icon={<TrendingUp size={18} />}
                      title="Performance Metrics"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <KpiCard
                        title="Units Sold"
                        value={details.totalSold.toLocaleString()}
                        icon={Users}
                      />
                      <KpiCard
                        title="Gross Vol"
                        value={`$${details.totalRevenue.toLocaleString()}`}
                        color="text-emerald-600"
                        icon={DollarSign}
                      />
                      <KpiCard
                        title="Avg Rev/Unit"
                        value={`$${details.avgRevenue.toFixed(2)}`}
                        icon={TrendingUp}
                      />
                      <KpiCard
                        title="Avg Retention"
                        value={details.avgDuration}
                        icon={Clock}
                      />
                    </div>

                    {/* Financial Breakdown */}
                    <SectionTitle
                      icon={<DollarSign size={18} />}
                      title="Financial Audit"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center">
                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">
                          Gross Inflow
                        </p>
                        <p className="text-2xl font-black text-emerald-600">
                          ${details.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
                        <p className="text-[10px] font-black text-rose-600 uppercase mb-1">
                          Refund Outflow
                        </p>
                        <p className="text-2xl font-black text-rose-600">
                          ${details.refunds.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-center">
                        <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">
                          Net Realization
                        </p>
                        <p className="text-2xl font-black text-indigo-600">
                          ${details.netRevenue.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Trend Chart */}
                    <SectionTitle
                      icon={<TrendingUp size={18} />}
                      title="Revenue Momentum"
                    />
                    <div className="h-[220px] w-full p-6 rounded-3xl bg-[var(--color-surface-soft)]/10 border border-[var(--color-border)]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient
                              id="planRev"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="var(--color-primary)"
                                stopOpacity={0.2}
                              />
                              <stop
                                offset="95%"
                                stopColor="var(--color-primary)"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            strokeOpacity={0.1}
                          />
                          <XAxis
                            dataKey="name"
                            fontSize={10}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            fontSize={10}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `$${v / 1000}K`}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--color-primary)"
                            strokeWidth={2}
                            fill="url(#planRev)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Transactions Table */}
                    <SectionTitle
                      icon={<FileText size={18} />}
                      title="Transaction Audit Trail"
                    />
                    <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-soft)]/10 mb-10">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead className="bg-[var(--color-surface-soft)] text-black/50  border-b border-[var(--color-border)]">
                          <tr className="text-[9px] font-black uppercase tracking-widest">
                            <th className="px-5 py-4">TXN Identifier</th>
                            <th className="px-5 py-4">Timestamp</th>
                            <th className="px-5 py-4">Customer Entity</th>
                            <th className="px-5 py-4">Settlement</th>
                            <th className="px-5 py-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]/50">
                          {details.recentTransactions.map((txn, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-white/40 transition-colors dark:hover:bg-white/10"
                            >
                              <td className="px-5 py-4 font-mono font-bold text-[var(--color-primary)]">
                                {txn.id}
                              </td>
                              <td className="px-5 py-4 text-[var(--color-text-muted)] font-medium">
                                {txn.date}
                              </td>
                              <td className="px-5 py-4 text-[var(--color-text-primary)] font-bold">
                                {txn.customer}
                              </td>
                              <td className="px-5 py-4 font-black">
                                ${txn.amount.toFixed(2)}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <TransactionStatus status={txn.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
