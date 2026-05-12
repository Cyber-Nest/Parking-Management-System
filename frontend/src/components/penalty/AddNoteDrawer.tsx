"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, MessageSquarePlus, Info, CheckCircle2 } from "lucide-react";

interface AddNoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
}

export const AddNoteDrawer = ({
  isOpen,
  onClose,
  onSave,
}: AddNoteDrawerProps) => {
  const [note, setNote] = useState("");
  const characterLimit = 500;

  // Reset note when drawer closes
  useEffect(() => {
    if (!isOpen) setNote("");
  }, [isOpen]);

  const handleSave = () => {
    if (note.trim()) {
      onSave(note);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-[var(--color-surface)] shadow-[-20px_0_50px_rgba(0,0,0,0.2)] z-50 border-l border-[var(--color-border)] flex flex-col"
          >
            {/* Header Area */}
            <div className="relative p-8 border-b border-[var(--color-border)] bg-gradient-to-b from-[var(--color-surface-soft)]/50 to-transparent">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
                      <MessageSquarePlus size={20} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-[var(--color-text)]">
                      Internal Note
                    </h2>
                  </div>
                  <p className="text-xs font-medium text-[var(--color-text-secondary)] pl-10">
                    Keep a record for your team. This will not be visible to the
                    customer.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-200 shadow-sm"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Writing Area */}
            <div className="flex-1 p-8 space-y-6">
              <div className="space-y-3 group">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors">
                    Note Content
                  </label>
                  <span
                    className={`text-[10px] font-bold ${note.length > characterLimit ? "text-red-500" : "text-[var(--color-text-muted)]"}`}
                  >
                    {note.length} / {characterLimit}
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    placeholder="Write something helpful for the next agent..."
                    className="w-full min-h-[280px] p-5 rounded-2xl bg-[var(--color-surface-soft)]/30 border-2 border-[var(--color-border)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] outline-none transition-all duration-300 resize-none text-[15px] leading-relaxed shadow-inner"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={characterLimit}
                    autoFocus
                  />

                  {/* Visual hint for internal nature */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-lg pointer-events-none">
                    <Info size={12} className="text-amber-600" />
                    <span className="text-[9px] font-black uppercase text-amber-600 tracking-tighter">
                      Team Only
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips / Guidelines */}
              <div className="p-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)]/20">
                <h4 className="text-[10px] font-black uppercase text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Writing Tips
                </h4>
                <ul className="text-[11px] text-[var(--color-text-secondary)] space-y-1.5 italic">
                  <li>
                    • Mention specific reasons for the penalty waiver/action.
                  </li>
                  <li>• Be concise and clear for future audits.</li>
                </ul>
              </div>
            </div>

            {/* Footer*/}
            <div className="p-8 border-t border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-4 font-bold text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface-soft)]/50 rounded-2xl hover:bg-[var(--color-surface-soft)] transition-all border border-transparent hover:border-[var(--color-border)]"
              >
                Discard
              </button>

              <button
                onClick={handleSave}
                disabled={!note.trim() || note.length > characterLimit}
                className={`flex-[1.5] py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-[0.98]
                  ${
                    !note.trim() || note.length > characterLimit
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-[var(--color-primary)] text-[var(--color-surface)] hover:opacity-90"
                  }`}
              >
                <Plus size={18} />
                Save Note
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
