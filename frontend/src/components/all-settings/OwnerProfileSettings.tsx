"use client";

import React, { useState, useRef } from "react";
import {
  Save,
  Upload,
  User,
  Shield,
  X,
  RotateCcw,
  CheckCircle2,
  Circle,
} from "lucide-react";
import toast from "react-hot-toast";

export const OwnerProfileSettings = () => {
  const [saving, setSaving] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  // Image input ki value clean karne ke liye ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    ownerName: "John Doe",
    role: "Parking Owner",
    status: "online",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const preview = URL.createObjectURL(file);
    setProfilePreview(preview);

    toast.success("Profile photo uploaded");
  };

  // Fix: Image remove hone par input data aur state dono clear honge
  const handleRemovePhoto = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Taaki cancel button dabane par wapas upload window na khule

    setProfilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Input fields se file reset ki
    }
    toast.success("Photo removed");
  };

  const handleReset = () => {
    setFormData({
      ownerName: "John Doe",
      role: "Parking Owner",
      status: "online",
    });

    setProfilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset par bhi file input clear kiya
    }

    toast.success("Profile reset");
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // API Call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Owner profile updated");
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT CARD */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[var(--color-surface)] p-8 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)] relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-primary)]">
                Owner Profile
              </h3>

              {/* <button
                onClick={handleReset}
                className="p-2 hover:rotate-180 transition-all duration-500 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] relative z-10"
              >
                <RotateCcw size={16} />
              </button> */}
            </div>

            <div className="relative aspect-square w-full max-w-[240px] mx-auto bg-[var(--color-bg)] rounded-[2.5rem] border-2 border-dashed border-[var(--color-border)] flex items-center justify-center overflow-hidden group">
              {profilePreview ? (
                <>
                  <img
                    src={profilePreview}
                    alt="Owner"
                    className="w-full h-full object-cover animate-in fade-in duration-300"
                  />

                  {/* Cancel Button ke upar relative z-10 aur stopPropagation kaam karega */}
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white text-red-500 shadow-lg hover:bg-red-50 active:scale-95 transition-all z-10"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center text-[var(--color-text-muted)] pointer-events-none">
                  <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4">
                    <Upload size={28} />
                  </div>

                  <span className="text-sm font-bold">Upload Owner Photo</span>

                  <p className="text-[10px] mt-1 opacity-70">
                    JPG / PNG (Max 2MB)
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef} // Ref attached here
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleUpload}
              />
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="lg:col-span-8">
          <div className="bg-[var(--color-surface)] p-8 md:p-10 rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Owner Name */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                  Owner Name
                </label>

                <div className="relative mt-2">
                  <User
                    size={18}
                    className="absolute left-4 top-4 text-[var(--color-text-muted)]"
                  />

                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => handleChange("ownerName", e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl outline-none"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                  Role
                </label>

                <div className="relative mt-2">
                  <Shield
                    size={18}
                    className="absolute left-4 top-4 text-[var(--color-text-muted)]"
                  />

                  <input
                    type="text"
                    disabled
                    value={formData.role}
                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-2xl opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mt-10">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                Owner Status
              </label>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <button
                  type="button"
                  onClick={() => handleChange("status", "online")}
                  className={`p-4 rounded-2xl border transition-all ${
                    formData.status === "online"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-[var(--color-border)] hover:bg-[var(--color-surface-soft)]"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {formData.status === "online" ? (
                      <CheckCircle2 size={18} className="text-green-500" />
                    ) : (
                      <Circle size={18} />
                    )}

                    <span className="font-semibold">Online</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange("status", "offline")}
                  className={`p-4 rounded-2xl border transition-all ${
                    formData.status === "offline"
                      ? "border-red-500 bg-red-500/10"
                      : "border-[var(--color-border)] hover:bg-[var(--color-surface-soft)]"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {formData.status === "offline" ? (
                      <CheckCircle2 size={18} className="text-red-500" />
                    ) : (
                      <Circle size={18} />
                    )}

                    <span className="font-semibold">Offline</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-10 p-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]">
              <p className="text-xs font-black uppercase tracking-widest mb-5">
                Live Preview
              </p>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-lg shadow-inner">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      className="w-full h-full object-cover"
                      alt="Avatar Preview"
                    />
                  ) : (
                    formData.ownerName.charAt(0)
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-lg text-[var(--color-text-primary)]">
                    {formData.ownerName}
                  </h4>

                  <p className="text-sm text-[var(--color-text-muted)]">
                    {formData.role}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        formData.status === "online"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />

                    <span className="text-xs font-medium capitalize">
                      {formData.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="mt-10 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-10 py-4 rounded-2xl flex items-center gap-3 transition-opacity disabled:opacity-50"
              >
                <Save size={18} />
                <span className="font-bold">
                  {saving ? "Saving..." : "Save Profile"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
