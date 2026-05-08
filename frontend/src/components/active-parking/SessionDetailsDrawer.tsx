"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ParkingSession } from "@/services/parking.service";

interface SessionDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  session: ParkingSession | null;
}

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

const InfoCard = ({ title, value }: { title: string; value: string }) => (
  <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
    <p className="text-[11px] uppercase font-black text-[var(--color-text-muted)] tracking-wider">
      {title}
    </p>
    <h3 className="mt-2 font-bold text-sm">{value || "-"}</h3>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mt-8">
    <h3 className="text-sm font-black uppercase tracking-wider mb-4">
      {title}
    </h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const HistoryCard = ({
  title,
  subtitle,
  amount,
}: {
  title: string;
  subtitle: string;
  amount: string;
}) => (
  <div className="p-4 rounded-2xl border border-[var(--color-border)] flex items-center justify-between">
    <div>
      <h4 className="font-bold text-sm">{title}</h4>
      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
        {subtitle}
      </p>
    </div>
    <div className="font-black text-sm">{amount}</div>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="p-5 rounded-2xl border border-dashed border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)]">
    {text}
  </div>
);

export const SessionDetailsDrawer = ({
  isOpen,
  onClose,
  session,
}: SessionDetailsDrawerProps) => {
  if (!session) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[var(--color-surface)] shadow-2xl z-50 border-l border-[var(--color-border)] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[var(--color-surface)] z-10 flex items-center justify-between px-8 py-6 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-xl font-black">Session Details</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {session.id}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-surface-soft)] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-5">
                <InfoCard title="License Plate" value={session.plate} />
                <InfoCard title="Vehicle" value={session.vehicle} />
                <InfoCard title="Plan" value={session.plan} />
                <InfoCard
                  title="Payment Status"
                  value={session.paymentStatus}
                />
                <InfoCard
                  title="Start Time"
                  value={`${formatDate(session.startTime)} - ${formatTime(session.startTime)}`}
                />
                <InfoCard
                  title="Expiry Time"
                  value={`${formatDate(session.expiryTime)} - ${formatTime(session.expiryTime)}`}
                />
                <InfoCard title="Remaining" value={session.remaining} />
                <InfoCard
                  title="Payment Method"
                  value={session.paymentMethod}
                />
              </div>

              {/* Cancellation Info */}
              {session.sessionStatus === "cancelled" && (
                <div className="mt-8">
                  <div className="grid grid-cols-2 gap-5">
                    <InfoCard
                      title="Cancelled By"
                      value={session.cancelledBy || "-"}
                    />
                    <InfoCard
                      title="Cancelled At"
                      value={session.cancelledAt || "-"}
                    />
                    <div className="col-span-2">
                      <InfoCard
                        title="Cancel Reason"
                        value={session.cancelReason || "-"}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Extensions */}
              <Section title="Extension History">
                {session.extensions.length === 0 ? (
                  <EmptyState text="No extension history found." />
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
              </Section>

              {/* Issues */}
              <Section title="Issue History">
                {session.issues.length === 0 ? (
                  <EmptyState text="No issues found." />
                ) : (
                  session.issues.map((item) => (
                    <HistoryCard
                      key={item.id}
                      title={item.reason}
                      subtitle={item.notes}
                      amount={item.markedAt}
                    />
                  ))
                )}
              </Section>

              {/* Penalties */}
              <Section title="Penalty History">
                {session.penalties.length === 0 ? (
                  <EmptyState text="No penalties found." />
                ) : (
                  session.penalties.map((item) => (
                    <HistoryCard
                      key={item.id}
                      title={item.reason}
                      subtitle={item.createdAt}
                      amount={item.amount}
                    />
                  ))
                )}
              </Section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
