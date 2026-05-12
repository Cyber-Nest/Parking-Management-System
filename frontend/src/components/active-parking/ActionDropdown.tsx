"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Eye, RefreshCw, Ban, Flag } from "lucide-react";
import { ParkingSession } from "@/services/parking.service";

interface ActionDropdownProps {
  session: ParkingSession;
  onView: (session: ParkingSession) => void;
  onExtend: (session: ParkingSession) => void;
  onCancel: (session: ParkingSession) => void;
  onIssue: (session: ParkingSession) => void;
  disabled?: boolean;
}

const MenuItem = ({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold transition-all hover:bg-[var(--color-surface-soft)] ${
      danger
        ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        : "text-[var(--color-text-primary)]"
    }`}
  >
    {icon}
    {label}
  </button>
);

export const ActionDropdown = ({
  session,
  onView,
  onExtend,
  onCancel,
  onIssue,
  disabled = false,
}: ActionDropdownProps) => {
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
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center transition-all ${
          disabled
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-[var(--color-surface-soft)] active:scale-95"
        }`}
      >
        <MoreVertical
          size={16}
          className="sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px]"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-10 sm:top-12 z-50 w-48 sm:w-52 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden"
          >
            <MenuItem
              icon={<Eye size={14} className="sm:w-[15px] sm:h-[15px]" />}
              label="View Details"
              onClick={() => {
                onView(session);
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<RefreshCw size={14} className="sm:w-[15px] sm:h-[15px]" />}
              label="Extend Session"
              onClick={() => {
                onExtend(session);
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<Ban size={14} className="sm:w-[15px] sm:h-[15px]" />}
              label="Cancel Session"
              onClick={() => {
                onCancel(session);
                setOpen(false);
              }}
              danger
            />
            <MenuItem
              icon={<Flag size={14} className="sm:w-[15px] sm:h-[15px]" />}
              label="Mark Issue"
              onClick={() => {
                onIssue(session);
                setOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
