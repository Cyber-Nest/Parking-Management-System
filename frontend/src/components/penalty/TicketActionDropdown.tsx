"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreVertical,
  Ticket,
  ImageIcon,
  Printer,
  CheckCircle2,
  Ban,
  Pencil,
  NotebookPen,
} from "lucide-react";
import { PenaltyTicket } from "@/services/penalty.service";

interface TicketActionDropdownProps {
  ticket: PenaltyTicket;
  onViewDetails: (ticket: PenaltyTicket) => void;
  onViewPhotos: (ticket: PenaltyTicket) => void;
  onReprint: (ticket: PenaltyTicket) => void;
  onMarkPaid: (ticket: PenaltyTicket) => void;
  onCancel: (ticket: PenaltyTicket) => void;
  onEdit: (ticket: PenaltyTicket) => void;
  onAddNote: (ticket: PenaltyTicket) => void;
}

const DropdownItem = ({ icon, label, onClick, success, danger }: any) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold hover:bg-[var(--color-surface-soft)] transition-all ${
      success ? "text-emerald-600" : danger ? "text-red-500" : ""
    }`}
  >
    {icon}
    {label}
  </button>
);

export const TicketActionDropdown = ({
  ticket,
  onViewDetails,
  onViewPhotos,
  onReprint,
  onMarkPaid,
  onCancel,
  onEdit,
  onAddNote,
}: TicketActionDropdownProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative flex justify-center" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-surface-soft)] transition-all"
      >
        <MoreVertical size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-12 z-50 w-56 bg-white border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden"
          >
            <DropdownItem
              icon={<Ticket size={15} />}
              label="View Details"
              onClick={() => {
                onViewDetails(ticket);
                setOpen(false);
              }}
            />
            <DropdownItem
              icon={<ImageIcon size={15} />}
              label="View Photos"
              onClick={() => {
                onViewPhotos(ticket);
                setOpen(false);
              }}
            />
            <DropdownItem
              icon={<Printer size={15} />}
              label="Reprint Ticket"
              onClick={() => {
                onReprint(ticket);
                setOpen(false);
              }}
            />
            {ticket.status === "Unpaid" && (
              <DropdownItem
                icon={<CheckCircle2 size={15} />}
                label="Mark Paid"
                success
                onClick={() => {
                  onMarkPaid(ticket);
                  setOpen(false);
                }}
              />
            )}
            {ticket.status !== "Cancelled" && (
              <DropdownItem
                icon={<Ban size={15} />}
                label="Cancel Ticket"
                danger
                onClick={() => {
                  onCancel(ticket);
                  setOpen(false);
                }}
              />
            )}
            {ticket.status !== "Paid" && (
              <DropdownItem
                icon={<Pencil size={15} />}
                label="Edit Ticket"
                onClick={() => {
                  onEdit(ticket);
                  setOpen(false);
                }}
              />
            )}
            <DropdownItem
              icon={<NotebookPen size={15} />}
              label="Add Note"
              onClick={() => {
                onAddNote(ticket);
                setOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
