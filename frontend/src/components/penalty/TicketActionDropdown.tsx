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
  disabled?: boolean;
}

const DropdownItem = ({ icon, label, onClick, success, danger }: any) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold transition-all hover:bg-[var(--color-surface-soft)] ${
      success 
        ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" 
        : danger 
        ? "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" 
        : "text-[var(--color-text-primary)]"
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
  disabled = false,
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
    <div className="relative flex justify-center overflow-visible" ref={menuRef}>
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center transition-all ${
          disabled
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-[var(--color-surface-soft)] active:scale-95"
        }`}
      >
        <MoreVertical size={16} className="sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 sm:top-12 z-50 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden"
            style={{ minWidth: "200px", maxWidth: "280px" }}
          >
            <DropdownItem
              icon={<Ticket size={14} className="sm:w-[15px] sm:h-[15px]" />}
              label="View Details"
              onClick={() => {
                onViewDetails(ticket);
                setOpen(false);
              }}
            />
            <DropdownItem
              icon={<ImageIcon size={14} className="sm:w-[15px] sm:h-[15px]" />}
              label="View Photos"
              onClick={() => {
                onViewPhotos(ticket);
                setOpen(false);
              }}
            />
            <DropdownItem
              icon={<Printer size={14} className="sm:w-[15px] sm:h-[15px]" />}
              label="Reprint Ticket"
              onClick={() => {
                onReprint(ticket);
                setOpen(false);
              }}
            />
            {ticket.status === "Unpaid" && (
              <DropdownItem
                icon={<CheckCircle2 size={14} className="sm:w-[15px] sm:h-[15px]" />}
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
                icon={<Ban size={14} className="sm:w-[15px] sm:h-[15px]" />}
                label="Cancel Ticket"
                danger
                onClick={() => {
                  onCancel(ticket);
                  setOpen(false);
                }}
              />
            )}
            {ticket.status !== "Paid" && ticket.status !== "Cancelled" && (
              <DropdownItem
                icon={<Pencil size={14} className="sm:w-[15px] sm:h-[15px]" />}
                label="Edit Ticket"
                onClick={() => {
                  onEdit(ticket);
                  setOpen(false);
                }}
              />
            )}
            <DropdownItem
              icon={<NotebookPen size={14} className="sm:w-[15px] sm:h-[15px]" />}
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