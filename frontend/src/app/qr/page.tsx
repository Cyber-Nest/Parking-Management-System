"use client";

import Link from "next/link";
import { CreditCard, Scale } from "lucide-react";

export default function QrLandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans overflow-x-hidden overflow-y-auto p-6 pt-12 flex flex-col justify-center">
      <div className="mx-auto max-w-xl lg:max-w-3xl w-full flex flex-col justify-center">
        <div className="rounded-2xl border border-white/5 bg-[#1A1A1A] p-6 lg:p-10 shadow-xl backdrop-blur-md">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0D0D0D] border border-white/10 text-[#C6F432] shadow-xl">
              <span className="text-2xl font-black font-mono tracking-tighter">
                P
              </span>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold">
                ParkSmart
              </p>
              <h1
                className="mt-3 text-2xl lg:text-4xl font-medium tracking-tight text-white"
                style={{ fontFamily: "serif" }}
              >
                Penalty Payment & Appeal
              </h1>
            </div>

            <p className="max-w-xl text-xs lg:text-sm leading-relaxed text-white/60">
              Scan the ParkSmart QR code to quickly pay a penalty or file an
              appeal. Use the options below to look up your ticket and continue
              with the official ParkSmart experience.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              href="/pay"
              className="group rounded-xl border border-white/5 bg-[#0D0D0D] p-6 flex flex-col items-center text-center transition-all duration-300 border-[#C6F432]/30 bg-[#1C1D17]"
            >
              <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-white/40 group-hover:text-[#C6F432] group-hover:border-[#C6F432]/20 transition-all duration-300">
                <CreditCard size={18} />
              </div>
              <p className="mt-4 text-[9px] uppercase tracking-[0.2em] text-white/50 group-hover:text-[#C6F432]/80 font-bold transition-colors">
                Pay Penalty
              </p>
              <p className="mt-1 text-base font-bold text-white group-hover:text-white transition-colors">
                Search ticket & pay
              </p>
              <p className="mt-2 text-xs text-white/40 leading-relaxed">
                Enter ticket number and email, then continue to payment.
              </p>
            </Link>

            <Link
              href="/qr/appeal"
              className="group rounded-xl border border-white/5 bg-[#0D0D0D] p-6 flex flex-col items-center text-center transition-all duration-300 border-[#C6F432]/30 bg-[#1C1D17]"
            >
              <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-white/40 group-hover:text-[#C6F432] group-hover:border-[#C6F432]/20 transition-all duration-300">
                <Scale size={18} />
              </div>
              <p className="mt-4 text-[9px] uppercase tracking-[0.2em] text-white/50 group-hover:text-[#C6F432]/80 font-bold transition-colors">
                Appeal
              </p>
              <p className="mt-1 text-base font-bold text-white group-hover:text-white transition-colors">
                Generate dispute link
              </p>
              <p className="mt-2 text-xs text-white/40 leading-relaxed">
                Get the appeal form URL for your ticket and submit evidence.
              </p>
            </Link>
          </div>
        </div>

        <p className="text-center text-[8px] text-white/30 mt-6 uppercase tracking-[0.2em]">
          Official Parking Enforcement & Compliance Portal
        </p>
      </div>
    </div>
  );
}
