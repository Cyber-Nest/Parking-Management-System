"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  StickyNote,
  Lock,
  Users,
  Globe,
  Check,
  Save,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

interface AddNoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string, visibility: string) => void;
  editingNote?: { id: string; content: string; visibility: string } | null;
}

const visibilityOptions = [
  {
    value: "internal",
    label: "Internal",
    icon: <Lock size={14} />,
    desc: "Only staff can see",
  },
  {
    value: "manager_only",
    label: "Manager Only",
    icon: <Shield size={14} />,
    desc: "Restricted access",
  },
  {
    value: "public",
    label: "Public",
    icon: <Globe size={14} />,
    desc: "Visible to everyone",
  },
];

function Shield({ size, className }: { size: number; className?: string }) {
  return <Users size={size} className={className} />;
}

export const AddNoteDrawer = ({
  isOpen,
  onClose,
  onSave,
  editingNote,
}: AddNoteDrawerProps) => {
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState("internal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when editingNote changes or drawer opens
  useEffect(() => {
    if (isOpen) {
      setNote(editingNote?.content || "");
      setVisibility(editingNote?.visibility || "internal");
    }
  }, [isOpen, editingNote]);

  const handleSave = async () => {
    if (!note.trim()) {
      toast.error("Please enter a note content");
      return;
    }
    try {
      setIsSubmitting(true);
      await onSave(note, visibility);
      setNote("");
      onClose();
    } finally {
      setIsSubmitting(false);
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
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--color-surface)] shadow-[-20px_0_50px_rgba(0,0,0,0.2)] z-50 border-l border-[var(--color-border)] flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[var(--color-surface)]/80 backdrop-blur-md z-10 flex items-center justify-between px-8 py-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">
                    {editingNote ? "Update" : "Add New"}{" "}
                    <span className="text-[var(--color-primary)]">Note</span>
                  </h2>
                  <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    {editingNote
                      ? "Modify existing record"
                      : "Log a new observation"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="p-2 rounded-full hover:bg-[var(--color-surface-soft)] transition-all active:scale-90 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
              {/* Textarea Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                    Note Content
                  </label>
                  <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
                    {note.length} characters
                  </span>
                </div>
                <div className="relative group">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write something important about this vehicle..."
                    rows={8}
                    disabled={isSubmitting}
                    className="w-full bg-[var(--color-surface-soft)] border-2 border-[var(--color-border)] rounded-2xl p-4 text-sm font-medium outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all resize-none placeholder:text-[var(--color-text-muted)]/50 disabled:opacity-50"
                  />
                  <div className="absolute bottom-3 right-3 opacity-20 pointer-events-none group-focus-within:opacity-10 transition-opacity">
                    <StickyNote size={40} />
                  </div>
                </div>
              </div>

              {/* Visibility Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                  Access Level
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {visibilityOptions.map((opt) => {
                    const isSelected = visibility === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setVisibility(opt.value)}
                        disabled={isSubmitting}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left disabled:opacity-50 ${
                          isSelected
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm"
                            : "border-[var(--color-border)] bg-transparent hover:bg-[var(--color-surface-soft)]"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2.5 rounded-xl transition-colors ${
                              isSelected
                                ? "bg-[var(--color-primary)] text-white"
                                : "bg-[var(--color-surface-soft)] text-[var(--color-text-muted)]"
                            }`}
                          >
                            {opt.icon}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-black ${isSelected ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}
                            >
                              {opt.label}
                            </p>
                            <p className="text-[10px] font-medium text-[var(--color-text-muted)] mt-0.5">
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white">
                            <Check size={12} strokeWidth={4} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3.5 font-black text-xs uppercase tracking-widest border-2 border-[var(--color-border)] rounded-2xl hover:bg-[var(--color-surface-soft)] transition-all active:scale-[0.98]"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-[1.5] bg-[var(--color-primary)] text-white flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {editingNote ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    {editingNote ? <Save size={16} /> : <Plus size={16} />}
                    {editingNote ? "Update Record" : "Save Note"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
