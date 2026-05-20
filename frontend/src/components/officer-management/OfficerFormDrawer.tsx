"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UserPlus,
  Camera,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Upload,
} from "lucide-react";
import { Officer } from "@/services/officer.service";
import { useState } from "react";

export interface OfficerFormData {
  countryCode: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  employeeId: string;
  employmentType: string;
  hireDate: string;
  emergencyContactName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  addressStreet: string;
  addressCity: string;
  addressProvince: string;
  addressPostalCode: string;
  profilePhoto: string | null;
}

interface OfficerFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OfficerFormData) => void | Promise<void>;
  editingOfficer: Officer | null;
  formData: OfficerFormData;
  onFormChange: (field: keyof OfficerFormData, value: string) => void;
}

// Helper component for form
const FormSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <div className="bg-[var(--color-bg)] p-5 rounded-2xl border border-[var(--color-border)] space-y-4 shadow-sm">
    <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border)]">
      <div className="p-2.5 rounded-xl bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[var(--color-primary)]">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text)]">
        {title}
      </h3>
    </div>
    <div className="space-y-4 pt-1">{children}</div>
  </div>
);

// Helper component
const FieldWrapper = ({
  label,
  children,
  helperText,
  error,
}: {
  label: string;
  children: React.ReactNode;
  helperText?: string;
  error?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-[var(--color-text-secondary)] tracking-tight pl-1">
      {label}
    </label>
    {children}
    {helperText && !error && (
      <p className="text-[11px] text-[var(--color-text-muted)] pl-1 leading-relaxed">
        {helperText}
      </p>
    )}
    {error && (
      <p className="text-[11px] text-red-500 pl-1 flex items-center gap-1">
        <AlertTriangle size={12} /> {error}
      </p>
    )}
  </div>
);

export const OfficerFormDrawer = ({
  isOpen,
  onClose,
  onSubmit,
  editingOfficer,
  formData,
  onFormChange,
}: OfficerFormDrawerProps) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    formData.profilePhoto || null,
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic validation hint
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB");
        return;
      }
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);
      onFormChange("profilePhoto", preview);
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
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[550px] bg-[var(--color-surface)] shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-50 border-l border-[var(--color-border)] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)] sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl ${editingOfficer ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    <UserPlus size={22} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tighter text-[var(--color-text)]">
                    {editingOfficer
                      ? "Update Officer Profile"
                      : "Register New Officer"}
                  </h2>
                </div>
                {/* <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-[380px]">
                  {editingOfficer
                    ? `Modifying details for ${editingOfficer.name}. Ensure information is accurate.`
                    : "Fill in the required details to create a new enforcement officer account."}
                </p> */}
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full transition-all border border-transparent hover:border-[var(--color-border)] shadow-sm group"
                aria-label="Close drawer"
              >
                <X
                  size={20}
                  className="group-hover:rotate-90 transition-transform"
                />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar bg-[var(--color-surface-soft)]/50">
              <div className="bg-[var(--color-bg)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  <div className="relative w-28 h-28 rounded-full bg-[var(--color-surface-soft)] border-4 border-[var(--color-bg)] outline outline-2 outline-dashed outline-[var(--color-border)] group-hover:outline-[var(--color-primary)] transition-all flex items-center justify-center overflow-hidden shadow-inner">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
                        <Camera size={32} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Floating Upload Button */}
                  <label
                    className="absolute bottom-1 right-1 p-2.5 bg-[var(--color-primary)] text-white rounded-full cursor-pointer shadow-lg hover:scale-105 transition-transform"
                    htmlFor="photo-upload"
                  >
                    <Upload size={16} strokeWidth={3} />
                    <input
                      id="photo-upload"
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/svg+xml"
                      onChange={handlePhotoUpload}
                    />
                  </label>

                  {photoPreview && (
                    <button
                      onClick={() => {
                        setPhotoPreview(null);
                        onFormChange("profilePhoto", "");
                      }}
                      className="absolute top-1 right-1 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-red-200"
                      title="Remove photo"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-[var(--color-text)]">
                    Profile Picture
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] max-w-xs">
                    JPG, PNG, or SVG. Clear facial shot recommended. Max size
                    2MB.
                  </p>
                </div>
              </div>

              <FormSection title="Account & Core Details" icon={UserPlus}>
                {/* Employee ID (Readonly) */}
                <FieldWrapper
                  label="Internal Employee ID"
                  helperText="System generated unique identifier. Cannot be modified."
                >
                  <div className="relative">
                    <input
                      type="text"
                      className="input bg-[var(--color-surface-soft)] cursor-not-allowed opacity-80 border-dashed font-mono text-sm"
                      value={
                        formData.employeeId ||
                        (editingOfficer ? editingOfficer.id : "OF-NEW-PENDING")
                      }
                      disabled
                      readOnly
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md bg-[var(--color-border)] text-[var(--color-text-muted)]">
                      <CheckCircle size={14} />
                    </div>
                  </div>
                </FieldWrapper>

                {/* Full Name */}
                <FieldWrapper label="Full Official Name">
                  <input
                    type="text"
                    placeholder="e.g., Jonathan R. Doe"
                    className="input focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    value={formData.name}
                    onChange={(e) => onFormChange("name", e.target.value)}
                    required
                  />
                </FieldWrapper>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <FieldWrapper
                    label="Work Email / Login"
                    helperText={
                      editingOfficer
                        ? "Login email is permanently linked."
                        : undefined
                    }
                  >
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                      />
                      <input
                        type="email"
                        placeholder="j.doe@cityenforce.gov"
                        className={`input pl-10 ${
                          editingOfficer
                            ? "bg-[var(--color-surface-soft)] cursor-not-allowed opacity-70 border-dashed"
                            : ""
                        }`}
                        disabled={!!editingOfficer}
                        value={formData.email}
                        onChange={(e) => onFormChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </FieldWrapper>

                  {/* Role */}
                  <FieldWrapper label="Administrative Role">
                    <select
                      className="input appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2371717a%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[length:16px] bg-[right_14px_center]"
                      value={formData.role}
                      onChange={(e) => onFormChange("role", e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select assigned role
                      </option>
                      <option value="Officer">Field Officer</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </FieldWrapper>
                </div>

                {/* Phone */}
                <FieldWrapper label="Primary Contact Number">
                  <div className="flex gap-2.5">
                    {/* Country Code Select */}
                    <select
                      className="w-32 px-3 py-2.5 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] text-sm font-bold text-[var(--color-text-secondary)] shadow-inner outline-none"
                      value={formData?.countryCode || "+1"}
                      onChange={(e) =>
                        onFormChange("countryCode", e.target.value)
                      }
                    >
                      <option value="+1">🇺🇸 +1 (USA)</option>
                      <option value="+1-CA">🇨🇦 +1 (Canada)</option>
                      <option value="+91">🇮🇳 +91 (India)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+61">🇦🇺 +61 (Australia)</option>
                    </select>

                    {/* Phone Input */}
                    <div className="relative flex-1">
                      <Phone
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                      />

                      <input
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="input pl-10"
                        value={formData.phone}
                        onChange={(e) => onFormChange("phone", e.target.value)}
                      />
                    </div>
                  </div>
                </FieldWrapper>
              </FormSection>

              <FormSection title="Employment Details" icon={Briefcase}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Employment Type */}
                  <FieldWrapper label="Employment Status">
                    <select
                      className="input"
                      value={formData.employmentType || ""}
                      onChange={(e) =>
                        onFormChange("employmentType", e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Select status
                      </option>
                      <option value="Full-Time">Full-Time (FT)</option>
                      <option value="Part-Time">Part-Time (PT)</option>
                      <option value="Contractor">Contractor (CN)</option>
                      <option value="Temporary">Temporary (TEMP)</option>
                    </select>
                  </FieldWrapper>

                  {/* Hire Date */}
                  <FieldWrapper label="Official Hire Date">
                    <input
                      type="date"
                      className="input"
                      value={formData.hireDate || ""}
                      onChange={(e) => onFormChange("hireDate", e.target.value)}
                    />
                  </FieldWrapper>
                </div>
              </FormSection>

              {/* Address Section */}
              <FormSection title="Residential Address" icon={MapPin}>
                <FieldWrapper label="Street Address Line">
                  <input
                    type="text"
                    placeholder="123 Enforcement Ave, Apt 4B"
                    className="input"
                    value={formData.addressStreet || ""}
                    onChange={(e) =>
                      onFormChange("addressStreet", e.target.value)
                    }
                  />
                </FieldWrapper>
                <div className="grid grid-cols-2 gap-4">
                  <FieldWrapper label="City">
                    <input
                      type="text"
                      placeholder="Metropolis"
                      className="input"
                      value={formData.addressCity || ""}
                      onChange={(e) =>
                        onFormChange("addressCity", e.target.value)
                      }
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Province / State">
                    <input
                      type="text"
                      placeholder="State/Region"
                      className="input"
                      value={formData.addressProvince || ""}
                      onChange={(e) =>
                        onFormChange("addressProvince", e.target.value)
                      }
                    />
                  </FieldWrapper>
                </div>
                <FieldWrapper label="Postal / ZIP Code">
                  <input
                    type="text"
                    placeholder="90210-1234"
                    className="input font-mono"
                    value={formData.addressPostalCode || ""}
                    onChange={(e) =>
                      onFormChange("addressPostalCode", e.target.value)
                    }
                  />
                </FieldWrapper>
              </FormSection>

              {/* Emergency Contact Section */}
              <FormSection
                title="Emergency Contact Information"
                icon={AlertTriangle}
              >
                <FieldWrapper label="Contact Full Name">
                  <input
                    type="text"
                    placeholder="Jane Doe (Primary Contact)"
                    className="input"
                    value={formData.emergencyContactName || ""}
                    onChange={(e) =>
                      onFormChange("emergencyContactName", e.target.value)
                    }
                  />
                </FieldWrapper>
                <div className="grid grid-cols-2 gap-4">
                  <FieldWrapper label="Emergency Relationship">
                    <input
                      type="text"
                      placeholder="e.g., Spouse, Sibling"
                      className="input"
                      value={formData.emergencyRelationship || ""}
                      onChange={(e) =>
                        onFormChange("emergencyRelationship", e.target.value)
                      }
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Emergency Phone">
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                      />
                      <input
                        type="tel"
                        placeholder="Contact phone"
                        className="input pl-10"
                        value={formData.emergencyPhone || ""}
                        onChange={(e) =>
                          onFormChange("emergencyPhone", e.target.value)
                        }
                      />
                    </div>
                  </FieldWrapper>
                </div>
              </FormSection>

              {/* Management Fields */}
              <div className="space-y-5 pt-4">
                {/* Access Status (only for edit) */}
                {editingOfficer && (
                  <div className="p-5 rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between gap-4 shadow-inner">
                    <div className="space-y-0.5">
                      <label className="text-sm font-bold text-[var(--color-text)]">
                        System Access Status
                      </label>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Revoke access immediately if the officer leaves.
                      </p>
                    </div>
                    <select
                      className={`w-40 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${
                        editingOfficer.accessStatus === "Enabled"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200 focus:ring-red-200"
                      }`}
                      value={editingOfficer.accessStatus}
                      onChange={(e) => {
                        // This functionality not implemented in original, preserved
                        console.log("Status change attempted:", e.target.value);
                      }}
                    >
                      <option value="Enabled">Enabled</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </div>
                )}

                {/* Password Invite  */}
                {!editingOfficer && (
                  <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-primary)]/[0.03]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-[var(--color-primary)] text-white shadow-md">
                        <Mail size={18} />
                      </div>
                      <label className="text-base font-extrabold tracking-tight text-[var(--color-text)]">
                        Account Security Setup
                      </label>
                    </div>
                    <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
                      <label className="flex items-start gap-3.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="pass"
                          className="mt-1.5 h-5 w-5 accent-[var(--color-primary)] border-[var(--color-border)] focus:ring-[var(--color-primary)]"
                          defaultChecked
                        />
                        <span className="text-sm">
                          <span className="block font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                            Send activation invite to email
                          </span>
                          <span className="block text-[13px] text-[var(--color-text-muted)] mt-1 leading-relaxed">
                            An automated email will be sent to{" "}
                            <strong className="text-[var(--color-text-secondary)] font-medium font-mono">
                              {formData.email || "[email pending]"}
                            </strong>
                            . The officer must click the link to secure their
                            account and set a password.
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--color-border)] flex gap-4 bg-[var(--color-surface)] sticky bottom-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 font-bold text-sm text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface-soft)] transition-colors shadow-sm active:scale-[0.98]"
              >
                Discard Changes
              </button>
              <button
                onClick={() => onSubmit(formData)}
                className="flex-[1.5] btn-primary flex items-center justify-center gap-2.5 px-8 py-3 shadow-lg shadow-[var(--color-primary)]/20 active:scale-[0.98]"
              >
                <UserPlus size={18} strokeWidth={3} />
                {editingOfficer
                  ? "Save Profile Changes"
                  : "Register & Send Invite"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
