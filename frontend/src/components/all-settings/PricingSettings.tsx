"use client";

import React, { useEffect, useState } from "react";
import {
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    DollarSign,
    ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { pricingService, Pricing } from "@/services/pricing.service";
import { taxService, Tax } from "@/services/tax.service";
import { listParkingLots, ParkingLotRecord } from "@/services/parking-lots.service";

export const PricingSettings = ({ parkingLotId }: { parkingLotId?: string }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [parkingLots, setParkingLots] = useState<ParkingLotRecord[]>([]);
    const [selectedParkingLotId, setSelectedParkingLotId] = useState<string>(parkingLotId ?? "");
    const [pricings, setPricings] = useState<Pricing[]>([]);
    const [taxes, setTaxes] = useState<Tax[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        base_price: "",
        additional_fees: "",
        tax_id: "",
        is_active: true,
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
                const [pricingData, taxData] = await Promise.all([
                    pricingService.list(selectedParkingLotId || undefined),
                    taxService.list(selectedParkingLotId || undefined),
                ]);
                setPricings(pricingData.items);
                setTaxes(taxData.items);
            } catch (error) {
                console.error("Failed to load pricing data:", error);
                toast.error("Failed to load pricing data");
            } finally {
                setLoading(false);
            }
        };
        if (selectedParkingLotId) {
            fetchData();
        }
    }, [selectedParkingLotId]);

    const resetForm = () => {
        setFormData({
            name: "",
            base_price: "",
            additional_fees: "",
            tax_id: "",
            is_active: true,
        });
        setEditingId(null);
        setShowAddForm(false);
    };

    const handleAddOrUpdate = async () => {
        if (!formData.name.trim()) {
            toast.error("Pricing name is required");
            return;
        }
        if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
            toast.error("Base price must be greater than 0");
            return;
        }

        try {
            setSaving(true);
            if (editingId) {
                await pricingService.updatePricing(
                    editingId,
                    {
                        name: formData.name,
                        base_price: parseFloat(formData.base_price),
                        additional_fees: formData.additional_fees ? parseFloat(formData.additional_fees) : 0,
                        tax_id: formData.tax_id || null,
                        is_active: formData.is_active,
                    },
                    selectedParkingLotId || undefined
                );
                toast.success("Pricing updated successfully");
            } else {
                await pricingService.createPricing(
                    {
                        name: formData.name,
                        base_price: parseFloat(formData.base_price),
                        additional_fees: formData.additional_fees ? parseFloat(formData.additional_fees) : 0,
                        tax_id: formData.tax_id || null,
                        is_active: formData.is_active,
                    },
                    selectedParkingLotId || undefined
                );
                toast.success("Pricing created successfully");
            }
            resetForm();
            // Refresh the list
            const pricingData = await pricingService.list(selectedParkingLotId || undefined);
            setPricings(pricingData.items);
        } catch (error) {
            toast.error(editingId ? "Failed to update pricing" : "Failed to create pricing");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (pricing: Pricing) => {
        setFormData({
            name: pricing.name,
            base_price: String(pricing.base_price),
            additional_fees: String(pricing.additional_fees || 0),
            tax_id: pricing.tax_id || "",
            is_active: pricing.is_active ?? true,
        });
        setEditingId(pricing.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this pricing?")) return;

        try {
            await pricingService.deletePricing(id);
            toast.success("Pricing deleted successfully");
            setPricings(pricings.filter((p) => p.id !== id));
        } catch (error) {
            toast.error("Failed to delete pricing");
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-8 animate-pulse">
                <div className="h-[200px] bg-gray-100 rounded-[32px]" />
                <div className="h-[400px] bg-gray-100 rounded-[32px]" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            {/* Parking Lot Selector */}
            <div className="bg-[var(--color-surface)] p-6 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
                <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1 block mb-3">
                    Select Parking Lot
                </label>
                <div className="relative">
                    <select
                        value={selectedParkingLotId}
                        onChange={(e) => setSelectedParkingLotId(e.target.value)}
                        className="w-full px-5 py-3.5 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl focus:border-[var(--color-primary)] transition-all outline-none text-sm font-bold appearance-none cursor-pointer"
                    >
                        <option value="">Choose a parking lot...</option>
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
            </div>

            {selectedParkingLotId && (
                <>
                    {/* Pricing List */}
                    <div className="bg-[var(--color-surface)] p-8 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center text-[var(--color-primary)]">
                                    <DollarSign size={20} />
                                </div>
                                <h3 className="font-bold text-lg text-[var(--color-text-primary)] tracking-tight">
                                    Pricing Plans
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowAddForm(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all"
                            >
                                <Plus size={16} />
                                Add Pricing
                            </button>
                        </div>

                        {/* Pricing Form */}
                        {showAddForm && (
                            <div className="mb-6 p-6 bg-[var(--color-surface-soft)] rounded-2xl border border-[var(--color-border)] space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1 block mb-2">
                                            Pricing Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-primary)] transition-all outline-none text-sm font-bold"
                                            placeholder="e.g., Standard Hourly"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1 block mb-2">
                                            Base Price ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.base_price}
                                            onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-primary)] transition-all outline-none text-sm font-bold"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1 block mb-2">
                                            Additional Fees ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.additional_fees}
                                            onChange={(e) => setFormData({ ...formData, additional_fees: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-primary)] transition-all outline-none text-sm font-bold"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1 block mb-2">
                                            Tax
                                        </label>
                                        <select
                                            value={formData.tax_id}
                                            onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-primary)] transition-all outline-none text-sm font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="">None</option>
                                            {taxes.map((tax) => (
                                                <option key={tax.id} value={tax.id}>
                                                    {tax.name} ({tax.rate}%)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">
                                        Active
                                    </label>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-5 h-5 rounded"
                                    />
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={resetForm}
                                        className="px-4 py-2.5 border border-[var(--color-border)] rounded-xl font-bold text-sm hover:bg-[var(--color-surface-soft)] transition-all flex items-center gap-2"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddOrUpdate}
                                        disabled={saving}
                                        className="px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Save size={16} />
                                        {saving ? "Saving..." : editingId ? "Update" : "Create"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Pricing List */}
                        <div className="space-y-3">
                            {pricings.length === 0 ? (
                                <div className="text-center py-8 text-[var(--color-text-muted)]">
                                    No pricing plans yet. Create one to get started.
                                </div>
                            ) : (
                                pricings.map((pricing) => (
                                    <div
                                        key={pricing.id}
                                        className="flex items-center justify-between p-4 bg-[var(--color-surface-soft)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-[var(--color-text-primary)]">
                                                {pricing.name}
                                            </div>
                                            <div className="text-xs text-[var(--color-text-muted)] mt-1">
                                                Base: ${pricing.base_price.toFixed(2)}
                                                {pricing.additional_fees ? ` • Fees: $${pricing.additional_fees.toFixed(2)}` : ""}
                                                {pricing.is_active ? (
                                                    <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-700 rounded text-xs font-bold">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-700 rounded text-xs font-bold">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(pricing)}
                                                className="p-2 hover:bg-blue-500/20 text-blue-600 rounded-lg transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pricing.id)}
                                                className="p-2 hover:bg-red-500/20 text-red-600 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
