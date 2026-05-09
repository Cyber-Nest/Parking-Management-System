"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { EvidencePhoto } from "@/services/penalty.service";

interface PhotoGalleryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  photos: EvidencePhoto[];
  ticketId: string;
}

export const PhotoGalleryDrawer = ({
  isOpen,
  onClose,
  photos = [],
  ticketId,
}: PhotoGalleryDrawerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 pointer-events-none"
          >
            {/* Gallery Frame */}
            <div className="relative w-full max-w-4xl h-auto aspect-video flex flex-col bg-[var(--color-surface)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-border)] pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 px-5 border-b border-[var(--color-border)] bg-[var(--color-surface)] z-20 relative">
                <div className="flex items-center gap-3">
                  <Camera
                    size={18}
                    className="text-[var(--color-text-muted)]"
                  />
                  <div>
                    <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">
                      Evidence Gallery
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Ticket ID:{" "}
                      <span className="font-mono text-[var(--color-text)]">
                        {ticketId}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Counter */}
                  <div className="px-3 py-1 bg-[var(--color-surface-soft)] rounded-full text-xs font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                    {currentIndex + 1} / {photos.length}
                  </div>

                  {/* Close */}
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--color-surface-soft)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Main Image View Area */}
              <div className="flex-1 relative flex items-center justify-center p-6 md:p-10 bg-[var(--color-surface-soft)] z-10 overflow-hidden">
                {photos.length > 0 ? (
                  <img
                    src={photos[currentIndex]?.image}
                    alt={`Evidence photo ${currentIndex + 1} for ticket ${ticketId}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-md border border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                ) : (
                  <div className="text-center text-[var(--color-text-muted)] p-10 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-inner">
                    <Camera
                      size={40}
                      className="mx-auto mb-3"
                      strokeWidth={1}
                    />
                    <p className="text-sm">No photos available</p>
                  </div>
                )}

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={goPrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--color-surface)]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[var(--color-surface)] transition-all border border-[var(--color-border)] shadow text-[var(--color-text)] active:scale-95"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={goNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--color-surface)]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[var(--color-surface)] transition-all border border-[var(--color-border)] shadow text-[var(--color-text)] active:scale-95"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Dock */}
              {photos.length > 1 && (
                <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] z-20 relative">
                  <div className="flex justify-center gap-2 max-w-full overflow-x-auto pb-1 custom-scrollbar-minimal">
                    {photos.map((photo, idx) => (
                      <button
                        key={photo.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                          currentIndex === idx
                            ? "ring-2 ring-[var(--color-primary)] scale-105 shadow"
                            : "opacity-70 ring-1 ring-[var(--color-border)] hover:opacity-100 hover:ring-[var(--color-border-hover)]"
                        }`}
                      >
                        <img
                          src={photo.image}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
