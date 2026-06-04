import Link from "next/link";

export default function QrLandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-[#111827]/95 p-8 shadow-2xl backdrop-blur-lg">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-[#60a5fa] shadow-inner">
            <span className="text-3xl font-extrabold">P</span>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Parks-Smart</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Penalty Payment & Appeal
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            Scan the Parks-Smart QR code to quickly pay a penalty or file an appeal. Use the search form to look up your ticket and continue with the official Parks-Smart experience.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/pay"
            className="rounded-3xl border border-[#3b82f6]/30 bg-[#1e293b] px-6 py-6 text-center transition hover:border-[#60a5fa]/40 hover:bg-[#172554]"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pay Penalty</p>
            <p className="mt-3 text-xl font-semibold text-white">Search ticket & pay</p>
            <p className="mt-2 text-sm text-slate-400">Enter ticket number and email, then continue to payment.</p>
          </Link>

          <Link
            href="/qr/appeal"
            className="rounded-3xl border border-[#f97316]/30 bg-[#1e293b] px-6 py-6 text-center transition hover:border-[#fb923c]/40 hover:bg-[#172554]"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Appeal</p>
            <p className="mt-3 text-xl font-semibold text-white">Generate dispute link</p>
            <p className="mt-2 text-sm text-slate-400">Get the appeal form URL for your ticket and submit evidence.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
