"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Edit3, Eye, FileText, Filter, MoreVertical, Printer, Search, ShieldCheck, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import { getReviewBlockMessage } from "@/lib/officer-ticket-review";
import { fileToDataUrl } from "@/lib/upload-media";
import { OfficerTicket, officerEnforcementService } from "@/services/officer-enforcement.service";
import { PAYMENT_METHOD_OPTIONS } from "@/services/payments.service";

const currentOfficerName = "Officer John";
const tabOptions = [
  { id: "my", label: "My Tickets" },
  { id: "all", label: "All Tickets" },
  { id: "unpaid", label: "Unpaid Tickets" },
  { id: "disputed", label: "Disputed Tickets" },
  { id: "cancelled", label: "Cancelled Tickets" },
] as const;

type TicketTabId = (typeof tabOptions)[number]["id"];

const isTicketTab = (value: string | null): value is TicketTabId =>
  tabOptions.some((tab) => tab.id === value);

export default function OfficerTicketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<OfficerTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<OfficerTicket | null>(null);
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TicketTabId>(
    isTicketTab(tabFromUrl) ? tabFromUrl : "my",
  );
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [violationFilter, setViolationFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState<"payment" | "evidence" | "review" | "view" | "edit" | "delete" | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [transactionRef, setTransactionRef] = useState<string>(`OFFICER-${Date.now()}`);
  const [editForm, setEditForm] = useState({
    licensePlate: "",
    violationType: "",
    fineAmount: "",
    locationName: "",
    dueDate: "",
  });
  const [evidenceNote, setEvidenceNote] = useState<string>("");
  const evidenceFileRef = useRef<HTMLInputElement>(null);
  const [reviewNote, setReviewNote] = useState<string>("Send to review");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isTicketTab(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, activeTab]);

  const selectTab = (tabId: TicketTabId) => {
    setActiveTab(tabId);
    router.replace(`/officer/tickets?tab=${tabId}`, { scroll: false });
  };

  useEffect(() => {
    setIsLoading(true);
    officerEnforcementService
      .getTickets({
        limit: 100,
        status: statusFilter || undefined,
        violationType: violationFilter || undefined,
        location: locationFilter || undefined,
        search: searchText || undefined,
        fromDate: dateFrom || undefined,
        toDate: dateTo || undefined,
      })
      .then((items) => {
        setTickets(items);
        setSelectedTicket(items[0] ?? null);
      })
      .finally(() => setIsLoading(false));
  }, [statusFilter, violationFilter, locationFilter, searchText, dateFrom, dateTo]);

  const filteredTickets = useMemo(() => {
    const active = tickets.filter((ticket) => {
      if (activeTab === "my") {
        return ticket.officer_name === currentOfficerName;
      }
      if (activeTab !== "all") {
        return ticket.status === activeTab;
      }
      return true;
    });
    if (!searchText.trim()) return active;
    const query = searchText.trim().toLowerCase();
    return active.filter((ticket) =>
      [ticket.ticket_number, ticket.license_plate, ticket.reason, ticket.location_name]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [activeTab, tickets, searchText]);

  const totals = useMemo(
    () => ({
      unpaid: tickets.filter((t) => t.status === "unpaid").length,
      paid: tickets.filter((t) => t.status === "paid").length,
      disputed: tickets.filter((t) => t.status === "disputed").length,
      cancelled: tickets.filter((t) => t.status === "cancelled").length,
      total: tickets.length,
    }),
    [tickets],
  );

  const actionStatus = selectedTicket?.status ?? "unpaid";
  const [isSaving, setIsSaving] = useState(false);

  const reloadTickets = async () => {
    setIsLoading(true);
    const items = await officerEnforcementService.getTickets({
      limit: 100,
      status: statusFilter || undefined,
      violationType: violationFilter || undefined,
      location: locationFilter || undefined,
      search: searchText || undefined,
      fromDate: dateFrom || undefined,
      toDate: dateTo || undefined,
    });
    setTickets(items);
    setSelectedTicket((current) => {
      if (!current) return items[0] ?? null;
      return items.find((item) => item.id === current.id) ?? items[0] ?? null;
    });
    setIsLoading(false);
  };

  const printTicket = async () => {
    if (!selectedTicket) return;
    await officerEnforcementService.getTicketPrint(selectedTicket.id);
    window.print();
  };

  const openPaymentModal = () => {
    setPaymentMethod("cash");
    setTransactionRef(`OFFICER-${Date.now()}`);
    setModalType("payment");
  };

  const openTicketModal = async (ticket: OfficerTicket, type: "view" | "edit" | "delete") => {
    setOpenActionId(null);
    setSelectedTicket(ticket);
    try {
      const freshTicket = await officerEnforcementService.getTicket(ticket.id);
      setSelectedTicket(freshTicket);
      if (type === "edit") {
        setEditForm({
          licensePlate: freshTicket.license_plate,
          violationType: freshTicket.reason,
          fineAmount: String(Number(freshTicket.amount || 0)),
          locationName: freshTicket.location_name ?? "",
          dueDate: freshTicket.due_date ? new Date(freshTicket.due_date).toISOString().slice(0, 10) : "",
        });
      }
    } catch {
      if (type === "edit") {
        setEditForm({
          licensePlate: ticket.license_plate,
          violationType: ticket.reason,
          fineAmount: String(Number(ticket.amount || 0)),
          locationName: ticket.location_name ?? "",
          dueDate: ticket.due_date ? new Date(ticket.due_date).toISOString().slice(0, 10) : "",
        });
      }
    }
    setModalType(type);
  };

  const openEvidenceModal = () => {
    setEvidenceNote("");
    setEvidencePreview(null);
    setEvidenceError(null);
    setModalType("evidence");
  };

  const handleEvidenceFilePick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setEvidencePreview(dataUrl);
    } catch {
      setEvidencePreview(null);
    } finally {
      event.target.value = "";
    }
  };

  const submitEvidence = async () => {
    if (!selectedTicket || !evidencePreview) return;
    try {
      setIsSaving(true);
      const ticketFolder = `parksmart/officer/tickets/${selectedTicket.ticket_number}`;
      const [photoUrl] = await officerEnforcementService.uploadPhotosForSubmit(
        [evidencePreview],
        ticketFolder,
      );
      await officerEnforcementService.addTicketEvidence(selectedTicket.id, {
        photos: [photoUrl],
        note: evidenceNote.trim() || undefined,
      });
      await reloadTickets();
      setModalType(null);
      setEvidencePreview(null);
      setEvidenceError(null);
    } catch (error) {
      setEvidenceError(getApiErrorMessage(error, "Unable to add evidence. Please try again."));
    } finally {
      setIsSaving(false);
    }
  };

  const openReviewModal = () => {
    setReviewNote("Send to review");
    setReviewError(getReviewBlockMessage(selectedTicket));
    setModalType("review");
  };

  const submitPayment = async () => {
    if (!selectedTicket) return;
    if (!paymentMethod.trim()) {
      toast.error("Payment method is required.");
      return;
    }
    try {
      setIsSaving(true);
      await officerEnforcementService.payTicket(selectedTicket.id, {
        payment_method: paymentMethod.trim(),
        transaction_ref: transactionRef.trim() || undefined,
      });
      await reloadTickets();
      setModalType(null);
      toast.success("Payment recorded successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to record payment. Please check the details and try again."));
    } finally {
      setIsSaving(false);
    }
  };


  const submitReview = async () => {
    if (!selectedTicket) return;
    const block = getReviewBlockMessage(selectedTicket);
    if (block) {
      setReviewError(block);
      return;
    }
    if (!reviewNote.trim()) {
      setReviewError("Review note is required.");
      return;
    }
    try {
      setIsSaving(true);
      setReviewError(null);
      await officerEnforcementService.reviewTicket(selectedTicket.id, reviewNote.trim());
      await reloadTickets();
      setModalType(null);
    } catch (error) {
      setReviewError(getApiErrorMessage(error, "Unable to send ticket to review."));
    } finally {
      setIsSaving(false);
    }
  };

  const submitEdit = async () => {
    if (!selectedTicket) return;
    if (!editForm.licensePlate.trim() || !editForm.violationType.trim()) {
      toast.error("Plate and violation are required.");
      return;
    }
    if (!Number.isFinite(Number(editForm.fineAmount)) || Number(editForm.fineAmount) <= 0) {
      toast.error("Fine amount must be greater than zero.");
      return;
    }
    try {
      setIsSaving(true);
      const updated = await officerEnforcementService.updateTicket(selectedTicket.id, {
        licensePlate: editForm.licensePlate.trim(),
        violationType: editForm.violationType.trim(),
        fineAmount: Number(editForm.fineAmount),
        locationName: editForm.locationName.trim() || undefined,
        dueDate: editForm.dueDate || undefined,
      });
      setSelectedTicket(updated);
      await reloadTickets();
      setModalType("view");
      toast.success("Ticket updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update ticket."));
    } finally {
      setIsSaving(false);
    }
  };

  const submitDelete = async () => {
    if (!selectedTicket) return;
    try {
      setIsSaving(true);
      await officerEnforcementService.deleteTicket(selectedTicket.id);
      await reloadTickets();
      setModalType(null);
      toast.success("Ticket deleted.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete ticket."));
    } finally {
      setIsSaving(false);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Ticket #", "Plate", "Violation", "Location", "Amount", "Status", "Issued On"],
      ...filteredTickets.map((ticket) => [
        ticket.ticket_number,
        ticket.license_plate,
        ticket.reason,
        ticket.location_name ?? "",
        `$${Number(ticket.amount).toFixed(2)}`,
        ticket.status,
        new Date(ticket.date_issued).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "officer-tickets.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #ticket-print-section,
          #ticket-print-section * {
            visibility: visible !important;
          }
          #ticket-print-section {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 12mm;
            background: white;
            color: black;
            font-family: "Courier New", monospace;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .ticket-print-header {
            margin-bottom: 12px;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>

      <div id="ticket-print-section" className="hidden">
        {selectedTicket ? (
          <div className="ticket-print-header">
            <h1 className="text-lg font-bold">Ticket #{selectedTicket.ticket_number}</h1>
            <p className="text-sm">Issued to {selectedTicket.license_plate}</p>
            <p className="text-sm">Location: {selectedTicket.location_name ?? "Unknown"}</p>
            <p className="text-sm">Officer: {selectedTicket.officer_name}</p>
            <p className="text-sm">Issued: {new Date(selectedTicket.date_issued).toLocaleString()}</p>
          </div>
        ) : null}
        {selectedTicket ? (
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-bold">Violation</p>
              <p>{selectedTicket.reason}</p>
            </div>
            <div>
              <p className="font-bold">Amount</p>
              <p>${Number(selectedTicket.amount).toFixed(2)}</p>
            </div>
            <div>
              <p className="font-bold">Due Date</p>
              <p>{selectedTicket.due_date ? new Date(selectedTicket.due_date).toLocaleDateString() : "N/A"}</p>
            </div>
            {selectedTicket.note ? (
              <div>
                <p className="font-bold">Notes</p>
                <p>{selectedTicket.note}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-sm text-slate-500">View, filter and manage issued enforcement tickets.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            <Download size={16} /> Export
          </button>
          <button onClick={printTicket} disabled={!selectedTicket} className="inline-flex items-center gap-2 rounded-md bg-[#1062ff] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            <Printer size={16} /> Print Ticket
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap gap-2">
          {tabOptions.map((tab) => (
            <button
              key={tab.id}
              onClick={() => selectTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === tab.id ? "bg-[#1062ff] text-white" : "bg-slate-100 text-slate-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Unpaid Violations</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{totals.unpaid}</p>
              <p className="mt-2 text-sm text-slate-500">Tickets still awaiting payment</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Paid Violations</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{totals.paid}</p>
              <p className="mt-2 text-sm text-slate-500">Closed payment records</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Disputed</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{totals.disputed}</p>
              <p className="mt-2 text-sm text-slate-500">Tickets sent for review</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total Tickets</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{totals.total}</p>
              <p className="mt-2 text-sm text-slate-500">Records in current query</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="grid gap-3 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-500">Search</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <Search size={16} className="text-slate-400" />
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Search ticket #, plate, violation"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500">Status</label>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                  <option value="">All Statuses</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="disputed">Disputed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500">Violation Type</label>
                <input value={violationFilter} onChange={(event) => setViolationFilter(event.target.value)} placeholder="No Parking, Expired Meter" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500">Location</label>
                <input value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} placeholder="Main St. Zone A" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
              </div>

              <div className="grid gap-2">
                <label className="block text-xs font-semibold text-slate-500">Date Range</label>
                <div className="flex gap-2">
                  <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                  <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:hidden">
            {isLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                Loading tickets...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                No tickets matched your filters.
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`rounded-3xl border bg-white p-4 shadow-sm transition ${
                    selectedTicket?.id === ticket.id ? "border-[#1062ff] ring-1 ring-[#1062ff]/20" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                      <p className="text-sm font-semibold text-slate-900">{ticket.ticket_number}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {ticket.license_plate} · {ticket.location_name ?? "Unknown"}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">{new Date(ticket.date_issued).toLocaleString()}</p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenActionId((current) => (current === ticket.id ? null : ticket.id));
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                        aria-label={`Actions for ticket ${ticket.ticket_number}`}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openActionId === ticket.id ? (
                        <div className="absolute right-0 top-12 z-20 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl">
                          <button type="button" onClick={() => void openTicketModal(ticket, "view")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <Eye size={14} /> View
                          </button>
                          <button type="button" onClick={() => void openTicketModal(ticket, "edit")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <Edit3 size={14} /> Edit
                          </button>
                          <button type="button" onClick={() => void openTicketModal(ticket, "delete")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2 py-1">{ticket.officer_name}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">{ticket.reason}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">${Number(ticket.amount).toFixed(2)}</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${ticket.status === "paid" ? "bg-emerald-50 text-emerald-700" : ticket.status === "disputed" ? "bg-amber-50 text-amber-700" : ticket.status === "cancelled" ? "bg-slate-100 text-slate-700" : "bg-rose-50 text-rose-700"}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden md:block overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <table className="min-w-[1120px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Ticket ID</th>
                  <th className="px-5 py-3">Ticket #</th>
                  <th className="px-5 py-3">Plate</th>
                  <th className="px-5 py-3">Officer</th>
                  <th className="px-5 py-3">Violation</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-10 text-center text-sm text-slate-500">
                      Loading tickets...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-10 text-center text-sm text-slate-500">
                      No tickets matched your filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50" onClick={() => setSelectedTicket(ticket)}>
                      <td className="px-5 py-4 font-mono text-xs text-slate-600">{ticket.id.slice(0, 8)}…</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{ticket.ticket_number}</td>
                      <td className="px-5 py-4">{ticket.license_plate}</td>
                      <td className="px-5 py-4">{ticket.officer_name}</td>
                      <td className="px-5 py-4">{ticket.reason}</td>
                      <td className="px-5 py-4">{ticket.location_name ?? "Unknown"}</td>
                      <td className="px-5 py-4 text-slate-500">{new Date(ticket.date_issued).toLocaleString()}</td>
                      <td className="px-5 py-4 font-semibold">${Number(ticket.amount).toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${ticket.status === "paid" ? "bg-emerald-50 text-emerald-700" : ticket.status === "disputed" ? "bg-amber-50 text-amber-700" : ticket.status === "cancelled" ? "bg-slate-100 text-slate-700" : "bg-rose-50 text-rose-700"}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="relative px-5 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setOpenActionId((current) => (current === ticket.id ? null : ticket.id))}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                          aria-label={`Actions for ticket ${ticket.ticket_number}`}
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openActionId === ticket.id ? (
                          <div className="absolute right-5 top-12 z-20 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl">
                            <button type="button" onClick={() => void openTicketModal(ticket, "view")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                              <Eye size={14} /> View
                            </button>
                            <button type="button" onClick={() => void openTicketModal(ticket, "edit")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                              <Edit3 size={14} /> Edit
                            </button>
                            <button type="button" onClick={() => void openTicketModal(ticket, "delete")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Ticket Details</p>
                <p className="text-xs text-slate-500">Selected record summary and actions.</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-xs font-semibold text-[#1062ff]">
                Clear
              </button>
            </div>
            {selectedTicket ? (
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Ticket ID</p>
                      <p className="mt-1 font-mono text-xs text-slate-600">{selectedTicket.id}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">Ticket Number</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">{selectedTicket.ticket_number}</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{selectedTicket.status.toUpperCase()}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">Issued on {new Date(selectedTicket.date_issued).toLocaleString()}</p>
                  {selectedTicket.status === 'disputed' ? (
                    <p className="mt-3 text-sm font-semibold text-amber-700">Review requested</p>
                  ) : null}
                </div>
                <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                  <DetailRow label="License Plate" value={selectedTicket.license_plate} />
                  <DetailRow label="Violation" value={selectedTicket.reason} />
                  <DetailRow label="Location" value={selectedTicket.location_name ?? "Unknown"} />
                  <DetailRow label="Officer" value={selectedTicket.officer_name} />
                  <DetailRow label="Amount" value={`$${Number(selectedTicket.amount).toFixed(2)}`} />
                  <DetailRow label="Due Date" value={selectedTicket.due_date ? new Date(selectedTicket.due_date).toLocaleDateString() : "N/A"} />
                  {selectedTicket.note ? <DetailRow label="Remarks" value={selectedTicket.note} /> : null}
                </div>
                <div className="grid gap-3">
                  <button onClick={printTicket} disabled={!selectedTicket} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1062ff] py-3 text-sm font-semibold text-white disabled:opacity-50">
                    <Printer size={16} /> Print Ticket
                  </button>
                  <button onClick={openPaymentModal} disabled={!selectedTicket || isSaving} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 disabled:opacity-50">
                    <ShieldCheck size={16} /> Add Payment
                  </button>
                  <button onClick={openEvidenceModal} disabled={!selectedTicket || isSaving} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 disabled:opacity-50">
                    <FileText size={16} /> Add Evidence
                  </button>
                  <button onClick={openReviewModal} disabled={!selectedTicket || isSaving} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 disabled:opacity-50">
                    <Filter size={16} /> Send to Review
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Select a ticket to view details and actions.
              </div>
            )}
          </div>
        </aside>
      </div>
      {modalType ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {modalType === 'view' ? 'Ticket Details' : modalType === 'edit' ? 'Edit Ticket' : modalType === 'delete' ? 'Delete Ticket' : modalType === 'payment' ? 'Record Payment' : modalType === 'evidence' ? 'Add Evidence' : 'Send Ticket to Review'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {modalType === 'view' ? 'Review the full ticket record.' : modalType === 'edit' ? 'Update ticket fields and save changes.' : modalType === 'delete' ? 'Confirm this ticket should be removed from active work.' : modalType === 'payment' ? 'Enter payment details for this ticket.' : modalType === 'evidence' ? 'Attach evidence to the selected ticket.' : 'Add a review note for this ticket.'}
                </p>
              </div>
              <button onClick={() => setModalType(null)} className="text-sm font-semibold text-slate-500 hover:text-slate-900">Close</button>
            </div>

            {modalType === 'view' && selectedTicket ? (
              <div className="mt-6 max-h-[70vh] space-y-4 overflow-y-auto pr-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Ticket Number</p>
                      <p className="mt-1 text-xl font-bold text-slate-900">{selectedTicket.ticket_number}</p>
                    </div>
                    <button type="button" onClick={() => setModalType(null)} className="rounded-full p-2 text-slate-500 hover:bg-white">
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <DetailRow label="Ticket ID" value={selectedTicket.id} />
                <DetailRow label="License Plate" value={selectedTicket.license_plate} />
                <DetailRow label="Violation" value={selectedTicket.reason} />
                <DetailRow label="Location" value={selectedTicket.location_name ?? "Unknown"} />
                <DetailRow label="Officer" value={selectedTicket.officer_name} />
                <DetailRow label="Amount" value={`$${Number(selectedTicket.amount).toFixed(2)}`} />
                <DetailRow label="Status" value={selectedTicket.status} />
                <DetailRow label="Issued" value={new Date(selectedTicket.date_issued).toLocaleString()} />
                <DetailRow label="Due Date" value={selectedTicket.due_date ? new Date(selectedTicket.due_date).toLocaleDateString() : "N/A"} />
                {selectedTicket.note ? <DetailRow label="Notes" value={selectedTicket.note} /> : null}
                {selectedTicket.photos?.length ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500">Evidence</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedTicket.photos.map((photo) => (
                        <img key={photo} src={photo} alt="Ticket evidence" className="h-36 w-full rounded-2xl object-cover" />
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setModalType(null)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Close</button>
                  <button onClick={() => void openTicketModal(selectedTicket, "edit")} className="rounded-2xl bg-[#1062ff] px-5 py-3 text-sm font-semibold text-white">Edit</button>
                </div>
              </div>
            ) : modalType === 'edit' && selectedTicket ? (
              <div className="mt-6 max-h-[70vh] space-y-4 overflow-y-auto pr-2">
                <label className="block text-xs font-semibold text-slate-500">License Plate</label>
                <input value={editForm.licensePlate} onChange={(event) => setEditForm((form) => ({ ...form, licensePlate: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                <label className="block text-xs font-semibold text-slate-500">Violation</label>
                <input value={editForm.violationType} onChange={(event) => setEditForm((form) => ({ ...form, violationType: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                <label className="block text-xs font-semibold text-slate-500">Fine Amount</label>
                <input type="number" min="0" step="0.01" value={editForm.fineAmount} onChange={(event) => setEditForm((form) => ({ ...form, fineAmount: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                <label className="block text-xs font-semibold text-slate-500">Location</label>
                <input value={editForm.locationName} onChange={(event) => setEditForm((form) => ({ ...form, locationName: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                <label className="block text-xs font-semibold text-slate-500">Due Date</label>
                <input type="date" value={editForm.dueDate} onChange={(event) => setEditForm((form) => ({ ...form, dueDate: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setModalType(null)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button>
                  <button onClick={() => void submitEdit()} disabled={isSaving} className="rounded-2xl bg-[#1062ff] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Save Changes</button>
                </div>
              </div>
            ) : modalType === 'delete' && selectedTicket ? (
              <div className="mt-6 space-y-4">
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  Delete ticket {selectedTicket.ticket_number}? This will mark the ticket as cancelled so it no longer behaves like an active violation.
                </p>
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setModalType(null)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button>
                  <button onClick={() => void submitDelete()} disabled={isSaving} className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Delete</button>
                </div>
              </div>
            ) : modalType === 'payment' ? (
              <div className="mt-6 space-y-4">
                <label className="block text-xs font-semibold text-slate-500">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                >
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <label className="block text-xs font-semibold text-slate-500">Transaction Reference</label>
                <input value={transactionRef} onChange={(event) => setTransactionRef(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="Reference" />
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setModalType(null)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button>
                  <button onClick={submitPayment} disabled={isSaving} className="rounded-2xl bg-[#1062ff] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Save Payment</button>
                </div>
              </div>
            ) : modalType === 'evidence' ? (
              <div className="mt-6 space-y-4">
                <input ref={evidenceFileRef} type="file" accept="image/*" className="hidden" onChange={(event) => void handleEvidenceFilePick(event)} />
                <label className="block text-xs font-semibold text-slate-500">Evidence Photo</label>
                <button
                  type="button"
                  onClick={() => evidenceFileRef.current?.click()}
                  disabled={isSaving}
                  className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm font-semibold text-[#1062ff] disabled:opacity-50"
                >
                  Browse photo (uploads when you click Add Evidence)
                </button>
                {evidencePreview ? (
                  <img src={evidencePreview} alt="Evidence preview" className="max-h-48 w-full rounded-2xl object-cover" />
                ) : null}
                <label className="block text-xs font-semibold text-slate-500">Note</label>
                <textarea value={evidenceNote} onChange={(event) => setEvidenceNote(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="Optional note" rows={4} />
                {evidenceError ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
                    {evidenceError}
                  </p>
                ) : null}
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setModalType(null)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button>
                  <button
                    onClick={() => void submitEvidence()}
                    disabled={isSaving || !evidencePreview}
                    className="rounded-2xl bg-[#1062ff] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Add Evidence
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {reviewError ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
                    {reviewError}
                  </p>
                ) : null}
                <label className="block text-xs font-semibold text-slate-500">Review Note</label>
                <textarea
                  value={reviewNote}
                  onChange={(event) => {
                    setReviewNote(event.target.value);
                    if (reviewError) setReviewError(null);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                  rows={4}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setModalType(null)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button>
                  <button
                    onClick={submitReview}
                    disabled={isSaving || Boolean(getReviewBlockMessage(selectedTicket))}
                    className="rounded-2xl bg-[#1062ff] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Send Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
