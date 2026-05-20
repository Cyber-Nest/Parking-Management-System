"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Palette,
  Type,
  Moon,
  Sun,
  Monitor,
  Save,
  RotateCcw,
  Info,
  Upload,
  X,
  Check,
  Layout,
  LayoutGrid,
  Home,
  Car,
  CreditCard,
  Ticket,
  Users,
  Settings as SettingsIcon,
  Bell,
  LogOut,
  Menu,
  Search,
  TrendingUp,
  Wallet,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSystem } from "@/contexts/SystemContext";
import {
  settingsService,
  BrandingSettings as BrandingSettingsType,
} from "@/services/settings.service";

// Color Picker Component
const ColorBox = ({ label, value, onChange }: any) => {
  const predefined = [
    "#0F766E",
    "#F97316",
    "#3B82F6",
    "#8B5CF6",
    "#EF4444",
    "#10B981",
  ];
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-3 bg-[var(--color-surface-soft)] p-3 rounded-2xl border border-[var(--color-border)]">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
        />
        <div className="h-8 w-[1px] bg-[var(--color-border)] mx-1" />
        {predefined.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
              value === c
                ? "ring-2 ring-offset-2 ring-[var(--color-primary)]"
                : ""
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
        <span className="ml-auto text-xs font-black text-[var(--color-text-primary)] font-mono">
          {value}
        </span>
      </div>
    </div>
  );
};

// Live Preview Component
const LivePreview = ({
  systemName,
  themeColor,
  darkMode,
  logoPreview,
}: any) => {
  const isDark = darkMode === "dark";
  const bgColor = isDark ? "#1e293b" : "#f3f4f6";
  const surfaceColor = isDark ? "#334155" : "#ffffff";
  const textColor = isDark ? "#f1f5f9" : "#111827";
  const textMuted = isDark ? "#94a3b8" : "#6b7280";
  const borderColor = isDark ? "#475569" : "#e5e7eb";

  return (
    <div
      className="rounded-2xl overflow-hidden border shadow-lg transition-all duration-300"
      style={{ backgroundColor: bgColor, borderColor: borderColor }}
    >
      {/* Header Preview */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: surfaceColor, borderColor: borderColor }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: themeColor }}
          >
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="font-bold text-sm" style={{ color: textColor }}>
            {systemName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200" />
          <div className="w-6 h-6 rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Preview */}
        <div
          className="w-16 p-3 border-r h-[280px] flex flex-col gap-4"
          style={{ backgroundColor: surfaceColor, borderColor: borderColor }}
        >
          {[Home, Car, CreditCard, Ticket, Users, SettingsIcon].map(
            (Icon, i) => (
              <div key={i} className="relative flex justify-center">
                <Icon
                  size={20}
                  style={{ color: i === 0 ? themeColor : textMuted }}
                />
                {i === 0 && (
                  <div
                    className="absolute -right-3 w-1 h-5 rounded-full"
                    style={{ backgroundColor: themeColor }}
                  />
                )}
              </div>
            ),
          )}
          <div className="mt-auto">
            <LogOut size={20} style={{ color: textMuted }} />
          </div>
        </div>

        {/* Main Content Preview */}
        <div className="flex-1 p-4 space-y-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: textColor }}>
              Dashboard Overview
            </h2>
            <p className="text-xs" style={{ color: textMuted }}>
              Welcome back, Admin
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              {
                icon: TrendingUp,
                label: "Revenue",
                value: "$80K",
                color: themeColor,
              },
              { icon: Car, label: "Active", value: "124", color: themeColor },
              {
                icon: Clock,
                label: "Expiring",
                value: "18",
                color: themeColor,
              },
              {
                icon: Wallet,
                label: "Today",
                value: "$245",
                color: themeColor,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-2 rounded-xl"
                style={{
                  backgroundColor: surfaceColor,
                  border: `1px solid ${borderColor}`,
                }}
              >
                <stat.icon size={14} style={{ color: stat.color }} />
                <p
                  className="text-[10px] font-medium mt-1"
                  style={{ color: textMuted }}
                >
                  {stat.label}
                </p>
                <p className="text-sm font-bold" style={{ color: textColor }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <button
            className="px-4 py-2 rounded-xl text-white text-xs font-bold w-full"
            style={{ backgroundColor: themeColor }}
          >
            + Add New Session
          </button>

          <div
            className="rounded-xl overflow-hidden border"
            style={{ borderColor: borderColor }}
          >
            <div
              className="flex p-2 gap-4 border-b"
              style={{
                borderColor: borderColor,
                backgroundColor: surfaceColor,
              }}
            >
              <span
                className="text-[9px] font-bold uppercase"
                style={{ color: textMuted }}
              >
                ID
              </span>
              <span
                className="text-[9px] font-bold uppercase"
                style={{ color: textMuted }}
              >
                Plate
              </span>
              <span
                className="text-[9px] font-bold uppercase"
                style={{ color: textMuted }}
              >
                Status
              </span>
            </div>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex p-2 gap-4 border-b last:border-b-0"
                style={{ borderColor: borderColor }}
              >
                <span className="text-[10px]" style={{ color: textColor }}>
                  PKG-001
                </span>
                <span className="text-[10px]" style={{ color: textColor }}>
                  ABC-1234
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${themeColor}20`,
                    color: themeColor,
                  }}
                >
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const BrandingSettings = () => {
  const { branding, updateBrandingSettings, refreshSettings } = useSystem();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState<BrandingSettingsType>({
    systemName: "ParkSmart",
    themeColor: "#0F766E",
    logoUrl: null,
    faviconUrl: null,
    darkMode: "light",
    sidebarCollapsed: false,
  });

  // Sync with context
  useEffect(() => {
    if (branding) {
      setLocalSettings(branding);
      if (branding.logoUrl) setLogoPreview(branding.logoUrl);
      setLoading(false);
    }
  }, [branding]);

  const handleChange = (field: keyof BrandingSettingsType, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateBrandingSettings(localSettings);
      toast.success("Brand identity updated successfully!");
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
      setLocalSettings((prev) => ({ ...prev, logoUrl: preview }));
      toast.success("Logo uploaded successfully!");
    }
  };

  const handleFaviconUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setLocalSettings((prev) => ({ ...prev, faviconUrl: preview }));
      toast.success("Favicon uploaded successfully!");
    }
  };

  if (loading)
    return <div className="h-96 bg-gray-100 rounded-[32px] animate-pulse" />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Settings Form */}
        <div className="lg:col-span-6 space-y-8">
          <div className="bg-[var(--color-surface)] p-8 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)] space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1">
                System Name
              </label>
              <div className="relative group">
                <Type
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)]"
                  size={18}
                />
                <input
                  type="text"
                  value={localSettings.systemName}
                  onChange={(e) => handleChange("systemName", e.target.value)}
                  placeholder="e.g. ParkSmart Pro"
                  className="w-full pl-12 pr-4 py-4 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl text-sm font-bold focus:border-[var(--color-primary)] focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <ColorBox
              label="Brand Theme Color"
              value={localSettings.themeColor}
              onChange={(c: string) => handleChange("themeColor", c)}
            />

            <div className="space-y-3">
              <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1">
                Default Interface
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "light", label: "Light", icon: <Sun size={18} /> },
                  { id: "dark", label: "Dark", icon: <Moon size={18} /> },
                  {
                    id: "system",
                    label: "System",
                    icon: <Monitor size={18} />,
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleChange("darkMode", mode.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      localSettings.darkMode === mode.id
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                        : "border-[var(--color-border)] text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {mode.icon}
                    <span className="text-[11px] font-black uppercase tracking-wider">
                      {mode.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Assets Section */}
          <div className="bg-[var(--color-surface)] p-8 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
            <div className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1 block mb-3">
                  Upload Main Logo
                </label>
                <div className="relative group w-full aspect-video bg-[var(--color-surface-soft)] rounded-2xl border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-[var(--color-primary)]/50">
                  {logoPreview ? (
                    <>
                      <img
                        src={logoPreview}
                        className="max-h-[80%] object-contain px-8"
                        alt="Logo"
                      />
                      <button
                        onClick={() => setLogoPreview(null)}
                        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Upload size={32} strokeWidth={1.5} />
                      <span className="text-xs font-bold mt-2">
                        Click to Upload
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </div>
              </div>

              {/* Favicon Upload */}
              <div className="flex items-center gap-4 bg-[var(--color-surface-soft)] p-4 rounded-2xl border border-[var(--color-border)]">
                <div className="w-12 h-12 bg-white rounded-xl border border-[var(--color-border)] flex items-center justify-center shadow-sm">
                  <Layout size={20} className="text-[var(--color-primary)]" />
                </div>
                <div className="flex-1">
                  <h5 className="text-[11px] font-black uppercase text-[var(--color-text-primary)]">
                    Favicon
                  </h5>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium">
                    Browser tab icon (32x32)
                  </p>
                </div>
                <label className="cursor-pointer">
                  <button className="p-2 bg-white rounded-lg border border-[var(--color-border)] hover:text-[var(--color-primary)] transition-colors">
                    <Upload size={14} />
                  </button>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFaviconUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Preview */}
        <div className="lg:col-span-6 space-y-6 sticky top-6">
          <div className="bg-[var(--color-surface)] p-6 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-primary)]">
                Live Preview
              </h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            </div>
            <LivePreview
              systemName={localSettings.systemName}
              themeColor={localSettings.themeColor}
              darkMode={localSettings.darkMode}
              logoPreview={logoPreview}
            />
          </div>

          <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50">
            <div className="flex gap-3">
              <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                Identity changes (logo & theme) will be applied globally to all
                officer dashboards and generated PDF receipts.
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full btn-primary flex items-center justify-center gap-3 py-4 rounded-2xl shadow-xl shadow-[var(--color-primary)]/20 active:scale-[0.98] transition-all"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span className="font-bold tracking-wide">
              Update Brand Identity
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
