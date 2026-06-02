"use client";

import React, { useEffect, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
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
import toast from "react-hot-toast";

import { customerService, BookingResponse } from "@/services/customer.service";
import {
  BookingSummary,
  DurationDetails,
  ExtensionDetails,
  ParkingDetails,
  useParkingBooking,
  VehicleDetails,
} from "@/contexts/CustomerParkingContext";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";

interface CheckoutFormProps {
  parkingDetails: ParkingDetails | null;
  vehicleDetails: VehicleDetails | null;
  selectedDuration: DurationDetails | null;
  bookingSummary: BookingSummary | null;
  extensionDetails: ExtensionDetails | null;
  clearBooking: () => void;
  returnUrl: string | null;
  onComplete: () => void;
}

function CheckoutForm({
  parkingDetails,
  vehicleDetails,
  selectedDuration,
  bookingSummary,
  extensionDetails,
  clearBooking,
  returnUrl,
  onComplete,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [completedBooking, setCompletedBooking] = useState<BookingResponse | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const isExtensionCheckout = Boolean(extensionDetails);
  const checkoutTotal = extensionDetails?.amount ?? bookingSummary?.total ?? 0;

  useEffect(() => {
    if (
      !showSuccess &&
      !isExtensionCheckout &&
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

      router.push(returnUrl || "/");

      return;
    }
  }, [
    parkingDetails,
    vehicleDetails,
    selectedDuration,
    bookingSummary,
    isExtensionCheckout,
    router,
  ]);

  useEffect(() => {
    if (!showSuccess) return;

    const timer = setTimeout(() => {
      clearBooking();

      router.push(`/?zone=ZONE-201`);
    }, 6000);

    return () => clearTimeout(timer);
  }, [showSuccess, clearBooking, returnUrl, router]);

  const handlePayment = async () => {
    try {
      if (!stripe || !elements) {
        toast.error("Payment system not ready", {
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

      setIsProcessing(true);
      setStripeError(null);

      // Create payment intent with the backend
      if (!bookingSummary && !extensionDetails) {
        toast.error("Booking summary missing", {
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

      const paymentIntentResponse = await customerService.createPaymentIntent(
        checkoutTotal,
      );

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(
        paymentIntentResponse.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        },
      );

      if (result.error) {
        setStripeError(result.error.message || "Payment failed");
        toast.error(result.error.message || "Payment failed", {
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

      if (!result.paymentIntent || result.paymentIntent.status !== "succeeded") {
        toast.error("Payment did not complete successfully.");
        return;
      }

      if (extensionDetails) {
        await customerService.extendBooking(extensionDetails.bookingId, {
          durationLabel: extensionDetails.durationLabel,
          durationMinutes: extensionDetails.durationMinutes,
          amount: extensionDetails.amount,
          stripePaymentIntentId: result.paymentIntent.id,
        });

        setCompletedBooking({
          bookingId: extensionDetails.bookingId,
          paymentId: result.paymentIntent.id,
          receiptNumber: result.paymentIntent.id,
          amount: extensionDetails.amount,
          total: extensionDetails.amount,
          bookingReference: extensionDetails.bookingReference,
          transactionReference: result.paymentIntent.id,
        });
        setShowSuccess(true);
        toast.success("Payment successful. Parking extended.");
        onComplete();
        return;
      }

      // Submit booking with payment confirmation
      if (parkingDetails && vehicleDetails && selectedDuration) {
        const bookingResult = await customerService.submitBooking(
          {
            parkingDetails,
            vehicleDetails,
            selectedDuration,
          },
          result.paymentIntent.id,
        );

        setCompletedBooking(bookingResult);
        setShowSuccess(true);
        toast.success("Payment successful. Booking confirmed.");
        onComplete();
      }
    } catch (error) {
      console.error(error);
      const axiosError = error as
        | { response?: { data?: { message?: string } } }
        | Error;
      const backendMessage =
        axiosError &&
        "response" in axiosError &&
        axiosError.response?.data?.message
          ? axiosError.response.data.message
          : error instanceof Error
          ? error.message
          : "Payment processing failed. Please try again.";

      toast.error(backendMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnHome = () => {
    clearBooking();
    router.push(returnUrl || "/");
  };

  const handleDownloadInvoice = async () => {
    let invoiceId = completedBooking?.invoiceId;

    if (!invoiceId && completedBooking?.bookingId) {
      try {
        const details = await customerService.getBookingWithInvoice(
          completedBooking.bookingId,
        );
        invoiceId = details?.invoice?.id ?? details?.invoiceId;
        if (invoiceId) {
          setCompletedBooking((prev) =>
            prev ? { ...prev, invoiceId, invoiceNumber: details?.invoice?.invoice_number ?? prev.invoiceNumber } : prev,
          );
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (!invoiceId) {
      toast.error("Invoice is not available yet. Your booking is still confirmed.");
      return;
    }

    try {
      setIsDownloading(true);
      await customerService.downloadInvoice(invoiceId);
      toast.success("Invoice downloaded.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download invoice.");
    } finally {
      setIsDownloading(false);
    }
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
                {extensionDetails
                  ? `Extension (${extensionDetails.parkingName})`
                  : `Base Fare (${parkingDetails?.parkingName})`}
                <span className="text-white font-mono">
                  ${(extensionDetails?.amount ?? bookingSummary?.subtotal ?? 0).toFixed(2)}
                </span>
              </div>
              {!extensionDetails ? (
                <div className="flex justify-between text-xs text-[#9CA3AF]">
                  <span>Service Fee</span>
                  <span className="text-white font-mono">
                    ${(bookingSummary?.serviceFee ?? 0).toFixed(2)}
                  </span>
                </div>
              ) : null}
              <div className="h-px bg-white/5 my-1" />
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[#4B5563] text-[9px] uppercase font-black tracking-widest">
                    Grand Total
                  </p>
                  <p className="text-lg font-bold">
                    {extensionDetails ? `Extend for ${extensionDetails.durationLabel}` : "Ready to park"}
                  </p>
                </div>
                <p className="text-[#C6F432] text-3xl lg:text-4xl font-black font-mono tracking-tighter">
                  ${checkoutTotal.toFixed(2)}
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
                  {extensionDetails ? "Parking Extended" : "Booking Confirmed"}
                </h3>
                <p className="text-[#9CA3AF] text-xs px-4 leading-relaxed">
                  {extensionDetails
                    ? "Your parking time has been extended. Collect digital receipt from your mail."
                    : "Your parking zone is now reserved. Collect digital receipt from your mail."}
                </p>
                <div className="w-full bg-black/40 rounded-2xl p-5 mt-6 space-y-3 text-left border border-white/5">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-white/5">
                    <div>
                      <span className="text-[8px] uppercase text-[#4B5563] font-black block mb-1">
                        {extensionDetails ? "Booking" : "Start Time"}
                      </span>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Clock size={12} className="text-[#C6F432]" />
                        {extensionDetails
                          ? `#${extensionDetails.bookingReference ?? extensionDetails.bookingId}`
                          : bookingSummary?.startTime}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase text-[#4B5563] font-black block mb-1">
                        {extensionDetails ? "Added Time" : "End Time"}
                      </span>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Clock size={12} className="text-[#C6F432]" />
                        {bookingSummary?.endTime ?? extensionDetails?.durationLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase text-[#4B5563] font-black">
                      Duration
                    </span>
                    <span className="text-xs font-bold text-[#C6F432]">
                      {bookingSummary?.duration ?? extensionDetails?.durationLabel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase text-[#4B5563] font-black">
                      Transaction ID
                    </span>
                    <span className="text-[10px] font-mono text-white/80">
                      #
                      {completedBooking?.transactionReference ??
                        completedBooking?.bookingReference ??
                        bookingSummary?.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-[9px] uppercase text-[#4B5563] font-black">
                      Total Paid
                    </span>
                    <span className="text-sm text-[#C6F432] font-black font-mono">
                      ${checkoutTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="w-full mt-6 flex flex-col gap-2">
                  <button
                    onClick={handleDownloadInvoice}
                    disabled={isDownloading}
                    className="w-full bg-[#1A1A1A] border border-[#C6F432]/30 text-[#C6F432] py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all hover:bg-[#C6F432]/10 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    <Download size={16} />
                    {isDownloading ? "Downloading…" : "Download Invoice (PDF)"}
                  </button>

                  <button
                    onClick={handleReturnHome}
                    className="w-full bg-[#C6F432] text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-transform active:scale-[0.98]"
                  >
                    <Home size={16} />
                    Return Home
                  </button>

                  {completedBooking?.invoiceNumber ? (
                    <p className="text-center text-[10px] text-[#9CA3AF] font-mono">
                      Invoice #{completedBooking.invoiceNumber}
                    </p>
                  ) : null}

                  <p className="text-center text-[10px] text-[#4B5563] uppercase tracking-[0.2em] font-medium">
                    Booking summary & receipt sent to your email
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

export default function PaymentPageWrapper() {
  const {
    parkingDetails,
    vehicleDetails,
    selectedDuration,
    bookingSummary,
    extensionDetails,
    returnUrl,
    clearBooking,
  } = useParkingBooking();

  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [stripeConfigError, setStripeConfigError] = useState<string | null>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(true);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const publishableKey = stripePublishableKey
          ? stripePublishableKey
          : (await customerService.getStripeConfig()).stripePublishableKey;

        if (!publishableKey) {
          throw new Error('Stripe publishable key is missing');
        }

        setStripePromise(loadStripe(publishableKey));
      } catch (error) {
        console.error(error);
        setStripeConfigError(
          'Stripe is not configured. Please check backend and frontend settings.',
        );
      } finally {
        setIsStripeLoading(false);
      }
    };

    initializeStripe();
  }, []);

  if (isStripeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] text-white">
        <p className="text-base">Loading payment configuration…</p>
      </div>
    );
  }

  if (stripeConfigError || !stripePromise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] text-white p-6">
        <div className="max-w-lg rounded-3xl border border-[#2D2D2D] bg-[#111111] p-10 text-center shadow-xl">
          <h1 className="text-2xl font-bold mb-3">Stripe configuration missing</h1>
          <p className="text-sm text-[#C6F6FF] mb-6">
            {stripeConfigError ||
              'The Stripe publishable key is not configured. Please add it to frontend/.env.local or backend .env.'}
          </p>
          <p className="text-xs text-[#9CA3AF]">
            If this keeps happening, restart both servers and verify Stripe settings.
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
        extensionDetails={extensionDetails}
        returnUrl={returnUrl}
        clearBooking={clearBooking}
        onComplete={() => {}}
      />
    </Elements>
  );
}
