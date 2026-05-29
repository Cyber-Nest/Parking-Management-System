"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, MoreVertical, Printer, Search, ShieldCheck, Trash2, TriangleAlert, X } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import { getReviewBlockMessage } from "@/lib/officer-ticket-review";
import {
  OfficerTicket,
  officerEnforcementService,
} from "@/services/officer-enforcement.service";

export default function OfficerViolationsPage() {
  const [tickets, setTickets] = useState<OfficerTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<OfficerTicket | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"view" | "edit" | "delete" | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [pendingReviewTicket, setPendingReviewTicket] = useState<OfficerTicket | null>(null);
  const [editForm, setEditForm] = useState({
    licensePlate: "",
    violationType: "",
    fineAmount: "",
    locationName: "",
    dueDate: "",
  });
  const [reviewNote, setReviewNote] = useState("Review requested");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const reloadTickets = async () => {
    const items = await officerEnforcementService.getTickets({ limit: 100 });
    setTickets(items);
    setSelectedTicket((current) => {
      if (!current) return items[0] ?? null;
      return items.find((item) => item.id === current.id) ?? items[0] ?? null;
    });
  };

  useEffect(() => {
    reloadTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    if (!searchText.trim()) return tickets;
    const query = searchText.trim().toLowerCase();
    return tickets.filter((ticket) =>
      [ticket.ticket_number, ticket.license_plate, ticket.reason, ticket.location_name]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchText, tickets]);

  const printTicket = async (ticket: OfficerTicket) => {
    await officerEnforcementService.getTicketPrint(ticket.id);
    window.open(`/officer/issue-ticket?reprint=${ticket.id}`, "_blank");
  };

  const openReviewModal = (ticket: OfficerTicket) => {
    setPendingReviewTicket(ticket);
    setReviewNote(ticket.status === "disputed" ? "Additional review note" : "Review requested");
    setReviewError(getReviewBlockMessage(ticket));
    setIsReviewModalOpen(true);
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

  const submitEdit = async () => {
    if (!selectedTicket) return;
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

  const submitReview = async () => {
    if (!pendingReviewTicket) return;
    const block = getReviewBlockMessage(pendingReviewTicket);
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
      await officerEnforcementService.reviewTicket(pendingReviewTicket.id, reviewNote.trim());
      await reloadTickets();
      setIsReviewModalOpen(false);
      setPendingReviewTicket(null);
    } catch (error) {
      setReviewError(getApiErrorMessage(error, "Unable to send ticket for review."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Violations</h1>
        <p className="text-sm text-slate-500">Issued tickets, payment status, and reprint actions.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Stat label="Open Tickets" value={tickets.filter((t) => t.status === "unpaid").length} />
            <Stat label="Paid Tickets" value={tickets.filter((t) => t.status === "paid").length} />
            <Stat label="Total Fines" value={`$${tickets.reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2)}`} />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <label className="block text-xs font-semibold text-slate-500">Search violations</label>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={16} className="text-slate-400" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search ticket #, plate, location"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Ticket</th>
                  <th className="px-5 py-3">Plate</th>
                  <th className="px-5 py-3">Violation</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50" onClick={() => setSelectedTicket(ticket)}>
                    <td className="px-5 py-4 font-bold">{ticket.ticket_number}</td>
                    <td className="px-5 py-4">{ticket.license_plate}</td>
                    <td className="px-5 py-4 text-slate-700">{ticket.reason}</td>
                    <td className="px-5 py-4">{ticket.location_name ?? "Unknown"}</td>
                    <td className="px-5 py-4 font-semibold">${Number(ticket.amount).toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${ticket.status === "paid" ? "bg-emerald-50 text-emerald-600" : ticket.status === "disputed" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-600"}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="relative px-5 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                      <button type="button" onClick={() => setOpenActionId((current) => (current === ticket.id ? null : ticket.id))} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100">
                        <MoreVertical size={16} />
                      </button>
                      {openActionId === ticket.id ? (
                        <div className="absolute right-5 top-12 z-20 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl">
                          <button type="button" onClick={() => void openTicketModal(ticket, "view")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Eye size={14} /> View</button>
                          <button type="button" onClick={() => void openTicketModal(ticket, "edit")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Edit3 size={14} /> Edit</button>
                          <button type="button" onClick={() => void openTicketModal(ticket, "delete")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"><Trash2 size={14} /> Delete</button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Violation details</p>
                <p className="text-xs text-slate-500">Select a ticket to inspect or reprint.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{filteredTickets.length} records</span>
            </div>
            {selectedTicket ? (
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Ticket Number</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">{selectedTicket.ticket_number}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{selectedTicket.status}</span>
                      {selectedTicket.status === 'disputed' ? <p className="text-xs font-semibold text-amber-700">Review requested</p> : null}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">Issued on {new Date(selectedTicket.date_issued).toLocaleString()}</p>
                </div>
                <DetailRow label="License Plate" value={selectedTicket.license_plate} />
                <DetailRow label="Location" value={selectedTicket.location_name ?? "Unknown"} />
                <DetailRow label="Violation" value={selectedTicket.reason} />
                <DetailRow label="Amount" value={`$${Number(selectedTicket.amount).toFixed(2)}`} />
                <div className="grid gap-3">
                  <button onClick={() => printTicket(selectedTicket)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1062ff] py-3 text-sm font-semibold text-white">
                    <Printer size={16} /> Reprint Ticket
                  </button>
                  <button onClick={() => openReviewModal(selectedTicket)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700">
                    <ShieldCheck size={16} /> Review Case
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Choose a violation to see more details and follow-up actions.
              </div>
            )}
          </div>
        </aside>
      {modalType && selectedTicket ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">{modalType === "view" ? "Violation Details" : modalType === "edit" ? "Edit Violation" : "Delete Violation"}</p>
                <p className="mt-1 text-sm text-slate-500">{selectedTicket.ticket_number}</p>
              </div>
              <button onClick={() => setModalType(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            {modalType === "view" ? (
              <div className="mt-6 max-h-[70vh] space-y-4 overflow-y-auto pr-2">
                <DetailRow label="Ticket ID" value={selectedTicket.id} />
                <DetailRow label="License Plate" value={selectedTicket.license_plate} />
                <DetailRow label="Location" value={selectedTicket.location_name ?? "Unknown"} />
                <DetailRow label="Violation" value={selectedTicket.reason} />
                <DetailRow label="Amount" value={`$${Number(selectedTicket.amount).toFixed(2)}`} />
                <DetailRow label="Status" value={selectedTicket.status} />
                <DetailRow label="Issued" value={new Date(selectedTicket.date_issued).toLocaleString()} />
                <DetailRow label="Due Date" value={selectedTicket.due_date ? new Date(selectedTicket.due_date).toLocaleDateString() : "N/A"} />
                {selectedTicket.note ? <DetailRow label="Notes" value={selectedTicket.note} /> : null}
                {selectedTicket.photos?.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedTicket.photos.map((photo) => (
                      <img key={photo} src={photo} alt="Violation evidence" className="h-36 w-full rounded-2xl object-cover" />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : modalType === "edit" ? (
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
            ) : (
              <div className="mt-6 space-y-4">
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Delete violation {selectedTicket.ticket_number}? This will mark it as cancelled.</p>
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setModalType(null)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button>
                  <button onClick={() => void submitDelete()} disabled={isSaving} className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
      {isReviewModalOpen && pendingReviewTicket ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">Review Ticket</p>
                <p className="mt-1 text-sm text-slate-500">Send this violation to the review queue with notes.</p>
              </div>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-sm font-semibold text-slate-500 hover:text-slate-900">Close</button>
            </div>
            <div className="mt-6 space-y-4">
              {reviewError ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
                  {reviewError}
                </p>
              ) : null}
              {pendingReviewTicket?.status === "disputed" ? (
                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  This ticket is already disputed. You can add another review note below.
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
                <button onClick={() => setIsReviewModalOpen(false)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button>
                <button
                  onClick={() => void submitReview()}
                  disabled={isSaving || Boolean(getReviewBlockMessage(pendingReviewTicket))}
                  className="rounded-2xl bg-[#1062ff] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Send Review
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm">
      <span className="block text-xs uppercase tracking-[0.24em] text-slate-500">{label}</span>
      <span className="mt-1 block font-semibold text-slate-900">{value}</span>
    </div>
  );
}
