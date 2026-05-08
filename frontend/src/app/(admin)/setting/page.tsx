"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  Receipt,
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
  Upload,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { FormInput } from "@/components/settings/FormInput";
import { Toast } from "@/components/common/Toast";

import { settingsService, GeneralSettings, TaxSettings } from "@/services/settings.service";

export default function ParkSmartSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; isOpen: boolean }>({
    message: "",
    type: "success",
    isOpen: false,
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    companyName: "",
    phone: "",
    address: "",
    email: "",
    supportEmail: "",
    website: "",
  });

  const [taxSettings, setTaxSettings] = useState<TaxSettings>({
    taxRate: "",
    currency: "CAD",
    taxMode: "inclusive",
  });

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type, isOpen: true });
  };
//fetch data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const [generalRes, taxRes] = await Promise.all([
          settingsService.getGeneralSettings(),
          settingsService.getTaxSettings(),
        ]);
        setGeneralSettings(generalRes);
        setTaxSettings(taxRes);
      } catch (error) {
        console.error(error);
        showToast("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

//input handler
  const handleGeneralChange = (field: keyof GeneralSettings, value: string) => {
    setGeneralSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleTaxChange = (field: keyof TaxSettings, value: string) => {
    setTaxSettings((prev) => ({ ...prev, [field]: value }));
  };
//data save
  const handleSaveGeneral = async () => {
    try {
      setSaving(true);
      const response = await settingsService.updateGeneralSettings(generalSettings);
      showToast(response.message, "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to save general settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTax = async () => {
    try {
      setSaving(true);
      const response = await settingsService.updateTaxSettings(taxSettings);
      showToast(response.message, "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to save tax settings", "error");
    } finally {
      setSaving(false);
    }
  };

//reset logic
  const handleReset = async () => {
    try {
      setLoading(true);
      const [generalRes, taxRes] = await Promise.all([
        settingsService.getGeneralSettings(),
        settingsService.getTaxSettings(),
      ]);
      setGeneralSettings(generalRes);
      setTaxSettings(taxRes);
      setLogoPreview(null);
      showToast("Settings reset to default", "info");
    } catch (error) {
      console.error(error);
      showToast("Failed to reset settings", "error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-6 bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            System <span className="text-[var(--color-primary)]">Preferences</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Manage your company information and tax configurations for ParkSmart.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 bg-white hover:border-[var(--color-primary)] transition-all text-sm font-bold"
        >
          <RotateCcw size={17} />
          Reset
        </button>
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
          {/* GENERAL SETTINGS */}
          {activeTab === "general" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Logo Section */}
                <div className="xl:col-span-1 bg-white p-7 rounded-[28px] border border-gray-100 shadow-sm h-fit text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-7">
                    Company Logo
                  </p>
                  <div className="relative w-52 h-52 mx-auto mb-7 bg-gray-50 rounded-3xl border border-gray-200 flex flex-col items-center justify-center group overflow-hidden transition-all hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 cursor-pointer">
                    {logoPreview ? (
                      <>
                        <img src={logoPreview} alt="Preview" className="w-full h-full object-contain p-4" />
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
                        <Upload size={36} strokeWidth={1.5} />
                        <span className="text-[11px] font-semibold mt-3">Click to Upload</span>
                      </div>
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={(e: any) => {
                        if (e.target.files && e.target.files[0]) {
                          setLogoPreview(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] font-medium">
                    PNG, JPG or SVG (Max. 2MB)
                  </p>
                </div>

                {/* Form Section */}
                <div className="xl:col-span-2 bg-white p-8 md:p-10 rounded-[28px] border border-gray-100 shadow-sm">
                  {loading ? (
                    <div className="space-y-5">
                      {Array(6).fill(null).map((_, i) => (
                        <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7 mb-10">
                        <FormInput
                          label="Company Name"
                          placeholder="Enter Company Name"
                          icon={<Building2 />}
                          value={generalSettings.companyName}
                          onChange={(e) => handleGeneralChange("companyName", e.target.value)}
                        />
                        <FormInput
                          label="Phone Number"
                          placeholder="+91 XXXXX XXXXX"
                          icon={<Phone />}
                          value={generalSettings.phone}
                          onChange={(e) => handleGeneralChange("phone", e.target.value)}
                        />
                        <FormInput
                          label="Address"
                          placeholder="Enter Company Address"
                          icon={<MapPin />}
                          value={generalSettings.address}
                          onChange={(e) => handleGeneralChange("address", e.target.value)}
                          textarea
                          rows={3}
                        />
                        <FormInput
                          label="Email Address"
                          placeholder="admin@example.com"
                          icon={<Mail />}
                          value={generalSettings.email}
                          onChange={(e) => handleGeneralChange("email", e.target.value)}
                        />
                        <FormInput
                          label="Support Email"
                          placeholder="support@example.com"
                          icon={<Mail />}
                          value={generalSettings.supportEmail}
                          onChange={(e) => handleGeneralChange("supportEmail", e.target.value)}
                        />
                        <FormInput
                          label="Website"
                          placeholder="www.example.com"
                          icon={<Globe />}
                          value={generalSettings.website}
                          onChange={(e) => handleGeneralChange("website", e.target.value)}
                        />
                      </div>
                      <div className="pt-8 border-t border-gray-50 flex justify-end">
                        <button
                          disabled={saving}
                          onClick={handleSaveGeneral}
                          className="btn-primary flex items-center gap-2.5 px-10 py-3.5 rounded-2xl shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-95 disabled:opacity-60"
                        >
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={20} />
                              Save General Details
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* TAX SETTINGS */
            <div className="max-w-5xl space-y-6">
              <div className="bg-white p-8 md:p-10 rounded-[28px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-50">
                  <div className="p-3.5 bg-amber-50 rounded-2xl">
                    <Percent className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Tax Configuration</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Configure your system-wide tax rates and billing currency.
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-5">
                    {Array(4).fill(null).map((_, i) => (
                      <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7 mb-10">
                      <FormInput
                        label="Default Tax Rate (%)"
                        placeholder="5.0"
                        icon={<Percent />}
                        value={taxSettings.taxRate}
                        onChange={(e) => handleTaxChange("taxRate", e.target.value)}
                      />
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest pl-1 block">
                          Currency
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                          <select
                            value={taxSettings.currency}
                            onChange={(e) => handleTaxChange("currency", e.target.value)}
                            className="input w-full pl-11 pr-4 py-3 text-[13px] bg-white border border-gray-200 rounded-xl appearance-none"
                          >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                            <option value="CAD">CAD ($)</option>
                          </select>
                        </div>
                      </div>

                      {/* Tax Mode */}
                      <div className="md:col-span-2 p-6 bg-gray-50/70 rounded-3xl border border-gray-100">
                        <p className="text-[11px] font-black uppercase text-[var(--color-text-muted)] tracking-wider mb-5">
                          Tax Application Mode
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <label className="flex items-start gap-4 p-5 bg-white rounded-2xl border-2 border-gray-100 cursor-pointer hover:border-[var(--color-primary)]/40 transition-colors">
                            <input
                              type="radio"
                              checked={taxSettings.taxMode === "inclusive"}
                              onChange={() => handleTaxChange("taxMode", "inclusive")}
                              className="mt-1 accent-[var(--color-primary)]"
                            />
                            <div>
                              <span className="block text-sm font-bold">Inclusive Pricing</span>
                              <span className="text-[11px] text-[var(--color-text-muted)] mt-1 block">
                                Taxes included in base price.
                              </span>
                            </div>
                          </label>
                          <label className="flex items-start gap-4 p-5 bg-white rounded-2xl border-2 border-gray-100 cursor-pointer hover:border-[var(--color-primary)]/40 transition-colors">
                            <input
                              type="radio"
                              checked={taxSettings.taxMode === "exclusive"}
                              onChange={() => handleTaxChange("taxMode", "exclusive")}
                              className="mt-1 accent-[var(--color-primary)]"
                            />
                            <div>
                              <span className="block text-sm font-bold">Exclusive Pricing</span>
                              <span className="text-[11px] text-[var(--color-text-muted)] mt-1 block">
                                Taxes added separately.
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-50 flex justify-end">
                      <button
                        disabled={saving}
                        onClick={handleSaveTax}
                        className="btn-primary flex items-center gap-2.5 px-10 py-3.5 rounded-2xl shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-95 disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={20} />
                            Update Pricing Rules
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50/50 p-6 rounded-[28px] border border-blue-100 flex gap-5 items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                  <Info size={24} strokeWidth={1.5} />
                </div>
                <p className="text-xs text-blue-700/80 font-medium italic">
                  Tax changes will only apply to new parking sessions and will not affect active bookings.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Toast Notification */}
      <Toast message={toast.message} type={toast.type} isOpen={toast.isOpen} onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))} />
    </div>
  );
}