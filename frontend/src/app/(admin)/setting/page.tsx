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

import { GeneralSettings } from "@/components/all-settings/GeneralSettings";
import { TaxSettings } from "@/components/all-settings/TaxSettings";
import { SystemSettings } from "@/components/all-settings/SystemSettings";
import { UsersRolesSettings } from "@/components/all-settings/UsersRolesSettings";
import { SecuritySettings } from "@/components/all-settings/SecuritySettings";
import { NotificationSettings } from "@/components/all-settings/NotificationSettings";
import { IntegrationsSettings } from "@/components/all-settings/IntegrationsSettings";
import { AuditLogsSettings } from "@/components/all-settings/AuditLogsSettings";
import { BrandingSettings } from "@/components/all-settings/BrandingSettings";

const TABS = [
  { id: "general", label: "General", icon: Settings },
  { id: "tax", label: "Tax & Pricing", icon: Receipt },
  { id: "system", label: "System", icon: Clock },
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "audit", label: "Audit Logs", icon: FileText },
  { id: "branding", label: "Branding", icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const handleResetAll = () => {
    toast.success("Settings reset to default");
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />;
      case "tax":
        return <TaxSettings />;
      case "system":
        return <SystemSettings />;
      case "users":
        return <UsersRolesSettings />;
      case "security":
        return <SecuritySettings />;
      case "notifications":
        return <NotificationSettings />;
      case "integrations":
        return <IntegrationsSettings />;
      case "audit":
        return <AuditLogsSettings />;
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
                className={`relative flex items-center gap-1.5 px-3 py-2 text-[11px] lg:text-[12px] font-bold rounded-[var(--radius-sm)] transition-all whitespace-nowrap flex-1 justify-center ${
                  isActive
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
