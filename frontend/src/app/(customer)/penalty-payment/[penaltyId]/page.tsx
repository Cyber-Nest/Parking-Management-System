"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeAlert,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  ShieldAlert,
  Car,
  Image,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { customerService, PenaltyDetails } from "@/services/customer.service";

export default function PenaltyPage() {
  const params = useParams();
  const router = useRouter();
  const penaltyId = params.penaltyId as string;

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [penalty, setPenalty] = useState<PenaltyDetails | null>(null);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // fetch penalty by id
  useEffect(() => {
    fetchPenalty();
  }, [penaltyId]);

  const fetchPenalty = async () => {
    try {
      setLoading(true);
      const response = await customerService.getPenaltyById(penaltyId);

      if (!response) {
        toast.error("Penalty record not found", {
          style: {
            background: "#0B0B0B",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fff",
            borderRadius: "18px",
          },
        });
        router.replace("/");
        return;
      }

      setPenalty(response);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load penalty details", {
        style: {
          background: "#0B0B0B",
          border: "1px solid rgba(239,68,68,0.2)",
          color: "#fff",
          borderRadius: "18px",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // handle pay penalty api call function
  const handlePayPenalty = async () => {
    try {
      setPaying(true);
      const success = await customerService.payPenalty(penaltyId);

      if (!success) {
        toast.error("Failed to process penalty payment", {
          style: {
            background: "#0B0B0B",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fff",
            borderRadius: "18px",
          },
        });
        return;
      }

      toast.success("Penalty payment successful", {
        style: {
          background: "#0B0B0B",
          border: "1px solid rgba(190,242,100,0.2)",
          color: "#fff",
          borderRadius: "18px",
        },
      });

      setPenalty((prev) => (prev ? { ...prev, status: "paid" } : prev));
    } catch (error) {
      console.error(error);
      toast.error("Penalty payment failed");
    } finally {
      setPaying(false);
    }
  };

  // loading skeleton UI
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white p-6 no-scrollbar">
        <div className="max-w-xl lg:max-w-6xl mx-auto space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8 animate-pulse pt-4">
          <div className="space-y-5">
            <div className="h-8 w-44 bg-white/5 rounded-xl" />
            <div className="h-[220px] rounded-[24px] bg-white/5" />
          </div>
          <div className="space-y-5 lg:pt-12">
            <div className="h-[320px] rounded-[24px] bg-white/5" />
            <div className="h-14 rounded-full bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!penalty) return null;

  return (
    <div className="h-screen bg-[#0D0D0D] text-white font-sans overflow-x-hidden overflow-y-auto scrollbar-hide">
      <div className="max-w-xl md:max-w-4xl lg:max-w-6xl mx-auto p-6 pt-10 pb-12 transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* LEFT COLUMN: Header & Hero Alert Card (Takes 5 cols on large screen) */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div>
                <h1
                  className="text-xl md:text-2xl font-medium tracking-tight"
                  style={{ fontFamily: "serif" }}
                >
                  Parking Violation
                </h1>
                <p className="text-[11px] text-[#4B5563] font-medium uppercase tracking-wide mt-0.5">
                  Official Enforcement Notice
                </p>
              </div>
            </div>

            {/* Hero  Card */}
            <div className="relative overflow-hidden rounded-[24px] border border-red-500/10 bg-[#121212] p-5 shadow-xl h-full flex flex-col justify-between">
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-red-500/[0.03] blur-2xl" />

              <div className="relative flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/10 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="text-red-400" size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold tracking-tight">
                        Penalty Notice
                      </h2>
                      <p className="text-[11px] text-[#4B5563] font-medium font-mono mt-0.5">
                        #{penalty.penaltyId?.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                      penalty.status === "paid"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : penalty.status === "disputed"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}
                  >
                    {penalty.status}
                  </span>
                </div>

                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Your vehicle remained parked after the booking expiration
                  timeline and grace window completion parameters were exceeded.
                </p>

                {/* Price Badge */}
                <div className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between mt-2">
                  <p className="text-[9px] uppercase tracking-widest text-[#4B5563] font-black">
                    Total Fine Assessed
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-[#C6F432] font-mono tracking-tighter">
                    ${Number(penalty.generatedPenalty || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Infraction Details & Action Buttons */}
          <div className="lg:col-span-7 lg:mt-[52px] flex flex-col space-y-6">
            {/* Violation section */}
            <div className="bg-[#1A1A1A] rounded-[24px] border border-white/5 p-5 shadow-2xl">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
                <div className="w-9 h-9 rounded-xl bg-[#C6F432]/10 flex items-center justify-center">
                  <BadgeAlert className="text-[#C6F432]" size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Infraction Details
                  </h3>
                  <p className="text-[11px] text-[#4B5563] mt-0.5">
                    System log timestamps and parameters.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Parking Location & Vehicle */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/40 border border-white/5 p-3.5">
                    <div className="flex items-center gap-1.5 mb-1.5 text-[9px] text-[#4B5563] uppercase tracking-wider font-bold">
                      <MapPin size={12} className="text-[#C6F432]" /> Site
                      Location
                    </div>
                    <p className="text-sm font-bold truncate text-white">
                      {penalty.parkingName}
                    </p>
                    {penalty.hasMultipleZones && penalty.zoneName && (
                      <p className="text-[10px] text-[#4B5563] font-medium mt-0.5">
                        Zone: {penalty.zoneName}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-black/40 border border-white/5 p-3.5">
                    <div className="flex items-center gap-1.5 mb-1.5 text-[9px] text-[#4B5563] uppercase tracking-wider font-bold">
                      <Car size={12} className="text-[#C6F432]" /> Vehicle
                      Target
                    </div>
                    <p className="text-sm font-bold truncate text-white">
                      {penalty.vehicleDetails?.vehicleModel || "Unknown"}
                    </p>
                    <p className="text-[10px] text-[#4B5563] font-mono font-medium mt-0.5">
                      {penalty.vehicleDetails?.plateNumber} •{" "}
                      {penalty.vehicleDetails?.carColor}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="w-full rounded-xl border border-white/5 bg-black/40 p-4 text-left transition-all duration-300 hover:border-[#C6F432]/20 hover:bg-black/60 active:scale-[0.99] group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#C6F432]/10 flex items-center justify-center group-hover:bg-[#C6F432]/20 transition-colors">
                        <Image size={16} className="text-[#C6F432]" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#4B5563] font-bold">
                          Citation Evidence
                        </p>
                        <p className="text-sm font-bold text-white mt-0.5 group-hover:text-[#C6F432] transition-colors">
                          View Violation Proof Image
                        </p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Timestamps */}

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/40 border border-white/5 p-3.5">
                    <div className="flex items-center gap-1.5 mb-1.5 text-[9px] text-[#4B5563] uppercase tracking-wider font-bold">
                      <Clock3 size={12} className="text-[#4B5563]" /> Session
                      Start
                    </div>
                    <p className="text-xs font-bold text-white leading-normal">
                      {penalty.bookingStartTime}
                    </p>
                  </div>

                  <div className="rounded-xl bg-black/40 border border-white/5 p-3.5">
                    <div className="flex items-center gap-1.5 mb-1.5 text-[9px] text-[#4B5563] uppercase tracking-wider font-bold">
                      <Clock3 size={12} className="text-[#4B5563]" /> Expired At
                    </div>
                    <p className="text-xs font-bold text-white leading-normal">
                      {penalty.allowedEndTime}
                    </p>
                  </div>
                </div>

                {/* Overtime Metrics */}
                <div className="rounded-xl border border-red-500/10 bg-red-500/[0.02] p-3.5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-[10px] uppercase tracking-wider text-red-400/80 font-black">
                      Measured Overtime
                    </span>
                  </div>
                  <p className="text-xs font-bold font-mono text-red-300">
                    {penalty.overtimeDuration}
                  </p>
                </div>

                {/* Reason Text */}
                <div className="rounded-xl bg-black/40 border border-white/5 p-3.5 space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-[#4B5563] font-bold block">
                    Violation Ground Reason
                  </span>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    {penalty.violationReason}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Controls btn */}
            <div className="space-y-3">
              {/* Pay Penalty Button */}
              <button
                disabled={penalty.status === "paid" || paying}
                onClick={handlePayPenalty}
                className={`w-full py-4 rounded-full font-black text-base transition-all flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(198,244,50,0.1)] active:scale-[0.97] ${
                  penalty.status === "paid"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed shadow-none"
                    : "bg-[#C6F432] border border-[#C6F432] text-black hover:bg-[#d4ff45]"
                }`}
              >
                {penalty.status === "paid" ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    Penalty Violation Settled
                  </>
                ) : paying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Processing Settle...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} strokeWidth={2.5} />
                    Pay Penalty Notice • $
                    {Number(penalty.generatedPenalty || 0).toFixed(2)}
                  </>
                )}
              </button>

              {/* Disputed Button */}
              {penalty.status !== "paid" && (
                <button
                  disabled={penalty.status === "disputed"}
                  onClick={() =>
                    router.push(`/penalty-dispute/${penalty.penaltyId}`)
                  }
                  className={`w-full py-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 border active:scale-[0.97] ${
                    penalty.status === "disputed"
                      ? "bg-amber-500/5 border-amber-500/10 text-amber-400 cursor-not-allowed"
                      : "bg-transparent border-white/10 text-red-400/80 hover:text-red-400 hover:border-white/20 hover:bg-white/[0.01]"
                  }`}
                >
                  <ShieldAlert
                    size={18}
                    className={
                      penalty.status === "disputed"
                        ? "text-amber-400"
                        : "text-[#4B5563]"
                    }
                  />
                  {penalty.status === "disputed"
                    ? "Dispute Under Admin Review"
                    : "I'm Not Guilty • File Dispute"}
                </button>
              )}

              <p className="text-center text-[9px] text-[#374151] pt-1 uppercase tracking-[0.15em] font-medium">
                {penalty.status === "paid"
                  ? "Transaction processed and cleared from logs"
                  : "Unresolved notices can result in immediate vehicle towing"}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/*EVIDENCE   POPUP */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg bg-[#121212] border border-white/5 rounded-[28px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#1A1A1A]/50">
              <div className="flex items-center gap-2">
                <Image size={16} className="text-[#C6F432]" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Enforcement Photo Proof
                </span>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="relative w-full aspect-[4/3] bg-black flex items-center justify-center">
              <img
                src={
                  penalty.evidenceImage ||
                  "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80"
                }
                alt="Enforcement citation evidence plate"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md border border-white/5 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#4B5563] font-bold">
                    Captured Target
                  </p>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">
                    {penalty.vehicleDetails?.plateNumber || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-wider text-[#4B5563] font-bold">
                    Citation ID
                  </p>
                  <p className="text-xs font-mono font-bold text-[#C6F432] mt-0.5">
                    #{penalty.penaltyId?.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
