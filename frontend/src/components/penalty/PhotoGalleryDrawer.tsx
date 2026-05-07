"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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
  photos,
  ticketId,
}: PhotoGalleryDrawerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
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
            className="fixed inset-0 bg-black/90 z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="relative w-full h-full flex flex-col">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/50 to-transparent">
                <div>
                  <h2 className="text-xl font-black text-white">
                    Evidence Photos
                  </h2>
                  <p className="text-sm text-white/70 mt-1">
                    Ticket: {ticketId} • {photos.length} photos
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Main Image */}
              {photos.length > 0 ? (
                <div className="flex-1 flex items-center justify-center p-20">
                  <img
                    src={photos[currentIndex]?.image}
                    alt={`Evidence ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-2xl"
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-white/50 text-lg">No photos available</p>
                </div>
              )}

              {/* Navigation Buttons */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
                  >
                    <ChevronLeft size={24} className="text-white" />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
                  >
                    <ChevronRight size={24} className="text-white" />
                  </button>
                </>
              )}

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
                  <div className="flex justify-center gap-3">
                    {photos.map((photo, idx) => (
                      <button
                        key={photo.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          currentIndex === idx
                            ? "border-[var(--color-primary)] scale-105"
                            : "border-white/30"
                        }`}
                      >
                        <img
                          src={photo.image}
                          alt={`Thumb ${idx + 1}`}
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
