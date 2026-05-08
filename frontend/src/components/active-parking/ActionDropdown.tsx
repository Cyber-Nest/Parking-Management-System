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
}

const MenuItem = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold hover:bg-[var(--color-surface-soft)] transition-all"
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
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-surface-soft)] transition-all"
      >
        <MoreVertical size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-12 z-50 w-52 bg-white border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden"
          >
            <MenuItem
              icon={<Eye size={15} />}
              label="View Details"
              onClick={() => {
                onView(session);
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<RefreshCw size={15} />}
              label="Extend Session"
              onClick={() => {
                onExtend(session);
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<Ban size={15} />}
              label="Cancel Session"
              onClick={() => {
                onCancel(session);
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<Flag size={15} />}
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
