"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Payment } from "@/services/payment.service";

interface PaymentDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

const InfoCard = ({ title, value }: { title: string; value: string }) => (
  <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
    <p className="text-[11px] uppercase font-black text-[var(--color-text-muted)] tracking-wider">{title}</p>
    <h3 className="mt-2 font-bold text-sm break-all">{value || "-"}</h3>
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
                <h2 className="text-xl font-black">Payment Details</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{payment.id}</p>
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
                <InfoCard title="Payment ID" value={payment.id} />
                <InfoCard title="Session ID" value={payment.sessionId} />
                <InfoCard title="Plate Number" value={payment.plate} />
                <InfoCard title="Payment Type" value={payment.type} />
                <InfoCard title="Amount" value={payment.amount} />
                <InfoCard title="Payment Method" value={payment.method} />
                <InfoCard title="Payment Status" value={payment.status} />
                <InfoCard title="Processed By" value={payment.processedBy} />
                <InfoCard title="Transaction Ref" value={payment.transactionReference} />
                <InfoCard title="Payment Date" value={`${payment.date} - ${payment.time}`} />

                {payment.refundInfo?.refunded && (
                  <>
                    <InfoCard title="Refunded By" value={payment.refundInfo.refundedBy || "-"} />
                    <InfoCard title="Refunded At" value={payment.refundInfo.refundedAt || "-"} />
                    <div className="col-span-2">
                      <InfoCard title="Refund Reason" value={payment.refundInfo.refundReason || "-"} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};