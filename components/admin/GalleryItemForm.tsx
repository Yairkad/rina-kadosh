"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import { createGalleryItem, updateGalleryItem, type GalleryFormData } from "@/app/admin/actions/gallery";

type EventType = { id: string; name_he: string };

type Props = {
  mode: "new" | "edit";
  id?: string;
  initial?: Partial<GalleryFormData>;
  eventTypes: EventType[];
};

export default function GalleryItemForm({ mode, id, initial, eventTypes }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [titleHe, setTitleHe] = useState(initial?.title_he ?? "");
  const [titleEn, setTitleEn] = useState(initial?.title_en ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [eventTypeId, setEventTypeId] = useState<string>(initial?.event_type_id ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const data: GalleryFormData = {
      title_he: titleHe,
      title_en: titleEn,
      images,
      event_type_id: eventTypeId || null,
      active,
    };

    startTransition(async () => {
      try {
        if (mode === "new") {
          await createGalleryItem(data);
        } else {
          await updateGalleryItem(id!, data);
        }
        router.push("/admin/gallery");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה לא צפויה");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {/* Title He */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">כותרת (עברית)</label>
        <input
          type="text"
          value={titleHe}
          onChange={(e) => setTitleHe(e.target.value)}
          placeholder="למשל: חתונה של שרה ומשה"
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
        />
      </div>

      {/* Title En */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">כותרת (אנגלית)</label>
        <input
          type="text"
          value={titleEn}
          onChange={(e) => setTitleEn(e.target.value)}
          placeholder="e.g. Sarah & Moshe Wedding"
          dir="ltr"
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
        />
      </div>

      {/* Event type */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">סוג אירוע (אופציונלי)</label>
        <select
          value={eventTypeId}
          onChange={(e) => setEventTypeId(e.target.value)}
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 bg-white"
        >
          <option value="">— לא מסווג —</option>
          {eventTypes.map((et) => (
            <option key={et.id} value={et.id}>{et.name_he}</option>
          ))}
        </select>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          תמונות
          {images.length > 0 && (
            <span className="mr-2 text-stone-400 font-normal">({images.length}) — הראשונה = ממוזערת</span>
          )}
        </label>
        <ImageUpload
          bucket="gallery"
          folder="items"
          images={images}
          onImagesChange={setImages}
        />
      </div>

      {/* Active */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          className={`relative w-10 h-5 rounded-full transition-colors ${active ? "bg-emerald-500" : "bg-stone-300"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${active ? "right-0.5" : "left-0.5"}`} />
        </button>
        <span className="text-sm text-stone-600">{active ? "פורסם" : "מוסתר"}</span>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending || images.length === 0}
          className="px-6 py-2.5 bg-stone-800 text-white text-sm font-medium rounded-xl hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
        >
          {pending ? "שומר..." : mode === "new" ? "צור פריט" : "שמור שינויים"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/gallery")}
          className="px-6 py-2.5 border border-stone-200 text-stone-600 text-sm rounded-xl hover:bg-stone-50 transition-colors"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
