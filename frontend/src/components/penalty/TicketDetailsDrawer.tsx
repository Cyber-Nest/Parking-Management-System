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
  MapPin,
  Map,
  User,
  ShieldCheck,
  CalendarDays,
  CircleDollarSign,
  Ban,
} from "lucide-react";
import { PenaltyTicket } from "@/services/penalty.service";

interface TicketDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: PenaltyTicket | null;
}

// Colored Badge Component
const StatusBadge = ({
  status,
  type = "ticket",
}: {
  status: string;
  type?: "ticket" | "payment" | "session";
}) => {
  const s = status.toLowerCase();
  let baseClass =
    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border";

  const ticketColors: Record<string, string> = {
    active: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cancelled: "bg-gray-200 text-gray-500 border-gray-300",
  };

  const paymentColors: Record<string, string> = {
    paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };

  const sessionColors: Record<string, string> = {
    active: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    expired: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  const colors =
    type === "ticket"
      ? ticketColors
      : type === "payment"
        ? paymentColors
        : sessionColors;

  return (
    <span
      className={`${baseClass} ${colors[s] || "bg-gray-100 text-gray-600 border-gray-200"}`}
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
  <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/20 hover:border-[var(--color-primary)]/20 transition-all group">
    <div className="flex items-center gap-2 mb-1.5">
      {Icon && (
        <Icon
          size={14}
          className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]"
        />
      )}
      <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">
        {title}
      </p>
    </div>
    <h3 className="font-semibold text-[13px] text-[var(--color-text)] break-all leading-tight">
      {value || "-"}
    </h3>
  </div>
);

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
    <h3 className="text-sm font-black uppercase tracking-[0.1em] text-[var(--color-text)]">
      {title}
    </h3>
  </div>
);

const EmptyState = ({ text, icon: Icon }: { text: string; icon?: any }) => (
  <div className="p-6 rounded-2xl border border-dashed border-[var(--color-border)] text-center bg-[var(--color-surface-soft)]/10">
    {Icon && (
      <Icon
        size={24}
        className="mx-auto text-[var(--color-text-muted)] mb-3"
        strokeWidth={1}
      />
    )}
    <p className="text-xs font-semibold text-[var(--color-text-secondary)] italic">
      {text}
    </p>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-[var(--color-surface)] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-50 flex flex-col border-l border-[var(--color-border)]"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[var(--color-surface)] z-10 p-8 py-6 border-b border-[var(--color-border)] shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-black tracking-tight text-[var(--color-text)]">
                      Penalty Ticket
                    </h2>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="text-xs font-mono bg-[var(--color-surface-soft)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded inline-block">
                    {ticket.id}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all shadow-sm group"
                >
                  <X
                    size={18}
                    className="group-hover:rotate-90 transition-transform"
                  />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-2 custom-scrollbar">
              <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-[var(--color-surface-soft)] to-transparent border border-[var(--color-border)]">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="col-span-2 border-r border-[var(--color-border)] pr-6">
                    <p className="text-[10px] uppercase font-black text-[var(--color-text-muted)] mb-1">
                      Violation Type
                    </p>
                    <h4 className="text-base font-bold text-red-600 leading-tight">
                      {ticket.violationType}
                    </h4>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-[var(--color-text-muted)] mb-1">
                      Amount
                    </p>
                    <h1 className="text-3xl font-black text-[var(--color-text)] tracking-tight">
                      {ticket.amount}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              <SectionTitle
                icon={<ShieldCheck size={18} />}
                title="Audit Details"
              />
              <div className="grid grid-cols-2 gap-4">
                {/* <div className="col-span-2">
                  <InfoCard
                    title="Violation Location"
                    value={ticket.location ?? "-"}
                    icon={MapPin}
                  />
                </div> */}
                <InfoCard
                  title="Issue Date"
                  value={ticket.issueDate}
                  icon={CalendarDays}
                />
                <InfoCard
                  title="Issue Time"
                  value={ticket.issueTime}
                  icon={Clock3}
                />
                <div className="col-span-2">
                  <InfoCard
                    title="Issuing Officer"
                    value={`${ticket.officer} (ID: ${ticket.officerId})`}
                    icon={User}
                  />
                </div>
              </div>

              {/* Vehicle Information */}
              <SectionTitle icon={<Car size={18} />} title="Vehicle Details" />
              <div className="grid grid-cols-2 gap-4">
                <InfoCard
                  title="License Plate"
                  value={ticket.plate}
                  icon={Map}
                />
                <InfoCard
                  title="Vehicle Type"
                  value={ticket.vehicle ?? "-"}
                  icon={Car}
                />
                <InfoCard
                  title="Vehicle Make"
                  value={ticket.raw?.parsedRemarks?.vehicleMake ?? ticket.raw?.parsedRemarks?.vehicleModel ?? "-"}
                  icon={Car}
                />
                <InfoCard
                  title="Vehicle Color"
                  value={ticket.raw?.parsedRemarks?.vehicleColor ?? "-"}
                  icon={Car}
                />
              </div>

              {/* Parking Session */}
              <SectionTitle
                icon={<Clock3 size={18} />}
                title="Linked Parking Session"
              />
              <div className="mb-4">
                <InfoCard
                  title="Session ID"
                  value={ticket.sessionId ?? "-"}
                  icon={NotebookPen}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoCard
                  title="Parking Plan"
                  value={ticket.parkingPlan ?? "-"}
                  icon={Ticket}
                />
                {/* <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1.5">
                    Session Status
                  </p>
                  <StatusBadge status={ticket.parkingStatus ?? "-"} type="session" />
                </div> */}
                <InfoCard
                  title="Session Start"
                  value={ticket.parkingStartTime ?? "-"}
                  icon={CalendarDays}
                />
                <InfoCard
                  title="Session Expiry"
                  value={ticket.parkingExpiryTime ?? "-"}
                  icon={Ban}
                />
              </div>

              {/* Payment Information */}
              <SectionTitle
                icon={<CreditCard size={18} />}
                title="Payment Summary"
              />
              {ticket.paymentId ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoCard
                      title="Payment ID"
                      value={ticket.paymentId ?? "-"}
                      icon={NotebookPen}
                    />
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1.5">
                        Payment Status
                      </p>
                      <StatusBadge
                        status={ticket.paymentStatus || "-"}
                        type="payment"
                      />
                    </div>
                  </div>
                  <InfoCard
                    title="Transaction Ref"
                    value={ticket.transactionReference || "-"}
                    icon={CircleDollarSign}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InfoCard
                      title="Method"
                      value={ticket.paymentMethod || "-"}
                      icon={CreditCard}
                    />
                    <InfoCard
                      title="Paid At"
                      value={ticket.paidAt || "-"}
                      icon={CalendarDays}
                    />
                  </div>
                </div>
              ) : (
                <EmptyState
                  text="Waiting for payment or waiver."
                  icon={CircleDollarSign}
                />
              )}

              {/* Cancellation Information */}
              {ticket.status === "Cancelled" && (
                <div className="relative group mt-10">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-3xl opacity-10"></div>
                  <div className="relative p-6 rounded-3xl bg-[var(--color-surface)] border border-gray-300/30">
                    <div className="flex items-center gap-2 mb-4 text-gray-500">
                      <Ban size={18} />
                      <h4 className="text-xs font-black uppercase tracking-widest">
                        Cancellation Details
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">
                          By
                        </p>
                        <p className="text-sm font-bold mt-1 text-[var(--color-text)]">
                          {ticket.cancelledBy || "System"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">
                          At
                        </p>
                        <p className="text-sm font-bold mt-1 tracking-tight text-[var(--color-text)]">
                          {ticket.cancelledAt || "-"}
                        </p>
                      </div>
                      <div className="col-span-2 p-3 bg-[var(--color-surface-soft)]/50 rounded-lg border border-[var(--color-border)]">
                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold mb-1">
                          Reason
                        </p>
                        <p className="text-xs font-medium italic text-[var(--color-text-secondary)]">
                          "{ticket.cancelReason || "No reason specified"}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Internal Notes */}
              {/* <SectionTitle
                icon={<NotebookPen size={18} />}
                title="Internal Team Notes"
              />
              <div className="space-y-4">
                {ticket.notes.length === 0 ? (
                  <EmptyState
                    text="No internal notes recorded."
                    icon={NotebookPen}
                  />
                ) : (
                  ticket.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] relative group hover:border-[var(--color-primary)]/20 hover:shadow-sm transition-all"
                    >
                      <div className="absolute top-4 right-4 text-[9px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-soft)] px-1.5 py-0.5 rounded">
                        {note.createdAt}
                      </div>
                      <p className="text-[13px] font-medium text-[var(--color-text)] leading-relaxed">
                        {note.note}
                      </p>
                      <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[var(--color-border)] group-hover:border-[var(--color-primary)]/10">
                        <div className="w-5 h-5 rounded-full bg-[var(--color-surface-soft)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)]">
                          <User size={10} />
                        </div>
                        <p className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                          {note.createdBy}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div> */}

              {/* Evidence Photos */}
              <SectionTitle
                icon={<ImageIcon size={18} />}
                title="Evidence Attachment"
              />
              <div className="grid grid-cols-3 gap-3">
                {ticket.evidencePhotos.length === 0 ? (
                  <div className="col-span-3">
                    <EmptyState
                      text="No photographic evidence available."
                      icon={ImageIcon}
                    />
                  </div>
                ) : (
                  ticket.evidencePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[var(--color-border)] shadow-sm group"
                    >
                      <img
                        src={photo.image}
                        alt="evidence"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <button className="p-1.5 bg-white/20 rounded-lg text-white backdrop-blur-sm">
                          <ShieldCheck size={14} />
                        </button>
                      </div>
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
