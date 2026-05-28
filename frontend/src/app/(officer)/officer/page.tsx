"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Car,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Plus,
  QrCode,
  Ticket,
  TriangleAlert,
} from "lucide-react";
import {
  OfficerDashboard,
  officerEnforcementService,
} from "@/services/officer-enforcement.service";
import { formatDutyShort } from "@/services/officer-portal.service";
import { useOfficerShift } from "@/hooks/useOfficerShift";

const money = (value: number) => `$${Number(value ?? 0).toFixed(2)}`;

export default function OfficerDashboardPage() {
  const [dashboard, setDashboard] = useState<OfficerDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileName, setProfileName] = useState("Officer");
  const { liveSeconds, onDuty } = useOfficerShift();

  useEffect(() => {
    const cached = window.localStorage.getItem("officerProfile");
    if (cached) {
      try {
        const p = JSON.parse(cached) as { fullName?: string };
        if (p.fullName) setProfileName(p.fullName);
      } catch {
        /* ignore */
      }
    }
    officerEnforcementService
      .getDashboard()
      .then(setDashboard)
      .finally(() => setIsLoading(false));
  }, []);

  const dutySeconds = onDuty ? liveSeconds : (dashboard?.onDutySeconds ?? 0);

  const stats = useMemo(
    () => [
      { label: "Tickets Issued", value: dashboard?.ticketsToday ?? 0, sub: "Today", icon: Ticket, color: "bg-blue-500", href: "/officer/tickets?tab=my" },
      { label: "Active Parkings", value: dashboard?.activeSessions ?? 0, sub: "Today", icon: Car, color: "bg-emerald-500", href: "/officer/sessions" },
      { label: "Total Collected", value: money(dashboard?.collectedToday ?? 0), sub: "Today", icon: DollarSign, color: "bg-amber-500", href: "/officer/tickets?tab=all" },
      { label: "On Duty Time", value: formatDutyShort(dutySeconds), sub: onDuty ? "Live" : "Today", icon: Clock, color: "bg-violet-500", href: "/officer/settings?tab=account" },
    ],
    [dashboard, dutySeconds, onDuty],
  );

  if (isLoading) {
    return <div className="rounded-lg bg-white p-8 text-sm text-slate-500">Loading officer dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enforcement Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back, {profileName}</p>
        </div>
        {/* <div className="flex gap-2">
          <Link href="/officer/scan" className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">
            <QrCode size={16} />
            Scan QR
          </Link>
          <Link href="/officer/issue-ticket" className="inline-flex items-center gap-2 rounded-md bg-[#1062ff] px-4 py-2 text-sm font-semibold text-white">
            <Plus size={16} />
            New Ticket
          </Link>
        </div> */}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-4">
              <span className={`flex h-12 w-12 items-center justify-center rounded-full ${item.color} text-white`}>
                <item.icon size={22} />
              </span>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-sm font-medium text-slate-600">{item.label}</p>
                <p className="text-xs text-slate-400">{item.sub}</p>
              </div>
            </div>
            <Link href={item.href} className="mt-4 inline-block text-sm font-semibold text-[#1062ff]">View all</Link>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr_0.75fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Recent Scans</h2>
            <Link href="/officer/scan" className="text-sm font-semibold text-[#1062ff]">View all</Link>
          </div>
          <div className="space-y-3">
            {(dashboard?.recentScans ?? []).map((scan) => (
              <div key={`${scan.license_plate}-${scan.checked_at}`} className="flex items-center gap-4 rounded-md border border-slate-100 p-3">
                <CheckCircle2 className="text-emerald-500" size={22} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{scan.license_plate}</p>
                  <p className="text-xs text-slate-500">{scan.location_name ?? "Main St. Zone A"}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">Active</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-bold">Violation Summary (Today)</h2>
          <div className="flex items-center justify-center">
            <div className="flex h-36 w-36 items-center justify-center rounded-full bg-[conic-gradient(#1062ff_0_36%,#f43f5e_36%_58%,#f59e0b_58%_78%,#8b5cf6_78%_100%)]">
              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-2xl font-bold">{dashboard?.ticketsToday ?? 0}</span>
                <span className="text-xs text-slate-500">Total</span>
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {(dashboard?.violationSummary ?? []).slice(0, 4).map((item) => (
              <div key={item.reason} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{item.reason}</span>
                <span className="font-bold">{item.total}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <h2 className="font-bold">Active Parking Session</h2>
          </div>
          <div className="space-y-4 p-5">
            {dashboard?.activeSession ? (
              <>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">ACTIVE</span>
                <h3 className="text-2xl font-bold">{dashboard.activeSession.license_plate}</h3>
                <p className="text-sm text-slate-500">{dashboard.activeSession.location_name ?? "Main St. Zone A"}</p>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-slate-500">Expires At</dt><dd className="font-semibold">{new Date(dashboard.activeSession.end_time).toLocaleString()}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Duration</dt><dd className="font-semibold">{Math.round(dashboard.activeSession.duration_minutes / 60)}h</dd></div>
                </dl>
              </>
            ) : (
              <p className="text-sm text-slate-500">No active session found.</p>
            )}
            <Link href="/officer/scan" className="flex w-full items-center justify-center gap-2 rounded-md border border-[#1062ff] py-2 text-sm font-bold text-[#1062ff]">
              <FileText size={16} />
              View Details
            </Link>
            <Link href="/officer/issue-ticket" className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1062ff] py-2 text-sm font-bold text-white">
              <TriangleAlert size={16} />
              Issue Ticket
            </Link>
          </div>
        </aside>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { href: "/officer/evidence", label: "Take Photo", icon: Camera },
          { href: "/officer/issue-ticket", label: "New Ticket", icon: Ticket },
          { href: "/officer/scan", label: "Plate Lookup", icon: FileText },
          { href: "/officer/evidence", label: "Add Evidence", icon: FileText },
        ].map((action) => (
          <Link key={action.label} href={action.href} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold text-[#1062ff]">
            <action.icon size={20} />
            {action.label}
          </Link>
        ))}
      </section>
    </div>
  );
}
