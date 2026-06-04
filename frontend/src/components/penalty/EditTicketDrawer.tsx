"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import type { PenaltyTicket } from "@/services/penalty.service";
import { getTicketById, updateTicket } from "@/services/tickets.service";

interface EditTicketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: PenaltyTicket | null;
  onSaved: () => void;
}

export const EditTicketDrawer = ({ isOpen, onClose, ticket, onSaved }: EditTicketDrawerProps) => {
  const [plate, setPlate] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [due, setDue] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ticket || !isOpen) return;
    const load = async () => {
      try {
        const t = await getTicketById(ticket.id);
        setPlate(String(t.license_plate ?? ""));
        setAmount(String(t.amount ?? ""));
        setReason(String(t.reason ?? ""));
        setDue(t.due_date ? String(t.due_date).slice(0, 10) : "");
        setLocation(String(t.location_name ?? ""));
      } catch {
        setPlate(ticket.plate);
        setAmount(String(ticket.raw?.amount ?? ticket.amount?.replace(/[^0-9.]/g, "") ?? ""));
        setReason(ticket.violation);
        setDue(ticket.dueDate ? String(ticket.dueDate).slice(0, 10) : "");
        setLocation(String(ticket.location ?? ""));
      }
    };
    void load();
  }, [ticket, isOpen]);

  const handleSave = async () => {
    if (!ticket) return;
    const amt = Number(amount);
    if (!plate.trim() || !reason.trim() || !Number.isFinite(amt) || amt <= 0) {
      toast.error("Check plate, amount, and reason");
      return;
    }
    try {
      setSaving(true);
      await updateTicket(ticket.id, {
        license_plate: plate.trim(),
        amount: amt,
        reason: reason.trim(),
        due_date: due.trim() ? `${due.trim()} 23:59:59` : null,
        location_name: location.trim() || null,
      });
      toast.success("Ticket updated");
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!ticket) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
              <h2 className="text-lg font-black">Edit ticket</h2>
              <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-[var(--color-surface-soft)]">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)]">License plate</label>
              <input className="input w-full" value={plate} onChange={(e) => setPlate(e.target.value)} />
              <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)]">Amount (CAD)</label>
              <input className="input w-full" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)]">Reason</label>
              <input className="input w-full" value={reason} onChange={(e) => setReason(e.target.value)} />
              <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)]">Due date</label>
              <input className="input w-full" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)]">Location</label>
              <input className="input w-full" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="flex gap-2 border-t border-[var(--color-border)] p-4">
              <button type="button" onClick={onClose} className="btn flex-1 border border-[var(--color-border)]">
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSave()}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
