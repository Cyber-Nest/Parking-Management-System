"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Ticket,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Building2,
  Camera,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  Printer,
  Car,
  CreditCard,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  penaltyReportService,
  PenaltyTicketDetails,
} from "@/services/penalty-report.service";

interface PenaltyDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string | null;
}

const SectionTitle = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="flex items-center gap-2 mt-8 mb-4">
    <div className="p-1.5 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
      {React.cloneElement(icon as React.ReactElement, { size: 14 })}
    </div>
    <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
      {title}
    </h3>
  </div>
);

const InfoRow = ({ label, value, icon, fullWidth = false }: any) => (
  <div
    className={`flex flex-col gap-1 py-3 px-4 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-soft)]/50 transition-all ${fullWidth ? "col-span-2" : ""}`}
  >
    <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
      {React.cloneElement(icon as React.ReactElement, { size: 12 })}
      <span className="text-[10px] font-bold uppercase tracking-tight">
        {label}
      </span>
    </div>
    <div className="text-sm font-black text-[var(--color-text-primary)] truncate">
      {value || "-"}
    </div>
  </div>
);

const EvidenceImage = ({ src, onClick }: any) => (
  <div
    onClick={onClick}
    className="relative aspect-square w-24 rounded-2xl overflow-hidden border-2 border-[var(--color-border)] cursor-pointer group hover:border-[var(--color-primary)] transition-all shadow-sm"
  >
    <img
      src={src}
      alt="Evidence"
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white">
        <Eye size={16} />
      </div>
    </div>
  </div>
);

export const PenaltyDetailsDrawer = ({
  isOpen,
  onClose,
  ticketId,
}: PenaltyDetailsDrawerProps) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<PenaltyTicketDetails | null>(null);

  useEffect(() => {
    if (isOpen && ticketId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await penaltyReportService.getTicketDetails(ticketId);
          setDetails(data);
        } catch (error) {
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
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[60]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-xl bg-[var(--color-surface)] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] z-[70] border-l border-[var(--color-border)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Ticket size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[var(--color-text-primary)] leading-tight">
                    Penalty Details
                  </h2>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">
                    Ticket{" "}
                    <span className="text-[var(--color-primary)]">
                      #{ticketId}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-[var(--color-surface-soft)] flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-300"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {loading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-40 bg-[var(--color-surface-soft)] rounded-3xl" />
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-[var(--color-surface-soft)] rounded-2xl"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                details && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Status Highlight Card */}
                    <div
                      className={`p-6 rounded-[1rem] border flex items-center justify-between ${
                        details.status === "Paid"
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : "bg-rose-500/5 border-rose-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${details.status === "Paid" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}
                        >
                          {details.status === "Paid" ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <AlertCircle size={20} />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                            Ticket Status
                          </p>
                          <h4 className="text-lg font-black">
                            {details.status}
                          </h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                          Total Fine
                        </p>
                        <h4 className="text-2xl font-black text-[var(--color-text-primary)]">
                          ${details.amount}
                        </h4>
                      </div>
                    </div>

                    {/* General Info Grid */}
                    <SectionTitle icon={<Clock />} title="Occurrence Details" />
                    <div className="grid grid-cols-2 gap-2">
                      <InfoRow
                        icon={<Calendar />}
                        label="Date"
                        value={details.issueDate}
                      />
                      <InfoRow
                        icon={<Clock />}
                        label="Time"
                        value={details.issueTime}
                      />
                      <InfoRow
                        icon={<MapPin />}
                        label="Zone / Location"
                        value={details.location}
                        fullWidth
                      />
                    </div>

                    {/* Vehicle Info */}
                    <SectionTitle icon={<Car />} title="Subject Vehicle" />
                    <div className="grid grid-cols-2 gap-2 bg-[var(--color-surface-soft)]/30 p-2 rounded-lg border border-[var(--color-border)]/50">
                      <InfoRow
                        icon={<CreditCard />}
                        label="License Plate"
                        value={details.plateNumber}
                      />
                      <InfoRow
                        icon={<ShieldCheck />}
                        label="Model"
                        value={details.vehicleModel}
                      />
                    </div>

                    {/* Evidence Section */}
                    {details.evidence && details.evidence.length > 0 && (
                      <>
                        <SectionTitle
                          icon={<Camera />}
                          title="Visual Evidence"
                        />
                        <div className="flex flex-wrap gap-4 px-2">
                          {details.evidence.map((img, idx) => (
                            <EvidenceImage
                              key={idx}
                              src={img}
                              onClick={() => window.open(img, "_blank")}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Officer Info */}
                    <SectionTitle icon={<User />} title="Issuing Authority" />
                    <div className="p-4 rounded-2xl border border-[var(--color-border)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-black text-xs">
                          {details.officerName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black">
                            {details.officerName}
                          </p>
                          <p className="text-[10px] font-bold opacity-60 uppercase">
                            Officer ID: {details.officerId}
                          </p>
                        </div>
                      </div>
                      {/* <button className="text-[10px] font-black uppercase text-[var(--color-primary)] hover:underline">View Profile</button> */}
                    </div>

                    {/* Payment Details (If available) */}
                    {details.status === "Paid" && details.paymentInfo && (
                      <>
                        <SectionTitle
                          icon={<DollarSign />}
                          title="Transaction Details"
                        />
                        <div className="bg-emerald-500/5 rounded-3xl p-6 border border-emerald-500/10 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <InfoRow
                              icon={<CreditCard />}
                              label="Method"
                              value={details.paymentInfo.method}
                            />
                            <InfoRow
                              icon={<Calendar />}
                              label="Paid On"
                              value={details.paymentInfo.date}
                            />
                          </div>
                          <div className="pt-4 border-t border-emerald-500/10">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">
                              Transaction Ref
                            </p>
                            <code className="text-xs font-mono font-bold break-all">
                              {details.paymentInfo.transactionId}
                            </code>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Notes Section */}
                    {details.notes && details.notes.length > 0 && (
                      <>
                        <SectionTitle
                          icon={<FileText />}
                          title="Officer Remarks"
                        />
                        <div className="space-y-3">
                          {details.notes.map((note, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-[var(--color-surface-soft)] border-l-4 border-[var(--color-primary)]"
                            >
                              <p className="text-sm font-medium leading-relaxed italic text-[var(--color-text-secondary)]">
                                "{note.content}"
                              </p>
                              <div className="mt-3 flex items-center justify-between opacity-50">
                                <span className="text-[10px] font-bold uppercase">
                                  {note.createdBy}
                                </span>
                                <span className="text-[10px]">
                                  {note.createdAt}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
