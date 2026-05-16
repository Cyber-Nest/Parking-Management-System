"use client";

import React, { useEffect, useMemo, useState } from "react";

import { ArrowLeft, Clock, ShieldCheck, AlertTriangle } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { customerService, DurationOption } from "@/services/customer.service";

export default function ExtendBookingPage() {
  const router = useRouter();

  const durations = customerService
    .getDurationOptions()
    .filter((d) => d.value !== "custom");

  const [bookingData] = useState({
    bookingId: "BOOK-1022",
    parkingName: "Central Parking Tower",
    zoneName: "Zone A",
    currentPlan: "30 Minutes",
    hourlyRate: 4.5,
    isGraceWindowActive: true,
    graceRemainingSeconds: 600,
  });

  const [selectedDurationValue, setSelectedDurationValue] = useState("1h");

  const [remainingTime, setRemainingTime] = useState(
    bookingData.graceRemainingSeconds,
  );

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!bookingData.isGraceWindowActive) {
      toast.error("Extension window expired");

      router.replace("/");

      return;
    }
  }, [bookingData, router]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          toast.error("Grace window expired");

          router.replace("/");

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);
  const formattedRemainingTime = useMemo(() => {
    const minutes = Math.floor(remainingTime / 60);

    const seconds = remainingTime % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }, [remainingTime]);

  const selectedDuration = durations.find(
    (d) => d.value === selectedDurationValue,
  ) as DurationOption;

  const handleExtendBooking = async () => {
    try {
      setIsProcessing(true);

      const success = await customerService.processDummyPayment();

      if (!success) {
        toast.error("Failed to extend parking", {
          style: {
            background: "#0B0B0B",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fff",
            borderRadius: "18px",
            padding: "14px 16px",
          },
        });

        return;
      }

      toast.success("Parking extended successfully", {
        style: {
          background: "#0B0B0B",
          border: "1px solid rgba(190,242,100,0.2)",
          color: "#fff",
          borderRadius: "18px",
          padding: "14px 16px",
        },
      });

      setTimeout(() => {
        router.replace("/");
      }, 2000);
    } catch (error) {
      console.error(error);

      toast.error("Extension failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-[#0D0D0D] text-white font-sans overflow-x-hidden overflow-y-auto scrollbar-hide">
      <div className="max-w-xl lg:max-w-5xl mx-auto min-h-screen flex flex-col p-6 pt-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {/* <Link
            href="/"
            className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/5 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link> */}

          <h2
            className="text-xl font-medium tracking-tight"
            style={{ fontFamily: "serif" }}
          >
            Extend Parking
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left */}
          <div className="space-y-6">
            {/* Grace Window */}
            <div className="bg-[#1A1A1A] border border-[#C6F432]/10 rounded-2xl p-5 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#C6F432]/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="text-[#C6F432]" size={22} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-bold">Grace Window Active</p>

                    <span className="px-2 py-1 rounded-full bg-[#C6F432]/10 text-[#C6F432] text-[9px] uppercase tracking-widest font-black">
                      Live
                    </span>
                  </div>

                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    Your booking has expired. Extend your parking before the
                    grace period ends.
                  </p>

                  <div className="mt-4 flex items-center justify-between bg-black/30 border border-white/5 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[#4B5563] font-black">
                        Remaining Time
                      </p>

                      <p className="text-[#C6F432] text-2xl font-black font-mono mt-1">
                        {formattedRemainingTime}
                      </p>
                    </div>

                    <AlertTriangle className="text-[red]" size={22} />
                  </div>
                </div>
              </div>
            </div>

            {/* Current Booking */}
            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#4B5563] font-black mb-1">
                  Current Booking
                </p>

                <h3 className="text-lg font-bold">{bookingData.parkingName}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[#4B5563] font-black mb-1">
                    Zone
                  </p>

                  <p className="text-sm font-mono font-bold text-white">
                    {bookingData.zoneName}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[#4B5563] font-black mb-1">
                    Current Plan
                  </p>

                  <p className="text-sm font-bold text-white">
                    {bookingData.currentPlan}
                  </p>
                </div>
              </div>
            </div>

            {/* Duration Cards */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#4B5563] font-bold ml-1">
                Extend Duration
              </p>

              {/* Hourly */}
              <div className="grid grid-cols-4 gap-2">
                {durations
                  .filter((d) => ["30m", "1h", "3h", "5h"].includes(d.value))
                  .map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setSelectedDurationValue(d.value)}
                      className={`flex flex-col items-center justify-center py-3.5 rounded-xl border transition-all duration-200 active:scale-[0.97] ${
                        selectedDurationValue === d.value
                          ? "bg-[#C6F432] border-[#C6F432] text-black shadow-[0_4px_15px_rgba(198,244,50,0.12)]"
                          : "bg-[#1A1A1A] border-white/5 text-[#9CA3AF]"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-tight mb-0.5">
                        {d.label}
                      </span>

                      <span
                        className={`text-sm font-mono font-bold ${
                          selectedDurationValue === d.value
                            ? "text-black"
                            : "text-white"
                        }`}
                      >
                        ${d.price.toFixed(2)}
                      </span>
                    </button>
                  ))}
              </div>

              {/* Plans */}
              <div className="grid grid-cols-3 gap-2">
                {durations
                  .filter((d) =>
                    ["half-day", "full-day", "weekly"].includes(d.value),
                  )
                  .map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setSelectedDurationValue(d.value)}
                      className={`flex flex-col items-center justify-center py-3.5 rounded-xl border transition-all duration-200 active:scale-[0.97] ${
                        selectedDurationValue === d.value
                          ? "bg-[#C6F432] border-[#C6F432] text-black shadow-[0_4px_15px_rgba(198,244,50,0.12)]"
                          : "bg-[#1A1A1A] border-white/5 text-[#9CA3AF]"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-tight mb-0.5 text-center px-1">
                        {d.label}
                      </span>

                      <span
                        className={`text-sm font-mono font-bold ${
                          selectedDurationValue === d.value
                            ? "text-black"
                            : "text-white"
                        }`}
                      >
                        ${d.price.toFixed(2)}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col justify-end lg:justify-start lg:pt-5 pb-8">
            {/* Summary */}
            <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/5 mb-6 flex justify-between items-center lg:flex-col lg:items-start lg:gap-4 shadow-xl">
              <div>
                <p className="text-[#4B5563] text-[9px] uppercase tracking-widest font-black">
                  Extension Summary
                </p>

                <p className="text-lg font-bold mt-0.5">
                  Extend for {selectedDuration.label}
                </p>
              </div>

              <p className="text-[#C6F432] text-3xl font-black font-mono tracking-tighter lg:text-5xl mt-2">
                ${selectedDuration.price.toFixed(2)}
              </p>
            </div>

            {/* Action */}
            <button
              disabled={isProcessing}
              onClick={handleExtendBooking}
              className={`w-full py-4 rounded-full font-black text-base transition-all flex items-center justify-center gap-3 ${
                isProcessing
                  ? "bg-[#1A1A1A] text-[#4B5563]"
                  : "bg-[#C6F432] text-black shadow-[0_8px_30px_rgba(198,244,50,0.2)] hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#C6F432] border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                "Pay & Extend Parking"
              )}
            </button>
            <p className="text-center lg:text-left text-[8px] text-[#4B5563] mt-4 uppercase tracking-[0.2em]">
              Secure Payment Powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
