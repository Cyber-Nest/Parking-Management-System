"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Ticket,
  Car,
  Clock3,
  CreditCard,
  NotebookPen,
  ImageIcon,
} from "lucide-react";
import { PenaltyTicket } from "@/services/penalty.service";

interface TicketDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: PenaltyTicket | null;
}

const InfoCard = ({ title, value }: { title: string; value: string }) => (
  <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
    <p className="text-[11px] uppercase font-black tracking-wider text-[var(--color-text-muted)]">
      {title}
    </p>
    <h3 className="mt-2 font-bold text-sm break-all">{value || "-"}</h3>
  </div>
);

const SectionTitle = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="flex items-center gap-2 mt-8 mb-5">
    <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-soft)] flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-sm font-black uppercase tracking-wider">{title}</h3>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="p-5 rounded-2xl border border-dashed border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)]">
    {text}
  </div>
);

export const TicketDetailsDrawer = ({
  isOpen,
  onClose,
  ticket,
}: TicketDetailsDrawerProps) => {
  if (!ticket) return null;

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
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Drawer */}
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
                <h2 className="text-xl font-black">Penalty Ticket Details</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {ticket.id}
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
              {/* Ticket Information */}
              <SectionTitle
                icon={<Ticket size={16} />}
                title="Ticket Information"
              />
              <div className="grid grid-cols-2 gap-5">
                <InfoCard title="Ticket No." value={ticket.id} />
                <InfoCard title="Violation Type" value={ticket.violationType} />
                <InfoCard title="Amount" value={ticket.amount} />
                <InfoCard title="Ticket Status" value={ticket.status} />
                <InfoCard
                  title="Issue Date"
                  value={`${ticket.issueDate} - ${ticket.issueTime}`}
                />
                <InfoCard title="Location" value={ticket.location} />
                <InfoCard
                  title="Officer"
                  value={`${ticket.officer} (${ticket.officerId})`}
                />
              </div>

              {/* Vehicle Information */}
              <SectionTitle
                icon={<Car size={16} />}
                title="Vehicle Information"
              />
              <div className="grid grid-cols-2 gap-5">
                <InfoCard title="License Plate" value={ticket.plate} />
                <InfoCard title="Vehicle" value={ticket.vehicle} />
              </div>

              {/* Parking Session */}
              <SectionTitle
                icon={<Clock3 size={16} />}
                title="Parking Session"
              />
              <div className="grid grid-cols-2 gap-5">
                <InfoCard title="Session ID" value={ticket.sessionId} />
                <InfoCard title="Plan" value={ticket.parkingPlan} />
                <InfoCard title="Start Time" value={ticket.parkingStartTime} />
                <InfoCard
                  title="Expiry Time"
                  value={ticket.parkingExpiryTime}
                />
                <InfoCard title="Parking Status" value={ticket.parkingStatus} />
              </div>

              {/* Payment Information */}
              <SectionTitle
                icon={<CreditCard size={16} />}
                title="Payment Information"
              />
              <div className="grid grid-cols-2 gap-5">
                <InfoCard title="Payment ID" value={ticket.paymentId || "-"} />
                <InfoCard
                  title="Payment Status"
                  value={ticket.paymentStatus || "-"}
                />
                <InfoCard
                  title="Payment Method"
                  value={ticket.paymentMethod || "-"}
                />
                <InfoCard
                  title="Transaction Ref"
                  value={ticket.transactionReference || "-"}
                />
                <InfoCard title="Paid At" value={ticket.paidAt || "-"} />
              </div>

              {/* Cancellation Information */}
              {ticket.status === "Cancelled" && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-5">
                    <InfoCard
                      title="Cancelled By"
                      value={ticket.cancelledBy || "-"}
                    />
                    <InfoCard
                      title="Cancelled At"
                      value={ticket.cancelledAt || "-"}
                    />
                    <InfoCard
                      title="Cancel Reason"
                      value={ticket.cancelReason || "-"}
                    />
                  </div>
                </div>
              )}

              {/* Internal Notes */}
              <SectionTitle
                icon={<NotebookPen size={16} />}
                title="Internal Notes"
              />
              <div className="space-y-3">
                {ticket.notes.length === 0 ? (
                  <EmptyState text="No notes added yet." />
                ) : (
                  ticket.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-2xl border border-[var(--color-border)]"
                    >
                      <p className="text-sm font-semibold">{note.note}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-2">
                        {note.createdBy} • {note.createdAt}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Evidence Photos */}
              <SectionTitle
                icon={<ImageIcon size={16} />}
                title="Evidence Photos"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ticket.evidencePhotos.length === 0 ? (
                  <EmptyState text="No evidence photos uploaded." />
                ) : (
                  ticket.evidencePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="rounded-2xl overflow-hidden border border-[var(--color-border)] h-52"
                    >
                      <img
                        src={photo.image}
                        alt="evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
