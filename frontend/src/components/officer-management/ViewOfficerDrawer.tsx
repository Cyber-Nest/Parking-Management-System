"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Phone,
  Ticket,
  Clock3,
  Activity,
  ShieldAlert,
  Briefcase,
  Calendar,
  MapPin,
  Users,
  IdCard,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Officer } from "@/services/officer.service";

interface ViewOfficerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  officer: Officer | null;
}

// Detail Item 
const DetailCard = ({ icon: Icon, label, value, className = "" }: any) => (
  <div
    className={`p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm flex flex-col gap-1.5 ${className}`}
  >
    <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
      <Icon size={14} strokeWidth={2.5} />
      <span className="text-[10px] uppercase font-bold tracking-wider">
        {label}
      </span>
    </div>
    <p className="text-sm font-bold text-[var(--color-text)] truncate">
      {value || "Not Provided"}
    </p>
  </div>
);

const ViewSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--color-border)]">
      <div className="text-[var(--color-primary)]">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
        {title}
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
  </div>
);

export const ViewOfficerDrawer = ({
  isOpen,
  onClose,
  officer,
}: ViewOfficerDrawerProps) => {
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
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[600px] bg-[var(--color-surface)] shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-50 border-l border-[var(--color-border)] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)] sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[var(--color-surface-soft)] text-[var(--color-primary)] border border-[var(--color-border)]">
                  <IdCard size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tighter text-[var(--color-text)]">
                    Officer Profile
                  </h2>
                  <p className="text-xs font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-soft)] px-2 py-0.5 rounded mt-1 inline-block">
                    {officer.employeeId || officer.id}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full transition-all group border border-transparent hover:border-[var(--color-border)]"
              >
                <X
                  size={20}
                  className="group-hover:rotate-90 transition-transform"
                />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar bg-[var(--color-surface-soft)]/30">
              {/* Hero Profile Section */}
              <div className="bg-[var(--color-bg)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-[var(--color-surface)] shadow-md overflow-hidden ring-1 ring-[var(--color-border)]">
                    <img
                      src={
                        officer.profilePhoto ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(officer.name)}&background=0F766E&color=fff`
                      }
                      alt={officer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* <div
                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[var(--color-bg)] shadow-sm ${officer.accessStatus === "Enabled" ? "bg-emerald-500" : "bg-red-500"}`}
                  /> */}
                </div>

                <div className="text-center md:text-left space-y-2">
                  <h3 className="text-2xl font-black text-[var(--color-text)]">
                    {officer.name}
                  </h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-[var(--color-primary)] text-white uppercase tracking-wider shadow-sm">
                      {officer.role}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                        officer.accessStatus === "Enabled"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-red-50 text-red-700 border-red-100"
                      }`}
                    >
                      {officer.accessStatus}
                    </span>
                    {officer.employmentType && (
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                        {officer.employmentType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid Content */}
              <ViewSection title="Core Employment" icon={Briefcase}>
                <DetailCard
                  icon={IdCard}
                  label="Employee ID"
                  value={officer.employeeId || officer.id}
                />
                <DetailCard
                  icon={Calendar}
                  label="Official Hire Date"
                  value={officer.hireDate}
                />
              </ViewSection>

              <ViewSection title="Communication" icon={Mail}>
                <DetailCard
                  icon={Mail}
                  label="Work Email"
                  value={officer.email}
                />
                <DetailCard
                  icon={Phone}
                  label="Primary Phone"
                  value={officer.phone}
                />
              </ViewSection>

              <ViewSection title="System Metrics" icon={Activity}>
                <DetailCard
                  icon={Ticket}
                  label="Total Tickets"
                  value={String(officer.tickets)}
                />
                <DetailCard
                  icon={Clock3}
                  label="Last Active"
                  value={`${officer.date} @ ${officer.time}`}
                />
                <DetailCard
                  icon={ShieldAlert}
                  label="Login Status"
                  value={officer.loginStatus}
                  className="md:col-span-2"
                />
              </ViewSection>

              {(officer.emergencyContactName || officer.emergencyPhone) && (
                <ViewSection title="Emergency Contact" icon={Users}>
                  <DetailCard
                    icon={Users}
                    label="Contact Person"
                    value={officer.emergencyContactName}
                  />
                  <DetailCard
                    icon={Phone}
                    label="Emergency Phone"
                    value={officer.emergencyPhone}
                  />
                  <DetailCard
                    icon={Info}
                    label="Relationship"
                    value={officer.emergencyRelationship}
                    className="md:col-span-2"
                  />
                </ViewSection>
              )}

              {(officer.addressStreet || officer.addressCity) && (
                <ViewSection title="Residential Address" icon={MapPin}>
                  <div className="md:col-span-2 grid grid-cols-1 gap-3">
                    <DetailCard
                      icon={MapPin}
                      label="Street Address"
                      value={officer.addressStreet}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <DetailCard
                        icon={MapPin}
                        label="City"
                        value={officer.addressCity}
                      />
                      <DetailCard
                        icon={MapPin}
                        label="Province"
                        value={officer.addressProvince}
                      />
                    </div>
                    <DetailCard
                      icon={IdCard}
                      label="Postal Code"
                      value={officer.addressPostalCode}
                    />
                  </div>
                </ViewSection>
              )}

              {/* Revocation Warning */}
              {officer.accessStatus === "Disabled" && (
                <div className="p-5 rounded-2xl border-2 border-red-400 bg-red-500/30 space-y-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle size={18} strokeWidth={3} />
                    <h3 className="text-sm font-black uppercase tracking-wider">
                      Access Revoked
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DetailCard
                      icon={Users}
                      label="Revoked By"
                      value={officer.disabledBy}
                      className="border-red-100"
                    />
                    <DetailCard
                      icon={Calendar}
                      label="Date of Revocation"
                      value={officer.disabledAt}
                      className="border-red-100"
                    />
                    <div className="md:col-span-2">
                      <DetailCard
                        icon={Info}
                        label="Reason for Suspension"
                        value={officer.disableReason}
                        className="border-red-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Timeline */}
              {/* <div className="space-y-4 pt-4 pb-8">
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <Activity size={16} strokeWidth={2.5} />
                  <h3 className="text-xs font-black uppercase tracking-widest">
                    Recent Activity Log
                  </h3>
                </div>

                <div className="space-y-3">
                  {officer.activityLogs && officer.activityLogs.length > 0 ? (
                    officer.activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary)] transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-sm text-[var(--color-text)]">
                            {log.action}
                          </p>
                          <span className="text-[10px] font-mono text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]">
                            {log.createdAt}
                          </span>
                        </div>
                        {log.details && (
                          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                            {log.details}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 rounded-2xl border-2 border-dashed border-[var(--color-border)] text-center">
                      <p className="text-sm text-[var(--color-text-muted)] font-medium">
                        No system activity recorded for this officer.
                      </p>
                    </div>
                  )}
                </div>
              </div> */}
            </div>

            {/* Footer */}
            {/* <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-surface)] sticky bottom-0 z-20">
              <button
                onClick={onClose}
                className="w-full py-3 font-bold text-sm text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface-soft)] transition-all active:scale-[0.98]"
              >
                Close Profile View
              </button>
            </div> */}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
