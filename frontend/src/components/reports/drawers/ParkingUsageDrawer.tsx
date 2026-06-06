"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Car,
  Clock,
  CreditCard,
  Tag,
  Receipt,
  Hash,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

interface ViewDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const StatusBadge = ({ status }: { status: string }) => {
  const s = status.toLowerCase();
  const styles: Record<string, string> = {
    completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    active: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    expired: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[s] || "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}
    >
      {status}
    </span>
  );
};

const MiniStat = ({
  label,
  value,
  colorClass = "text-[var(--color-text)]",
}: any) => (
  <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/20">
    <p className="text-[10px] uppercase font-black text-[var(--color-text-muted)] mb-1">
      {label}
    </p>
    <h4 className={`text-xl font-black ${colorClass}`}>{value}</h4>
  </div>
);

const InfoCard = ({
  icon: Icon,
  label,
  value,
  color = "text-[var(--color-text-primary)]",
}: {
  icon: any;
  label: string;
  value: string | number;
  color?: string;
}) => (
  <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/20 hover:border-[var(--color-primary)]/20 transition-all group">
    <div className="flex items-center gap-2 mb-1.5">
      <Icon
        size={14}
        className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]"
      />
      <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">
        {label}
      </p>
    </div>
    <h3 className={`font-black text-lg ${color}`}>{value}</h3>
  </div>
);

export const ParkingUsageDrawer = ({
  isOpen,
  onClose,
  data,
}: ViewDetailsDrawerProps) => {
  if (!data) return null;

  const totalSessions = data.totalSessions ?? 0;
  const completed = data.completed ?? 0;
  const active = data.active ?? 0;
  const expired = data.expired ?? 0;
  const avgDuration = data.avgDuration ?? 0;
  const revenue = data.revenue ?? 0;

  // Compute percentage bars
  const completedPct = totalSessions > 0 ? Math.round((completed / totalSessions) * 100) : 0;
  const activePct = totalSessions > 0 ? Math.round((active / totalSessions) * 100) : 0;
  const expiredPct = totalSessions > 0 ? Math.round((expired / totalSessions) * 100) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-[var(--color-surface)] shadow-2xl z-50 flex flex-col border-l border-[var(--color-border)]"
          >
            {/* Header */}
            <div className="p-8 border-b border-dashed border-[var(--color-border)] relative">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center text-[var(--color-primary)]">
                  <Receipt size={24} />
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight">
                  Session Insights
                </h2>
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <Calendar size={14} className="text-[var(--color-primary)]" />
                  <p className="text-xs font-mono font-bold uppercase tracking-wider">
                    {data.date}
                  </p>
                </div>
              </div>

              {/* Quick Summary Grid */}
              <div className="grid grid-cols-3 gap-3 mt-8">
                <MiniStat label="Total" value={totalSessions.toLocaleString()} />
                <MiniStat
                  label="Revenue"
                  value={`$${revenue.toLocaleString()}`}
                  colorClass="text-emerald-500"
                />
                <MiniStat
                  label="Avg Duration"
                  value={`${avgDuration}m`}
                  colorClass="text-blue-500"
                />
              </div>
            </div>

            {/* Scrollable  */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {/* Status Breakdown */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] flex items-center gap-2 mb-5">
                  <Car size={14} /> Status Breakdown
                </h3>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <InfoCard
                    icon={CheckCircle}
                    label="Completed"
                    value={completed.toLocaleString()}
                    color="text-emerald-600"
                  />
                  <InfoCard
                    icon={RefreshCcw}
                    label="Active"
                    value={active.toLocaleString()}
                    color="text-blue-600"
                  />
                  <InfoCard
                    icon={AlertCircle}
                    label="Expired"
                    value={expired.toLocaleString()}
                    color="text-rose-500"
                  />
                </div>

                {/* Visual bar breakdown */}
                <div className="space-y-3 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-3">
                    Session Distribution
                  </p>
                  {/* Completed */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-emerald-600">Completed</span>
                      <span className="text-[var(--color-text-muted)]">{completedPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--color-surface-soft)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${completedPct}%` }}
                      />
                    </div>
                  </div>
                  {/* Active */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-blue-600">Active</span>
                      <span className="text-[var(--color-text-muted)]">{activePct}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--color-surface-soft)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${activePct}%` }}
                      />
                    </div>
                  </div>
                  {/* Expired */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-rose-500">Expired</span>
                      <span className="text-[var(--color-text-muted)]">{expiredPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--color-surface-soft)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${expiredPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] flex items-center gap-2 mb-5">
                  <Tag size={14} /> Detailed Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoCard
                    icon={Car}
                    label="Total Sessions"
                    value={totalSessions.toLocaleString()}
                  />
                  <InfoCard
                    icon={CreditCard}
                    label="Total Revenue"
                    value={`$${revenue.toLocaleString()}`}
                    color="text-emerald-600"
                  />
                  <InfoCard
                    icon={Clock}
                    label="Avg Duration"
                    value={`${avgDuration} min`}
                  />
                  <InfoCard
                    icon={ArrowUpRight}
                    label="Completion Rate"
                    value={`${completedPct}%`}
                    color="text-emerald-600"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
