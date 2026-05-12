"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  Globe,
  Calendar,
  Save,
  RotateCcw,
  Info,
  ChevronDown,
  Languages,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSystem } from "@/contexts/SystemContext";
import { formatDateTime } from "@/utils/dateHelper";
import type { SystemSettings } from "@/services/settings.service";

// Timezone Options - Canada First, Then India, Then International
const TIMEZONE_OPTIONS = [
  // Canada
  {
    value: "America/Toronto",
    label: "(UTC-05:00) Toronto - Eastern Time",
    region: "Ontario, Quebec",
  },
  {
    value: "America/Vancouver",
    label: "(UTC-08:00) Vancouver - Pacific Time",
    region: "British Columbia",
  },
  {
    value: "America/Edmonton",
    label: "(UTC-07:00) Edmonton - Mountain Time",
    region: "Alberta",
  },
  {
    value: "America/Winnipeg",
    label: "(UTC-06:00) Winnipeg - Central Time",
    region: "Manitoba",
  },
  {
    value: "America/Halifax",
    label: "(UTC-04:00) Halifax - Atlantic Time",
    region: "Nova Scotia, New Brunswick",
  },
  {
    value: "America/St_Johns",
    label: "(UTC-03:30) St. John's - Newfoundland Time",
    region: "Newfoundland",
  },
  // India
  {
    value: "Asia/Kolkata",
    label: "(UTC+05:30) Kolkata - Indian Standard Time",
    region: "India",
  },
  // International
  {
    value: "America/New_York",
    label: "(UTC-05:00) New York - Eastern Time",
    region: "USA",
  },
  {
    value: "Europe/London",
    label: "(UTC+00:00) London - GMT",
    region: "United Kingdom",
  },
  { value: "Asia/Dubai", label: "(UTC+04:00) Dubai - GST", region: "UAE" },
  {
    value: "Australia/Sydney",
    label: "(UTC+10:00) Sydney - AEDT",
    region: "Australia",
  },
];

// Language Options
const LANGUAGE_OPTIONS = [
  { value: "en", label: "English (Canada)" },
  { value: "fr", label: "French (Canada)" },
  { value: "en-US", label: "English (US)" },
  { value: "hi", label: "Hindi (India)" },
  { value: "es", label: "Spanish" },
];

// Date Format Options
const DATE_FORMAT_OPTIONS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2024) - Canada / Europe" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024) - USA" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31) - ISO Standard" },
];

// Time Format Options
const TIME_FORMAT_OPTIONS = [
  { value: "12h", label: "12 Hour (hh:mm AM/PM) - Canada / USA" },
  { value: "24h", label: "24 Hour (HH:mm) - Europe / Military" },
];

// SELECT COMPONENT
const SystemSelect = ({ label, icon, value, onChange, options }: any) => {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.1em] ml-1 block">
        {label}
      </label>
      <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-5 pr-12 py-3.5 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl text-[13px] font-bold text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:ring-[6px] focus:ring-[var(--color-primary)]/5 transition-all outline-none appearance-none cursor-pointer dark:bg-[var(--color-surface)] dark:text-[var(--color-text-primary)] dark:border-[var(--color-border)]"
        >
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none border-l border-[var(--color-border)] pl-3 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors">
          {icon && React.cloneElement(icon, { size: 16 })}
          <ChevronDown size={14} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};

//INFO CARD

const InfoCard = ({ icon, title, value, subValue, iconBg, iconColor }: any) => {
  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-[28px] border border-[var(--color-border)] shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          {React.cloneElement(icon, { className: iconColor, size: 18 })}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
          {title}
        </p>
        <h2 className="text-xl font-black text-[var(--color-text-primary)] mt-1">
          {value}
        </h2>
        {subValue && (
          <p className="text-[10px] text-[var(--color-text-secondary)] font-medium mt-0.5">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};

export const SystemSettingsComponent = () => {
  const { system, branding, updateSystemSettings, refreshSettings } =
    useSystem();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [localSettings, setLocalSettings] = useState<SystemSettings>({
    timezone: "America/Toronto",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    weekStartsOn: "monday",
    currency: "USD",
    sessionExpiryDisplay: "countdown",
  });

  // Sync with context
  useEffect(() => {
    if (system) {
      setLocalSettings({
        timezone: system.timezone || "America/Toronto",
        language: system.language || "en",
        dateFormat: system.dateFormat || "DD/MM/YYYY",
        timeFormat: system.timeFormat || "12h",
        weekStartsOn: system.weekStartsOn || "monday",
        currency: system.currency || "USD",
        sessionExpiryDisplay: system.sessionExpiryDisplay || "countdown",
      });
      setLoading(false);
    }
  }, [system]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (field: string, value: string) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSystemSettings(localSettings);
      toast.success("System settings updated successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (system) {
      setLocalSettings({
        timezone: system.timezone || "America/Toronto",
        language: system.language || "en",
        dateFormat: system.dateFormat || "DD/MM/YYYY",
        timeFormat: system.timeFormat || "12h",
        weekStartsOn: system.weekStartsOn || "monday",
        currency: system.currency || "USD",
        sessionExpiryDisplay: system.sessionExpiryDisplay || "countdown",
      });
      toast("Changes discarded", { icon: "ℹ️" });
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await refreshSettings();
      toast.success("Settings reset to default");
    } catch (error) {
      toast.error("Failed to reset settings");
    } finally {
      setLoading(false);
    }
  };

  // Get formatted time
  const formattedTime = formatDateTime(currentTime, localSettings);

  const getTimezoneRegion = () => {
    const found = TIMEZONE_OPTIONS.find(
      (opt) => opt.value === localSettings.timezone,
    );
    return found?.region || "Canada";
  };

  const getLanguageLabel = () => {
    const found = LANGUAGE_OPTIONS.find(
      (opt) => opt.value === localSettings.language,
    );
    return found?.label || "English (Canada)";
  };

  const getThemeLabel = () => {
    const mode = branding?.darkMode || "light";
    if (mode === "dark") return "Dark Mode";
    if (mode === "light") return "Light Mode";
    return "System Default";
  };

  if (loading) {
    return (
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-[32px] animate-pulse" />
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* 3 Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          icon={<Globe />}
          title="Current System Time"
          value={formattedTime}
          subValue={getTimezoneRegion()}
          iconBg="bg-blue-50 dark:bg-blue-900/30"
          iconColor="text-blue-500 dark:text-blue-400"
        />
        <InfoCard
          icon={<Languages />}
          title="Localization"
          value={getLanguageLabel()}
          subValue={`Date: ${localSettings.dateFormat} • Time: ${localSettings.timeFormat === "12h" ? "12-hour" : "24-hour"}`}
          iconBg="bg-orange-50 dark:bg-orange-900/30"
          iconColor="text-orange-500 dark:text-orange-400"
        />
        <InfoCard
          icon={branding?.darkMode === "dark" ? <Clock /> : <Clock />}
          title="Theme Mode"
          value={getThemeLabel()}
          subValue="Appearance preference"
          iconBg="bg-teal-50 dark:bg-teal-900/30"
          iconColor="text-teal-600 dark:text-teal-400"
        />
      </div>

      {/* Main Settings Card */}
      <div className="bg-[var(--color-surface)] rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-8 md:p-10 space-y-8">
          {/* 4 Settings Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SystemSelect
              label="Timezone"
              icon={<Globe />}
              value={localSettings.timezone}
              onChange={(v: string) => handleChange("timezone", v)}
              options={TIMEZONE_OPTIONS}
            />
            <SystemSelect
              label="Default Language"
              icon={<Languages />}
              value={localSettings.language}
              onChange={(v: string) => handleChange("language", v)}
              options={LANGUAGE_OPTIONS}
            />
            <SystemSelect
              label="Date Format"
              icon={<Calendar />}
              value={localSettings.dateFormat}
              onChange={(v: string) => handleChange("dateFormat", v)}
              options={DATE_FORMAT_OPTIONS}
            />
            <SystemSelect
              label="Time Format"
              icon={<Clock />}
              value={localSettings.timeFormat}
              onChange={(v: string) => handleChange("timeFormat", v)}
              options={TIME_FORMAT_OPTIONS}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[var(--color-surface-soft)] px-8 py-5 border-t border-[var(--color-border)] flex items-center justify-end gap-4">
          <button
            onClick={handleReset}
            className="text-[13px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors px-4 py-2 rounded-xl"
          >
            <RotateCcw size={14} className="inline mr-2" />
            Reset
          </button>
          <button
            onClick={handleDiscard}
            className="text-[13px] font-bold text-[var(--color-text-muted)] hover:text-red-500 transition-colors px-4 py-2 rounded-xl"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2.5 px-8 py-3 rounded-xl shadow-lg shadow-[var(--color-primary)]/20 active:scale-95 transition-all"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span className="text-[13px] font-bold uppercase tracking-wide">
              Save Changes
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
