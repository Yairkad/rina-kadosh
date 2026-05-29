"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X, ArrowRight } from "lucide-react";
import { createProduct, updateProduct, type ProductFormData } from "@/app/admin/actions/products";
import { saveBOM } from "@/app/admin/actions/materials";

type EventType = { id: string; name_he: string; name_en: string };
type DesignStyle = { id: string; event_type_id: string; name_he: string; name_en: string };
type RawMaterial = { id: string; name_he: string; unit: string };
type BOMItem  = { material_id: string; quantity_per_unit: number };
type BOMEntry = { material_id: string; mode: "yields" | "needs"; value: string };
// yields = "X יחידות מ-1 גיליון"   → qty = 1/X
// needs  = "כל יחידה דורשת X גיליונות" → qty = X

function initBOMEntries(items: BOMItem[]): BOMEntry[] {
  return items.map((item) => {
    const q = item.quantity_per_unit;
    if (q > 0 && q < 1) {
      return { material_id: item.material_id, mode: "yields", value: String(Math.round((1 / q) * 1000) / 1000) };
    }
    return { material_id: item.material_id, mode: "needs", value: String(q) };
  });
}

function bomEntriesToItems(entries: BOMEntry[]): BOMItem[] {
  return entries
    .filter((e) => e.material_id && Number(e.value) > 0)
    .map((e) => ({
      material_id: e.material_id,
      quantity_per_unit: e.mode === "yields" ? 1 / Number(e.value) : Number(e.value),
    }));
}

function stripLeadingZero(val: string): string {
  return val.replace(/^0+(\d)/, "$1");
}

type Props = {
  eventTypes: EventType[];
  styles: DesignStyle[];
  materials?: RawMaterial[];
  initialBOM?: BOMItem[];
  initial?: Partial<ProductFormData> & { id?: string };
  mode: "new" | "edit";
};

const STATUS_OPTIONS = [
  { value: "draft", label: "טיוטה" },
  { value: "published", label: "פעיל" },
  { value: "archived", label: "ארכיון" },
] as const;

const MIN_TYPE_OPTIONS = [
  { value: "units", label: "יחידות מינימום" },
  { value: "amount", label: "סכום מינימום (₪)" },
] as const;

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
    </div>
  );
}

function Input({ className = "", onChange, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      {...props}
      onFocus={type === "number" ? (e) => e.target.select() : props.onFocus}
      onChange={type === "number" && onChange
        ? (e) => { e.target.value = stripLeadingZero(e.target.value); onChange(e); }
        : onChange}
      className={`w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition ${className}`}
    />
  );
}

function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition resize-none ${className}`}
    />
  );
}

function Select({ className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition bg-white ${className}`}
    />
  );
}

const UNIT_LABELS: Record<string, string> = {
  sheet: "גיליון", meter: "מטר", piece: "יחידה", gram: "גרם", roll: "גליל",
};

export default function ProductForm({ eventTypes, styles, materials = [], initialBOM = [], initial, mode }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [bom, setBom] = useState<BOMEntry[]>(initBOMEntries(initialBOM));

  const [form, setForm] = useState<ProductFormData>({
    name_he: "",
    name_en: "",
    description_he: "",
    description_en: "",
    price_per_unit: 0,
    cost_price: null,
    min_type: "units",
    min_value: 1,
    event_type_id: null,
    design_style_id: null,
    images: [],
    status: "draft",
    ...initial,
  });

  const set = <K extends keyof ProductFormData>(key: K, val: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const filteredStyles = styles.filter(
    (s) => !form.event_type_id || s.event_type_id === form.event_type_id
  );

  function addImage() {
    const url = newImageUrl.trim();
    if (!url) return;
    set("images", [...(form.images ?? []), url]);
    setNewImageUrl("");
  }

  function removeImage(i: number) {
    set("images", (form.images ?? []).filter((_, idx) => idx !== i));
  }

  function handleSubmit() {
    setError("");
    if (!form.name_he || !form.name_en) {
      setError("שם בעברית ובאנגלית הם שדות חובה");
      return;
    }
    if (!form.price_per_unit || form.price_per_unit <= 0) {
      setError("מחיר חייב להיות גדול מ-0");
      return;
    }

    startTransition(async () => {
      let res;
      if (mode === "edit" && initial?.id) {
        res = await updateProduct(initial.id, form);
        if (!res?.error) await saveBOM(initial.id, bomEntriesToItems(bom));
      } else {
        res = await createProduct(form);
        if (!res?.error && res?.id) await saveBOM(res.id, bomEntriesToItems(bom));
      }

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/admin/products");
        router.refresh();
      }
    });
  }

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <button
        onClick={() => router.push("/admin/products")}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowRight size={15} />
        חזרה למוצרים
      </button>

      <div className="space-y-6">
        {/* Section: Names */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-800 text-sm">שמות ותיאור</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="שם בעברית *">
              <Input
                value={form.name_he}
                onChange={(e) => set("name_he", e.target.value)}
                placeholder="פלייסמט מעוצב"
              />
            </Field>
            <Field label="שם באנגלית *">
              <Input
                value={form.name_en}
                onChange={(e) => set("name_en", e.target.value)}
                placeholder="Designed Placemat"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="תיאור בעברית">
              <Textarea
                value={form.description_he ?? ""}
                onChange={(e) => set("description_he", e.target.value)}
                rows={3}
                placeholder="תיאור קצר..."
              />
            </Field>
            <Field label="תיאור באנגלית">
              <Textarea
                value={form.description_en ?? ""}
                onChange={(e) => set("description_en", e.target.value)}
                rows={3}
                placeholder="Short description..."
              />
            </Field>
          </div>
        </section>

        {/* Section: Pricing */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-800 text-sm">תמחור ומינימום</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="מחיר ליחידה (₪) *">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.price_per_unit || ""}
                onChange={(e) => set("price_per_unit", parseFloat(e.target.value) || 0)}
                placeholder="25.00"
              />
            </Field>
            <Field label="מחיר עלות (₪)" hint="לשימוש פנימי בלבד">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.cost_price ?? ""}
                onChange={(e) =>
                  set("cost_price", e.target.value ? parseFloat(e.target.value) : null)
                }
                placeholder="12.00"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="סוג מינימום הזמנה">
              <Select
                value={form.min_type}
                onChange={(e) => set("min_type", e.target.value as "units" | "amount")}
              >
                {MIN_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </Field>
            <Field
              label={
                form.min_type === "units"
                  ? "מינימום יחידות"
                  : "מינימום סכום (₪)"
              }
            >
              <Input
                type="number"
                min={0}
                step={form.min_type === "units" ? 1 : 0.01}
                value={form.min_value || ""}
                onChange={(e) => set("min_value", parseFloat(e.target.value) || 0)}
                placeholder={form.min_type === "units" ? "10" : "200"}
              />
            </Field>
          </div>
        </section>

        {/* Section: Catalog */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-800 text-sm">שיוך לקטלוג</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="סוג אירוע">
              <Select
                value={form.event_type_id ?? ""}
                onChange={(e) => {
                  set("event_type_id", e.target.value || null);
                  set("design_style_id", null);
                }}
              >
                <option value="">— ללא שיוך —</option>
                {eventTypes.map((et) => (
                  <option key={et.id} value={et.id}>
                    {et.name_he}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="סגנון עיצוב">
              <Select
                value={form.design_style_id ?? ""}
                onChange={(e) => set("design_style_id", e.target.value || null)}
                disabled={!form.event_type_id}
              >
                <option value="">— ללא שיוך —</option>
                {filteredStyles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_he}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        {/* Section: Images */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-800 text-sm">תמונות</h2>
          <p className="text-xs text-stone-400">
            הוסף כתובות URL לתמונות. התמונה הראשונה = thumbnail.
          </p>

          {(form.images ?? []).length > 0 && (
            <div className="space-y-2">
              {(form.images ?? []).map((url, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm bg-stone-50 rounded-lg px-3 py-2"
                >
                  <span className="text-xs text-stone-400 font-mono w-4 shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-stone-600 text-xs font-mono">
                    {url}
                  </span>
                  {i === 0 && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                      ראשי
                    </span>
                  )}
                  <button
                    onClick={() => removeImage(i)}
                    className="text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addImage()}
              placeholder="https://example.com/image.jpg"
              className="flex-1"
            />
            <button
              onClick={addImage}
              disabled={!newImageUrl.trim()}
              className="flex items-center gap-1.5 text-sm px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              <Plus size={14} />
              הוסף
            </button>
          </div>
        </section>

        {/* Section: BOM */}
        {materials.length > 0 && (
          <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-stone-800 text-sm">חומרי גלם (BOM)</h2>
              <p className="text-xs text-stone-400 mt-0.5">הגדר כמה מכל חומר נדרש לייצור יחידה אחת</p>
            </div>

            {bom.map((row, i) => {
              const mat = materials.find((m) => m.id === row.material_id);
              const unitLabel = mat ? (UNIT_LABELS[mat.unit] ?? mat.unit) : "יחידת חומר";
              const numVal = Number(row.value);

              return (
                <div key={i} className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-3">
                  {/* Row 1: material + delete */}
                  <div className="flex items-center gap-2">
                    <select
                      value={row.material_id}
                      onChange={(e) => setBom((b) => b.map((r, idx) => idx === i ? { ...r, material_id: e.target.value } : r))}
                      className="flex-1 text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white font-medium"
                    >
                      <option value="">— בחר חומר —</option>
                      {materials.map((m) => <option key={m.id} value={m.id}>{m.name_he}</option>)}
                    </select>
                    <button type="button" onClick={() => setBom((b) => b.filter((_, idx) => idx !== i))}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all">
                      <X size={14} />
                    </button>
                  </div>

                  {/* Row 2: sentence-style mode selector */}
                  {row.material_id && (
                    <div className="space-y-2">
                      {/* Option A: yields */}
                      <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${row.mode === "yields" ? "border-stone-400 bg-white" : "border-stone-200 hover:bg-white/60"}`}>
                        <input type="radio" checked={row.mode === "yields"} onChange={() => setBom((b) => b.map((r, idx) => idx === i ? { ...r, mode: "yields" } : r))} className="accent-stone-700" />
                        <span className="text-sm text-stone-700 flex items-center gap-1.5 flex-wrap">
                          מ-1 {unitLabel} יוצאות
                          <input
                            type="number" min={1} step={1}
                            value={row.mode === "yields" ? row.value : ""}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setBom((b) => b.map((r, idx) => idx === i ? { ...r, mode: "yields", value: stripLeadingZero(e.target.value) } : r))}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="?"
                            className="w-16 text-center text-sm px-2 py-1 rounded border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
                          />
                          יחידות מוצר
                          {row.mode === "yields" && numVal > 0 && (
                            <span className="text-xs text-stone-400">(= {(1 / numVal).toFixed(3)} {unitLabel} לכל יחידה)</span>
                          )}
                        </span>
                      </label>

                      {/* Option B: needs */}
                      <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${row.mode === "needs" ? "border-stone-400 bg-white" : "border-stone-200 hover:bg-white/60"}`}>
                        <input type="radio" checked={row.mode === "needs"} onChange={() => setBom((b) => b.map((r, idx) => idx === i ? { ...r, mode: "needs" } : r))} className="accent-stone-700" />
                        <span className="text-sm text-stone-700 flex items-center gap-1.5 flex-wrap">
                          כל יחידת מוצר דורשת
                          <input
                            type="number" min={0.001} step={0.001}
                            value={row.mode === "needs" ? row.value : ""}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setBom((b) => b.map((r, idx) => idx === i ? { ...r, mode: "needs", value: stripLeadingZero(e.target.value) } : r))}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="?"
                            className="w-16 text-center text-sm px-2 py-1 rounded border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
                          />
                          {unitLabel}
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setBom((b) => [...b, { material_id: "", mode: "yields", value: "" }])}
              className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 border border-dashed border-stone-200 rounded-lg px-4 py-2 w-full hover:bg-stone-50 active:scale-95 transition-all"
            >
              <Plus size={14} /> הוסף חומר
            </button>
          </section>
        )}

        {/* Section: Status */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-800 text-sm mb-4">סטטוס</h2>
          <div className="flex gap-3">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => set("status", opt.value)}
                className={`text-sm px-5 py-2 rounded-xl border font-medium transition-all ${
                  form.status === opt.value
                    ? "bg-stone-800 text-white border-stone-800"
                    : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Submit */}
        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3 pb-8">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 text-sm px-6 py-3 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-400 text-white rounded-xl font-medium transition-all active:scale-95"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {mode === "new" ? "צור מוצר" : "שמור שינויים"}
          </button>
          <button
            onClick={() => router.push("/admin/products")}
            className="text-sm px-6 py-3 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-all active:scale-95"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
