"use client";

import React, { useEffect, useState } from "react";
import {
  Save,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  X,
  Upload,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSystem } from "@/contexts/SystemContext";

const FormInput = ({
  label,
  placeholder,
  icon,
  value,
  onChange,
  textarea = false,
  rows = 3,
}: any) => {
  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.15em] ml-1 transition-colors group-focus-within:text-[var(--color-primary)]">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-[14px] text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-all duration-300">
            {React.cloneElement(icon, { size: 18, strokeWidth: 2 })}
          </div>
        )}
        {textarea ? (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full pl-12 pr-4 py-3 text-sm bg-[var(--color-surface-soft)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:bg-white focus:ring-[6px] focus:ring-[var(--color-primary)]/5 rounded-2xl transition-all duration-300 outline-none resize-none placeholder:text-gray-400 font-medium dark:focus:bg-[var(--color-surface)]"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-3.5 text-sm bg-[var(--color-surface-soft)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:bg-white focus:ring-[6px] focus:ring-[var(--color-primary)]/5 rounded-2xl transition-all duration-300 outline-none placeholder:text-gray-400 font-medium dark:focus:bg-[var(--color-surface)]"
          />
        )}
      </div>
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <div className="lg:col-span-4">
      <div className="bg-[var(--color-surface)] p-8 rounded-[32px] border border-[var(--color-border)] h-96 animate-pulse" />
    </div>
    <div className="lg:col-span-8">
      <div className="bg-[var(--color-surface)] p-8 md:p-10 rounded-[32px] border border-[var(--color-border)] h-96 animate-pulse" />
    </div>
  </div>
);

export const GeneralSettings = () => {
  const { branding, updateBrandingSettings, refreshSettings } = useSystem();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    phone: "",
    address: "",
    email: "",
    supportEmail: "",
    website: "",
  });

  // Load data from context
  useEffect(() => {
    if (branding) {
      setFormData({
        companyName: branding.systemName || "",
        phone: "+1 (647) 123-4567",
        address: "123 Park Street, Suite 100, Toronto, Ontario, Canada",
        email: "admin@parksmart.com",
        supportEmail: "support@parksmart.com",
        website: "www.parksmart.com",
      });
      if (branding.logoUrl) {
        setLogoPreview(branding.logoUrl);
      }
      setLoading(false);
    }
  }, [branding]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update system name in branding
      await updateBrandingSettings({
        systemName: formData.companyName,
        logoUrl: logoPreview,
      });

      toast.success("General settings updated successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);

      // Update logo in context
      await updateBrandingSettings({ logoUrl: preview });
      toast.success("Logo uploaded successfully!");
    }
  };

  const handleLogoRemove = async () => {
    setLogoPreview(null);
    await updateBrandingSettings({ logoUrl: null });
    toast.success("Logo removed");
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Logo Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[var(--color-surface)] p-8 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)] relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-primary)]/10 transition-colors duration-500" />

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-primary)]">
                  Company Brand
                </h3>
              </div>
              <button
                onClick={handleReset}
                className="p-2 hover:rotate-180 transition-all duration-500 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="relative aspect-square w-full max-w-[240px] mx-auto bg-[var(--color-bg)] rounded-[2.5rem] border-2 border-dashed border-[var(--color-border)] group-hover:border-[var(--color-primary)]/30 flex flex-col items-center justify-center transition-all duration-300 overflow-hidden shadow-inner">
              {logoPreview ? (
                <div className="relative w-full h-full p-6 animate-in zoom-in-95 duration-300">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={handleLogoRemove}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-full text-red-500 shadow-sm hover:bg-red-50 transition-colors"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors cursor-pointer">
                  <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                    <Upload size={28} strokeWidth={1.5} />
                  </div>
                  <span className="text-[13px] font-bold">Upload New Logo</span>
                  <p className="text-[10px] mt-1 opacity-60 font-medium tracking-wide">
                    SVG or PNG (Max 2MB)
                  </p>
                </div>
              )}
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
              />
            </div>
          </div>
        </div>

        {/* Right: Info Card */}
        <div className="lg:col-span-8">
          <div className="bg-[var(--color-surface)] p-8 md:p-10 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)] h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <FormInput
                label="Company Name"
                placeholder="ParkSmart Solutions"
                icon={<Building2 />}
                value={formData.companyName}
                onChange={(e: any) =>
                  handleChange("companyName", e.target.value)
                }
              />
              <FormInput
                label="Support Hot-line"
                placeholder="+1 (647) 000-0000"
                icon={<Phone />}
                value={formData.phone}
                onChange={(e: any) => handleChange("phone", e.target.value)}
              />

              <div className="md:col-span-2">
                <FormInput
                  label="Official Address"
                  placeholder="123 Business Bay, Downtown"
                  icon={<MapPin />}
                  value={formData.address}
                  onChange={(e: any) => handleChange("address", e.target.value)}
                  textarea
                  rows={2}
                />
              </div>

              <FormInput
                label="Admin Email"
                placeholder="admin@parksmart.com"
                icon={<Mail />}
                value={formData.email}
                onChange={(e: any) => handleChange("email", e.target.value)}
              />
              <FormInput
                label="Support Email"
                placeholder="help@parksmart.com"
                icon={<Mail />}
                value={formData.supportEmail}
                onChange={(e: any) =>
                  handleChange("supportEmail", e.target.value)
                }
              />

              <div className="md:col-span-2">
                <FormInput
                  label="Official Website"
                  placeholder="https://www.parksmart.com"
                  icon={<Globe />}
                  value={formData.website}
                  onChange={(e: any) => handleChange("website", e.target.value)}
                />
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[12px] text-[var(--color-text-muted)] font-medium italic">
                Changes will be applied globally
              </p>

              <button
                onClick={handleSave}
                disabled={saving}
                className="group relative btn-primary w-full md:w-auto overflow-hidden px-10 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-[var(--color-primary)]/20 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save
                      size={18}
                      strokeWidth={2.5}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    <span className="relative z-10 font-bold tracking-wide">
                      Save Configuration
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
