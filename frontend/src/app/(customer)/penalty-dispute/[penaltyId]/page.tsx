"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldAlert,
  Upload,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { customerService, PenaltyDetails } from "@/services/customer.service";

export default function PenaltyDisputePage() {
  const params = useParams();
  const router = useRouter();
  const penaltyId = params.penaltyId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [penalty, setPenalty] = useState<PenaltyDetails | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    explanation: "",
    proofImage: null as string | null,
  });

  // fetch penalty
  useEffect(() => {
    fetchPenalty();
  }, []);

  const fetchPenalty = async () => {
    try {
      setLoading(true);
      const response = await customerService.getPenaltyById(penaltyId);

      if (!response) {
        toast.error("Penalty record not found");
        router.replace("/");
        return;
      }

      setPenalty(response);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load penalty details");
    } finally {
      setLoading(false);
    }
  };

  // handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setProofPreview(preview);

    setFormData((prev) => ({
      ...prev,
      proofImage: preview,
    }));
  };

  // handle remove image
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (proofPreview) {
      URL.revokeObjectURL(proofPreview);
    }

    setProofPreview(null);
    setFormData((prev) => ({
      ...prev,
      proofImage: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // handle form submission
  const handleSubmit = async () => {
    try {
      if (
        !formData.fullName ||
        !formData.email ||
        !formData.phone ||
        !formData.explanation
      ) {
        toast.error("Please complete all required fields", {
          style: {
            background: "#0B0B0B",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fff",
            borderRadius: "18px",
          },
        });
        return;
      }

      setSubmitting(true);
      const success = await customerService.submitPenaltyDispute(
        penaltyId,
        formData,
      );

      if (!success) {
        toast.error("Failed to submit dispute");
        return;
      }

      setSubmitted(true);
      toast.success("Dispute submitted successfully", {
        style: {
          background: "#0B0B0B",
          border: "1px solid rgba(190,242,100,0.2)",
          color: "#fff",
          borderRadius: "18px",
        },
      });

      setTimeout(() => {
        router.replace("/");
      }, 10000);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] p-6 no-scrollbar">
        <div className="max-w-xl lg:max-w-6xl mx-auto space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8 animate-pulse pt-4">
          <div className="space-y-5">
            <div className="h-9 w-9 rounded-full bg-white/5" />
            <div className="h-10 w-48 bg-white/5 rounded-xl" />
            <div className="h-[140px] rounded-[24px] bg-white/5" />
            <div className="h-[140px] rounded-[24px] bg-white/5 invisible lg:visible" />
          </div>
          <div className="lg:pt-14">
            <div className="h-[450px] rounded-[24px] bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!penalty) return null;

  // success message UI
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-6 no-scrollbar">
        <div className="w-full max-w-sm rounded-[32px] border border-white/5 bg-[#121212] p-8 text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#C6F432]/5 blur-3xl rounded-full" />

          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#C6F432]/10 border border-[#C6F432]/5 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-[#C6F432]" />
            </div>

            <h1
              className="text-2xl font-medium tracking-tight text-red-400/80 mt-6"
              style={{ fontFamily: "serif" }}
            >
              Dispute Submitted
            </h1>

            <p className="text-xs text-[#9CA3AF] leading-relaxed mt-3 px-2">
              Your claim request is safe with us. Our administrative team will
              review the case details and contact you shortly.
            </p>

            <div className="mt-6 rounded-2xl border border-white/5 bg-black/40 p-4 text-left">
              <p className="text-[9px] uppercase tracking-[0.15em] text-[#4B5563] font-black">
                Reference ID
              </p>
              <p className="text-base font-bold font-mono text-[#C6F432] mt-1 break-all">
                {penalty.penaltyId}
              </p>
            </div>

            <p className="text-[10px] text-[#4B5563] uppercase tracking-wider mt-8 animate-pulse font-medium">
              Redirecting to platform...
            </p>
          </div>
        </div>
      </div>
    );
  }

  //evidence uploader component
  const EvidenceUploader = () => (
    <div className="space-y-1.5 w-full">
      <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
        Supporting Evidence (Optional)
      </label>
      <label className="w-full min-h-[140px] rounded-xl border border-dashed border-white/10 bg-[#111111] flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#C6F432]/40 transition-all overflow-hidden relative p-4 group">
        {proofPreview ? (
          <>
            <img
              src={proofPreview}
              alt="Proof Preview"
              className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-300"
            />

            <button
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 w-7 Fly-btn h-7 rounded-full bg-black/70 hover:bg-black/90 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all z-10 shadow-lg"
              title="Remove image"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-xl bg-[#C6F432]/10 flex items-center justify-center mb-2 border border-[#C6F432]/5">
              <Upload size={16} className="text-[#C6F432]" />
            </div>
            <p className="text-xs font-bold text-white">
              Upload Documents / Images
            </p>
            <p className="text-[10px] text-[#4B5563] mt-1 max-w-[240px] leading-normal font-medium">
              Attach parking dashboard active screenshot, receipts, or session
              proofs.
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </label>
    </div>
  );

  return (
    <div className="h-screen bg-[#0D0D0D] text-white overflow-y-auto scrollbar-hide">
      <div className="max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto p-6 pt-10 pb-12 transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* LEFT COLUMN: Header, Summary Card & Evidence Upload */}
          <div className="lg:col-span-5 flex flex-col space-y-6 lg:sticky lg:top-10">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link
                href={`/penalty-payment/${penalty.penaltyId}`}
                className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
              >
                <ArrowLeft size={16} />
              </Link>

              <div>
                <h1
                  className="text-xl md:text-2xl font-medium tracking-tight"
                  style={{ fontFamily: "serif" }}
                >
                  Penalty Dispute
                </h1>
                <p className="text-[11px] text-[#4B5563] font-medium uppercase tracking-wide mt-0.5">
                  Case Verification Desk
                </p>
              </div>
            </div>

            {/* Penalty Summary Card */}
            <div className="rounded-[24px] border border-white/5 bg-[#121212] p-5 relative overflow-hidden shadow-lg">
              <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[#C6F432]/5 blur-2xl" />

              <div className="relative flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#C6F432]/10 flex items-center justify-center border border-[#C6F432]/5">
                    <ShieldAlert className="text-[#C6F432]" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-white">
                      {penalty.parkingName}
                    </h2>
                    {penalty.hasMultipleZones && penalty.zoneName && (
                      <p className="text-xs text-[#4B5563] font-medium mt-0.5">
                        Zone Area:{" "}
                        <span className="text-white/70">
                          {penalty.zoneName}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <p className="text-[9px] uppercase tracking-wider text-[#4B5563] font-bold">
                      Plate Number
                    </p>
                    <p className="text-sm font-bold font-mono text-white mt-0.5">
                      {penalty.vehicleDetails?.plateNumber || "N/A"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <p className="text-[9px] uppercase tracking-wider text-[#4B5563] font-bold">
                      Total Fine
                    </p>
                    <p className="text-sm font-black font-mono text-[#C6F432] mt-0.5">
                      ${Number(penalty.generatedPenalty || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block w-full">
              <EvidenceUploader />
            </div>
          </div>

          {/* RIGHT COLUMN  Form Desk */}
          <div className="lg:col-span-7 lg:pt-[52px]">
            {/* Dispute Form */}
            <div className="rounded-[24px] border border-white/5 bg-[#1A1A1A] p-5 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-[#C6F432]/10 flex items-center justify-center">
                  <FileText size={18} className="text-[#C6F432]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Statement of Case
                  </h3>
                  <p className="text-[11px] text-[#4B5563] mt-0.5">
                    Please fill out all required details accurately.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#374151]"
                    />
                    <input
                      type="text"
                      placeholder="e.g. John Anderson"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="w-full bg-[#111111] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-[#374151]"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#374151]"
                    />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full bg-[#111111] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-[#374151]"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
                    Contact Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={15}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#374151]"
                    />
                    <input
                      type="tel"
                      placeholder="+1 (647) 000-0000"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full bg-[#111111] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-[#374151]"
                    />
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
                    Explanation Statement
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Briefly state why you believe this fine was generated due to an error..."
                    value={formData.explanation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        explanation: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl bg-[#111111] border border-white/5 p-4 text-sm outline-none resize-none focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-[#374151] leading-relaxed"
                  />
                </div>

                <div className="block lg:hidden">
                  <EvidenceUploader />
                </div>

                {/* CTA Submit Button */}
                <div className="pt-2">
                  <button
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="w-full bg-[#C6F432] text-black font-black py-4 rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.97] text-base shadow-[0_8px_20px_rgba(198,244,50,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? "Processing Verification..."
                      : "File Official Dispute"}
                  </button>
                  <p className="text-center text-[9px] text-[#374151] mt-3 uppercase tracking-[0.15em] font-medium">
                    Case evaluation is subject to audit review parameters
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
