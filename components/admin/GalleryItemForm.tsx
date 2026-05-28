"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, ArrowRight } from "lucide-react";
import { createGalleryItem, updateGalleryItem, type GalleryFormData } from "@/app/admin/actions/gallery";

type EventType = { id: string; name_he: string };

type Props = {
  eventTypes: EventType[];
  initial?: Partial<GalleryFormData> & { id?: string };
  mode: "new" | "edit";
};

export default function GalleryItemForm({ eventTypes, initial, mode }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  const [form, setForm] = useState<GalleryFormData>({
    title_he: "",
    title_en: "",
    images: [],
    event_type_id: null,
    active: true,
    ...initial,
  });

  const set = <K extends keyof GalleryFormData>(key: K, val: GalleryFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  function addImage() {
    const url = newImageUrl.trim();
    if (!url) return;
    set("images", [...form.images, url]);
    setNewImageUrl("");
  }

  function removeImage(i: number) {
    set("images", form.images.filter((_, idx) => idx !== i));
  }

  function handleSubmit() {
    setError("");
    if (form.images.length === 0) {
      setError("נדרשת לפחות תמונה אחת");
      return;
    }
    startTransition(async () => {
      let res;
      if (mode === "edit" && initial?.id) {
        res = await updateGalleryItem(initial.id, form);
      } else {
        res = await createGalleryItem(form);
      }
      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/admin/gallery");
        router.refresh();
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.push("/admin/gallery")}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowRight size={15} />
        חזרה לגלריה
      </button>

      <div className="space-y-5">
        <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-800 text-sm">פרטים</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">כותרת בעברית</label>
              <input
                value={form.title_he ?? ""}
                onChange={(e) => set("title_he", e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
                placeholder="חתונה חלומית"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">כותרת באנגלית</label>
              <input
                value={form.title_en ?? ""}
                onChange={(e) => set("title_en", e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
                placeholder="Dream Wedding"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">סוג אירוע</label>
            <select
              value={form.event_type_id ?? ""}
              onChange={(e) => set("event_type_id", e.target.value || null)}
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 transition bg-white"
            >
              <option value="">— ללא שיוך —</option>
              {eventTypes.map((et) => (
                <option key={et.id} value={et.id}>{et.name_he}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => set("active", !form.active)}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.active ? "bg-green-500" : "bg-stone-300"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? "right-0.5" : "left-0.5"}`} />
            </button>
            <span className="text-sm text-stone-600">{form.active ? "מוצג בגלריה" : "מוסתר"}</span>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-800 text-sm">תמונות</h2>
          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {form.images.map((url, i) => (
                <div key={i} className="relative group aspect-square bg-stone-100 rounded-xl overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 left-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={11} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1.5 right-1.5 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">ראשי</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addImage()}
              placeholder="https://..."
              className="flex-1 text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
            />
            <button
              onClick={addImage}
              disabled={!newImageUrl.trim()}
              className="flex items-center gap-1.5 text-sm px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              <Plus size={14} />
              הוסף
            </button>
          </div>
        </section>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3 pb-8">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 text-sm px-6 py-3 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-400 text-white rounded-xl font-medium transition-colors"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {mode === "new" ? "צור פריט" : "שמור שינויים"}
          </button>
          <button
            onClick={() => router.push("/admin/gallery")}
            className="text-sm px-6 py-3 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
