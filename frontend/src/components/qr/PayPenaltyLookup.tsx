"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { customerService, PenaltyDetails } from "@/services/customer.service";

interface PayPenaltyLookupProps {
  initialTicket?: string;
}

export default function PayPenaltyLookup({ initialTicket }: PayPenaltyLookupProps) {
  const [ticketNumber, setTicketNumber] = useState(initialTicket ?? "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [penalty, setPenalty] = useState<PenaltyDetails | null>(null);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ticketNumber.trim()) {
      toast.error("Enter a ticket number to search.");
      return;
    }

    try {
      setLoading(true);
      const data = await customerService.getPenaltyById(ticketNumber.trim());
      if (!data) {
        toast.error("Ticket not found.");
        setPenalty(null);
        return;
      }
      setPenalty(data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to find ticket. Please verify the ticket number.");
      setPenalty(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-[#111827]/95 p-8 shadow-2xl backdrop-blur-lg">
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Pay Penalty</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Lookup your ticket</h1>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Enter your ticket number and email to fetch the penalty amount and proceed to secure payment.
            </p>
          </div>

          <form onSubmit={handleSearch} className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200">
              Ticket Number
              <input
                value={ticketNumber}
                onChange={(event) => {
                  setTicketNumber(event.target.value);
                  if (penalty) setPenalty(null);
                }}
                placeholder="Enter ticket number"
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-[#60a5fa]"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              Email Address
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                type="email"
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-[#60a5fa]"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="sm:col-span-2 rounded-3xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search Ticket"}
            </button>
          </form>

          {initialTicket && !penalty ? (
            <div className="rounded-[32px] border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-300">
              Ticket number is prefilled from the scan. Please enter your email and click search to load the ticket details.
            </div>
          ) : null}

          {penalty ? (
            <div className="rounded-[32px] border border-[#3b82f6]/20 bg-[#111827] p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ticket</p>
                  <p className="mt-2 text-xl font-semibold text-white">{penalty.penaltyId}</p>
                  <p className="text-sm text-slate-400">{penalty.violationReason}</p>
                </div>
                <div className="rounded-3xl bg-[#1f2937] px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Amount</p>
                  <p className="mt-2 text-3xl font-bold text-[#60a5fa]">${Number(penalty.generatedPenalty || 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Status</p>
                  <p className="mt-2 font-semibold text-white capitalize">{penalty.status}</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Vehicle</p>
                  <p className="mt-2 font-semibold text-white">{penalty.vehicleDetails?.plateNumber || "Unknown"}</p>
                </div>
              </div>

              <Link
                href={`/penalty-payment/${encodeURIComponent(ticketNumber.trim())}${email ? `?email=${encodeURIComponent(email.trim())}` : ""}`}
                className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
              >
                Proceed to Secure Payment
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
