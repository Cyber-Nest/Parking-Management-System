// "use client";
// import React, { useState } from "react";
// import {
//   ArrowLeft,
//   CreditCard,
//   ShieldCheck,
//   CheckCircle2,
//   Download,
//   Home,
//   Clock,
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function PaymentPage() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const router = useRouter();

//   // Mock data for the summary
//   const bookingDetails = {
//     startTime: "10:30 AM",
//     endTime: "11:30 AM",
//     duration: "60 mins",
//     spot: "A-102",
//   };

//   const handlePayment = () => {
//     setIsProcessing(true);
//     setTimeout(() => {
//       setIsProcessing(false);
//       setShowSuccess(true);
//     }, 2000);
//   };

//   return (
//     <div className="min-h-screen bg-[#0D0D0D] text-white font-sans overflow-x-hidden overflow-y-auto">
//       <div className="max-w-xl lg:max-w-5xl mx-auto min-h-screen flex flex-col p-6 pt-10 relative">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-8">
//           <button
//             onClick={() => router.back()}
//             className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/5 hover:bg-white/10 transition-colors"
//           >
//             <ArrowLeft size={18} />
//           </button>
//           <h2
//             className="text-xl font-medium tracking-tight"
//             style={{ fontFamily: "serif" }}
//           >
//             Secure Checkout
//           </h2>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
//           {/* Left Side: Payment Methods */}
//           <div className="space-y-6">
//             <p className="text-[10px] uppercase tracking-[0.2em] text-[#4B5563] font-bold ml-1">
//               Select Payment Method
//             </p>
//             <div className="space-y-3">
//               <div className="bg-[#1A1A1A] border border-[#C6F432]/30 p-4 rounded-2xl flex items-center justify-between cursor-pointer">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-[#C6F432]/10 rounded-xl flex items-center justify-center text-[#C6F432]">
//                     <CreditCard size={20} />
//                   </div>
//                   <div>
//                     <p className="text-sm font-bold">Credit / Debit Card</p>
//                     <p className="text-[10px] text-[#4B5563]">
//                       Secured by Stripe
//                     </p>
//                   </div>
//                 </div>
//                 <div className="w-5 h-5 rounded-full border-2 border-[#C6F432] flex items-center justify-center p-0.5">
//                   <div className="w-full h-full bg-[#C6F432] rounded-full" />
//                 </div>
//               </div>

//               <div className="bg-[#1A1A1A] opacity-40 border border-white/5 p-4 rounded-2xl flex items-center justify-between grayscale cursor-not-allowed">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
//                     <img
//                       src="https://img.icons8.com/color/48/google-logo.png"
//                       className="w-5 h-5"
//                       alt="GPay"
//                     />
//                   </div>
//                   <p className="text-sm font-bold">Google Pay</p>
//                 </div>
//               </div>
//             </div>

//             <div className="hidden lg:flex items-center gap-3 p-4 border border-white/5 rounded-2xl bg-black/20">
//               <ShieldCheck className="text-[#C6F432]" size={24} />
//               <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
//                 Your transaction is protected with 256-bit SSL encryption and
//                 PCI-DSS compliant processing.
//               </p>
//             </div>
//           </div>

//           {/* Right Side: Summary Breakdown */}
//           <div className="space-y-6">
//             <div className="bg-[#1A1A1A] rounded-[28px] p-6 border border-white/5 space-y-4 shadow-xl">
//               <div className="flex justify-between text-xs text-[#9CA3AF]">
//                 <span>Base Fare (Spot {bookingDetails.spot})</span>
//                 <span className="text-white font-mono">$10.00</span>
//               </div>
//               <div className="flex justify-between text-xs text-[#9CA3AF]">
//                 <span>Service Fee</span>
//                 <span className="text-white font-mono">$2.00</span>
//               </div>
//               <div className="h-px bg-white/5 my-1" />
//               <div className="flex justify-between items-end">
//                 <div>
//                   <p className="text-[#4B5563] text-[9px] uppercase font-black tracking-widest">
//                     Grand Total
//                   </p>
//                   <p className="text-lg font-bold">Ready to park</p>
//                 </div>
//                 <p className="text-[#C6F432] text-3xl lg:text-4xl font-black font-mono tracking-tighter">
//                   $12.00
//                 </p>
//               </div>
//             </div>

//             {/* Bottom Action */}
//             <div className="space-y-4">
//               <div className="flex items-center justify-center lg:justify-start gap-2 text-[#4B5563] text-[10px] uppercase tracking-widest font-bold px-2">
//                 <ShieldCheck size={12} className="text-[#C6F432]" />
//                 Encrypted Transaction
//               </div>

//               <button
//                 disabled={isProcessing}
//                 onClick={handlePayment}
//                 className={`w-full py-4 rounded-full font-black text-base transition-all flex items-center justify-center gap-3 ${
//                   isProcessing
//                     ? "bg-[#1A1A1A] text-[#4B5563]"
//                     : "bg-[#C6F432] text-black shadow-[0_8px_30px_rgba(198,244,50,0.2)] hover:scale-[1.02] active:scale-[0.98]"
//                 }`}
//               >
//                 {isProcessing ? (
//                   <span className="flex items-center gap-2">
//                     <span className="w-4 h-4 border-2 border-[#C6F432] border-t-transparent rounded-full animate-spin" />
//                     Validating...
//                   </span>
//                 ) : (
//                   "Complete Payment"
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Success Popup Overlay */}
//         {showSuccess && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-black/80">
//             <div className="bg-[#1A1A1A] w-full max-w-sm rounded-[32px] p-8 border border-white/10 relative shadow-2xl animate-in zoom-in duration-300">
//               <div className="flex flex-col items-center text-center">
//                 <div className="w-16 h-16 bg-[#C6F432]/10 rounded-full flex items-center justify-center mb-5">
//                   <CheckCircle2 className="text-[#C6F432]" size={32} />
//                 </div>

//                 <h3 className="text-2xl mb-1" style={{ fontFamily: "serif" }}>
//                   Booking Confirmed
//                 </h3>
//                 <p className="text-[#9CA3AF] text-xs px-4 leading-relaxed">
//                   Your spot {bookingDetails.spot} is now reserved. Access is
//                   granted.
//                 </p>

//                 <div className="w-full bg-black/40 rounded-2xl p-5 mt-6 space-y-3 text-left border border-white/5">
//                   <div className="grid grid-cols-2 gap-4 pb-3 border-b border-white/5">
//                     <div>
//                       <span className="text-[8px] uppercase text-[#4B5563] font-black block mb-1">
//                         Start Time
//                       </span>
//                       <span className="text-xs font-bold text-white flex items-center gap-1.5">
//                         <Clock size={12} className="text-[#C6F432]" />{" "}
//                         {bookingDetails.startTime}
//                       </span>
//                     </div>
//                     <div>
//                       <span className="text-[8px] uppercase text-[#4B5563] font-black block mb-1">
//                         End Time
//                       </span>
//                       <span className="text-xs font-bold text-white flex items-center gap-1.5">
//                         <Clock size={12} className="text-[#C6F432]" />{" "}
//                         {bookingDetails.endTime}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex justify-between items-center">
//                     <span className="text-[9px] uppercase text-[#4B5563] font-black">
//                       Duration
//                     </span>
//                     <span className="text-xs font-bold text-[#C6F432]">
//                       {bookingDetails.duration}
//                     </span>
//                   </div>

//                   <div className="flex justify-between items-center">
//                     <span className="text-[9px] uppercase text-[#4B5563] font-black">
//                       Transaction ID
//                     </span>
//                     <span className="text-[10px] font-mono text-white/80">
//                       #PS-99210-XC
//                     </span>
//                   </div>

//                   <div className="flex justify-between items-center pt-2 border-t border-white/5">
//                     <span className="text-[9px] uppercase text-[#4B5563] font-black">
//                       Total Paid
//                     </span>
//                     <span className="text-sm text-[#C6F432] font-black font-mono">
//                       $12.00
//                     </span>
//                   </div>
//                 </div>

//                 <div className="w-full mt-6 flex flex-col gap-2">
//                   <Link href="/">
//                     <button className="w-full bg-[#C6F432] text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-transform active:scale-[0.98]">
//                       <Home size={16} />
//                       Return Home
//                     </button>
//                   </Link>
//                   <button className="w-full py-3 text-[#9CA3AF] text-xs font-bold flex items-center justify-center gap-2 hover:text-white transition-colors">
//                     <Download size={16} />
//                     Get Digital Receipt
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";

import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Download,
  Home,
  Clock,
} from "lucide-react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { customerService } from "@/services/customer.service";

import { useParkingBooking } from "@/contexts/CustomerParkingContext";

export default function PaymentPage() {
  const router = useRouter();

  const {
    parkingDetails,
    vehicleDetails,
    selectedDuration,
    bookingSummary,
    clearBooking,
  } = useParkingBooking();

  const [isProcessing, setIsProcessing] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (
      !showSuccess &&
      (!parkingDetails ||
        !vehicleDetails ||
        !selectedDuration ||
        !bookingSummary)
    ) {
      toast.error("Incomplete booking flow", {
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
  }, [
    parkingDetails,
    vehicleDetails,
    selectedDuration,
    bookingSummary,
    router,
  ]);

  useEffect(() => {
    if (!showSuccess) return;

    const timer = setTimeout(() => {
      clearBooking();

      router.push("/");
    }, 6000);

    return () => clearTimeout(timer);
  }, [showSuccess, clearBooking, router]);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      const success = await customerService.processDummyPayment();

      if (!success) {
        toast.error("Payment failed", {
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
        return;
      }

      setShowSuccess(true);

      toast.success("Payment successful", {
        style: {
          background: "#0B0B0B",
          border: "1px solid rgba(190,242,100,0.2)",
          color: "#fff",
          borderRadius: "18px",
          padding: "14px 16px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 30px rgba(190,242,100,0.15)",
        },
      });
    } catch (error) {
      console.error(error);

      toast.error("Payment processing failed", {
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnHome = () => {
    clearBooking();

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans overflow-x-hidden overflow-y-auto">
      <div className="max-w-xl lg:max-w-5xl mx-auto min-h-screen flex flex-col p-6 pt-10 relative">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          <h2
            className="text-xl font-medium tracking-tight"
            style={{ fontFamily: "serif" }}
          >
            Secure Checkout
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left */}
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#4B5563] font-bold ml-1">
              Select Payment Method
            </p>

            <div className="space-y-3">
              {/* Card */}
              <div className="bg-[#1A1A1A] border border-[#C6F432]/30 p-4 rounded-2xl flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C6F432]/10 rounded-xl flex items-center justify-center text-[#C6F432]">
                    <CreditCard size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">Credit / Debit Card</p>

                    <p className="text-[10px] text-[#4B5563]">
                      Secured by Stripe
                    </p>
                  </div>
                </div>

                <div className="w-5 h-5 rounded-full border-2 border-[#C6F432] flex items-center justify-center p-0.5">
                  <div className="w-full h-full bg-[#C6F432] rounded-full" />
                </div>
              </div>

              {/* GPay */}
              <div className="bg-[#1A1A1A] opacity-40 border border-white/5 p-4 rounded-2xl flex items-center justify-between grayscale cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <img
                      src="https://img.icons8.com/color/48/google-logo.png"
                      className="w-5 h-5"
                      alt="GPay"
                    />
                  </div>

                  <p className="text-sm font-bold">Google Pay</p>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="hidden lg:flex items-center gap-3 p-4 border border-white/5 rounded-2xl bg-black/20">
              <ShieldCheck className="text-[#C6F432]" size={24} />

              <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                Your transaction is protected with 256-bit SSL encryption and
                PCI-DSS compliant processing.
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-[#1A1A1A] rounded-[28px] p-6 border border-white/5 space-y-4 shadow-xl">
              <div className="flex justify-between text-xs text-[#9CA3AF]">
                Base Fare ({parkingDetails?.parkingName})
                <span className="text-white font-mono">
                  ${bookingSummary?.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-[#9CA3AF]">
                <span>Service Fee</span>

                <span className="text-white font-mono">
                  ${bookingSummary?.serviceFee.toFixed(2)}
                </span>
              </div>

              <div className="h-px bg-white/5 my-1" />

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[#4B5563] text-[9px] uppercase font-black tracking-widest">
                    Grand Total
                  </p>

                  <p className="text-lg font-bold">Ready to park</p>
                </div>

                <p className="text-[#C6F432] text-3xl lg:text-4xl font-black font-mono tracking-tighter">
                  ${bookingSummary?.total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-[#4B5563] text-[10px] uppercase tracking-widest font-bold px-2">
                <ShieldCheck size={12} className="text-[#C6F432]" />
                Encrypted Transaction
              </div>

              <button
                disabled={isProcessing}
                onClick={handlePayment}
                className={`w-full py-4 rounded-full font-black text-base transition-all flex items-center justify-center gap-3 ${
                  isProcessing
                    ? "bg-[#1A1A1A] text-[#4B5563]"
                    : "bg-[#C6F432] text-black shadow-[0_8px_30px_rgba(198,244,50,0.2)] hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#C6F432] border-t-transparent rounded-full animate-spin" />
                    Validating...
                  </span>
                ) : (
                  "Complete Payment"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Success Popup */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-black/80">
            <div className="bg-[#1A1A1A] w-full max-w-sm rounded-[32px] p-8 border border-white/10 relative shadow-2xl animate-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#C6F432]/10 rounded-full flex items-center justify-center mb-5">
                  <CheckCircle2 className="text-[#C6F432]" size={32} />
                </div>

                <h3 className="text-2xl mb-1" style={{ fontFamily: "serif" }}>
                  Booking Confirmed
                </h3>

                <p className="text-[#9CA3AF] text-xs px-4 leading-relaxed">
                  Your parking zone is now reserved. Collect digital receipt from
                  your mail.
                </p>

                {/* Summary Card */}
                <div className="w-full bg-black/40 rounded-2xl p-5 mt-6 space-y-3 text-left border border-white/5">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-white/5">
                    <div>
                      <span className="text-[8px] uppercase text-[#4B5563] font-black block mb-1">
                        Start Time
                      </span>

                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Clock size={12} className="text-[#C6F432]" />

                        {bookingSummary?.startTime}
                      </span>
                    </div>

                    <div>
                      <span className="text-[8px] uppercase text-[#4B5563] font-black block mb-1">
                        End Time
                      </span>

                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Clock size={12} className="text-[#C6F432]" />

                        {bookingSummary?.endTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase text-[#4B5563] font-black">
                      Duration
                    </span>

                    <span className="text-xs font-bold text-[#C6F432]">
                      {bookingSummary?.duration}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase text-[#4B5563] font-black">
                      Transaction ID
                    </span>

                    <span className="text-[10px] font-mono text-white/80">
                      #{bookingSummary?.transactionId}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-[9px] uppercase text-[#4B5563] font-black">
                      Total Paid
                    </span>

                    <span className="text-sm text-[#C6F432] font-black font-mono">
                      ${bookingSummary?.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full mt-6 flex flex-col gap-2">
                  <button
                    onClick={handleReturnHome}
                    className="w-full bg-[#C6F432] text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-transform active:scale-[0.98]"
                  >
                    <Home size={16} />
                    Return Home
                  </button>

                  {/* <button className="w-full py-3 text-[#9CA3AF] text-xs font-bold flex items-center justify-center gap-2 hover:text-white transition-colors">
                    <Download size={16} />
                    Get Digital Receipt
                  </button> */}
                  {/* <p className="text-center text-[10px] text-[#4B5563] mt-5 uppercase tracking-[0.2em] font-medium">
                    Receipt forwarded to{" "}
                    <span className="text-white/60 font-mono lower-case">
                      {" "}
                      your email
                    </span>
                  </p> */}

                  <p className="text-center text-[10px] text-[#4B5563] mt-5 uppercase tracking-[0.2em] font-medium">
                    Booking summary & receipt sent to inbox
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
