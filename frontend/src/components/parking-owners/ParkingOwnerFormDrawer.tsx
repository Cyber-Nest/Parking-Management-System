"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Upload,
  Camera,
  Plus,
  Trash2,
  QrCode,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";

import toast from "react-hot-toast";
import { ParkingOwner, ParkingZone } from "@/services/parking-owner.service";
import { uploadFileToCloudinary } from "@/lib/upload-media";

export interface ParkingOwnerFormData {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  companyName: string;
  parkingName: string;
  parkingAddress: string;
  parkingImage: string | null;
  averageRate: string;
  zones: ParkingZone[];
  isActive: boolean;
}

interface ParkingOwnerFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ParkingOwnerFormData) => void | Promise<void>;
  editingParkingOwner: ParkingOwner | null;
  formData: ParkingOwnerFormData;
  onFormChange: (field: keyof ParkingOwnerFormData, value: any) => void;
}

const FormSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-2xl p-6 space-y-6 shadow-sm shadow-black/[0.01]">
    <div className="flex items-center gap-3 border-b border-[var(--color-border)]/50 pb-4">
      <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center">
        <Icon size={16} strokeWidth={2} />
      </div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
        {title}
      </h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const FieldWrapper = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5 flex flex-col">
    <label className="text-xs font-medium text-[var(--color-text-secondary)] px-0.5">
      {label}
    </label>
    {children}
  </div>
);

export const ParkingOwnerFormDrawer = ({
  isOpen,
  onClose,
  onSubmit,
  editingParkingOwner,
  formData,
  onFormChange,
}: ParkingOwnerFormDrawerProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    formData.parkingImage || null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFileToCloudinary(file, "parksmart/parking", "Parking cover");
      setImagePreview(url);
      onFormChange("parkingImage", url);
      toast.success("Parking image uploaded");
    } catch {
      toast.error("Failed to upload parking image");
    }
  };

  const handleAddZone = () => {
    const newZone: ParkingZone = {
      id: `ZONE-${Date.now()}`,
      name: "",
      isActive: true,
      rate: undefined,
    };

    onFormChange("zones", [...formData.zones, newZone]);
  };

  const updateZone = (index: number, field: keyof ParkingZone, value: any) => {
    const updatedZones = [...formData.zones];
    updatedZones[index] = {
      ...updatedZones[index],
      [field]: value,
    };

    onFormChange("zones", updatedZones);
  };

  const removeZone = (index: number) => {
    const updatedZones = formData.zones.filter((_, i) => i !== index);
    onFormChange("zones", updatedZones);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-40 transition-all duration-300"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 32,
              stiffness: 320,
            }}
            className="fixed top-0 right-0 h-full w-full max-w-[580px] bg-[var(--color-bg)] border-l border-[var(--color-border)]/60 z-50 shadow-2xl shadow-black/10 flex flex-col outline-none"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)]/50 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl flex items-center justify-center border transition-colors duration-200 ${
                    editingParkingOwner
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  }`}
                >
                  <Building2 size={20} strokeWidth={2} />
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
                    {editingParkingOwner
                      ? "Update Parking Owner"
                      : "Create Parking Owner"}
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 font-medium">
                    Manage parking owner access, zones, and QR booking setup.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[var(--color-surface-soft)] transition-colors duration-200 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[var(--color-surface-soft)]/20 no-scrollbar">
              {/* Image Upload */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 shadow-sm shadow-black/[0.01]">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-soft)] flex items-center justify-center shadow-inner transition-transform group-hover:scale-[1.02] duration-200">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Parking"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera
                        size={28}
                        className="text-[var(--color-text-muted)]"
                      />
                    )}
                  </div>

                  {/* Upload Label Button */}
                  <label
                    htmlFor="parking-image"
                    className="absolute -bottom-2 -right-2 p-2 bg-[var(--color-primary)] text-white rounded-xl cursor-pointer shadow-lg shadow-[var(--color-primary)]/20 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/10"
                  >
                    <Upload size={14} strokeWidth={2.5} />
                    <input
                      id="parking-image"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>

                  {/* Remove Button */}
                  {imagePreview && (
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        onFormChange("parkingImage", null);
                      }}
                      className="absolute -top-2 -right-2 p-1 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 backdrop-blur-md transition-transform hover:scale-105"
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  )}
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-[var(--color-text)]">
                    Parking Cover Image
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] font-medium">
                    Upload parking thumbnail or area preview image.
                  </p>
                </div>
              </div>

              {/* Owner Details */}
              <FormSection title="Owner Details" icon={User}>
                <FieldWrapper label="Owner Full Name">
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="John Anderson"
                      className="w-full bg-[var(--color-surface-soft)]/50 border border-[var(--color-border)]/70 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200"
                      value={formData.ownerName}
                      onChange={(e) =>
                        onFormChange("ownerName", e.target.value)
                      }
                    />
                  </div>
                </FieldWrapper>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldWrapper label="Email Address">
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                      />
                      <input
                        type="email"
                        placeholder="owner@parkssmart.com"
                        className="w-full bg-[var(--color-surface-soft)]/50 border border-[var(--color-border)]/70 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200"
                        value={formData.ownerEmail}
                        onChange={(e) =>
                          onFormChange("ownerEmail", e.target.value)
                        }
                      />
                    </div>
                  </FieldWrapper>

                  <FieldWrapper label="Phone Number">
                    <div className="relative">
                      <Phone
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                      />
                      <input
                        type="tel"
                        placeholder="+1 647 000 0000"
                        className="w-full bg-[var(--color-surface-soft)]/50 border border-[var(--color-border)]/70 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200"
                        value={formData.ownerPhone}
                        onChange={(e) =>
                          onFormChange("ownerPhone", e.target.value)
                        }
                      />
                    </div>
                  </FieldWrapper>
                </div>

                <FieldWrapper label="Company Name (Optional)">
                  <input
                    type="text"
                    placeholder="Urban Parking Ltd."
                    className="w-full bg-[var(--color-surface-soft)]/50 border border-[var(--color-border)]/70 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200"
                    value={formData.companyName}
                    onChange={(e) =>
                      onFormChange("companyName", e.target.value)
                    }
                  />
                </FieldWrapper>
              </FormSection>

              {/* Parking Details */}
              <FormSection title="Parking Details" icon={MapPin}>
                <FieldWrapper label="Parking Name">
                  <input
                    type="text"
                    placeholder="Central Parking Tower"
                    className="w-full bg-[var(--color-surface-soft)]/50 border border-[var(--color-border)]/70 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200"
                    value={formData.parkingName}
                    onChange={(e) =>
                      onFormChange("parkingName", e.target.value)
                    }
                  />
                </FieldWrapper>

                <FieldWrapper label="Parking Address">
                  <textarea
                    rows={3}
                    placeholder="123 Downtown Street, Toronto"
                    className="w-full bg-[var(--color-surface-soft)]/50 border border-[var(--color-border)]/70 rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none resize-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200 leading-relaxed"
                    value={formData.parkingAddress}
                    onChange={(e) =>
                      onFormChange("parkingAddress", e.target.value)
                    }
                  />
                </FieldWrapper>

                <FieldWrapper label="Average Hourly Rate ($)">
                  <input
                    type="number"
                    placeholder="4.5"
                    className="w-full bg-[var(--color-surface-soft)]/50 border border-[var(--color-border)]/70 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200"
                    value={formData.averageRate}
                    onChange={(e) =>
                      onFormChange("averageRate", e.target.value)
                    }
                  />
                </FieldWrapper>
              </FormSection>

              {/* Zones */}
              <FormSection title="Parking Zones" icon={BadgeCheck}>
                <div className="space-y-4">
                  {formData.zones.map((zone, index) => (
                    <div
                      key={zone.id}
                      className="p-4 rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-bg)]/50 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold bg-[var(--color-surface-soft)] text-[var(--color-text-secondary)] border border-[var(--color-border)]/40 px-2.5 py-1 rounded-lg">
                          Zone 0{index + 1}
                        </span>

                        <button
                          onClick={() => removeZone(index)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-95 duration-200"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldWrapper label="Zone Name">
                          <input
                            type="text"
                            placeholder="VIP Floor"
                            className="w-full bg-[var(--color-surface-soft)]/50 border border-[var(--color-border)]/70 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200"
                            value={zone.name}
                            onChange={(e) =>
                              updateZone(index, "name", e.target.value)
                            }
                          />
                        </FieldWrapper>

                        <FieldWrapper label="Custom Rate (Optional)">
                          <input
                            type="number"
                            placeholder="8"
                            className="w-full bg-[var(--color-surface-soft)]/50 border border-[var(--color-border)]/70 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200"
                            value={zone.rate || ""}
                            onChange={(e) =>
                              updateZone(index, "rate", Number(e.target.value))
                            }
                          />
                        </FieldWrapper>
                      </div>

                      <div className="flex items-center justify-between border border-[var(--color-border)]/50 rounded-xl px-4 py-3 bg-[var(--color-surface)]">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-[var(--color-text)]">
                            Zone Status
                          </p>
                          <p className="text-[11px] text-[var(--color-text-muted)] font-medium">
                            Enable or disable this zone.
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            updateZone(index, "isActive", !zone.isActive)
                          }
                          className={`w-11 h-6 rounded-full transition-colors relative duration-300 outline-none border border-transparent focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] focus:ring-[var(--color-primary)] ${
                            zone.isActive
                              ? "bg-emerald-500"
                              : "bg-neutral-300 dark:bg-neutral-700"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                              zone.isActive ? "left-6" : "left-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleAddZone}
                    className="w-full border border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] rounded-xl py-3 flex items-center justify-center gap-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] bg-[var(--color-surface)]/40 hover:bg-[var(--color-primary)]/[0.02] transition-all duration-200 active:scale-[0.99]"
                  >
                    <Plus size={15} />
                    Add Parking Zone
                  </button>
                </div>
              </FormSection>

              {/* QR Info */}
              {editingParkingOwner && (
                <FormSection title="QR Access" icon={QrCode}>
                  <div className="p-4 rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-surface)] flex flex-col sm:flex-row items-center gap-5">
                    <img
                      src={editingParkingOwner.qrCodeUrl}
                      alt="QR"
                      className="w-24 h-24 rounded-xl border border-[var(--color-border)]/80 bg-white p-1.5 shadow-sm"
                    />

                    <div className="flex-1 text-center sm:text-left space-y-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-[var(--color-text)]">
                          QR Generated Successfully
                        </p>
                        <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed font-medium">
                          Customers can scan this QR code instantly to trigger
                          the smart live booking flow.
                        </p>
                      </div>

                      <button className="px-4 py-2 bg-[var(--color-surface-soft)] hover:bg-[var(--color-border)] border border-[var(--color-border)]/80 text-[var(--color-text)] font-semibold text-xs rounded-xl shadow-sm transition-all duration-200 active:scale-95">
                        Download QR Code
                      </button>
                    </div>
                  </div>
                </FormSection>
              )}

              {/* Access */}
              {editingParkingOwner && (
                <FormSection title="Access Control" icon={AlertTriangle}>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-surface)]">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-[var(--color-text)]">
                        Parking Access Status
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)] font-medium">
                        Disable customer QR access immediately for this parking
                        owner.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        onFormChange("isActive", !formData.isActive)
                      }
                      className={`w-12 h-6.5 rounded-full transition-colors relative duration-300 outline-none border border-transparent ${
                        formData.isActive
                          ? "bg-emerald-500"
                          : "bg-neutral-300 dark:bg-neutral-700"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                          formData.isActive ? "left-6" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </FormSection>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[var(--color-bg)] border-t border-[var(--color-border)]/50 p-5 flex gap-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-5 py-3 rounded-xl border border-[var(--color-border)]/80 text-[var(--color-text-secondary)] font-semibold text-sm hover:bg-[var(--color-surface-soft)] transition-colors active:scale-95 duration-200 disabled:opacity-50"
              >
                Discard
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-[1.4] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover,var(--color-primary))] text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-primary)]/15 active:scale-[0.98] transition-all duration-200 border border-white/5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {editingParkingOwner ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Building2 size={16} strokeWidth={2.5} />
                    {editingParkingOwner ? "Save Changes" : "Create Owner Account"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
