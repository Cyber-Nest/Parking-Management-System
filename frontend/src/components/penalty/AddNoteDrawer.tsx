"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";

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

  const handleSave = () => {
    if (note.trim()) {
      onSave(note);
      setNote("");
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
            className="fixed inset-0 bg-black/40 z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full max-w-[450px] bg-[var(--color-surface)] shadow-2xl z-50 border-l border-[var(--color-border)]"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-soft)]">
                <div>
                  <h2 className="text-xl font-black">Add Internal Note</h2>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Add a note to this penalty ticket
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-[var(--color-border)]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Note Content
                  </label>
                  <textarea
                    placeholder="Enter your note here..."
                    className="input min-h-[200px] resize-none"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[var(--color-border)] flex gap-3 bg-[var(--color-surface-soft)]">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 font-bold text-sm border border-[var(--color-border)] rounded-[var(--radius-md)] hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 px-6"
                >
                  <Plus size={18} />
                  Add Note
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
