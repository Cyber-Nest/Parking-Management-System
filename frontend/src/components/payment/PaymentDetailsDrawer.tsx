"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Hash, User, Calendar, Receipt, Info, RefreshCcw, Landmark, Tag } from "lucide-react";
import { Payment } from "@/services/payment.service";

interface PaymentDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

const StatusBadge = ({ status }: { status: string }) => {
  const s = status.toLowerCase();
  const styles: Record<string, string> = {
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    refunded: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[s] || styles.pending}`}>
      {status}
    </span>
  );
};

const InfoCard = ({ title, value, icon: Icon }: { title: string; value: string; icon?: any }) => (
  <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/20 hover:bg-[var(--color-surface-soft)]/40 transition-all group">
    <div className="flex items-center gap-2 mb-1.5">
      {Icon && <Icon size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />}
      <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">
        {title}
      </p>
    </div>
    <h3 className="font-bold text-sm text-[var(--color-text)] break-all leading-tight">{value || "-"}</h3>
  </div>
);

export const PaymentDetailsDrawer = ({ isOpen, onClose, payment }: PaymentDetailsDrawerProps) => {
  if (!payment) return null;

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
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-[var(--color-surface)] shadow-2xl z-50 flex flex-col border-l border-[var(--color-border)]"
          >
            {/* Header / Receipt Style */}
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
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black tracking-tight">Transaction Detail</h2>
                  <StatusBadge status={payment.status} />
                </div>
                <p className="text-xs font-mono text-[var(--color-text-secondary)]">Ref: {payment.transactionReference}</p>
              </div>

              {/* Amount Highlight */}
              <div className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-[var(--color-surface-soft)] to-transparent border border-[var(--color-border)] flex flex-col items-center justify-center">
                <p className="text-[10px] uppercase font-black text-[var(--color-text-muted)] mb-1">Total Paid</p>
                <h1 className="text-4xl font-black text-[var(--color-text)]">
                   {payment.amount}
                </h1>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <InfoCard title="Plate Number" value={payment.plate} icon={Tag} />
                <InfoCard title="Payment Type" value={payment.type} icon={Info} />
                <InfoCard title="Method" value={payment.method} icon={CreditCard} />
                <InfoCard title="Processed By" value={payment.processedBy} icon={User} />
                <div className="col-span-2">
                   <InfoCard title="Payment Date & Time" value={`${payment.date} at ${payment.time}`} icon={Calendar} />
                </div>
                <InfoCard title="Payment ID" value={payment.id} icon={Hash} />
                <InfoCard title="Session ID" value={payment.sessionId} icon={Landmark} />
              </div>

              {/* Refund Information Section */}
              {payment.refundInfo?.refunded && (
                <div className="relative group">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl opacity-10 group-hover:opacity-20 transition duration-300"></div>
                   <div className="relative p-6 rounded-3xl bg-[var(--color-surface)] border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-4 text-blue-500">
                        <RefreshCcw size={18} className="animate-spin-slow" />
                        <h4 className="text-xs font-black uppercase tracking-widest">Refund Information</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Refunded By</p>
                          <p className="text-sm font-bold mt-1">{payment.refundInfo.refundedBy || "System"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Refunded At</p>
                          <p className="text-sm font-bold mt-1">{payment.refundInfo.refundedAt || "-"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Reason</p>
                          <p className="text-sm font-medium mt-1 italic text-[var(--color-text-secondary)]">
                            "{payment.refundInfo.refundReason || "No reason provided"}"
                          </p>
                        </div>
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex gap-3">
                <button 
                  onClick={() => window.print()} 
                  className="flex-1 py-4 border border-[var(--color-border)] rounded-2xl font-bold text-sm hover:bg-[var(--color-surface-soft)] transition-all flex items-center justify-center gap-2"
                >
                   Print Receipt
                </button>
                <button 
                  onClick={onClose}
                  className="flex-[1.5] py-4 bg-[var(--color-text)] text-[var(--color-surface)] rounded-2xl font-bold text-sm hover:opacity-90 transition-all"
                >
                    Done
                </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};