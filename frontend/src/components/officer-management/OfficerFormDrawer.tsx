"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus } from "lucide-react";
import { Officer } from "@/services/officer.service";

interface OfficerFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface OfficerFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OfficerFormData) => void;
  editingOfficer: Officer | null;
  formData: OfficerFormData;
  onFormChange: (field: keyof OfficerFormData, value: string) => void;
}

export const OfficerFormDrawer = ({
  isOpen,
  onClose,
  onSubmit,
  editingOfficer,
  formData,
  onFormChange,
}: OfficerFormDrawerProps) => {
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[430px] bg-[var(--color-surface)] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-[var(--color-border)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-soft)]">
            <div>
              <h2 className="text-xl font-black">
                {editingOfficer ? "Edit Officer" : "Add Officer"}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {editingOfficer
                  ? "Update officer details and permissions."
                  : "Register a new enforcement officer"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-[var(--color-border)]"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                className="input"
                value={formData.name}
                onChange={(e) => onFormChange("name", e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
                Email / Login
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                className={`input ${
                  editingOfficer ? "bg-gray-100 cursor-not-allowed opacity-70" : ""
                }`}
                disabled={!!editingOfficer}
                value={formData.email}
                onChange={(e) => onFormChange("email", e.target.value)}
              />
              {editingOfficer && (
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Login email cannot be changed.
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
                Phone Number
              </label>
              <div className="flex gap-2">
                <div className="w-20 px-3 py-2 border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-bg)] flex items-center text-sm font-medium">
                  +91
                </div>
                <input
                  type="text"
                  placeholder="Phone number"
                  className="input"
                  value={formData.phone}
                  onChange={(e) => onFormChange("phone", e.target.value)}
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
                Role
              </label>
              <select
                className="input"
                value={formData.role}
                onChange={(e) => onFormChange("role", e.target.value)}
              >
                <option value="">Select role</option>
                <option value="Officer">Officer</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>

            {/* Access Status (only for edit) */}
            {editingOfficer && (
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Access Status
                </label>
                <select
                  className="input"
                  value={editingOfficer.accessStatus}
                  onChange={(e) => {
                    // This will be handled by parent
                    // onFormChange("accessStatus", e.target.value);
                  }}
                >
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            )}

            {/* Password Invite (only for add) */}
            {!editingOfficer && (
              <div className="pt-5 border-t border-[var(--color-border)]">
                <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)] mb-3 block">
                  Password Setup
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="pass"
                    className="mt-1 accent-[var(--color-primary)]"
                    defaultChecked
                  />
                  <span className="text-sm">
                    <span className="block font-bold">Send invite link to email</span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Officer will create password using email invite.
                    </span>
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[var(--color-border)] flex gap-3 bg-[var(--color-surface-soft)]">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 font-bold text-sm border border-[var(--color-border)] rounded-[var(--radius-md)] hover:bg-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(formData)}
              className="flex-1 btn-primary flex items-center justify-center gap-2 px-6"
            >
              <UserPlus size={18} />
              {editingOfficer ? "Update Officer" : "Create Officer"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};