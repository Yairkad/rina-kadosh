"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  initialIndex: number;
  title: string;
  onClose: () => void;
};

export default function GalleryLightbox({
  images,
  initialIndex,
  title,
  onClose,
}: Props) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % images.length),
    [images.length]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors z-10"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-xs font-medium tabular-nums">
          {current + 1} / {images.length}
        </div>
      )}

      {/* Image area */}
      <div
        className="relative w-full max-w-4xl px-14 flex items-center justify-center"
        style={{ height: "70vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
            className="relative w-full h-full"
          >
            <Image
              src={images[current]}
              alt={title}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>

      {/* Title + dot nav */}
      <div
        className="mt-5 text-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <p className="text-white/80 font-medium text-sm mb-3">{title}</p>
        )}
        {images.length > 1 && (
          <div className="flex gap-2 justify-center">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  i === current
                    ? "bg-[var(--gold)] scale-125"
                    : "bg-white/30 hover:bg-white/60"
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
