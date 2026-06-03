"use client";

import React, { useEffect, useState } from "react";
import {
  Percent,
  DollarSign,
  Save,
  ChevronDown,
  Wallet2,
  Calculator,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  settingsService,
  TaxSettings as TaxSettingsType,
} from "@/services/settings.service";
import { listParkingLots, ParkingLotRecord } from "@/services/parking-lots.service";

//Toggle Component
const CustomToggle = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const isYes = value === "yes";
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="flex bg-[var(--color-surface-soft)] p-1 rounded-xl border border-[var(--color-border)] w-fit min-w-[160px]">
        <button
          onClick={() => onChange("yes")}
          className={`flex-1 px-6 py-2 text-xs font-bold rounded-lg transition-all ${
            isYes
              ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => onChange("no")}
          className={`flex-1 px-6 py-2 text-xs font-bold rounded-lg transition-all ${
            !isYes
              ? "bg-red-500 text-white shadow-md shadow-red-500/20"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
};

export const TaxSettings = ({ parkingLotId }: { parkingLotId?: string }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parkingLots, setParkingLots] = useState<ParkingLotRecord[]>([]);
  const [selectedParkingLotId, setSelectedParkingLotId] = useState<string>(parkingLotId ?? "");
  const [settings, setSettings] = useState<TaxSettingsType>({
    taxRate: "",
    currency: "CAD",
    roundingRule: "nearest_cent",
    pricesIncludeTax: "yes",
    refundAllowed: "yes",
    refundApprovalRequired: "yes",
  });

  // Fetch parking lots
  useEffect(() => {
    const loadParkingLots = async () => {
      try {
        const lots = await listParkingLots();
        setParkingLots(lots);
      } catch (error) {
        console.error("Failed to load parking lots:", error);
      }
    };
    loadParkingLots();
  }, []);

  // Sync prop with state
  useEffect(() => {
    setSelectedParkingLotId(parkingLotId ?? "");
  }, [parkingLotId]);

  // Fetch data when parking lot changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getTaxSettings(selectedParkingLotId || undefined);
        setSettings(data);
      } catch (error) {
        toast.error("Failed to load tax settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedParkingLotId]);

  const handleChange = (field: keyof TaxSettingsType, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await settingsService.updateTaxSettings(settings, selectedParkingLotId || undefined);
      toast.success(response.message);
    } catch (error) {
      toast.error("Failed to save tax settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
        <div className="h-[400px] bg-gray-100  rounded-[32px]" />
        <div className="h-[400px] bg-gray-100  rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Parking Lot Selector */}
     {/*  <div className="mb-8 bg-[var(--color-surface)] p-6 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
        <div className="relative">
          <select
            value={selectedParkingLotId}
            onChange={(e) => setSelectedParkingLotId(e.target.value)}
            className="w-full px-5 py-3.5 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl focus:border-[var(--color-primary)] transition-all outline-none text-sm font-bold appearance-none cursor-pointer"
          >
            {parkingLots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.lot_name} {lot.address ? `(${lot.address})` : ""}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          />
        </div>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Card: Base Financials */}
        <div className="bg-[var(--color-surface)] p-8 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center text-[var(--color-primary)]">
              <Wallet2 size={20} />
            </div>
            <h3 className="font-bold text-lg text-[var(--color-text-primary)] tracking-tight">
              Base Financials
            </h3>
          </div>

          <div className="space-y-7">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1">
                Default Tax Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => handleChange("taxRate", e.target.value)}
                  className="w-full px-5 py-3.5 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all outline-none text-sm font-bold"
                  placeholder="5"
                />
                <Percent
                  size={16}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1">
                Currency
              </label>
              <div className="relative">
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="w-full px-5 py-3.5 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl focus:border-[var(--color-primary)] transition-all outline-none text-sm font-bold appearance-none cursor-pointer"
                >
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1">
                Rounding Rule
              </label>
              <div className="relative">
                <select
                  value={settings.roundingRule}
                  onChange={(e) => handleChange("roundingRule", e.target.value)}
                  className="w-full px-5 py-3.5 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl focus:border-[var(--color-primary)] transition-all outline-none text-sm font-bold appearance-none cursor-pointer"
                >
                  <option value="nearest_cent">Nearest Cent</option>
                  <option value="nearest_dollar">Nearest Dollar</option>
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Billing Logic */}
        <div className="bg-[var(--color-surface)] p-8 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[var(--color-accent)]/10 rounded-xl flex items-center justify-center text-[var(--color-accent)]">
              <Calculator size={20} />
            </div>
            <h3 className="font-bold text-lg text-[var(--color-text-primary)] tracking-tight">
              Billing Logic
            </h3>
          </div>

          <div className="space-y-10 flex-1">
            <CustomToggle
              label="Prices Include Tax"
              value={settings.pricesIncludeTax}
              onChange={(v) => handleChange("pricesIncludeTax", v)}
            />
            <CustomToggle
              label="Refund Allowed"
              value={settings.refundAllowed}
              onChange={(v) => handleChange("refundAllowed", v)}
            />
            <CustomToggle
              label="Refund Approval Required"
              value={settings.refundApprovalRequired}
              onChange={(v) => handleChange("refundApprovalRequired", v)}
            />
          </div>
        </div>
      </div>

      {/* Save Bar Bottom */}
      <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex items-center justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary min-w-[200px] flex items-center justify-center gap-3 py-4 rounded-2xl shadow-xl shadow-[var(--color-primary)]/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={18} strokeWidth={2.5} />
              <span className="font-bold tracking-wide">
                Save Logic Changes
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
