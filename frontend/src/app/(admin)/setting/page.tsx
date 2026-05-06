"use client";

import React, { useState } from "react";
import {
  Settings,
  Receipt,
  Upload,
  Save,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Percent,
  DollarSign,
  Info,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

//Form Input Component
const FormInput = ({ label, placeholder, icon, type = "text" }: any) => {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest block pl-1">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
            {React.cloneElement(icon, { size: 17 })}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          className={`input w-full ${icon ? "pl-11" : "pl-4"} pr-4 py-3 text-[13px] bg-white border border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 rounded-xl transition-all`}
        />
      </div>
    </div>
  );
};

export default function ParkSmartSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-6 bg-[var(--color-bg)]">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          System{" "}
          <span className="text-[var(--color-primary)]">Preferences</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Manage your company information and tax configurations for ParkSmart.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-8 w-fit">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2.5 px-7 py-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === "general"
              ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/15"
              : "text-[var(--color-text-secondary)] hover:bg-gray-50"
          }`}
        >
          <Settings size={17} /> General Settings
        </button>
        <button
          onClick={() => setActiveTab("tax")}
          className={`flex items-center gap-2.5 px-7 py-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === "tax"
              ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/15"
              : "text-[var(--color-text-secondary)] hover:bg-gray-50"
          }`}
        >
          <Receipt size={17} /> Tax & Pricing
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "general" ? (
            /* GENERAL SETTINGS */
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Logo Upload Card */}
                <div className="xl:col-span-1 bg-white p-7 rounded-[28px] border border-gray-100 shadow-sm h-fit text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-7">
                    Company Logo
                  </p>
                  <div className="relative w-52 h-52 mx-auto mb-7 bg-gray-50 rounded-3xl border border-gray-200 flex flex-col items-center justify-center group overflow-hidden transition-all hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 cursor-pointer">
                    {logoPreview ? (
                      <>
                        <img
                          src={logoPreview}
                          alt="Preview"
                          className="w-full h-full object-contain p-4"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogoPreview(null);
                          }}
                          className="absolute top-3 right-3 p-1.5 bg-white/70 backdrop-blur-sm rounded-full text-red-500 hover:bg-white"
                        >
                          <X size={15} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 group-hover:text-[var(--color-primary)]">
                        <Building2 size={36} strokeWidth={1.5} />
                        <span className="text-[11px] font-semibold mt-3">
                          Click to Upload
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={(e: any) => {
                        if (e.target.files && e.target.files[0])
                          setLogoPreview(
                            URL.createObjectURL(e.target.files[0]),
                          );
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] font-medium">
                    PNG, JPG or SVG (Max. 2MB)
                  </p>
                </div>

                {/* Form Info Card */}
                <div className="xl:col-span-2 bg-white p-8 md:p-10 rounded-[28px] border border-gray-100 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7 mb-10">
                    <FormInput
                      label="Company Name"
                      placeholder="Enter Company Name"
                      icon={<Building2 size={16} />}
                    />
                    <FormInput
                      label="Phone Number"
                      placeholder="+91 XXXXX XXXXX"
                      icon={<Phone size={16} />}
                    />

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest pl-1 block">
                        Address
                      </label>
                      <div className="relative group">
                        <MapPin
                          className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors"
                          size={17}
                        />
                        <textarea
                          placeholder="Enter Company Address"
                          className="input w-full pl-11 pr-4 py-3 text-[13px] bg-white border border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 rounded-xl min-h-[110px] no-scrollbar transition-all"
                        />
                      </div>
                    </div>

                    <FormInput
                      label="Email Address"
                      placeholder="admin@example.com"
                      icon={<Mail size={16} />}
                    />
                    <FormInput
                      label="Support Email"
                      placeholder="support@example.com"
                      icon={<Mail size={16} />}
                    />
                    <FormInput
                      label="Website"
                      placeholder="www.example.com"
                      icon={<Globe size={16} />}
                    />
                  </div>

                  <div className="pt-8 border-t border-gray-50 flex justify-end">
                    <button className="btn-primary flex items-center gap-2.5 px-10 py-3.5 rounded-2xl shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-95">
                      <Save size={20} /> Save General Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAX & PRICING */
            <div className="max-w-5xl space-y-6">
              <div className="bg-white p-8 md:p-10 rounded-[28px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-50">
                  <div className="p-3.5 bg-amber-50 rounded-2xl">
                    <Percent className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      Tax Configuration
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Configure your system-wide tax rates and billing currency.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7 mb-10">
                  <FormInput
                    label="Default Tax Rate (%)"
                    placeholder="5.0"
                    icon={<Percent size={16} />}
                  />

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest pl-1 block">
                      Currency
                    </label>
                    <div className="relative group">
                      <DollarSign
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors"
                        size={17}
                      />
                      <select className="input w-full pl-11 pr-4 py-3 text-[13px] bg-white border border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 rounded-xl appearance-none transition-all cursor-pointer">
                        <option>INR (₹)</option>
                        <option>USD ($)</option>
                        <option>CAD ($)</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2 p-6 bg-gray-50/70 rounded-3xl border border-gray-100">
                    <p className="text-[11px] font-black uppercase text-[var(--color-text-muted)] tracking-wider mb-5">
                      Tax Application Mode
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <label className="flex items-start gap-4 p-5 bg-white rounded-2xl border-2 border-gray-100 cursor-pointer group hover:border-[var(--color-primary)]/40 transition-colors has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary)]/5">
                        <input
                          type="radio"
                          name="tax_mode"
                          className="mt-1 accent-[var(--color-primary)] w-4 h-4 shrink-0"
                          defaultChecked
                        />
                        <div>
                          <span className="block text-sm font-bold text-gray-950">
                            Inclusive Pricing
                          </span>
                          <span className="text-[11px] text-[var(--color-text-muted)] mt-1 block">
                            Taxes included in the base price.
                          </span>
                        </div>
                      </label>
                      <label className="flex items-start gap-4 p-5 bg-white rounded-2xl border-2 border-gray-100 cursor-pointer group hover:border-[var(--color-primary)]/40 transition-colors has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary)]/5">
                        <input
                          type="radio"
                          name="tax_mode"
                          className="mt-1 accent-[var(--color-primary)] w-4 h-4 shrink-0"
                        />
                        <div>
                          <span className="block text-sm font-bold text-gray-950">
                            Exclusive Pricing
                          </span>
                          <span className="text-[11px] text-[var(--color-text-muted)] mt-1 block">
                            Taxes added on top of base price.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Save Button  */}
                <div className="pt-8 border-t border-gray-50 flex justify-end">
                  <button className="btn-primary flex items-center gap-2.5 px-10 py-3.5 rounded-2xl shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-95">
                    <Save size={20} /> Update Pricing Rules
                  </button>
                </div>
              </div>

              <div className="bg-blue-50/50 p-6 rounded-[28px] border border-blue-100 flex gap-5 items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                  <Info size={24} strokeWidth={1.5} />
                </div>
                <p className="text-xs text-blue-700/80 font-medium italic">
                  Note: Tax changes will only apply to new parking sessions and
                  will not affect currently active bookings.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
