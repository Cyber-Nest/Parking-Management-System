"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { customerService, DurationOption } from "@/services/customer.service";
import type { CustomerBookingDetails } from "@/services/customer.service";
import { useParkingBooking } from "@/contexts/CustomerParkingContext";

interface ExtendBookingPageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export default function ExtendBookingPage({ params }: ExtendBookingPageProps) {
  const router = useRouter();
  const { setExtensionDetails, parkingDetails } = useParkingBooking();
  const { bookingId } = React.use(params);

  const durations = customerService
    .getDurationOptions()
    .filter((d) => d.value !== "custom");

  const [bookingData, setBookingData] = useState<CustomerBookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDurationValue, setSelectedDurationValue] = useState("1h");
  const [remainingTime, setRemainingTime] = useState(600);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const booking = await customerService.getBookingById(bookingId);
        if (!booking) {
          toast.error("Booking not found");
          router.replace(`/?zone=ZONE-201`);
          return;
        }

        setBookingData(booking);
        setRemainingTime((booking.grace_period_minutes ?? 10) * 60);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load booking details");
        router.replace(`/?zone=ZONE-201`);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, router]);

  useEffect(() => {
    if (!bookingData) return;

    let interval: ReturnType<typeof setInterval>;
    interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.error("Grace window expired");
          router.replace(`/?zone=ZONE-201`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [bookingData, router]);

  const selectedDuration = durations.find(
    (d) => d.value === selectedDurationValue,
  ) as DurationOption;

  const formattedRemainingTime = useMemo(() => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [remainingTime]);

  const handleExtendBooking = async () => {
    if (!bookingData) return;

    setIsProcessing(true);
    setExtensionDetails({
      bookingId: bookingData.id,
      bookingReference: bookingData.bookingReference,
      parkingName: bookingData.parking_name,
      zoneName: bookingData.zone_name,
      durationLabel: selectedDuration.label,
      durationMinutes: selectedDuration.minutes,
      amount: selectedDuration.price,
    });
    router.push("/payment?mode=extension");
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
        <p className="text-lg">Loading booking details...</p>
      </div>
    );
  }

  if (!bookingData) {
    return null;
  }

  return (
    <div className="h-screen bg-[#0D0D0D] text-white font-sans overflow-x-hidden overflow-y-auto scrollbar-hide">
      <div className="max-w-xl lg:max-w-5xl mx-auto min-h-screen flex flex-col p-6 pt-10">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/?zone=ZONE-201`}
            className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/5 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <h2 className="text-xl font-medium tracking-tight" style={{ fontFamily: "serif" }}>
            Extend Parking
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-6">
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
                    Extend your parking before the grace period ends.
                  </p>
                  <div className="mt-4 flex items-center justify-between bg-black/30 border border-white/5 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[#4B5563] font-black mb-1">
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

            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#4B5563] font-black mb-1">
                  Current Booking
                </p>
                <h3 className="text-lg font-bold">{bookingData.parking_name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[#4B5563] font-black mb-1">
                    Zone
                  </p>
                  <p className="text-sm font-mono font-bold text-white">{bookingData.zone_name ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[#4B5563] font-black mb-1">
                    Current Plan
                  </p>
                  <p className="text-sm font-bold text-white">{bookingData.duration_label ?? "Standard"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#4B5563] font-bold ml-1">
                Extend Duration
              </p>
              <div className="grid grid-cols-4 gap-2">
                {durations
                  .filter((d) => d.type === "short")
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
                      <span className={`text-sm font-mono font-bold ${selectedDurationValue === d.value ? "text-black" : "text-white"}`}>
                        ${d.price.toFixed(2)}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-end lg:justify-start lg:pt-5 pb-8">
            <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/5 mb-6 flex justify-between items-center lg:flex-col lg:items-start lg:gap-4 shadow-xl">
              <div>
                <p className="text-[#4B5563] text-[9px] uppercase tracking-widest font-black">
                  Extension Summary
                </p>
                <p className="text-lg font-bold mt-0.5">
                  Extend for {selectedDuration.label}
                </p>
                <p className="text-sm text-[#9CA3AF] mt-1">
                  Add extra time to your current booking and continue parking without interruption.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-[#4B5563] font-black mb-1">
                  Price
                </p>
                <p className="text-xl font-bold text-white">
                  ${selectedDuration.price.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExtendBooking}
              disabled={isProcessing}
              className="w-full rounded-2xl bg-[#C6F432] py-4 text-lg font-bold text-black transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Opening checkout..." : "Extend Parking"}
            </button>

            <div className="mt-6 rounded-2xl border border-white/5 bg-[#111111] p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F172A] text-[#C6F432]">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#4B5563] font-black">Secure Extension</p>
                  <p className="text-sm text-[#9CA3AF]">Your booking id is {bookingData.bookingReference}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[#9CA3AF]">
                This page is a secure extension flow for booking ID <strong>{bookingData.id}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
