"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Search, ShieldCheck, CircleDot } from "lucide-react";
import {
  OfficerSession,
  officerEnforcementService,
} from "@/services/officer-enforcement.service";

const STATUS_FILTERS = [
  { value: "All", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Expiring Soon", label: "Expiring Soon" },
  { value: "Issue", label: "Ticket Issued" },
] as const;
const SORT_OPTIONS = ["Start Time Latest", "Expiry Time Soonest", "Plate Number"] as const;
type ProcessedOfficerSession = OfficerSession & {
  remainingMs: number;
  status: "Active" | "Expiring Soon" | "Ticket Issued";
  timeLeftLabel: string;
};

export default function OfficerSessionsPage() {
  const [sessions, setSessions] = useState<OfficerSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ProcessedOfficerSession | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]["value"]>("All");
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]>("Start Time Latest");

  useEffect(() => {
    officerEnforcementService.getSessions({ limit: 100 }).then(setSessions);
  }, []);

  const now = useMemo(() => Date.now(), [sessions.length]);

  const processedSessions = useMemo(
    () =>
      sessions.map((session): ProcessedOfficerSession => {
        const expiresAt = new Date(session.end_time).getTime();
        const remainingMs = expiresAt - now;
        const isExpiring = remainingMs > 0 && remainingMs <= 10 * 60 * 1000;
        const status =
          session.status === "active"
            ? isExpiring
              ? "Expiring Soon"
              : "Active"
            : session.status === "issue"
            ? "Ticket Issued"
            : "Ticket Issued";
        return {
          ...session,
          remainingMs,
          status,
          timeLeftLabel: remainingMs > 0 ? formatDuration(remainingMs) : "Expired",
        };
      }),
    [sessions, now]
  );

  const filteredSessions = useMemo(
    () =>
      processedSessions
        .filter((session) => {
          if (statusFilter !== "All") {
            const expected = statusFilter === "Issue" ? "Ticket Issued" : statusFilter;
            if (session.status !== expected) return false;
          }
          if (!searchText.trim()) return true;
          const query = searchText.trim().toLowerCase();
          return (
            session.license_plate.toLowerCase().includes(query) ||
            session.id.toLowerCase().includes(query) ||
            String(session.location_name ?? "").toLowerCase().includes(query) ||
            String(session.plan_name ?? "").toLowerCase().includes(query)
          );
        })
        .sort((a, b) => {
          if (sortBy === "Start Time Latest") return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
          if (sortBy === "Expiry Time Soonest") return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
          return a.license_plate.localeCompare(b.license_plate);
        }),
    [processedSessions, searchText, statusFilter, sortBy]
  );

  const summary = useMemo(() => {
    const activeCount = processedSessions.filter((session) => session.status === "Active").length;
    const expiringCount = processedSessions.filter((session) => session.status === "Expiring Soon").length;
    const locationCount = new Set(processedSessions.map((session) => session.location_name ?? "Unknown")).size;
    return { activeCount, expiringCount, locationCount };
  }, [processedSessions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Active Sessions</h1>
        <p className="text-sm text-slate-500">Monitor current parking sessions with a fast side-panel review.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr]">
            <div className="grid gap-3 md:grid-cols-3">
              <StatCard
                label="Active"
                value={summary.activeCount.toString()}
                description="Sessions currently in progress"
              />
              <StatCard
                label="Expiring"
                value={summary.expiringCount.toString()}
                description="Sessions near expiry"
              />
              <StatCard
                label="Locations"
                value={summary.locationCount.toString()}
                description="Unique active zones"
              />
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Search and filters</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Search size={18} className="text-slate-400" />
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Plate, session ID, location"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as any)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                  >
                    {STATUS_FILTERS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as any)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Plate</th>
                  <th className="px-5 py-3">Session ID</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Start</th>
                  <th className="px-5 py-3">Expires</th>
                  <th className="px-5 py-3">Time Left</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => setSelectedSession(session)}
                  >
                    <td className="px-5 py-4 font-semibold text-slate-900">{session.license_plate}</td>
                    <td className="px-5 py-4 text-slate-500">{session.id}</td>
                    <td className="px-5 py-4 text-slate-700">{session.location_name ?? "Unknown"}</td>
                    <td className="px-5 py-4 text-slate-500">{new Date(session.start_time).toLocaleString()}</td>
                    <td className="px-5 py-4 text-slate-500">{new Date(session.end_time).toLocaleString()}</td>
                    <td className="px-5 py-4 text-slate-700">{session.timeLeftLabel}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          session.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : session.status === "Expiring Soon"
                            ? "bg-amber-50 text-amber-700"
                            : session.status === "Ticket Issued"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        <CircleDot size={10} />
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Session details</p>
                <p className="text-xs text-slate-500">Select a session to inspect more details.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {filteredSessions.length} shown
              </span>
            </div>
            {selectedSession ? (
              <div className="space-y-4">
                <DetailRow label="Plate" value={selectedSession.license_plate} />
                <DetailRow label="Session ID" value={selectedSession.id} />
                <DetailRow label="Location" value={selectedSession.location_name ?? "Unknown"} />
                <DetailRow label="Start Time" value={new Date(selectedSession.start_time).toLocaleString()} />
                <DetailRow label="Expires At" value={new Date(selectedSession.end_time).toLocaleString()} />
                <DetailRow label="Time Remaining" value={selectedSession.timeLeftLabel} />
                <DetailRow label="Zone" value={selectedSession.plan_name ?? "Standard"} />
                <div className="grid gap-3">
                  <Link href="/officer/map" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1062ff] py-3 text-sm font-semibold text-white">
                    View on Map
                  </Link>
                  <Link
                    href={`/officer/scan?plate=${encodeURIComponent(selectedSession.license_plate)}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700"
                  >
                    Lookup Plate
                  </Link>
                  <Link
                    href={`/officer/issue-ticket?plate=${encodeURIComponent(selectedSession.license_plate)}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-700"
                  >
                    Issue Ticket
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Select an active session to review details.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3 text-slate-900">
              <ShieldCheck size={18} className="text-emerald-600" />
              <div>
                <p className="text-sm font-semibold">Assigned patrol zone</p>
                <p className="text-xs text-slate-500">Only active sessions within your assigned area are displayed.</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              Use the filters to narrow results, then click a session to see enforcement actions and details.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function formatDuration(ms: number) {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
}

function StatCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
      <span className="block text-xs uppercase tracking-[0.24em] text-slate-500">{label}</span>
      <span className="mt-1 block font-semibold text-slate-900">{value}</span>
    </div>
  );
}
