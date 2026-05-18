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
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
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
import {
  BookingSummary,
  DurationDetails,
  ParkingDetails,
  useParkingBooking,
  VehicleDetails,
} from "@/contexts/CustomerParkingContext";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : Promise.resolve(null);

interface CheckoutFormProps {
  parkingDetails: ParkingDetails | null;
  vehicleDetails: VehicleDetails | null;
  selectedDuration: DurationDetails | null;
  bookingSummary: BookingSummary | null;
  clearBooking: () => void;
  onComplete: () => void;
}

function CheckoutForm({
  parkingDetails,
  vehicleDetails,
  selectedDuration,
  bookingSummary,
  clearBooking,
  onComplete,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingSummary) return;

    const loadPaymentIntent = async () => {
      try {
        const intent = await customerService.createPaymentIntent(
          bookingSummary.total,
        );
        setClientSecret(intent.clientSecret);
      } catch (error) {
        console.error(error);

        const axiosError = error as { response?: { data?: { message?: string } } } | Error;
        const backendMessage =
          axiosError &&
          'response' in axiosError &&
          axiosError.response?.data?.message
            ? axiosError.response.data.message
            : error instanceof Error
            ? error.message
            : 'Unable to initialize payment.';

        toast.error(
          backendMessage ||
            "Unable to initialize payment. Please try again or contact support.",
        );
      }
    };

    loadPaymentIntent();
  }, [bookingSummary]);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      toast.error("Stripe is not ready yet. Please wait a moment.");
      return;
    }

    if (!bookingSummary || !parkingDetails || !vehicleDetails) {
      toast.error("Incomplete booking information.");
      return;
    }

    if (!clientSecret) {
      toast.error("Payment session not initialized.");
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      toast.error("Enter your card details to proceed.");
      return;
    }

    setIsProcessing(true);
    setStripeError(null);

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            email: vehicleDetails.email,
          },
        },
      });

      if (result.error) {
        setStripeError(result.error.message ?? "Card payment failed.");
        toast.error(result.error.message || "Payment failed.");
        return;
      }

      if (!result.paymentIntent || result.paymentIntent.status !== "succeeded") {
        toast.error("Payment did not complete successfully.");
        return;
      }

      await customerService.submitBooking(
        {
          parkingDetails,
          vehicleDetails,
          selectedDuration: selectedDuration as DurationDetails,
        },
        result.paymentIntent.id,
      );

      setShowSuccess(true);
      toast.success("Payment successful. Booking confirmed.");
      onComplete();
    } catch (error) {
      console.error(error);
      toast.error("Payment processing failed. Please try again.");
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
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#4B5563] font-bold ml-1">
              Select Payment Method
            </p>

            <div className="space-y-3">
              <div className="bg-[#1A1A1A] border border-[#C6F432]/30 p-4 rounded-2xl flex items-center justify-between">
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

            <div className="bg-[#1A1A1A] rounded-[28px] p-5 border border-white/5 space-y-4 shadow-xl">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#4B5563] font-bold mb-3">
                  Card details
                </p>
                <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-4">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          color: "#FFFFFF",
                          fontSize: "16px",
                          fontFamily: "Inter, system-ui, sans-serif",
                          fontSmoothing: "antialiased",
                          "::placeholder": {
                            color: "#9CA3AF",
                          },
                        },
                        invalid: {
                          color: "#F87171",
                        },
                      },
                    }}
                  />
                </div>
                {stripeError && (
                  <p className="text-sm text-rose-400 mt-3">{stripeError}</p>
                )}
              </div>

              <div className="text-[11px] text-[#9CA3AF] leading-relaxed">
                Your transaction is protected with 256-bit SSL encryption and
                PCI-DSS compliant processing.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#1A1A1A] rounded-[28px] p-6 border border-white/5 space-y-4 shadow-xl">
              <div className="flex justify-between text-xs text-[#9CA3AF]">
                <span>Base Fare (Spot {parkingDetails?.spotId})</span>
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
                  Your spot {parkingDetails?.spotId} is now reserved. Access is
                  granted.
                </p>
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
                <div className="w-full mt-6 flex flex-col gap-2">
                  <button
                    onClick={handleReturnHome}
                    className="w-full bg-[#C6F432] text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-transform active:scale-[0.98]"
                  >
                    <Home size={16} />
                    Return Home
                  </button>
                  <button className="w-full py-3 text-[#9CA3AF] text-xs font-bold flex items-center justify-center gap-2 hover:text-white transition-colors">
                    <Download size={16} />
                    Get Digital Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPageWrapper() {
  const {
    parkingDetails,
    vehicleDetails,
    selectedDuration,
    bookingSummary,
    clearBooking,
  } = useParkingBooking();

  if (!stripePublishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] text-white p-6">
        <div className="max-w-lg rounded-3xl border border-[#2D2D2D] bg-[#111111] p-10 text-center shadow-xl">
          <h1 className="text-2xl font-bold mb-3">Stripe configuration missing</h1>
          <p className="text-sm text-[#C6C6C6] mb-6">
            The frontend Stripe publishable key is not configured. Please add
            <code className="block py-1 px-2 rounded bg-[#1F1F1F] text-[#A5FFA0] mt-3">
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
            </code>
            to <code className="block py-1 px-2 rounded bg-[#1F1F1F]">frontend/.env.local</code> and restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        parkingDetails={parkingDetails}
        vehicleDetails={vehicleDetails}
        selectedDuration={selectedDuration}
        bookingSummary={bookingSummary}
        clearBooking={clearBooking}
        onComplete={() => {}}
      />
    </Elements>
  );
}
