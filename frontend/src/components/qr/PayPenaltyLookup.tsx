"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Hash, Mail, Search, ArrowRight, ShieldCheck, Car } from "lucide-react";
import { customerService, PenaltyDetails } from "@/services/customer.service";

interface PayPenaltyLookupProps {
  initialTicket?: string;
}

export default function PayPenaltyLookup({
  initialTicket,
}: PayPenaltyLookupProps) {
  const [ticketNumber, setTicketNumber] = useState(initialTicket ?? "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [penalty, setPenalty] = useState<PenaltyDetails | null>(null);

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

  const errorToastStyle = {
    style: {
      background: "#0B0B0B",
      border: "1px solid rgba(239,68,68,0.2)",
      color: "#fff",
      borderRadius: "18px",
      padding: "14px 16px",
      backdropFilter: "blur(12px)",
      boxShadow: "0 0 30px rgba(239,68,68,0.12)",
    },
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ticketNumber.trim()) {
      toast.error("Enter a ticket number to search.", { ...errorToastStyle });
      return;
    }

    try {
      setLoading(true);
      const data = await customerService.getPenaltyById(ticketNumber.trim());
      if (!data) {
        toast.error("Ticket not found.", { ...errorToastStyle });
        setPenalty(null);
        return;
      }
      setPenalty(data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to find ticket. Please verify the ticket number.", {
        ...errorToastStyle,
      });
      setPenalty(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans overflow-x-hidden overflow-y-auto p-6 pt-12">
      <div className="mx-auto max-w-xl lg:max-w-3xl flex flex-col min-h-[calc(100vh-6rem)] justify-center">
        <div className="rounded-2xl border border-white/5 bg-[#1A1A1A] p-6 lg:p-10 shadow-xl backdrop-blur-md">
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold">
                Pay Penalty
              </p>
              <h1
                className="mt-3 text-2xl lg:text-3xl font-medium tracking-tight text-white"
                style={{ fontFamily: "serif" }}
              >
                Lookup your ticket
              </h1>
              <p className="mt-3 text-xs lg:text-sm leading-relaxed text-white/60">
                Enter your ticket number and email to fetch the penalty amount
                and proceed to secure payment.
              </p>
            </div>

            <form onSubmit={handleSearch} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/90 ml-1 font-bold">
                  Ticket Number
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    size={16}
                  />
                  <input
                    value={ticketNumber}
                    onChange={(event) => {
                      setTicketNumber(event.target.value);
                      if (penalty) setPenalty(null);
                    }}
                    placeholder="Enter ticket number"
                    className="w-full bg-[#0D0D0D] border border-white/20 rounded-xl py-3.5 pl-11 pr-4 focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-white/20 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/90 ml-1 font-bold">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    size={16}
                  />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    type="email"
                    className="w-full bg-[#0D0D0D] border border-white/20 rounded-xl py-3.5 pl-11 pr-4 focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-white/20 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="sm:col-span-2 w-full bg-[#C6F432] hover:bg-[#d4ff45] text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm shadow-[0_10px_25px_rgba(198,244,50,0.15)] disabled:opacity-50"
              >
                {loading ? "Searching..." : "Search Ticket"}
                {!loading && <Search size={16} />}
              </button>
            </form>

            {initialTicket && !penalty ? (
              <div className="rounded-xl border border-white/5 bg-[#0D0D0D] p-4 text-xs text-white/50 leading-relaxed">
                Ticket number is prefilled from the scan. Please enter your
                email and click search to load the ticket details.
              </div>
            ) : null}

            {penalty ? (
              <div className="rounded-xl border border-[#C6F432]/20 bg-[#1C1D17] p-5 lg:p-6 space-y-5 animate-fadeIn">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#C6F432] font-bold">
                      Ticket Info
                    </p>
                    <p className="mt-1.5 text-lg font-bold font-mono text-white">
                      {penalty.penaltyId}
                    </p>
                    <p className="text-xs text-white/60 mt-0.5">
                      {penalty.violationReason}
                    </p>
                  </div>

                  <div className="bg-[#0D0D0D] border border-white/5 px-5 py-3 rounded-xl text-left sm:text-right shrink-0">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">
                      Amount Due
                    </p>
                    <p className="mt-1 text-2xl lg:text-3xl font-black font-mono tracking-tight text-[#C6F432]">
                      ${Number(penalty.generatedPenalty || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-[#0D0D0D] p-3.5">
                    <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 font-bold flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-white/30" /> Status
                    </p>
                    <p className="mt-1 text-sm font-bold text-white capitalize">
                      {penalty.status}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#0D0D0D] p-3.5">
                    <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 font-bold flex items-center gap-1.5">
                      <Car size={12} className="text-white/30" /> Vehicle
                    </p>
                    <p className="mt-1 text-sm font-bold font-mono text-white">
                      {penalty.vehicleDetails?.plateNumber || "Unknown"}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/penalty-payment/${encodeURIComponent(ticketNumber.trim())}${email ? `?email=${encodeURIComponent(email.trim())}` : ""}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-white text-black hover:bg-white/90 font-black py-4 text-sm transition-all active:scale-[0.98] gap-2 shadow-lg"
                >
                  Proceed to Secure Payment
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <p className="text-center text-[8px] text-white/30 mt-6 uppercase tracking-[0.2em]">
          Secure Payment Gateway Powered by Stripe
        </p>
      </div>
    </div>
  );
}
