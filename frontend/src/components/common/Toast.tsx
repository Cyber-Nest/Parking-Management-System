"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type, isOpen, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const icons = {
    success: <CheckCircle2 size={20} className="text-emerald-500" />,
    error: <XCircle size={20} className="text-red-500" />,
    info: <AlertCircle size={20} className="text-blue-500" />,
  };

  const bgColors = {
    success: "bg-emerald-50 border-emerald-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] min-w-[300px] max-w-[500px]"
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${bgColors[type]}`}>
            {icons[type]}
            <p className="text-sm font-semibold flex-1">{message}</p>
            <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-lg transition-all">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};