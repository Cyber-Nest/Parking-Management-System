"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Eye, Receipt, RotateCcw } from "lucide-react";
import { Payment } from "@/services/payment.service";

interface PaymentActionDropdownProps {
  payment: Payment;
  onView: (payment: Payment) => void;
  onReceipt: (payment: Payment) => void;
  onRefund: (payment: Payment) => void;
  disabled?: boolean;
}

const DropdownItem = ({ icon, label, danger, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold transition-all hover:bg-[var(--color-surface-soft)] ${
      danger ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-[var(--color-text-primary)]"
    }`}
  >
    {icon}
    {label}
  </button>
);

export const PaymentActionDropdown = ({
  payment,
  onView,
  onReceipt,
  onRefund,
  disabled = false,
}: PaymentActionDropdownProps) => {
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
        <MoreVertical size={16} className="sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-10 sm:top-12 z-50 w-48 sm:w-52 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden"
          >
            <DropdownItem
              icon={<Eye size={14} className="sm:w-[15px] sm:h-[15px]" />}
              label="View Payment"
              onClick={() => {
                onView(payment);
                setOpen(false);
              }}
            />
            <DropdownItem
              icon={<Receipt size={14} className="sm:w-[15px] sm:h-[15px]" />}
              label="Generate Receipt"
              onClick={() => {
                onReceipt(payment);
                setOpen(false);
              }}
            />
            {/* {payment.status === "Paid" && (
              <DropdownItem
                icon={<RotateCcw size={14} className="sm:w-[15px] sm:h-[15px]" />}
                label="Refund Payment"
                danger
                onClick={() => {
                  onRefund(payment);
                  setOpen(false);
                }}
              />
            )} */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};