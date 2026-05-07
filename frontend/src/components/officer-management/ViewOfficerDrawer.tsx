"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, Ticket, Clock3, Activity, ShieldAlert } from "lucide-react";
import { Officer } from "@/services/officer.service";

interface ViewOfficerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  officer: Officer | null;
}

const InfoCard = ({ icon, title, value }: any) => (
  <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
    <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
      {icon}
      <p className="text-[11px] uppercase font-black tracking-wider">{title}</p>
    </div>
    <h3 className="mt-3 font-bold text-sm break-all">{value}</h3>
  </div>
);

export const ViewOfficerDrawer = ({ isOpen, onClose, officer }: ViewOfficerDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen && officer && (
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
                <h2 className="text-xl font-black">Officer Profile</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{officer.id}</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-surface-soft)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8">
              {/* Top Section */}
              <div className="flex items-center gap-5 mb-8">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border">
                  <img
                    src={`https://i.pravatar.cc/300?u=${officer.id}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-black">{officer.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-600">
                      {officer.role}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black ${
                        officer.accessStatus === "Enabled"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {officer.accessStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-5">
                <InfoCard icon={<Mail size={16} />} title="Email" value={officer.email} />
                <InfoCard icon={<Phone size={16} />} title="Phone" value={officer.phone} />
                <InfoCard icon={<Ticket size={16} />} title="Tickets Issued" value={String(officer.tickets)} />
                <InfoCard icon={<Clock3 size={16} />} title="Last Login" value={`${officer.date} - ${officer.time}`} />
                <InfoCard icon={<Activity size={16} />} title="Login Status" value={officer.loginStatus} />
                <InfoCard icon={<ShieldAlert size={16} />} title="Access Status" value={officer.accessStatus} />
              </div>

              {/* Disable Info */}
              {officer.accessStatus === "Disabled" && (
                <div className="mt-8 p-5 rounded-2xl border border-red-100 bg-red-50">
                  <h3 className="text-sm font-black text-red-600 uppercase tracking-wider mb-4">
                    Disable Details
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <InfoCard title="Disabled By" value={officer.disabledBy || "-"} />
                    <InfoCard title="Disabled At" value={officer.disabledAt || "-"} />
                    <div className="col-span-2">
                      <InfoCard title="Reason" value={officer.disableReason || "-"} />
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Logs */}
              <div className="mt-8">
                <h3 className="text-sm font-black uppercase tracking-wider mb-5">Activity Logs</h3>
                <div className="space-y-3">
                  {officer.activityLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
                      <p className="font-semibold text-sm">{log.action}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-2">{log.createdAt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};