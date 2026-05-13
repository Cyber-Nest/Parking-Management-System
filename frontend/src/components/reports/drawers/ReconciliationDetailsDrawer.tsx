"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  CreditCard,
  Landmark,
  Undo2,
  Settings2,
  FileText,
  Printer,
  Download,
  Hash,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Banknote,
  Fingerprint,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  paymentReconciliationService,
  ReconciliationData,
} from "@/services/payment-reconciliation.service";

interface ReconciliationDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
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

const StatusBadge = ({ status }: { status: string }) => {
  const isReconciled = status === "Reconciled";
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-tighter ${
        isReconciled ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
};

export const ReconciliationDetailsDrawer = ({
  isOpen,
  onClose,
  itemId,
}: ReconciliationDetailsDrawerProps) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<ReconciliationData | null>(null);

  useEffect(() => {
    if (isOpen && itemId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const data =
            await paymentReconciliationService.getDetailsById(itemId);
          setDetails(data);
        } catch (error) {
          console.error(error);
          toast.error("Failed to load details");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, itemId]);

  if (!itemId) return null;

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
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--color-surface)] shadow-[-20px_0_50px_rgba(0,0,0,0.2)] z-50 border-l border-[var(--color-border)] flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[var(--color-surface)]/80 backdrop-blur-md z-10 flex items-center justify-between px-8 py-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center text-white">
                    <Landmark size={24} />
                  </div>
                  {/* <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[var(--color-surface)] ${details?.status === "Reconciled" ? "bg-emerald-500" : "bg-amber-500"}`} /> */}
                </div>
                <div>
                  <h2 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">
                    Reconciliation{" "}
                    <span className="text-[var(--color-primary)]">Details</span>
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="px-2 py-0.5 rounded bg-[var(--color-primary)] border border-[var(--color-primary)] text-[10px] font-mono font-bold text-white tracking-tighter">
                      {details?.bankReference || "REF-PENDING"}
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
                  Syncing Balance Sheet...
                </div>
              ) : (
                details && (
                  <div className="py-2">
                    {/* Summary Card */}
                    <div className="mt-6 p-6 rounded-[2rem] bg-gradient-to-br from-[var(--color-surface-soft)] to-transparent border border-[var(--color-border)] shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Fingerprint size={120} />
                      </div>

                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <StatusBadge status={details.status} />
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                              Net Expected
                            </p>
                            <p className="text-2xl font-black text-[var(--color-text-primary)] tracking-tighter">
                              $
                              {details.netExpected.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--color-border)]/50">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                              Deposited
                            </p>
                            <p className="text-xl font-black text-[var(--color-text-primary)] tracking-tighter">
                              $
                              {details.deposited.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-rose-500">
                              Variance
                            </p>
                            <p
                              className={`text-xl font-black tracking-tighter ${details.variance === 0 ? "text-emerald-500" : "text-rose-500"}`}
                            >
                              $
                              {details.variance.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <SectionTitle
                      icon={<ShieldCheck size={16} />}
                      title="Registry Info"
                    />
                    <div className="space-y-0.5 bg-[var(--color-surface-soft)]/20 p-2 rounded-2xl border border-[var(--color-border)]/30">
                      <InfoRow
                        icon={<Calendar size={14} />}
                        label="Posting Date"
                        value={details.date}
                      />
                      <InfoRow
                        icon={<Hash size={14} />}
                        label="Bank Reference"
                        value={details.bankReference}
                      />
                    </div>

                    <SectionTitle
                      icon={<Wallet size={16} />}
                      title="Inflow Breakdown"
                    />
                    <div className="space-y-0.5">
                      <InfoRow
                        icon={<ArrowUpRight size={14} />}
                        label="Gross Collected"
                        value={`$${details.totalCollected.toLocaleString()}`}
                        color="text-emerald-600"
                        subValue="Revenue Captured"
                      />
                      <InfoRow
                        icon={<CreditCard size={14} />}
                        label="Card Payments"
                        value={`$${details.cardAmount.toLocaleString()}`}
                      />
                      <InfoRow
                        icon={<Banknote size={14} />}
                        label="Other Channels"
                        value={`$${details.otherAmount.toLocaleString()}`}
                      />
                    </div>

                    <SectionTitle
                      icon={<Undo2 size={16} />}
                      title="Outflow & Adjustments"
                    />
                    <div className="space-y-0.5">
                      <InfoRow
                        icon={<ArrowDownRight size={14} />}
                        label="Refunds"
                        value={`-$${Math.abs(details.refunds).toLocaleString()}`}
                        color="text-rose-500"
                      />
                      <InfoRow
                        icon={<Settings2 size={14} />}
                        label="Corrections"
                        value={`$${details.adjustment.toLocaleString()}`}
                      />
                    </div>

                    {details.notes && (
                      <>
                        <SectionTitle
                          icon={<FileText size={16} />}
                          title="Audit Notes"
                        />
                        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                          <p className="text-xs leading-relaxed text-[var(--color-text-primary)] font-medium italic">
                            "{details.notes}"
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 p-6 bg-[var(--color-surface)]/80 backdrop-blur-md border-t border-[var(--color-border)] flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest border border-[var(--color-border)] hover:bg-[var(--color-surface-soft)] transition-all active:scale-95">
                <Printer size={16} />
                Print
              </button>
              <button className="flex-[1.5] flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest bg-[var(--color-primary)] text-white hover:opacity-95 shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-95">
                <Download size={16} />
                Download Report
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
