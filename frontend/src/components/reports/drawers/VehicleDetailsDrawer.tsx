"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Car,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Award,
  Fingerprint,
  History,
  Sparkles,
} from "lucide-react";
import {
  VehicleSummary,
  CustomerInfo,
} from "@/services/vehicle-history.service";

interface VehicleDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleSummary: VehicleSummary | null;
  customerInfo: CustomerInfo | null;
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

export const VehicleDetailsDrawer = ({
  isOpen,
  onClose,
  vehicleSummary,
  customerInfo,
}: VehicleDetailsDrawerProps) => {
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
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-blue-600 flex items-center justify-center text-white shadow-lg shadow-[var(--color-primary)]/20">
                    <Car size={24} />
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[var(--color-surface)]"
                    title="Active Record"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">
                    Vehicle Identity
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px] font-mono font-bold text-white tracking-tighter">
                      {vehicleSummary?.licensePlate}
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)] font-medium">
                      • {vehicleSummary?.province}
                    </span>
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

            <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
              {/* Profile Card Summary */}
              <div className="mt-6 p-6 rounded-[2rem] bg-gradient-to-br from-[var(--color-surface-soft)] to-transparent border border-[var(--color-border)] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <Fingerprint size={120} />
                </div>

                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
                    Make & Model
                  </p>
                  <h3 className="text-2xl font-black text-[var(--color-text-primary)] leading-tight">
                    {vehicleSummary?.vehicleColor} {vehicleSummary?.vehicleMake}
                    <span className="block text-[var(--color-primary)]">
                      {vehicleSummary?.vehicleModel}
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-[var(--color-border)]/50">
                    <div className="flex items-center gap-2">
                      <Clock
                        size={16}
                        className="text-[var(--color-text-muted)]"
                      />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                          Total Usage
                        </p>
                        <p className="text-xs font-bold">
                          {vehicleSummary?.totalTimeParked}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={16}
                        className="text-[var(--color-text-muted)]"
                      />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                          Fav Location
                        </p>
                        <p className="text-xs font-bold truncate max-w-[100px]">
                          {vehicleSummary?.favoriteLocation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {vehicleSummary && (
                <>
                  <SectionTitle
                    icon={<History size={16} />}
                    title="Observation Timeline"
                  />
                  <div className="space-y-0.5 bg-[var(--color-surface-soft)]/20 p-2 rounded-2xl border border-[var(--color-border)]/30">
                    <InfoRow
                      icon={<Calendar size={14} />}
                      label="First Detected"
                      value={vehicleSummary.firstSeen}
                    />
                    <InfoRow
                      icon={<Calendar size={14} />}
                      label="Latest Session"
                      value={vehicleSummary.lastSeen}
                      color="text-emerald-500"
                    />
                  </div>
                </>
              )}

              {customerInfo && (
                <>
                  <SectionTitle
                    icon={<User size={16} />}
                    title="Ownership Details"
                  />
                  <div className="space-y-0.5">
                    <InfoRow
                      icon={<User size={14} />}
                      label="Owner Name"
                      value={customerInfo.name}
                    />
                    <InfoRow
                      icon={<Phone size={14} />}
                      label="Contact"
                      value={customerInfo.phone}
                    />
                    <InfoRow
                      icon={<Mail size={14} />}
                      label="Email Address"
                      value={customerInfo.email}
                    />
                    <InfoRow
                      icon={<Calendar size={14} />}
                      label="Registration"
                      value={customerInfo.registeredDate}
                    />
                    <div className="mt-4 p-4 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                          <Award size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                            Status
                          </p>
                          <p className="text-sm font-black text-[var(--color-primary)]">
                            {customerInfo.customerType}
                          </p>
                        </div>
                      </div>
                      <Sparkles
                        size={16}
                        className="text-[var(--color-primary)] opacity-50"
                      />
                    </div>
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
