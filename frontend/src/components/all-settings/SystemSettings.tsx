"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  Globe,
  Calendar,
  Timer,
  Save,
  RotateCcw,
  Info,
  ChevronDown,
  Languages,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  settingsService,
  SystemSettings as SystemSettingsType,
} from "@/services/settings.service";

//Select Component for System Settings
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
          className="w-full pl-5 pr-12 py-3.5 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl text-[13px] font-bold text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:bg-white focus:ring-[6px] focus:ring-[var(--color-primary)]/5 transition-all outline-none appearance-none cursor-pointer"
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

export const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettingsType>({
    timezone: "America/Toronto",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    sessionExpiryDisplay: "countdown",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getSystemSettings();
        setSettings(data);
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field: keyof SystemSettingsType, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await settingsService.updateSystemSettings(settings);
      toast.success(response.message);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="h-96 bg-gray-100 rounded-[32px] animate-pulse" />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Cards (Status Display) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--color-surface)] p-6 rounded-[28px] border border-[var(--color-border)] shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
              <Globe size={18} />
            </div>
            <span className="px-2 py-0.5 bg-green-100 text-[10px] font-black text-green-600 rounded uppercase">
              Active
            </span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
              Current System Time
            </p>
            <h2 className="text-xl font-black text-[var(--color-text-primary)] mt-1">
              14:45:02
            </h2>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">
              Eastern Daylight Time
            </p>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] p-6 rounded-[28px] border border-[var(--color-border)] shadow-sm flex flex-col gap-4">
          <div className="p-2 bg-orange-50 rounded-lg text-orange-500 w-fit">
            <Languages size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
              Localization
            </p>
            <h2 className="text-xl font-black text-[var(--color-text-primary)] mt-1">
              EN-CA
            </h2>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">
              Default Language: English
            </p>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] p-6 rounded-[28px] border border-[var(--color-border)] shadow-sm flex flex-col gap-4">
          <div className="p-2 bg-teal-50 rounded-lg text-teal-600 w-fit">
            <Timer size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
              Active Session
            </p>
            <h2 className="text-xl font-black text-[var(--color-text-primary)] mt-1">
              29:45
            </h2>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">
              Remaining until expiry
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-[var(--color-surface)] rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-8 md:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SystemSelect
              label="Timezone"
              icon={<Globe />}
              value={settings.timezone}
              onChange={(v: string) => handleChange("timezone", v)}
              options={[
                { value: "America/Toronto", label: "(UTC-06:00) Toronto" },
                { value: "Asia/Kolkata", label: "(UTC+05:30) India" },
              ]}
            />
            <SystemSelect
              label="Default Language"
              icon={<Languages />}
              value={settings.language}
              onChange={(v: string) => handleChange("language", v)}
              options={[
                { value: "en", label: "English" },
                { value: "fr", label: "French" },
              ]}
            />
            <SystemSelect
              label="Date Format"
              icon={<Calendar />}
              value={settings.dateFormat}
              onChange={(v: string) => handleChange("dateFormat", v)}
              options={[
                { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
              ]}
            />
            {/* <SystemSelect
              label="Session Expiry Display"
              icon={<Timer />}
              value={settings.sessionExpiryDisplay}
              onChange={(v: string) => handleChange("sessionExpiryDisplay", v)}
              options={[
                { value: "countdown", label: "Countdown" },
                { value: "static", label: "Static" },
              ]}
            /> */}
            <SystemSelect
              label="Time Format"
              icon={<Clock />}
              value={settings.timeFormat}
              onChange={(v: string) => handleChange("timeFormat", v)}
              options={[
                { value: "12h", label: "12 Hour (hh:mm AM/PM)" },
                { value: "24h", label: "24 Hour (HH:mm)" },
              ]}
            />
          </div>

          {/* Info Alert Area */}
          {/* <div className="bg-[var(--color-info-bg)]/40 p-5 rounded-2xl border border-[var(--color-info-bg)] flex gap-4 items-start animate-in fade-in duration-700">
            <Info size={20} className="text-[var(--color-info)] mt-0.5" />
            <div>
              <h4 className="text-[13px] font-bold text-[var(--color-info)]">
                Regional Localization
              </h4>
              <p className="text-[12px] text-[var(--color-info)]/80 font-medium leading-relaxed mt-0.5">
                Changing these settings will update the display format for all
                reports, receipts, and dashboards across the portal.
              </p>
            </div>
          </div> */}
        </div>

        {/* Card Footer Actions */}
        <div className="bg-[var(--color-surface-soft)] px-8 py-5 border-t border-[var(--color-border)] flex items-center justify-end gap-4">
          <button className="text-[13px] font-bold text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
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
