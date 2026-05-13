"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Receipt,
  User,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  Printer,
  Download,
  DollarSign,
  History,
  Building2,
  Globe,
  ShieldCheck,
  CreditCard as CardIcon,
  Fingerprint,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  refundsAdjustmentsService,
  RefundAdjustmentData,
} from "@/services/refunds-adjustments.service";

interface ExtendedRefundData extends RefundAdjustmentData {
  originalPaymentId?: string;
  originalPaymentAmount?: number;
  originalPaymentMethod?: string;
  originalPaymentDate?: string;
  refundApprovedBy?: string;
  refundApprovedAt?: string;
  auditLogs?: {
    action: string;
    timestamp: string;
    user: string;
  }[];
  stripeTransactionId?: string;
  gateway?: string;
  deviceInfo?: string;
}

interface RefundDetailsDrawerProps {
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
  const styles: Record<string, string> = {
    Completed: "bg-emerald-500 text-white",
    Pending: "bg-amber-500 text-white",
    Failed: "bg-rose-500 text-white",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-tighter ${styles[status] || styles.Completed}`}
    >
      {status.toUpperCase()}
    </span>
  );
};

export const RefundDetailsDrawer = ({
  isOpen,
  onClose,
  itemId,
}: RefundDetailsDrawerProps) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<ExtendedRefundData | null>(null);

  useEffect(() => {
    if (isOpen && itemId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await refundsAdjustmentsService.getDetailsById(itemId);
          const extendedData: ExtendedRefundData = {
            ...data,
            originalPaymentId:
              data?.type === "Refund"
                ? `PAY-${Math.floor(Math.random() * 100000)}`
                : undefined,
            originalPaymentAmount:
              data?.type === "Refund" ? Math.abs(data.amount) * 2 : undefined,
            originalPaymentMethod: data?.paymentMethod,
            originalPaymentDate: data?.dateTime,
            refundApprovedBy:
              data?.type === "Refund"
                ? data.processedBy === "System"
                  ? "Auto-Approved"
                  : data.processedBy
                : undefined,
            refundApprovedAt: data?.dateTime,
            stripeTransactionId:
              data?.transactionId ||
              `txn_${Math.random().toString(36).substring(2, 10)}`,
            gateway:
              data?.paymentMethod === "Visa" ||
              data?.paymentMethod === "Mastercard"
                ? "Stripe"
                : "Manual",
            auditLogs: [
              {
                action: `${data?.type} requested`,
                timestamp: data?.dateTime ?? "",
                user: data?.processedBy || "System",
              },
              {
                action: `${data?.type} approved`,
                timestamp: data?.dateTime ?? "",
                user: data?.processedBy || "Admin",
              },
              {
                action: `${data?.type} processed`,
                timestamp: data?.dateTime ?? "",
                user: data?.processedBy || "System",
              },
            ],
          } as ExtendedRefundData;
          setDetails(extendedData);
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
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center text-white shadow-lg shadow-[var(--color-primary)]/20">
                    <Receipt size={24} />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">
                    {details?.type || "Transaction"} Details
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="px-2 py-0.5 rounded bg-[var(--color-primary)] text-white border border-[var(--color-primary)] text-[10px] font-mono font-bold tracking-tighter">
                      {details?.referenceId}
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
                  Loading Ledger...
                </div>
              ) : (
                details && (
                  <>
                    {/* Amount Profile Card */}
                    <div className="mt-6 p-6 rounded-[2rem] bg-gradient-to-br from-[var(--color-surface-soft)] to-transparent border border-[var(--color-border)] shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Fingerprint size={120} />
                      </div>

                      <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
                          Settlement Amount
                        </p>
                        <h3
                          className={`text-3xl font-black leading-tight ${details.amount < 0 ? "text-rose-500" : "text-emerald-500"}`}
                        >
                          {details.amount < 0
                            ? `-$${Math.abs(details.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                            : `+$${details.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          <span className="block text-[var(--color-text-muted)] text-sm mt-1 uppercase tracking-widest opacity-60">
                            {details.type} Logic Applied
                          </span>
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-[var(--color-border)]/50">
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              size={16}
                              className="text-[var(--color-text-muted)]"
                            />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                                Status
                              </p>
                              <StatusBadge status={details.status} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe
                              size={16}
                              className="text-[var(--color-text-muted)]"
                            />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                                Gateway
                              </p>
                              <p className="text-xs font-bold truncate max-w-[100px]">
                                {details.gateway}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <SectionTitle
                      icon={<FileText size={16} />}
                      title="Core Information"
                    />
                    <div className="space-y-0.5 bg-[var(--color-surface-soft)]/20 p-2 rounded-2xl border border-[var(--color-border)]/30">
                      <InfoRow
                        icon={<Calendar size={14} />}
                        label="Execution Date"
                        value={details.dateTime}
                      />
                      <InfoRow
                        icon={<AlertCircle size={14} />}
                        label="Reason/Note"
                        value={details.reason}
                      />
                      <InfoRow
                        icon={<User size={14} />}
                        label="Entity Reference"
                        value={details.plateUser}
                      />
                    </div>

                    {details.type === "Refund" && (
                      <>
                        <SectionTitle
                          icon={<History size={16} />}
                          title="Origin Details"
                        />
                        <div className="space-y-0.5">
                          <InfoRow
                            icon={<CardIcon size={14} />}
                            label="Original Method"
                            value={details.originalPaymentMethod}
                          />
                          <InfoRow
                            icon={<DollarSign size={14} />}
                            label="Original Value"
                            value={`$${details.originalPaymentAmount?.toFixed(2)}`}
                            color="text-[var(--color-primary)]"
                          />
                        </div>
                      </>
                    )}

                    <SectionTitle
                      icon={<ShieldCheck size={16} />}
                      title="Authorization"
                    />
                    <div className="space-y-0.5">
                      <InfoRow
                        icon={<User size={14} />}
                        label="Authorized By"
                        value={details.refundApprovedBy || details.processedBy}
                      />
                      <InfoRow
                        icon={<Building2 size={14} />}
                        label="Platform"
                        value="Admin Console v2.0"
                      />
                    </div>

                    {/* Audit Trail  */}
                    <SectionTitle
                      icon={<History size={16} />}
                      title="Audit Trail"
                    />
                    <div className="ml-4 space-y-6 border-l border-[var(--color-border)] pl-6 py-2">
                      {details.auditLogs?.map((log, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[30.5px] top-1 w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">
                            {log.action}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-1 font-medium">
                            {log.timestamp} •{" "}
                            <span className="text-[var(--color-primary)]">
                              @{log.user}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 p-6 bg-[var(--color-surface)]/80 backdrop-blur-md border-t border-[var(--color-border)] flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest border border-[var(--color-border)] hover:bg-[var(--color-surface-soft)] transition-all active:scale-95">
                <Printer size={16} />
                Print
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest bg-[var(--color-primary)] text-white hover:opacity-90 shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-95">
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
