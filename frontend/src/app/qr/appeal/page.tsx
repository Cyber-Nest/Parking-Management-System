"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Hash, ArrowRight, FileText } from "lucide-react";
import { customerService } from "@/services/customer.service";

export default function QrAppealPage() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleGenerate = async () => {
    if (!ticketNumber.trim()) {
      toast.error("Enter a ticket number to generate the appeal link.", {
        ...errorToastStyle,
      });
      return;
    }

    try {
      setLoading(true);
      const ticket = await customerService.getPenaltyById(ticketNumber.trim());
      if (!ticket) {
        toast.error("Ticket not found. Please check the ticket number.", {
          ...errorToastStyle,
        });
        setGeneratedLink(null);
        return;
      }
      setGeneratedLink(
        `/penalty-dispute/${encodeURIComponent(ticketNumber.trim())}`,
      );
      toast.success("Appeal link generated.", { ...toastStyle });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate appeal link.", { ...errorToastStyle });
      setGeneratedLink(null);
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
                Submit an Appeal
              </p>
              <h1
                className="mt-3 text-2xl lg:text-3xl font-medium tracking-tight text-white"
                style={{ fontFamily: "serif" }}
              >
                Get your dispute form link
              </h1>
              <p className="mt-3 text-xs lg:text-sm leading-relaxed text-white/60">
                Enter your ticket number and generate an official appeal URL.
                Follow the link to complete the formal dispute form with your
                evidence.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 items-end">
              <div className="space-y-2 sm:col-span-2">
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
                    onChange={(event) => setTicketNumber(event.target.value)}
                    placeholder="Enter ticket number"
                    className="w-full bg-[#0D0D0D] border border-white/20 rounded-xl py-3.5 pl-11 pr-4 focus:border-[#C6F432]/40 focus:outline-none transition-all placeholder:text-white/20 text-sm font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-[#C6F432] hover:bg-[#d4ff45] text-black font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm shadow-[0_10px_25px_rgba(198,244,50,0.15)] disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate URL"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>

            {generatedLink ? (
              <div className="rounded-xl border border-[#C6F432]/20 bg-[#1C1D17] p-5 lg:p-6 space-y-4 animate-fadeIn">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#C6F432] font-bold">
                    Your appeal form
                  </p>
                  <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[#0D0D0D] p-3.5 rounded-xl border border-white/5">
                    <p className="break-all text-sm font-mono text-white/80 pr-2">
                      {generatedLink}
                    </p>
                    <Link
                      href={generatedLink}
                      className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 px-4 py-2 text-xs font-bold transition-all whitespace-nowrap"
                    >
                      Open Form
                    </Link>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start text-white/50 text-xs leading-relaxed pt-1 border-t border-white/5">
                  <FileText
                    size={14}
                    className="mt-0.5 text-[#C6F432] shrink-0"
                  />
                  <p>
                    The appeal form will ask for ticket number, full name,
                    email, phone, address, reason for appeal, and optionally
                    upload JPEG/PDF evidence.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/5 bg-[#0D0D0D] p-4 text-xs text-center lg:text-left text-white/40 tracking-wide uppercase font-medium">
                Enter a valid ticket number and click the button to see your
                appeal form link.
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[8px] text-white/30 mt-6 uppercase tracking-[0.2em]">
          Official Parking Dispute Resolution System
        </p>
      </div>
    </div>
  );
}
