"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  CreditCard,
  Car,
  Hash,
  AlertCircle,
  ReceiptIndianRupee,
  ChevronRight,
} from "lucide-react";
import { ParkingSession } from "@/services/parking.service";

interface SessionDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  session: ParkingSession | null;
}

// Helper for Status Badges
const StatusBadge = ({ status }: { status?: string }) => {
  const value = String(status ?? "N/A");
  const isPaid =
    value.toLowerCase() === "paid" || value.toLowerCase() === "active";
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isPaid
        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
        }`}
    >
      {status}
    </span>
  );
};

const InfoCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon?: any;
}) => (
  <div className="group p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/20 hover:bg-[var(--color-surface-soft)]/50 transition-all duration-300">
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon size={14} className="text-[var(--color-text-muted)]" />}
      <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-widest">
        {title}
      </p>
    </div>
    <h3 className="font-semibold text-[15px] text-[var(--color-text)] truncate">
      {value || "-"}
    </h3>
  </div>
);

const Section = ({
  title,
  children,
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: any;
}) => (
  <div className="mt-10">
    <div className="flex items-center gap-2 mb-5">
      {Icon && <Icon size={18} className="text-[var(--color-primary)]" />}
      <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[var(--color-text)]">
        {title}
      </h3>
    </div>
    <div className="grid gap-3">{children}</div>
  </div>
);

const HistoryCard = ({
  title,
  subtitle,
  amount,
  isNegative = false,
}: {
  title?: string;
  subtitle?: string;
  amount?: string;
  isNegative?: boolean;
}) => (
  <div className="group p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/30 transition-all flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${isNegative ? "bg-red-500/10 text-red-500" : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"}`}
      >
        {isNegative ? (
          <AlertCircle size={18} />
        ) : (
          <ReceiptIndianRupee size={18} />
        )}
      </div>
      <div>
        <h4 className="font-bold text-sm group-hover:text-[var(--color-primary)] transition-colors">
          {title}
        </h4>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 tracking-tight">
          {subtitle}
        </p>
      </div>
    </div>
    <div
      className={`font-black text-sm ${isNegative ? "text-red-500" : "text-[var(--color-text)]"}`}
    >
      {amount}
    </div>
  </div>
);

export const SessionDetailsDrawer = ({
  isOpen,
  onClose,
  session,
}: SessionDetailsDrawerProps) => {
  if (!session) return null;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

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
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-[var(--color-surface)] shadow-[-20px_0_50px_rgba(0,0,0,0.2)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="relative p-8 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-surface-soft)]/30">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-black tracking-tight">
                      Session Details
                    </h2>
                    <StatusBadge status={session.sessionStatus} />
                  </div>
                  <p className="text-xs font-mono text-[var(--color-text-secondary)] bg-[var(--color-surface-soft)] px-2 py-1 rounded inline-block">
                    ID: {session.id}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {/* Primary Grid */}
              <div className="grid grid-cols-2 gap-4">
                <InfoCard
                  title="License Plate"
                  value={session.plate}
                  icon={Hash}
                />
                <InfoCard
                  title="Vehicle Type"
                  value={session.vehicle}
                  icon={Car}
                />
                <InfoCard
                  title="Parking Lot"
                  value={session.parkingLotName || "Unassigned"}
                  icon={Car}
                />
                <InfoCard
                  title="Subzone"
                  value={session.subzoneName || "Unassigned"}
                  icon={Hash}
                />
                <InfoCard
                  title="Pricing Plan"
                  value={session.plan}
                  icon={CreditCard}
                />
                <InfoCard
                  title="Payment"
                  value={session.paymentStatus}
                  icon={ReceiptIndianRupee}
                />
              </div>

              {/* Time Section */}
              <div className="mt-6 p-5 rounded-2xl bg-[var(--color-primary)]/[0.03] border border-[var(--color-primary)]/10">
                <div className="flex justify-between items-center text-center">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-black text-[var(--color-text-muted)] mb-1">
                      Entry
                    </p>
                    <p className="text-sm font-bold">
                      {formatTime(session.startTime)}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">
                      {formatDate(session.startTime)}
                    </p>
                  </div>
                  <div className="px-4 text-[var(--color-primary)]/30">
                    <ChevronRight size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-black text-[var(--color-text-muted)] mb-1">
                      Expiry
                    </p>
                    <p className="text-sm font-bold text-orange-500">
                      {formatTime(session.expiryTime)}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">
                      {formatDate(session.expiryTime)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancellation Info  */}
              {session.sessionStatus === "cancelled" && (
                <div className="mt-8 p-5 rounded-2xl bg-red-500/5 border border-red-500/20">
                  <h4 className="text-red-500 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle size={14} /> Cancellation Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">
                        Reason
                      </p>
                      <p className="text-sm font-semibold">
                        {session.cancelReason || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">
                        By
                      </p>
                      <p className="text-sm font-semibold">
                        {session.cancelledBy || "System"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Lists */}
              {/* <Section title="Extensions" icon={Clock}>
                {session.extensions.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)] italic">
                    No extensions recorded.
                  </p>
                ) : (
                  session.extensions.map((item) => (
                    <HistoryCard
                      key={item.id}
                      title={item.duration}
                      subtitle={item.extendedAt}
                      amount={item.amount}
                    />
                  ))
                )}
              </Section> */}

              {/* <Section title="Violations & Penalties" icon={AlertCircle}>
                {[...session.issues, ...session.penalties].length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)] italic">
                    Clean record. No issues found.
                  </p>
                ) : (
                  <>
                    {session.issues.map((item) => (
                      <HistoryCard
                        key={item.id}
                        title={item.reason}
                        subtitle={item.notes}
                        amount="Flagged"
                        isNegative
                      />
                    ))}
                    {session.penalties.map((item) => (
                      <HistoryCard
                        key={item.id}
                        title={item.reason}
                        subtitle={item.createdAt}
                        amount={item.amount}
                        isNegative
                      />
                    ))}
                  </>
                )}
              </Section> */}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
