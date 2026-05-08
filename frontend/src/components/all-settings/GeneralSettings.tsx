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
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

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
            className="w-full pl-12 pr-4 py-3 text-sm bg-[var(--color-surface-soft)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:bg-white focus:ring-[6px] focus:ring-[var(--color-primary)]/5 rounded-2xl transition-all duration-300 outline-none resize-none placeholder:text-gray-400 font-medium"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-3.5 text-sm bg-[var(--color-surface-soft)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:bg-white focus:ring-[6px] focus:ring-[var(--color-primary)]/5 rounded-2xl transition-all duration-300 outline-none placeholder:text-gray-400 font-medium"
          />
        )}
      </div>
    </div>
  );
};

export const GeneralSettings = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Logo Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[var(--color-surface)] p-8 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)] relative overflow-hidden group">
            {/* Background Decorative Gradient */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-primary)]/10 transition-colors duration-500" />

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-2">
                {/* <div className="w-1.5 h-4 bg-[var(--color-primary)] rounded-full" /> */}
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-primary)]">
                  Company Brand
                </h3>
              </div>
              {/* <button className="p-2 hover:rotate-180 transition-all duration-500 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                <RotateCcw size={16} />
              </button> */}
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
                    onClick={() => setLogoPreview(null)}
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
                onChange={(e: any) =>
                  setLogoPreview(URL.createObjectURL(e.target.files[0]))
                }
              />
            </div>

            {/* <div className="mt-8 p-4 bg-[var(--color-primary)]/5 rounded-2xl border border-[var(--color-primary)]/10">
               <div className="flex items-center gap-3 text-[var(--color-primary)]">
                  <ShieldCheck size={18} />
                  <p className="text-[11px] font-bold leading-tight">This logo will appear on all penalty tickets and reports.</p>
               </div>
            </div> */}
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
              />
              <FormInput
                label="Support Hot-line"
                placeholder="+1 (647) 000-0000"
                icon={<Phone />}
              />

              <div className="md:col-span-2">
                <FormInput
                  label="Official Address"
                  placeholder="123 Business Bay, Downtown"
                  icon={<MapPin />}
                  textarea
                  rows={2}
                />
              </div>

              <FormInput
                label="Admin Email"
                placeholder="admin@parksmart.com"
                icon={<Mail />}
              />
              <FormInput
                label="Support Email"
                placeholder="help@parksmart.com"
                icon={<Mail />}
              />

              <div className="md:col-span-2">
                <FormInput
                  label="Official Website"
                  placeholder="https://www.parksmart.com"
                  icon={<Globe />}
                />
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[12px] text-[var(--color-text-muted)] font-medium italic">
                {/* Last updated: May 08, 2026 */}
              </p>

              <button
                onClick={() => {
                  setSaving(true);
                  setTimeout(() => {
                    setSaving(false);
                    toast.success("Settings Updated!");
                  }, 1500);
                }}
                className="group relative btn-primary w-full md:w-auto overflow-hidden px-10 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-[var(--color-primary)]/20 active:scale-[0.98] transition-all"
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
