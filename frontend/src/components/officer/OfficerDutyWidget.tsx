"use client";

import { useOfficerShift } from "@/hooks/useOfficerShift";

export function OfficerDutyWidget({ compact = false }: { compact?: boolean }) {
  const {
    onDuty,
    loading,
    ending,
    liveLabel,
    startedAtLabel,
    startShift,
    endShift,
  } = useOfficerShift();

  if (loading) {
    return (
      <div className={compact ? "text-xs text-slate-500" : "m-5 rounded-lg bg-white/10 p-4 text-sm text-white/70"}>
        Loading shift...
      </div>
    );
  }

  if (!onDuty) {
    return (
      <div className={compact ? "" : "m-5 rounded-lg bg-slate-500/20 p-4 text-sm"}>
        {!compact ? <p className="mb-2 text-xs text-white/60">Off duty</p> : null}
        <button
          type="button"
          onClick={() => void startShift()}
          className="w-full rounded-md bg-emerald-500 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
        >
          Start Shift
        </button>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "m-5 rounded-lg bg-emerald-500/15 p-4 text-sm"}>
      {!compact ? (
        <>
          <div className="mb-2 flex items-center gap-2 text-emerald-300">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
            On Duty
          </div>
          <p className="text-xs text-white/60">Since {startedAtLabel ?? "--"}</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums">{liveLabel}</p>
          <button
            type="button"
            onClick={() => void endShift()}
            disabled={ending}
            className="mt-3 w-full rounded-md border border-rose-400/40 py-2 text-xs font-semibold text-rose-300 disabled:opacity-50"
          >
            {ending ? "Ending..." : "End Shift"}
          </button>
        </>
      ) : (
        <span className="font-mono text-sm font-bold tabular-nums text-emerald-700">{liveLabel}</span>
      )}
    </div>
  );
}
