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
} from "lucide-react";
import toast from "react-hot-toast";
import {
  settingsService,
  BrandingSettings as BrandingSettingsType,
} from "@/services/settings.service";

// Color Picker
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
            className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${value === c ? "ring-2 ring-offset-2 ring-[var(--color-primary)]" : ""}`}
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

export const BrandingSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [settings, setSettings] = useState<BrandingSettingsType>({
    systemName: "ParkSmart",
    themeColor: "#0F766E",
    logoUrl: null,
    faviconUrl: null,
    darkMode: "light",
    sidebarCollapsed: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getBrandingSettings();
        setSettings(data);
        if (data.logoUrl) setLogoPreview(data.logoUrl);
      } catch (error) {
        toast.error("Failed to load branding");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field: keyof BrandingSettingsType, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsService.updateBrandingSettings(settings);
      document.documentElement.style.setProperty(
        "--color-primary",
        settings.themeColor,
      );
      toast.success("Identity updated successfully!");
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="h-96 bg-gray-100 rounded-[32px] animate-pulse" />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Text & Colors */}
        <div className="lg:col-span-7 space-y-8">
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
                  value={settings.systemName}
                  onChange={(e) => handleChange("systemName", e.target.value)}
                  placeholder="e.g. ParkSmart Pro"
                  className="w-full pl-12 pr-4 py-4 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl text-sm font-bold focus:border-[var(--color-primary)] focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <ColorBox
              label="Brand Theme Color"
              value={settings.themeColor}
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
                      settings.darkMode === mode.id
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
        </div>

        {/* Right Side: Assets & Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[var(--color-surface)] p-8 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
            <div className="flex flex-col items-center gap-6">
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
                      Upload Main Logo
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e: any) =>
                    setLogoPreview(URL.createObjectURL(e.target.files[0]))
                  }
                />
              </div>

              <div className="w-full flex items-center gap-4 bg-[var(--color-surface-soft)] p-4 rounded-2xl border border-[var(--color-border)]">
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
                <button className="p-2 bg-white rounded-lg border border-[var(--color-border)] hover:text-[var(--color-primary)] transition-colors">
                  <Upload size={14} />
                </button>
              </div>
            </div>

            <div className="mt-10 p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50">
              <div className="flex gap-3">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                  Identity changes (logo & theme) will be applied globally to
                  all officer dashboards and generated PDF receipts.
                </p>
              </div>
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
