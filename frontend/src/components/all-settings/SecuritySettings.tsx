"use client";

import React, { useEffect, useState } from "react";
import {
  Shield,
  Lock,
  KeyRound,
  Timer,
  Save,
  RotateCcw,
  Info,
  AlertCircle,
  Type,
  Hash,
  AtSign,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  settingsService,
  SecuritySettings as SecuritySettingsType,
} from "@/services/settings.service";

// Security Input
const SecurityInput = ({ label, value, onChange, unit, icon }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full px-5 py-3.5 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl text-[13px] font-bold text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:bg-white focus:ring-[6px] focus:ring-[var(--color-primary)]/5 transition-all outline-none appearance-none"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
        {icon &&
          React.cloneElement(icon, {
            size: 14,
            className: "text-[var(--color-text-muted)]",
          })}
        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase border-l border-[var(--color-border)] pl-2">
          {unit}
        </span>
      </div>
    </div>
  </div>
);

// Switch Component
const SecuritySwitch = ({ label, icon, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-4 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl group hover:border-[var(--color-primary)]/30 transition-all">
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-xl transition-colors ${active ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "bg-white text-[var(--color-text-muted)]"}`}
      >
        {icon}
      </div>
      <span className="text-[13px] font-bold text-[var(--color-text-primary)]">
        {label}
      </span>
    </div>
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${active ? "bg-[var(--color-primary)]" : "bg-gray-200"}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${active ? "left-7" : "left-1"}`}
      />
    </button>
  </div>
);

export const SecuritySettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SecuritySettingsType>({
    minPasswordLength: 8,
    maxLoginAttempts: 5,
    requireUppercase: "yes",
    requireNumber: "yes",
    requireSpecialChar: "yes",
    twoFactorAuth: "disabled",
    sessionTimeout: 30,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getSecuritySettings();
        setSettings(data);
      } catch (error) {
        toast.error("Failed to load security settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field: keyof SecuritySettingsType, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await settingsService.updateSecuritySettings(settings);
      toast.success(response.message);
    } catch (error) {
      toast.error("Failed to save security settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="h-96 bg-gray-100 rounded-[32px] animate-pulse" />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="bg-[var(--color-surface)] rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-8 md:p-10 space-y-10">
          {/* Pass Length & Login Attempts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SecurityInput
              label="Minimum Password Length"
              value={settings.minPasswordLength}
              onChange={(v: any) => handleChange("minPasswordLength", v)}
              unit="Chars"
              icon={<Lock />}
            />
            <SecurityInput
              label="Maximum Login Attempts"
              value={settings.maxLoginAttempts}
              onChange={(v: any) => handleChange("maxLoginAttempts", v)}
              unit="Attempts"
              icon={<AlertCircle />}
            />
          </div>

          {/* Requirement Switches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <SecuritySwitch
              label="Require Uppercase"
              icon={<Type size={18} />}
              active={settings.requireUppercase === "yes"}
              onToggle={() =>
                handleChange(
                  "requireUppercase",
                  settings.requireUppercase === "yes" ? "no" : "yes",
                )
              }
            />
            <SecuritySwitch
              label="Require Special Character"
              icon={<AtSign size={18} />}
              active={settings.requireSpecialChar === "yes"}
              onToggle={() =>
                handleChange(
                  "requireSpecialChar",
                  settings.requireSpecialChar === "yes" ? "no" : "yes",
                )
              }
            />
            <SecuritySwitch
              label="Require Number"
              icon={<Hash size={18} />}
              active={settings.requireNumber === "yes"}
              onToggle={() =>
                handleChange(
                  "requireNumber",
                  settings.requireNumber === "yes" ? "no" : "yes",
                )
              }
            />
            {/* Session Timeout */}
            <div className="flex items-center justify-between p-4 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white text-[var(--color-text-muted)] rounded-xl">
                  <Timer size={18} />
                </div>
                <span className="text-[13px] font-bold text-[var(--color-text-primary)]">
                  Session Timeout
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    handleChange("sessionTimeout", parseInt(e.target.value))
                  }
                  className="w-16 bg-white border border-[var(--color-border)] rounded-lg py-1 px-2 text-center text-xs font-black outline-none focus:border-[var(--color-primary)]"
                />
                <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
                  min
                </span>
              </div>
            </div>
          </div>

          {/*Account Lock & 2FA */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[var(--color-border)]/50">
            <SecurityInput
              label="Account Lock Duration"
              value={15}
              unit="Minutes"
              icon={<Timer />}
            />

            <div className="space-y-3">
              <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1">
                Two-Factor Authentication
              </label>
              <div className="flex bg-[var(--color-surface-soft)] p-1.5 rounded-xl border border-[var(--color-border)] overflow-hidden">
                {["disabled", "optional", "required"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleChange("twoFactorAuth", opt)}
                    className={`flex-1 py-2.5 text-[11px] font-bold capitalize rounded-lg transition-all ${
                      settings.twoFactorAuth === opt
                        ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div> */}

          {/* Info Area */}
          <div className="bg-[var(--color-info-bg)]/40 p-5 rounded-2xl border border-[var(--color-info-bg)] flex gap-4 items-start">
            <Info
              size={18}
              className="text-[var(--color-info)] mt-0.5 shrink-0"
            />
            <p className="text-[11px] text-[var(--color-info)]/80 font-medium leading-relaxed">
              <span className="font-bold text-[var(--color-info)]">
                Security Settings:
              </span>{" "}
              These settings help protect your system and user accounts from
              unauthorized access. Changes will be logged in the Audit Logs and
              applied to all administrative users immediately.
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-[var(--color-surface-soft)] px-8 py-5 border-t border-[var(--color-border)] flex items-center justify-end gap-4">
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
