"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Receipt,
  Clock,
  Users,
  Shield,
  Bell,
  Plug,
  FileText,
  Palette,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { GeneralSettings } from "@/components/all-settings/GeneralSettings";
import { TaxSettings } from "@/components/all-settings/TaxSettings";
import { PricingSettings } from "@/components/all-settings/PricingSettings";
import { SystemSettingsComponent as SystemSettings } from "@/components/all-settings/SystemSettings";
import { UsersRolesSettings } from "@/components/all-settings/UsersRolesSettings";
import { SecuritySettings } from "@/components/all-settings/SecuritySettings";
import { NotificationSettings } from "@/components/all-settings/NotificationSettings";
import { IntegrationsSettings } from "@/components/all-settings/IntegrationsSettings";
import { AuditLogsSettings } from "@/components/all-settings/AuditLogsSettings";
import { BrandingSettings } from "@/components/all-settings/BrandingSettings";
import { OwnerProfileSettings } from "@/components/all-settings/OwnerProfileSettings";
import { ReportParkingLotFilter } from "@/components/reports/ReportParkingLotFilter";
const TABS = [
  { id: "general", label: "General", icon: Settings },
  { id: "tax", label: "Tax", icon: Receipt },
  { id: "pricing", label: "Pricing", icon: Receipt },
  { id: "owner-profile", label: "Owner Profile", icon: Users },
  // { id: "system", label: "System", icon: Clock },
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "audit", label: "Audit Logs", icon: FileText },
  { id: "branding", label: "Branding", icon: Palette },
];

const PARKING_LOT_FILTER_EXCLUDED_TABS = new Set([
  "branding",
  "owner-profile",
  "users",
]);

export default function SettingsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-[var(--color-text-secondary)]">Loading settings...</div>}>
      <SettingsContent />
    </React.Suspense>
  );
}

function SettingsContent() {
  const [activeTab, setActiveTab] = useState("general");
  const [parkingLotId, setParkingLotId] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleResetAll = () => {
    toast.success("Settings reset to default");
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings parkingLotId={parkingLotId} />;
      case "owner-profile":
        return <OwnerProfileSettings />;
      case "tax":
        return <TaxSettings parkingLotId={parkingLotId} />;
      case "pricing":
        return <PricingSettings parkingLotId={parkingLotId} />;
      // case "system":
      //   return <SystemSettings />;
      case "users":
        return <UsersRolesSettings />;
      case "security":
        return <SecuritySettings parkingLotId={parkingLotId} />;
      case "notifications":
        return <NotificationSettings parkingLotId={parkingLotId} />;
      case "integrations":
        return <IntegrationsSettings parkingLotId={parkingLotId} />;
      case "audit":
        return <AuditLogsSettings parkingLotId={parkingLotId} />;
      case "branding":
        return <BrandingSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-4 bg-[var(--color-bg)]">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
            System <span className="text-[var(--color-primary)]">Settings</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm font-semibold mt-1">
            Manage your system preferences, users, and global configurations.
          </p>
        </div>

        {/* <button
          onClick={handleResetAll}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all text-xs font-bold shadow-sm"
        >
          <RotateCcw size={16} />
          Reset All
        </button> */}
      </header>

      {/* Pill Tabs Section */}
      <div className="bg-[var(--color-surface)] p-1.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] mb-8">
        <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar bg-[var(--color-surface-soft)] p-1 rounded-[var(--radius-md)]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 text-[11px] lg:text-[12px] font-bold rounded-[var(--radius-sm)] transition-all whitespace-nowrap flex-1 justify-center ${isActive
                    ? "bg-white text-[var(--color-primary)] shadow-sm border border-[var(--color-border)]/50"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
              >
                <Icon
                  size={14}
                  className={
                    isActive
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)]"
                  }
                />
                {tab.label}

                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-[var(--radius-sm)] -z-10 shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Animated Content Area */}
      <div className="min-h-[400px]">
        {!PARKING_LOT_FILTER_EXCLUDED_TABS.has(activeTab) && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-[var(--shadow-card)]">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                Parking Lot Scope
              </p>
            </div>
            <ReportParkingLotFilter
              value={parkingLotId}
              onChange={setParkingLotId}
            />
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
