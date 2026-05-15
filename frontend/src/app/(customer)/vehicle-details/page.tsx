// "use client";
// import React, { useState } from "react";
// import { ArrowLeft, Car, Mail, Palette, Hash } from "lucide-react";
// import Link from "next/link";

// export default function VehicleDetailsPage() {
//   const [selectedDuration, setSelectedDuration] = useState("1h");

//   const durations = [
//     { label: "30m", value: "30m", price: "$2.50" },
//     { label: "1h", value: "1h", price: "$4.50" },
//     { label: "3h", value: "3h", price: "$12.00" },
//     { label: "Day", value: "day", price: "$25.00" },
//   ];

//   return (
//     <div className="h-screen bg-[#0D0D0D] text-white font-sans overflow-x-hidden overflow-y-auto scrollbar-hide">
//       <div className="max-w-xl lg:max-w-5xl mx-auto min-h-screen flex flex-col p-6 pt-10">

//         <div className="flex items-center gap-4 mb-8">
//           <Link
//             href="/"
//             className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/5 hover:bg-white/5 transition-colors"
//           >
//             <ArrowLeft size={18} />
//           </Link>
//           <h2
//             className="text-xl font-medium tracking-tight"
//             style={{ fontFamily: "serif" }}
//           >
//             Vehicle Details
//           </h2>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

//           {/* Left Column: Form Fields */}
//           <div className="space-y-6">
//             {/* Email Input */}
//             <div className="space-y-1.5">
//               <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
//                 Receipt Email
//               </label>
//               <div className="relative">
//                 <Mail
//                   className="absolute left-4 top-1/2 -translate-y-1/2 text-[#374151]"
//                   size={16}
//                 />
//                 <input
//                   type="email"
//                   placeholder="your@email.com"
//                   className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-[#374151] text-sm"
//                 />
//               </div>
//             </div>

//             {/* Vehicle Model Field */}
//             <div className="space-y-1.5">
//               <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
//                 Vehicle Model
//               </label>
//               <div className="relative">
//                 <Car
//                   className="absolute left-4 top-1/2 -translate-y-1/2 text-[#374151]"
//                   size={16}
//                 />
//                 <input
//                   type="text"
//                   placeholder="e.g. Tesla Model 3"
//                   className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-[#374151] text-sm"
//                 />
//               </div>
//             </div>

//             {/* Plate & Color  */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-1.5">
//                 <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
//                   Plate No.
//                 </label>
//                 <div className="relative">
//                   <Hash
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-[#374151]"
//                     size={16}
//                   />
//                   <input
//                     type="text"
//                     placeholder="ONT-123"
//                     className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-[#374151] text-sm font-mono"
//                   />
//                 </div>
//               </div>
//               <div className="space-y-1.5">
//                 <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
//                   Car Color
//                 </label>
//                 <div className="relative">
//                   <Palette
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-[#374151]"
//                     size={16}
//                   />
//                   <input
//                     type="text"
//                     placeholder="e.g. Silver"
//                     className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-[#374151] text-sm"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Duration Selection */}
//             <div className="space-y-3 pt-4">
//               <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
//                 Parking Duration
//               </label>
//               <div className="grid grid-cols-4 gap-2">
//                 {durations.map((d) => (
//                   <button
//                     key={d.value}
//                     onClick={() => setSelectedDuration(d.value)}
//                     className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all duration-200 ${
//                       selectedDuration === d.value
//                         ? "bg-[#C6F432] border-[#C6F432] text-black"
//                         : "bg-[#1A1A1A] border-white/5 text-[#9CA3AF]"
//                     }`}
//                   >
//                     <span className="text-[10px] font-bold uppercase tracking-tight mb-0.5">
//                       {d.label}
//                     </span>
//                     <span
//                       className={`text-sm font-mono font-bold ${selectedDuration === d.value ? "text-black" : "text-white"}`}
//                     >
//                       {d.price.split(".")[0]}
//                     </span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Right Column: Summary Card & acttion*/}
//           <div className="flex flex-col justify-end lg:justify-start lg:pt-5 pb-8">
//             <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/5 mb-6 flex justify-between items-center lg:flex-col lg:items-start lg:gap-4 shadow-xl">
//               <div>
//                 <p className="text-[#4B5563] text-[9px] uppercase tracking-widest font-black">
//                   Total Due
//                 </p>
//                 <p className="text-lg font-bold mt-0.5">
//                   Summary for {selectedDuration}
//                 </p>
//               </div>
//               <p className="text-[#C6F432] text-3xl font-black font-mono tracking-tighter lg:text-5xl">
//                 {durations.find((d) => d.value === selectedDuration)?.price}
//               </p>
//             </div>

//             <Link href="/payment">
//               <button className="w-full bg-[#C6F432] hover:bg-[#d4ff45] text-black font-black py-4 rounded-full flex items-center justify-center gap-3 transition-all active:scale-[0.98] text-md shadow-[0_10px_30px_rgba(198,244,50,0.3)] lg:text-lg">
//                 Proceed to Payment
//               </button>
//             </Link>

//             {/* <p className="text-center text-[10px] text-[#4B5563] mt-6 uppercase tracking-[0.2em] font-medium">
//               Free cancellation up to 5 mins before start
//             </p> */}
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

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
  } = useParkingBooking();

  const durations = customerService.getDurationOptions();

  const [selectedDurationValue, setSelectedDurationValue] = useState("1h");

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

      router.push("/");

      return;
    }
  }, [parkingDetails, router]);

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

    return true;
  };

  const handleProceedToPayment = () => {
    if (!parkingDetails) {
      toast.error("Parking details missing", {
        ...toastStyle,
      });

      return;
    }

    const isValid = validateForm();

    if (!isValid) return;

    const selectedDuration = durations.find(
      (d) => d.value === selectedDurationValue,
    ) as DurationOption;

    setVehicleDetails(formData);

    setSelectedDuration(selectedDuration);

    const bookingSummary = customerService.generateBookingSummary({
      parkingDetails,
      vehicleDetails: formData,
      selectedDuration,
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
            href="/"
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

            {/* Duration */}
            <div className="space-y-3 pt-4">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] ml-1 font-bold">
                Parking Duration
              </label>

              <div className="grid grid-cols-4 gap-2">
                {durations.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setSelectedDurationValue(d.value)}
                    className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all duration-200 ${
                      selectedDurationValue === d.value
                        ? "bg-[#C6F432] border-[#C6F432] text-black"
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
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col justify-end lg:justify-start lg:pt-5 pb-8">
            <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/5 mb-6 flex justify-between items-center lg:flex-col lg:items-start lg:gap-4 shadow-xl">
              <div>
                <p className="text-[#4B5563] text-[9px] uppercase tracking-widest font-black">
                  Total Due
                </p>

                <p className="text-lg font-bold mt-0.5">
                  Summary for {selectedDurationValue}
                </p>
              </div>

              <p className="text-[#C6F432] text-3xl font-black font-mono tracking-tighter lg:text-5xl">
                $
                {durations
                  .find((d) => d.value === selectedDurationValue)
                  ?.price.toFixed(2)}
              </p>
            </div>

            <button
              onClick={handleProceedToPayment}
              className="w-full bg-[#C6F432] hover:bg-[#d4ff45] text-black font-black py-4 rounded-full flex items-center justify-center gap-3 transition-all active:scale-[0.98] text-md shadow-[0_10px_30px_rgba(198,244,50,0.3)] lg:text-lg"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
