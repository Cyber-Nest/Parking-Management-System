"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Ticket,
  CheckCircle2,
  Clock,
  XCircle,
  Briefcase,
  Calendar,
  MapPin,
  Eye,
  Image as ImageIcon,
  FileText,
  Activity as ActivityIcon,
  TrendingUp,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

// Services
import {
  officerPerformanceService,
  OfficerPerformanceData,
  OfficerTicketData,
  OfficerEvidenceData,
  OfficerActivityLog,
} from "@/services/officer-performance.service";

const StatusBadge = ({ status }: { status: string }) => {
  const s = status.toLowerCase();
  const colors: Record<string, string> = {
    paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    unpaid: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    cancelled: "bg-gray-100 text-gray-500 border-gray-200",
    void: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${colors[s] || "bg-gray-100 text-gray-600 border-gray-200"}`}
    >
      {status}
    </span>
  );
};

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
    <h3 className="text-sm font-black uppercase tracking-[0.1em] text-[var(--color-text-primary)]">
      {title}
    </h3>
  </div>
);

const InfoCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
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
    <h3 className="font-semibold text-[13px] text-[var(--color-text-primary)] leading-tight break-words">
      {value || "-"}
    </h3>
  </div>
);

export const OfficerDetailsDrawer = ({
  isOpen,
  onClose,
  officer,
}: {
  isOpen: boolean;
  onClose: () => void;
  officer: OfficerPerformanceData | null;
}) => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<OfficerTicketData[]>([]);
  const [evidence, setEvidence] = useState<OfficerEvidenceData[]>([]);
  const [activities, setActivities] = useState<OfficerActivityLog[]>([]);
  const [breakdown, setBreakdown] = useState({
    paid: 0,
    unpaid: 0,
    cancelled: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    cancelledAmount: 0,
  });

  useEffect(() => {
    if (isOpen && officer) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [t, e, a, b] = await Promise.all([
            officerPerformanceService.getOfficerTickets(officer.id),
            officerPerformanceService.getOfficerEvidence(officer.id),
            officerPerformanceService.getOfficerActivities(officer.id),
            officerPerformanceService.getOfficerTicketBreakdown(officer.id),
          ]);
          setTickets(t);
          setEvidence(e);
          setActivities(a);
          setBreakdown(b);
        } catch (error) {
          toast.error("Data fetch failed");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, officer]);

  if (!officer) return null;

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
            className="fixed top-0 right-0 h-full w-full max-w-xl bg-[var(--color-surface)] shadow-2xl z-50 flex flex-col border-l border-[var(--color-border)]"
          >
            {/* Header */}
            <div className="p-8 py-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface)] sticky top-0 z-10 shadow-sm">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)] uppercase">
                  Officer Intel
                </h2>
                <p className="text-xs font-mono bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] px-2 py-0.5 rounded inline-block mt-1 tracking-tighter">
                  ID: {officer.officerId}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-2 custom-scrollbar">
              {loading ? (
                <div className="animate-pulse space-y-6">
                  <div className="h-32 bg-[var(--color-surface-soft)] rounded-3xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-[var(--color-surface-soft)] rounded-xl" />
                    <div className="h-20 bg-[var(--color-surface-soft)] rounded-xl" />
                  </div>
                  <div className="h-40 bg-[var(--color-surface-soft)] rounded-3xl" />
                </div>
              ) : (
                <>
                  {/* Hero Card */}
                  <div className="mb-8 p-6 rounded-[2rem] bg-[var(--color-primary)] text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-[10px] uppercase font-black opacity-50 tracking-[0.2em] mb-1">
                        Total Revenue Generated
                      </p>
                      <h1 className="text-4xl font-black tracking-tighter">
                        ${officer.revenue.toLocaleString()}
                      </h1>
                      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-wider">
                        <TrendingUp size={12} className="text-emerald-400" />{" "}
                        Top Tier Performance
                      </div>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
                  </div>

                  {/* Profile Section */}
                  <SectionTitle
                    icon={<User size={18} />}
                    title="Personnel Identification"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 mb-2">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center text-white text-2xl font-black shadow-lg">
                        {officer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[var(--color-text-primary)] leading-tight">
                          {officer.name}
                        </h3>
                        <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest opacity-80">
                          {officer.role || "Active Officer"}
                        </p>
                      </div>
                    </div>
                    <InfoCard
                      title="Primary Email"
                      value={officer.email}
                      icon={Mail}
                    />
                    <InfoCard
                      title="Phone"
                      value={officer.phone}
                      icon={Phone}
                    />
                    <div className="col-span-2">
                      <InfoCard
                        title="Registered Address"
                        value={[
                          officer.addressStreet,
                          officer.addressCity,
                          officer.addressProvince,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                        icon={MapPin}
                      />
                    </div>
                  </div>

                  {/* Ticket Analytics Table */}
                  <SectionTitle
                    icon={<FileText size={18} />}
                    title="Issuance History"
                  />
                  <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-soft)]/10">
                    <table className="w-full text-left text-[12px]">
                      <thead className="bg-[var(--color-surface-soft)]/50 border-b border-[var(--color-border)]">
                        <tr className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">
                          <th className="px-4 py-3">Ticket ID</th>

                          <th className="px-4 py-3">Violation</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]/50">
                        {tickets.slice(0, 5).map((t, i) => (
                          <tr
                            key={i}
                            className="hover:bg-white/50 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium">
                              <div className="text-[var(--color-text-primary)] font-bold">
                                {t.ticketId}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium">
                              <div className="text-[var(--color-text-primary)] font-bold">
                                {t.violationType}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-black text-[var(--color-text-primary)]">
                              ${t.amount}
                            </td>

                            <td className="px-4 py-3 text-right">
                              <StatusBadge status={t.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/*Evidence */}
                  <SectionTitle
                    icon={<ImageIcon size={18} />}
                    title="Visual Evidence"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    {evidence.map((ev, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-xl overflow-hidden border border-[var(--color-border)] group relative cursor-pointer"
                      >
                        <img
                          src={ev.imageUrl}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          alt="evidence"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye size={16} className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Activity Log (Timeline Style) */}
                  <SectionTitle
                    icon={<ActivityIcon size={18} />}
                    title="Activity Logs"
                  />
                  <div className="space-y-4 ml-2">
                    {activities.map((log, i) => (
                      <div
                        key={i}
                        className="relative pl-6 pb-4 border-l border-[var(--color-border)] last:border-0"
                      >
                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] border-2 border-[var(--color-surface)] shadow-sm" />
                        <div className="flex justify-between items-start">
                          <h4 className="text-[11px] font-black uppercase text-[var(--color-text-primary)] tracking-tight">
                            {log.action}
                          </h4>
                          <span className="text-[9px] font-mono text-[var(--color-text-muted)] flex items-center gap-1">
                            <Clock size={10} /> {log.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-1 leading-relaxed italic border-l-2 border-[var(--color-primary)]/10 pl-2 bg-[var(--color-surface-soft)]/20 py-1">
                          "{log.details}"
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
