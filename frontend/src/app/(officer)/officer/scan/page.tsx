"use client";

import { Children, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FileText, History, Search, ShieldCheck, X } from "lucide-react";
import {
  PlateScanResult,
  VehicleHistory,
  officerEnforcementService,
} from "@/services/officer-enforcement.service";

type ParkingStatus = PlateScanResult["status"];

function statusLabel(status: ParkingStatus | undefined, hasOpenTicket: boolean) {
  if (status === "valid") return "ACTIVE PARKING";
  if (status === "expired") return "EXPIRED PARKING";
  if (status === "not_found" || status === "violation") {
    return hasOpenTicket ? "UNPAID PARKING (OPEN TICKET)" : "UNPAID PARKING";
  }
  return "UNPAID PARKING";
}

function statusDescription(status: PlateScanResult["status"] | undefined, hasOpenTicket: boolean) {
  switch (status) {
    case "valid":
      return "Parking time is still running. Customer has an active paid session.";
    case "expired":
      return "Parking session has ended. Review session and customer details before enforcement.";
    case "violation":
      return "An unpaid or disputed ticket exists for this plate. Issue a new ticket only if appropriate.";
    case "not_found":
      return hasOpenTicket
        ? "No active session. An open enforcement ticket exists for this plate."
        : "No parking session or payment record. Vehicle may be parked without paying.";
    default:
      return "Enter a license plate and search to load vehicle data.";
  }
}

function statusTone(status: ParkingStatus | undefined) {
  switch (status) {
    case "valid":
      return "bg-emerald-50 text-emerald-700";
    case "expired":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-rose-50 text-rose-700";
  }
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function remainingMinutes(endTime: string) {
  const diff = new Date(endTime).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 60000));
}

export default function OfficerScanPage() {
  const searchParams = useSearchParams();
  const [plate, setPlate] = useState(searchParams.get("plate") ?? "");
  const [result, setResult] = useState<PlateScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<VehicleHistory | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState("");

  const activePlate = result?.plate ?? plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const status = result?.status;
  const hasOpenTicket = Boolean(result?.openTicket);
  const isUnpaidParking = status === "not_found" || status === "violation";
  const hasPaidSession = status === "valid" || status === "expired";
  const canIssueTicket = Boolean(result) && status !== "valid";
  const customer = result?.customer;
  const session = result?.session;

  const runSearch = async () => {
    const value = plate.trim();
    if (!value) {
      toast.error("Enter a license plate number.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await officerEnforcementService.scanPlate(value);
      setResult(data);
      setPlate(data.plate);
      setLastCheckedAt(new Date().toLocaleString());
    } catch (error) {
      console.error(error);
      toast.error("Lookup failed. Please check the backend and try again.");
      setResult({
        plate: value.trim().toUpperCase().replace(/[^A-Z0-9]/g, ""),
        status: "not_found",
        session: null,
        openTicket: null,
        recentTickets: [],
        customer: null,
      });
      setLastCheckedAt(new Date().toLocaleString());
    } finally {
      setIsLoading(false);
    }
  };

  const loadVehicleHistory = async () => {
    if (!activePlate) return toast.error("Search a plate first.");
    try {
      const data = await officerEnforcementService.getVehicleHistory(activePlate, 20);
      setHistory(data);
      setShowHistory(true);
    } catch (error) {
      console.error(error);
      toast.error("Vehicle history failed to load");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Plate Lookup</h1>
        <p className="text-sm text-slate-500">Enter a license plate to search and fetch parking data from the database.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">License Plate Number</label>
          <div className="mt-2 flex gap-3">
            <input
              value={plate}
              onChange={(event) => setPlate(event.target.value.toUpperCase())}
              onKeyDown={(event) => {
                if (event.key === "Enter") void runSearch();
              }}
              placeholder="e.g. ABC123"
              className="min-w-0 flex-1 rounded-md border border-slate-200 px-4 py-3 text-lg font-bold outline-none focus:border-[#1062ff]"
            />
            <button
              onClick={() => void runSearch()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-md bg-[#1062ff] px-8 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              <Search size={16} />
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">Manual entry uses the plate number to load sessions, tickets, and payment status.</p>
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-bold">Plate Status</h2>
            <div className={`mb-5 rounded-md py-3 text-center text-sm font-bold ${statusTone(status)}`}>
              {result ? statusLabel(status, hasOpenTicket) : "AWAITING SEARCH"}
            </div>
            <p className="mb-4 text-sm text-slate-600">{statusDescription(status, hasOpenTicket)}</p>
            <div className="grid grid-cols-[1fr_auto] gap-3 text-sm">
              <span className="text-slate-500">License Plate</span>
              <span className="font-bold">{activePlate || "—"}</span>
              {session ? (
                <>
                  <span className="text-slate-500">Location</span>
                  <span className="font-semibold">{session.location_name ?? "Unknown"}</span>
                  <span className="text-slate-500">Plan</span>
                  <span className="font-semibold">{session.plan_name ?? "Standard"}</span>
                  <span className="text-slate-500">Session Status</span>
                  <span className="font-semibold uppercase">{session.status}</span>
                </>
              ) : null}
              {result?.openTicket ? (
                <>
                  <span className="text-slate-500">Open Ticket</span>
                  <span className="font-semibold">{result.openTicket.ticket_number}</span>
                  <span className="text-slate-500">Ticket Status</span>
                  <span className="font-semibold uppercase">{result.openTicket.status}</span>
                </>
              ) : null}
            </div>
          </section>

          {hasPaidSession && session ? (
            <>
              <section className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="mb-4 font-bold">Customer</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Name</dt>
                    <dd className="text-right font-semibold">{"Guest "}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Email</dt>
                    <dd className="text-right font-semibold">{customer?.email ?? session.customer_email ?? "—"}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="mb-4 font-bold">Parking Session</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Session ID</dt>
                    <dd className="font-mono text-xs font-semibold">{session.id}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Start Time</dt>
                    <dd className="text-right font-semibold">{formatDateTime(session.start_time)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Expires At</dt>
                    <dd className="text-right font-semibold">{formatDateTime(session.end_time)}</dd>
                  </div>
                  {status === "valid" ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Time Remaining</dt>
                      <dd className="font-semibold text-emerald-700">{remainingMinutes(session.end_time)} min</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Duration</dt>
                    <dd className="font-semibold">{session.duration_minutes} min</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Payment</dt>
                    <dd className="font-semibold">
                      {session.amount_paid != null
                        ? `$${Number(session.amount_paid).toFixed(2)}${session.payment_method ? ` (${session.payment_method})` : ""}`
                        : "Paid"}
                    </dd>
                  </div>
                  {session.paid_at ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Paid At</dt>
                      <dd className="text-right font-semibold">{formatDateTime(session.paid_at)}</dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            </>
          ) : null}

          {isUnpaidParking && result ? (
            <section className="rounded-lg border border-dashed border-rose-200 bg-rose-50/50 p-5 text-sm text-rose-800">
              {hasOpenTicket ? (
                <p>
                  Open ticket <strong>{result.openTicket?.ticket_number}</strong> ({result.openTicket?.status}) —{" "}
                  {result.openTicket?.reason}. Amount due: ${Number(result.openTicket?.amount ?? 0).toFixed(2)}.
                </p>
              ) : (
                <p>No parking session or payment record exists for this plate. Issue a ticket if enforcement is required.</p>
              )}
            </section>
          ) : null}

          <section className="grid grid-cols-2 gap-3">
            {canIssueTicket ? (
              <Link
                href={
                  activePlate
                    ? `/officer/issue-ticket?plate=${encodeURIComponent(activePlate)}${
                        session?.id ? `&sessionId=${encodeURIComponent(session.id)}` : ""
                      }${
                        session?.location_name
                          ? `&location=${encodeURIComponent(session.location_name)}`
                          : ""
                      }`
                    : "/officer/issue-ticket"
                }
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm font-bold text-[#1062ff]"
              >
                <FileText size={18} />
                Issue Ticket
              </Link>
            ) : (
              <span
                title="Cannot issue a ticket while parking time is still running"
                className="flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 p-4 text-sm font-bold text-slate-400"
              >
                <FileText size={18} />
                Issue Ticket
              </span>
            )}
            <button
              onClick={() => void loadVehicleHistory()}
              disabled={!activePlate}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm font-bold text-[#1062ff] disabled:opacity-50"
            >
              <History size={18} />
              Vehicle History
            </button>
          </section>

          <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
            <ShieldCheck size={20} />
            <div>
              <p className="font-bold">
                {status === "valid"
                  ? "Active parking — issue ticket is disabled while time is running."
                  : status === "expired"
                    ? "Expired parking — review session and customer details before issuing a ticket."
                    : "Unpaid parking — issue a ticket if enforcement is required."}
              </p>
              <p>Last checked: {lastCheckedAt || "Not searched yet"}</p>
            </div>
          </div>
        </aside>
      </div>

      {showHistory && history ? (
        <Modal title={`Vehicle History: ${history.plate}`} onClose={() => setShowHistory(false)}>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto">
            <HistoryBlock title="Sessions" empty="No sessions found">
              {history.sessions.map((item) => (
                <HistoryRow
                  key={item.id}
                  title={`${item.status.toUpperCase()} • ${item.plan_name ?? "Plan"}`}
                  detail={`${item.location_name ?? "Unknown"} • ${formatDateTime(item.start_time)} → ${formatDateTime(item.end_time)} • ${item.duration_minutes} min${
                    item.amount_paid != null ? ` • Paid $${Number(item.amount_paid).toFixed(2)}` : ""
                  }`}
                />
              ))}
            </HistoryBlock>
            <HistoryBlock title="Tickets" empty="No tickets found">
              {history.tickets.map((ticket) => (
                <HistoryRow
                  key={ticket.id}
                  title={`${ticket.ticket_number} • ${ticket.status.toUpperCase()}`}
                  detail={`${ticket.reason} • $${Number(ticket.amount).toFixed(2)} • Officer: ${ticket.officer_name} • ${formatDateTime(ticket.date_issued)}`}
                />
              ))}
            </HistoryBlock>
            <HistoryBlock title="Evidence" empty="No evidence found">
              {history.evidence.map((item) => (
                <HistoryRow
                  key={item.id}
                  title={item.reason}
                  detail={`${item.officer_name ?? "Officer"} • ${formatDateTime(item.uploaded_at)}`}
                />
              ))}
            </HistoryBlock>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <section className="w-full max-w-xl rounded-lg bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200">
            <X size={16} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function HistoryBlock({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const hasChildren = Children.count(children) > 0;
  return (
    <section>
      <h3 className="mb-2 text-sm font-bold text-slate-900">{title}</h3>
      <div className="space-y-2">{hasChildren ? children : <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">{empty}</p>}</div>
    </section>
  );
}

function HistoryRow({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-3 text-sm">
      <p className="font-bold text-slate-900">{title}</p>
      <p className="text-slate-500">{detail}</p>
    </div>
  );
}
