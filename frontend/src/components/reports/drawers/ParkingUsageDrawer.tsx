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

export const ParkingUsageDrawer = ({
  isOpen,
  onClose,
  data,
}: ViewDetailsDrawerProps) => {
  if (!data) return null;

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
                <MiniStat label="Total" value={data.total} />
                <MiniStat
                  label="Revenue"
                  value={`$${data.revenue}`}
                  colorClass="text-emerald-500"
                />
                <MiniStat
                  label="Active"
                  value={data.active}
                  colorClass="text-blue-500"
                />
              </div>
            </div>

            {/* Scrollable  */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] flex items-center gap-2">
                  <Car size={14} /> Session Timeline
                </h3>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] bg-[var(--color-surface-soft)] px-2 py-1 rounded">
                  Showing all records
                </span>
              </div>

              <div className="space-y-4">
                {(data.sessions || [1, 2, 3]).map(
                  (session: any, idx: number) => (
                    <div
                      key={idx}
                      className="group relative p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/10 hover:bg-[var(--color-surface-soft)]/30 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center font-black text-sm group-hover:border-[var(--color-primary)] transition-colors">
                            {String(idx + 1).padStart(2, "0")}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[var(--color-text)] uppercase tracking-tight">
                              {session.plateNumber || "AB 1234"}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={session.status || "Completed"} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)] border-dotted">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                            <Clock size={12} />
                            <p className="text-[9px] font-black uppercase">
                              Duration
                            </p>
                          </div>
                          <p className="text-[11px] font-bold text-[var(--color-text)]">
                            {session.startTime || "10:00 AM"} -{" "}
                            {session.expiryTime || "12:00 PM"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                            <CreditCard size={12} />
                            <p className="text-[9px] font-black uppercase">
                              Paid Amount
                            </p>
                          </div>
                          <p className="text-[11px] font-bold text-emerald-500">
                            ${session.amount || "10.00"} •{" "}
                            <span className="text-[var(--color-text-muted)]">
                              {session.paymentMethod || "CARD"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
