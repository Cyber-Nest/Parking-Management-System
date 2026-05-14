"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  User,
  AlertCircle,
  FileText,
  Printer,
  Download,
  Car,
  Building2,
  ShieldAlert,
  Gavel,
  Fingerprint,
  History,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  outstandingDueService,
  OutstandingTicket,
  type OutstandingDueFilters,
} from "@/services/outstanding-due.service";

interface OutstandingDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string | null;
  exportFilters?: OutstandingDueFilters;
}

const InfoRow = ({ label, value, icon, color, subValue }: any) => (
  <div className="flex items-center justify-between py-3.5 px-2 hover:bg-[var(--color-surface-soft)]/40 rounded-xl transition-all group">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] leading-none">
          {label}
        </p>
        {subValue && (
          <p className="text-[10px] text-[var(--color-text-muted)]/60 mt-1">
            {subValue}
          </p>
        )}
      </div>
    </div>
    <span
      className={`text-sm font-black tracking-tight ${color || "text-[var(--color-text-primary)]"}`}
    >
      {value || "-"}
    </span>
  </div>
);

const SectionTitle = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="mt-8 mb-4">
    <div className="flex items-center gap-2.5 px-1">
      <div className="text-[var(--color-primary)] opacity-80">{icon}</div>
      <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[var(--color-text-primary)]">
        {title}
      </h3>
    </div>
    <div className="h-[1px] w-full bg-gradient-to-r from-[var(--color-border)] via-[var(--color-border)] to-transparent mt-2" />
  </div>
);

const StatusBadge = ({ days }: { days: number }) => {
  const config =
    days === 0
      ? { label: "DUE TODAY", classes: "bg-emerald-500" }
      : days <= 5
        ? { label: "PENDING", classes: "bg-amber-500" }
        : days <= 15
          ? { label: "OVERDUE", classes: "bg-orange-500" }
          : { label: "CRITICAL", classes: "bg-rose-500" };

  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white tracking-tighter ${config.classes}`}
    >
      {config.label}
    </span>
  );
};

export const OutstandingDetailsDrawer = ({
  isOpen,
  onClose,
  ticketId,
  exportFilters,
}: OutstandingDetailsDrawerProps) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<OutstandingTicket | null>(null);

  useEffect(() => {
    if (isOpen && ticketId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await outstandingDueService.getTicketById(ticketId);
          setDetails(data);
        } catch (error) {
          console.error(error);
          toast.error("Failed to load ticket details");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, ticketId]);

  if (!ticketId) return null;

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
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--color-surface)] shadow-[-20px_0_50px_rgba(0,0,0,0.2)] z-50 border-l border-[var(--color-border)] flex flex-col print:shadow-none print:border-0"
            id="outstanding-drawer-print"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[var(--color-surface)]/80 backdrop-blur-md z-10 flex items-center justify-between px-8 py-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-red-800/60 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                    <Ticket size={24} />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">
                    Enforcement <span className="text-rose-500">Report</span>
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="px-2 py-0.5 rounded bg-gray-100 dark:bg-[var(--color-primary)] border border-gray-200 dark:border-gray-700 text-[10px] font-mono font-bold text-white tracking-tighter">
                      {details?.ticketId}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-full hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 transition-all active:scale-90 border border-transparent hover:border-rose-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
              {loading ? (
                <div className="mt-12 space-y-8 animate-pulse text-center text-[var(--color-text-muted)] font-black uppercase tracking-widest text-xs">
                  Retrieving Citation...
                </div>
              ) : (
                details && (
                  <>
                    {/* Hero Summary Card */}
                    <div className="mt-6 p-6 rounded-[2rem] bg-gradient-to-br from-[var(--color-surface-soft)] to-transparent border border-[var(--color-border)] shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Gavel size={120} />
                      </div>

                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                            Amount Outstanding
                          </p>
                          <StatusBadge days={details.daysPending} />
                        </div>
                        <h3 className="text-4xl font-black text-rose-500 leading-tight">
                          $
                          {details.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                          <span className="block text-[var(--color-text-muted)] text-sm mt-1 uppercase tracking-widest opacity-60">
                            Penalty Balance
                          </span>
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-[var(--color-border)]/50">
                          <div className="flex items-center gap-2">
                            <Car
                              size={16}
                              className="text-[var(--color-primary)]"
                            />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                                Vehicle
                              </p>
                              <p className="text-xs font-bold tracking-widest uppercase">
                                {details.plateNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar
                              size={16}
                              className="text-[var(--color-text-muted)]"
                            />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                                Ticket Date
                              </p>
                              <p className="text-xs font-bold truncate max-w-[100px]">
                                {details.ticketDate}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <SectionTitle
                      icon={<ShieldAlert size={16} />}
                      title="Violation Details"
                    />
                    <div className="space-y-0.5 bg-[var(--color-surface-soft)]/20 p-2 rounded-2xl border border-[var(--color-border)]/30">
                      <InfoRow
                        icon={<AlertCircle size={14} />}
                        label="Violation Type"
                        value={details.violationType}
                        color="text-rose-600"
                      />
                      <InfoRow
                        icon={<MapPin size={14} />}
                        label="Location"
                        value={details.location}
                      />
                      <InfoRow
                        icon={<Clock size={14} />}
                        label="Due Date"
                        value={details.dueDate}
                        color={
                          details.daysPending > 15
                            ? "text-rose-500"
                            : "text-orange-500"
                        }
                      />
                      <InfoRow
                        icon={<History size={14} />}
                        label="Aging Period"
                        value={`${details.daysPending} Days Overdue`}
                      />
                    </div>

                    <SectionTitle
                      icon={<Building2 size={16} />}
                      title="Enforcement Context"
                    />
                    <div className="space-y-0.5">
                      <InfoRow
                        icon={<User size={14} />}
                        label="Officer"
                        value={details.officerName || "N/A"}
                      />
                      <InfoRow
                        icon={<Fingerprint size={14} />}
                        label="Badge ID"
                        value={details.officerId || "N/A"}
                      />
                    </div>

                    {details.notes && (
                      <>
                        <SectionTitle
                          icon={<FileText size={16} />}
                          title="Official Notes"
                        />
                        <div className="p-5 rounded-2xl bg-[var(--color-surface-soft)] border border-[var(--color-border)] border-dashed relative">
                          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)] italic font-medium">
                            "{details.notes}"
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 p-6 bg-[var(--color-surface)]/80 backdrop-blur-md border-t border-[var(--color-border)] flex gap-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest border border-[var(--color-border)] hover:bg-[var(--color-surface-soft)] transition-all active:scale-95"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!exportFilters) {
                    toast.error("Filters unavailable for export");
                    return;
                  }
                  try {
                    const response = await outstandingDueService.exportReport({
                      ...exportFilters,
                      format: "pdf",
                    });
                    if (response.blob) {
                      const url = window.URL.createObjectURL(response.blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.setAttribute(
                        "download",
                        `outstanding_due_${new Date().toISOString().split("T")[0]}.pdf`,
                      );
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      window.URL.revokeObjectURL(url);
                      toast.success("PDF downloaded");
                    }
                  } catch (e) {
                    console.error(e);
                    toast.error("Export failed");
                  }
                }}
                className="flex-[1.5] flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest bg-[var(--color-primary)] text-white hover:opacity-90 shadow-lg shadow-rose-500/20 transition-all active:scale-95"
              >
                <Download size={16} />
                Export PDF
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
