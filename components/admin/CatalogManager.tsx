"use client";

import { useState, useTransition, useEffect } from "react";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import Link from "next/link";
import {
  Plus, ChevronDown, ChevronUp, Pencil, Trash2,
  Loader2, Check, X, Package, ExternalLink,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import {
  createEventType, updateEventType, deleteEventType,
  createDesignStyle, updateDesignStyle, deleteDesignStyle,
  quickCreateProduct,
} from "@/app/admin/actions/catalog";

type ItemStatus = "draft" | "published" | "archived";

type EventType = { id: string; name_he: string; name_en: string; slug: string; display_order: number; status: ItemStatus; image?: string | null; atmosphere_image?: string | null };
type DesignStyle = { id: string; event_type_id: string; name_he: string; name_en: string; slug: string; display_order: number; status: ItemStatus; atmosphere_image?: string | null };
type Product = { id: string; name_he: string; status: string; design_style_id: string | null; event_type_id: string | null };
type FormData = { name_he: string; name_en: string; display_order: number; status: ItemStatus; event_type_id?: string };

const EMPTY_FORM: FormData = { name_he: "", name_en: "", display_order: 0, status: "published" };

const STATUS_COLORS: Record<ItemStatus, string> = {
  draft: "bg-stone-100 text-stone-500",
  published: "bg-green-100 text-green-700",
  archived: "bg-red-100 text-red-600",
};
const STATUS_LABELS: Record<ItemStatus, string> = { draft: "טיוטה", published: "פעיל", archived: "ארכיון" };

function toSlug(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function ItemForm({ initial, onSave, onCancel, loading, error, label, showImage, showAtmosphereImage }: {
  initial: FormData & { image?: string | null; atmosphere_image?: string | null };
  onSave: (d: FormData & { image?: string | null; atmosphere_image?: string | null }) => void;
  onCancel: () => void; loading: boolean; error: string; label: string; showImage?: boolean; showAtmosphereImage?: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form, v: string | number | null) => setForm((f) => ({ ...f, [k]: v }));

  const { scheduleTranslate } = useAutoTranslate();

  useEffect(() => {
    scheduleTranslate("name", form.name_he, form.name_en, (t) =>
      setForm((f) => (f.name_en.trim() ? f : { ...f, name_en: t }))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name_he]);

  return (
    <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-3">
      <p className="text-xs font-semibold text-stone-600">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-stone-500 mb-1">שם בעברית</label>
          <input value={form.name_he} onChange={(e) => set("name_he", e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="חתונה" />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">שם באנגלית</label>
          <input value={form.name_en} onChange={(e) => set("name_en", e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="Wedding" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-stone-500 mb-1">Slug</label>
          <input value={form.name_en ? toSlug(form.name_en) : ""} readOnly
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-100 bg-stone-100 text-stone-400 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">סדר תצוגה</label>
          <input type="number" value={form.display_order} onChange={(e) => set("display_order", Number(e.target.value))}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-stone-500 mb-1.5">סטטוס</label>
        <div className="flex gap-2">
          {(["published", "draft"] as ItemStatus[]).map((s) => (
            <button key={s} type="button" onClick={() => set("status", s)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${form.status === s ? `${STATUS_COLORS[s]} border-current ring-1 ring-current ring-offset-1` : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"}`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
      {showImage && (
        <div>
          <label className="block text-xs text-stone-500 mb-1.5">תמונת כרטיס (דף הבית)</label>
          <ImageUpload
            bucket="catalog"
            folder="events"
            value={form.image}
            onUpload={(url) => set("image", url)}
            onRemove={() => set("image", null)}
          />
        </div>
      )}
      {showAtmosphereImage && (
        <div>
          <label className="block text-xs text-stone-500 mb-1.5">תמונת אווירה (ראש עמוד קטגוריה)</label>
          <p className="text-xs text-stone-400 mb-2">תמונה רחבה / GIF — ממולץ 1920×800px, מתחת ל-3MB</p>
          <ImageUpload
            bucket="catalog"
            folder="atmosphere"
            value={form.atmosphere_image}
            onUpload={(url) => set("atmosphere_image", url)}
            onRemove={() => set("atmosphere_image", null)}
          />
        </div>
      )}

      {error && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="flex gap-2">
        <button onClick={() => onSave(form)} disabled={loading || !form.name_he || !form.name_en}
          className="flex items-center gap-1.5 text-sm px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:bg-stone-300 transition-colors">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} שמור
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 text-sm px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors">
          <X size={14} /> ביטול
        </button>
      </div>
    </div>
  );
}

function QuickProductForm({ onSave, onCancel, loading, error }: {
  onSave: (d: { name_he: string; name_en: string; price_per_unit: number }) => void;
  onCancel: () => void; loading: boolean; error: string;
}) {
  const [form, setForm] = useState({ name_he: "", name_en: "", price_per_unit: "" });

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3 mt-2">
      <p className="text-xs font-semibold text-stone-600">מוצר חדש (טיוטה)</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-stone-500 mb-1">שם בעברית *</label>
          <input value={form.name_he} onChange={(e) => setForm((f) => ({ ...f, name_he: e.target.value }))}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="הגדת שבת" />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">שם באנגלית *</label>
          <input value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="Shabbat Booklet" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-stone-500 mb-1">מחיר ליחידה (₪) *</label>
        <input type="number" min={0} step={0.01} value={form.price_per_unit}
          onChange={(e) => setForm((f) => ({ ...f, price_per_unit: e.target.value }))}
          className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="25" />
      </div>
      {error && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ name_he: form.name_he, name_en: form.name_en, price_per_unit: Number(form.price_per_unit) })}
          disabled={loading || !form.name_he || !form.name_en || !form.price_per_unit}
          className="flex items-center gap-1.5 text-sm px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:bg-stone-300 transition-colors">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} צור מוצר
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 text-sm px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors">
          <X size={14} /> ביטול
        </button>
      </div>
    </div>
  );
}

export default function CatalogManager({ initialEventTypes, initialStyles, initialProducts }: {
  initialEventTypes: EventType[]; initialStyles: DesignStyle[]; initialProducts: Product[];
}) {
  const [expanded, setExpanded]         = useState<string | null>(null);
  const [expandedStyle, setExpandedStyle] = useState<string | null>(null);
  const [editingEventType, setEditingEventType] = useState<string | null>(null);
  const [addingEventType, setAddingEventType]   = useState(false);
  const [editingStyle, setEditingStyle]         = useState<string | null>(null);
  const [addingStyleFor, setAddingStyleFor]     = useState<string | null>(null);
  const [addingProductFor, setAddingProductFor] = useState<string | null>(null);
  const [isPending, startTransition]            = useTransition();
  const [formError, setFormError]               = useState("");

  function handleAction(fn: () => Promise<{ error?: string; success?: boolean }>) {
    setFormError("");
    startTransition(async () => {
      const res = await fn();
      if (res?.error) {
        setFormError(res.error);
      } else {
        setEditingEventType(null);
        setAddingEventType(false);
        setEditingStyle(null);
        setAddingStyleFor(null);
        setAddingProductFor(null);
      }
    });
  }

  const stylesFor    = (etId: string)  => initialStyles.filter((s) => s.event_type_id === etId);
  const productsFor  = (styleId: string) => initialProducts.filter((p) => p.design_style_id === styleId);

  return (
    <div className="space-y-3">
      {!addingEventType && (
        <button onClick={() => setAddingEventType(true)}
          className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 border border-dashed border-stone-300 rounded-xl px-4 py-3 w-full hover:bg-stone-50 transition-colors">
          <Plus size={16} /> הוסף סוג אירוע
        </button>
      )}

      {addingEventType && (
        <ItemForm label="סוג אירוע חדש" initial={{ ...EMPTY_FORM, display_order: initialEventTypes.length }}
          loading={isPending} error={formError}
          onCancel={() => { setAddingEventType(false); setFormError(""); }}
          onSave={(data) => handleAction(() => createEventType(data))} />
      )}

      {initialEventTypes.map((et) => {
        const isExpanded = expanded === et.id;
        const styles = stylesFor(et.id);

        return (
          <div key={et.id} className={`rounded-2xl border overflow-hidden transition-all ${isExpanded ? "border-stone-300 shadow-sm" : "border-stone-200 bg-white"}`}>

            {/* ── Event Type Header ── */}
            {editingEventType === et.id ? (
              <div className="p-4 bg-white">
                <ItemForm label="עריכת סוג אירוע" showImage
                  initial={{ name_he: et.name_he, name_en: et.name_en, display_order: et.display_order, status: et.status, image: et.image }}
                  loading={isPending} error={formError}
                  onCancel={() => { setEditingEventType(null); setFormError(""); }}
                  onSave={(data) => handleAction(() => updateEventType(et.id, data))} />
              </div>
            ) : (
              <div className={`flex items-center gap-3 px-5 py-4 border-r-4 border-stone-700 ${isExpanded ? "bg-stone-800 text-white" : "bg-white hover:bg-stone-50"} transition-colors group/header`}>
                <button onClick={() => setExpanded(isExpanded ? null : et.id)}
                  className="flex-1 flex items-center gap-3 text-right min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-base ${isExpanded ? "text-white" : "text-stone-800"}`}>{et.name_he}</span>
                      <span className={`text-sm ${isExpanded ? "text-stone-300" : "text-stone-400"}`}>/ {et.name_en}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isExpanded ? "bg-white/20 text-white" : STATUS_COLORS[et.status]}`}>
                        {STATUS_LABELS[et.status]}
                      </span>
                    </div>
                    <div className={`text-xs mt-0.5 ${isExpanded ? "text-stone-400" : "text-stone-400"}`}>
                      {styles.length} סגנונות · {initialProducts.filter(p => p.event_type_id === et.id).length} מוצרים
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-stone-300 shrink-0" /> : <ChevronDown size={16} className="text-stone-400 shrink-0" />}
                </button>
                <button onClick={() => { setEditingEventType(et.id); setExpanded(et.id); }}
                  className={`p-1.5 rounded-lg transition-colors ${isExpanded ? "text-stone-300 hover:text-white hover:bg-white/20" : "text-stone-400 hover:text-stone-700 hover:bg-stone-100"}`}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => { if (window.confirm(`למחוק את "${et.name_he}"? לא ניתן לשחזר.`)) handleAction(() => deleteEventType(et.id)); }} disabled={isPending}
                  className={`p-1.5 rounded-lg transition-colors ${isExpanded ? "text-stone-300 hover:text-red-300 hover:bg-white/20" : "text-stone-400 hover:text-red-600 hover:bg-red-50"}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {/* ── Design Styles Section ── */}
            {isExpanded && editingEventType !== et.id && (
              <div className="bg-stone-50 px-5 py-4 space-y-2 border-t border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">סגנונות עיצוב</span>
                </div>

                {styles.length === 0 && !addingStyleFor && (
                  <p className="text-sm text-stone-400 py-2">אין סגנונות עדיין</p>
                )}

                {styles.map((style) => {
                  const styleProducts = productsFor(style.id);
                  const isStyleExpanded = expandedStyle === style.id;

                  return (
                    <div key={style.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                      {editingStyle === style.id ? (
                        <div className="p-3">
                          <ItemForm label="עריכת סגנון" showAtmosphereImage
                            initial={{ name_he: style.name_he, name_en: style.name_en, display_order: style.display_order, status: style.status, event_type_id: et.id, atmosphere_image: style.atmosphere_image }}
                            loading={isPending} error={formError}
                            onCancel={() => { setEditingStyle(null); setFormError(""); }}
                            onSave={(data) => handleAction(() => updateDesignStyle(style.id, data))} />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 px-4 py-3 border-r-2 border-stone-300">
                            <button onClick={() => setExpandedStyle(isStyleExpanded ? null : style.id)}
                              className="flex-1 flex items-center gap-2 text-right min-w-0">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold text-stone-700">{style.name_he}</span>
                                  <span className="text-xs text-stone-400">/ {style.name_en}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[style.status]}`}>
                                    {STATUS_LABELS[style.status]}
                                  </span>
                                </div>
                                <div className="text-xs text-stone-400 mt-0.5">
                                  {styleProducts.length} מוצרים
                                </div>
                              </div>
                              {isStyleExpanded ? <ChevronUp size={14} className="text-stone-300 shrink-0" /> : <ChevronDown size={14} className="text-stone-300 shrink-0" />}
                            </button>
                            <button onClick={() => setEditingStyle(style.id)}
                              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => { if (window.confirm(`למחוק את "${style.name_he}"? לא ניתן לשחזר.`)) handleAction(() => deleteDesignStyle(style.id)); }} disabled={isPending}
                              className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Products sub-section */}
                          {isStyleExpanded && (
                            <div className="px-4 pb-3 pt-1 border-t border-stone-100 bg-stone-50/60 space-y-1.5">
                              {styleProducts.length === 0 && !addingProductFor && (
                                <p className="text-xs text-stone-400 py-1">אין מוצרים בסגנון זה</p>
                              )}

                              {styleProducts.map((p) => (
                                <div key={p.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white transition-colors group">
                                  <Package size={13} className="text-stone-300 shrink-0" />
                                  <span className="text-xs text-stone-700 flex-1">{p.name_he}</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_COLORS[p.status as ItemStatus] ?? "bg-stone-100 text-stone-500"}`}>
                                    {STATUS_LABELS[p.status as ItemStatus] ?? p.status}
                                  </span>
                                  <Link href={`/admin/products/${p.id}`}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-stone-400 hover:text-stone-700 transition-all">
                                    <ExternalLink size={12} />
                                  </Link>
                                </div>
                              ))}

                              {addingProductFor === style.id ? (
                                <QuickProductForm
                                  loading={isPending} error={formError}
                                  onCancel={() => { setAddingProductFor(null); setFormError(""); }}
                                  onSave={(data) => handleAction(() => quickCreateProduct({
                                    ...data,
                                    event_type_id: et.id,
                                    design_style_id: style.id,
                                  }))} />
                              ) : (
                                <div className="flex gap-2 pt-1">
                                  <button onClick={() => setAddingProductFor(style.id)}
                                    className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 border border-dashed border-stone-200 rounded-lg px-3 py-1.5 hover:bg-white transition-colors">
                                    <Plus size={12} /> הוסף מוצר
                                  </button>
                                  <Link href={`/admin/products?event=${et.id}&style=${style.id}`}
                                    className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-white transition-colors">
                                    <ExternalLink size={12} /> ראה הכל
                                  </Link>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                {addingStyleFor === et.id ? (
                  <ItemForm label="סגנון חדש"
                    initial={{ ...EMPTY_FORM, display_order: styles.length, event_type_id: et.id }}
                    loading={isPending} error={formError}
                    onCancel={() => { setAddingStyleFor(null); setFormError(""); }}
                    onSave={(data) => handleAction(() => createDesignStyle({ ...data, event_type_id: et.id }))} />
                ) : (
                  <button onClick={() => setAddingStyleFor(et.id)}
                    className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-800 border border-dashed border-stone-200 rounded-lg px-3 py-2 w-full hover:bg-stone-100 transition-colors mt-1">
                    <Plus size={13} /> הוסף סגנון
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {initialEventTypes.length === 0 && !addingEventType && (
        <div className="text-center py-16 text-stone-400 text-sm">אין סוגי אירועים עדיין</div>
      )}
    </div>
  );
}
