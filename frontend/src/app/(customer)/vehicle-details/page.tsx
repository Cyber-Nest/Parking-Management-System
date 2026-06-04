"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Car, Mail, Palette, Hash } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  customerService,
  DurationOption,
  VehicleDetails,
} from "@/services/customer.service";

import { useParkingBooking } from "@/contexts/CustomerParkingContext";

export default function VehicleDetailsPage() {
  const router = useRouter();

  const {
    parkingDetails,
    setVehicleDetails,
    setSelectedDuration,
    setBookingSummary,
    returnUrl,
  } = useParkingBooking();

  const [durations, setDurations] = useState<DurationOption[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const [selectedDurationValue, setSelectedDurationValue] = useState("");

  const selectedDuration = durations.find(
    (d) => d.value === selectedDurationValue,
  );

  const [customHours, setCustomHours] = useState<number | "" | undefined>();

  const [customMinutes, setCustomMinutes] = useState<number | "" | undefined>();

  const [formData, setFormData] = useState<VehicleDetails>({
    email: "",
    vehicleModel: "",
    plateNumber: "",
    carColor: "",
  });

  useEffect(() => {
    if (!parkingDetails) {
      toast.error("Please select parking first", {
        style: {
          background: "#0B0B0B",
          border: "1px solid rgba(239,68,68,0.2)",
          color: "#fff",
          borderRadius: "18px",
          padding: "14px 16px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 30px rgba(239,68,68,0.12)",
        },
      });

      router.push(`${returnUrl}`);

      return;
    }
  }, [parkingDetails, router]);

  useEffect(() => {
    const loadPlans = async () => {
      if (!parkingDetails?.lotId || !parkingDetails?.zoneId) return;
      try {
        setLoadingPlans(true);
        const plans = await customerService.getParkingPlansByLot(
          String(parkingDetails.lotId),
          String(parkingDetails.zoneId),
        );
        setDurations(plans);
        setSelectedDurationValue(plans[0]?.value ?? "");
      } catch (error) {
        console.error(error);
        toast.error("No plans found for this parking zone", {
          ...toastStyle,
        });
      } finally {
        setLoadingPlans(false);
      }
    };

    void loadPlans();
  }, [parkingDetails?.lotId, parkingDetails?.zoneId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toastStyle = {
    style: {
      background: "#0B0B0B",
      border: "1px solid rgba(190,242,100,0.15)",
      color: "#fff",
      borderRadius: "18px",
      padding: "14px 16px",
      backdropFilter: "blur(12px)",
      boxShadow: "0 0 25px rgba(190,242,100,0.08)",
    },
  };

  const validateForm = () => {
    if (!formData.email || !formData.email.includes("@")) {
      toast.error("Please enter valid email", {
        ...toastStyle,
      });

      return false;
    }

    if (!formData.vehicleModel.trim()) {
      toast.error("Please enter vehicle model", {
        ...toastStyle,
      });

      return false;
    }

    if (!formData.plateNumber.trim()) {
      toast.error("Please enter plate number", {
        ...toastStyle,
      });

      return false;
    }

    if (!formData.carColor.trim()) {
      toast.error("Please enter car color", {
        ...toastStyle,
      });

      return false;
    }

    if (selectedDurationValue === "custom") {
      const totalMinutes = (customHours || 0) * 60 + (customMinutes || 0);

      if (totalMinutes <= 0) {
        toast.error("Please select custom parking duration", {
          ...toastStyle,
        });

        return false;
      }
    }
    return true;
  };

  const customPrice =
    (((customHours || 0) * 60 + (customMinutes || 0)) / 60) *
    (parkingDetails?.hourlyRate || 0);

  const displayPrice =
    selectedDurationValue === "custom"
      ? customPrice
      : selectedDuration?.price || 0;

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hrs && mins) return `${hrs} Hr ${mins} Min`;
    if (hrs) return `${hrs} Hr`;
    return `${mins} Min`;
  };
  const handleProceedToPayment = async () => {
    if (!parkingDetails) {
      toast.error("Parking details missing", {
        ...toastStyle,
      });

      return;
    }

    const isValid = validateForm();

    if (!isValid) return;

    const selectedDurationOption = selectedDuration;

    if (!selectedDurationOption) {
      toast.error("No plan selected", {
        ...toastStyle,
      });
      return;
    }

    setVehicleDetails(formData);
    setSelectedDuration(selectedDurationOption);

    const bookingSummary = await customerService.generateBookingSummaryWithTax({
      parkingDetails,
      vehicleDetails: formData,
      selectedDuration: selectedDurationOption,
    });

    setBookingSummary(bookingSummary);

    router.push("/payment");
  };

  return (
    <div className="h-screen bg-[#0D0D0D] text-white font-sans overflow-x-hidden overflow-y-auto scrollbar-hide">
      <div className="max-w-xl lg:max-w-5xl mx-auto min-h-screen flex flex-col p-6 pt-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`${returnUrl}`}
            className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/5 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>

          <h2
            className="text-xl font-medium tracking-tight"
            style={{ fontFamily: "serif" }}
          >
            Vehicle Details
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left */}
          <div className="space-y-6">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
                Receipt Email
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#374151]"
                  size={16}
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-[#374151] text-sm"
                />
              </div>
            </div>

            {/* Vehicle Model */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
                Vehicle Model
              </label>

              <div className="relative">
                <Car
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#374151]"
                  size={16}
                />

                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  placeholder="e.g. Tesla Model 3"
                  className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-[#374151] text-sm"
                />
              </div>
            </div>

            {/* Plate & Color */}
            <div className="grid grid-cols-2 gap-4">
              {/* Plate */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
                  Plate No.
                </label>

                <div className="relative">
                  <Hash
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#374151]"
                    size={16}
                  />

                  <input
                    type="text"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleChange}
                    placeholder="ONT-123"
                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-[#374151] text-sm font-mono"
                  />
                </div>
              </div>

              {/* Color */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
                  Car Color
                </label>

                <div className="relative">
                  <Palette
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#374151]"
                    size={16}
                  />

                  <input
                    type="text"
                    name="carColor"
                    value={formData.carColor}
                    onChange={handleChange}
                    placeholder="e.g. Silver"
                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-[#374151] text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
                Parking Plan
              </label>
              <select
                value={selectedDurationValue}
                onChange={(event) =>
                  setSelectedDurationValue(event.target.value)
                }
                disabled={loadingPlans || durations.length === 0}
                className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3.5 px-4 focus:border-[#C6F432]/40 focus:outline-none transition-all text-sm disabled:opacity-50"
              >
                <option value="">
                  {loadingPlans ? "Loading plans..." : "Select a plan"}
                </option>
                {durations.map((duration) => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label} - ${duration.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col justify-end lg:justify-start lg:pt-5 pb-8">
            <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/5 mb-6 flex flex-col gap-6 shadow-xl">
              <div>
                <p className="text-[#4B5563] text-[9px] uppercase tracking-widest font-black">
                  Total Due
                </p>
                <p className="text-lg font-bold mt-0.5">
                  Summary for {formatDuration(selectedDuration?.minutes || 0)}{" "}
                  Duration
                </p>
                <p className="text-[#C6F432] text-3xl font-black font-mono tracking-tighter lg:text-5xl mt-2">
                  ${displayPrice.toFixed(2)}
                </p>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full bg-[#C6F432] hover:bg-[#d4ff45] text-black font-black py-4 rounded-full flex items-center justify-center gap-3 transition-all active:scale-[0.98] text-md shadow-[0_10px_30px_rgba(198,244,50,0.3)] lg:text-lg"
              >
                Proceed to Payment
              </button>
              <p className="text-center lg:text-left text-[8px] text-[#4B5563] mt-4 uppercase tracking-[0.2em]">
                Secure Payment Powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
