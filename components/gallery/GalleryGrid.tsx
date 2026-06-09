"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import GalleryLightbox from "./GalleryLightbox";

export type GalleryItem = {
  id: string;
  title_he: string | null;
  title_en: string | null;
  images: string[];
  event_type_id: string | null;
};

export type EventTypeFilter = {
  id: string;
  name_he: string;
  name_en: string;
};

type Props = {
  items: GalleryItem[];
  eventTypes: EventTypeFilter[];
  locale: string;
};

type Lightbox = {
  images: string[];
  index: number;
  title: string;
};

export default function GalleryGrid({ items, eventTypes, locale }: Props) {
  const [filter, setFilter] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<Lightbox | null>(null);
  const isHe = locale === "he";

  const usedEventTypeIds = useMemo(
    () => new Set(items.map((i) => i.event_type_id).filter(Boolean)),
    [items]
  );
  const visibleEventTypes = eventTypes.filter((e) => usedEventTypeIds.has(e.id));

  const filtered = useMemo(
    () => (filter ? items.filter((i) => i.event_type_id === filter) : items),
    [items, filter]
  );

  const openLightbox = (item: GalleryItem) => {
    if (!item.images.length) return;
    setLightbox({
      images: item.images,
      index: 0,
      title: isHe ? (item.title_he ?? "") : (item.title_en ?? ""),
    });
  };

  return (
    <section className="pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Filter tabs */}
      {visibleEventTypes.length > 0 && (
        <div className="flex justify-center flex-wrap gap-2 mb-10">
          <FilterButton
            active={filter === null}
            onClick={() => setFilter(null)}
            label={isHe ? "הכל" : "All"}
          />
          {visibleEventTypes.map((et) => (
            <FilterButton
              key={et.id}
              active={filter === et.id}
              onClick={() => setFilter(et.id)}
              label={isHe ? et.name_he : et.name_en}
            />
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-[var(--muted)] text-sm">
          {isHe ? "הגלריה עדיין ריקה — חזרו בקרוב!" : "Gallery is coming soon!"}
        </div>
      ) : (
        <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                className="group relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer bg-stone-100"
                onClick={() => openLightbox(item)}
              >
                {item.images[0] ? (
                  <Image
                    src={item.images[0]}
                    alt={isHe ? (item.title_he ?? "") : (item.title_en ?? "")}
                    width={600}
                    height={450}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="aspect-[4/3] bg-stone-200" />
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  {(item.title_he || item.title_en) && (
                    <p className="text-white font-semibold text-sm leading-snug">
                      {isHe ? item.title_he : item.title_en}
                    </p>
                  )}
                  {item.images.length > 1 && (
                    <p className="text-white/60 text-xs mt-1">
                      {item.images.length} {isHe ? "תמונות" : "photos"}
                    </p>
                  )}
                </div>

                {/* Multi-image indicator (always visible, top corner) */}
                {item.images.length > 1 && (
                  <div className="absolute top-3 end-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                    1 / {item.images.length}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <GalleryLightbox
            images={lightbox.images}
            initialIndex={lightbox.index}
            title={lightbox.title}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200 ${
        active
          ? "bg-[var(--gold)] text-white border-[var(--gold)]"
          : "border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)]/10"
      }`}
    >
      {label}
    </button>
  );
}
