"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { customerService } from "@/services/customer.service";

export default function QrAppealPage() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!ticketNumber.trim()) {
      toast.error("Enter a ticket number to generate the appeal link.");
      return;
    }

    try {
      setLoading(true);
      const ticket = await customerService.getPenaltyById(ticketNumber.trim());
      if (!ticket) {
        toast.error("Ticket not found. Please check the ticket number.");
        setGeneratedLink(null);
        return;
      }
      setGeneratedLink(`/penalty-dispute/${encodeURIComponent(ticketNumber.trim())}`);
      toast.success("Appeal link generated.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate appeal link.");
      setGeneratedLink(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-[#111827]/95 p-8 shadow-2xl backdrop-blur-lg">
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Submit an Appeal</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Get your dispute form link</h1>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Enter your ticket number and generate an official appeal URL. Follow the link to complete the formal dispute form with your evidence.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200">
              Ticket Number
              <input
                value={ticketNumber}
                onChange={(event) => setTicketNumber(event.target.value)}
                placeholder="Enter ticket number"
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-[#f97316]"
              />
            </label>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-3xl bg-[#f97316] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ea580c] disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate Appeal URL"}
            </button>
          </div>

          {generatedLink ? (
            <div className="rounded-[32px] border border-[#f97316]/30 bg-[#111827] p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your appeal form</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="break-all text-sm text-white/80">{generatedLink}</p>
                <Link
                  href={generatedLink}
                  className="inline-flex items-center justify-center rounded-3xl bg-[#f97316] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ea580c]"
                >
                  Open Appeal Form
                </Link>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                The appeal form will ask for ticket number, full name, email, phone, address, reason for appeal, and optionally upload JPEG/PDF evidence.
              </p>
            </div>
          ) : (
            <div className="rounded-[32px] border border-slate-700 bg-[#111827] p-6 text-sm text-slate-400">
              Enter a valid ticket number and click the button to see your appeal form link.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
