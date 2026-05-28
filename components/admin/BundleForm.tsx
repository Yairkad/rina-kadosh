"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, ArrowRight } from "lucide-react";
import { createBundle, updateBundle, type BundleFormData } from "@/app/admin/actions/bundles";

type Product = { id: string; name_he: string; price_per_unit: number };
type EventType = { id: string; name_he: string; name_en: string };
type DesignStyle = { id: string; event_type_id: string; name_he: string };

type Props = {
  products: Product[];
  eventTypes: EventType[];
  styles: DesignStyle[];
  initial?: Partial<BundleFormData> & { id?: string };
  mode: "new" | "edit";
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={`w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 transition ${className}`} />
  );
}

export default function BundleForm({ products, eventTypes, styles, initial, mode }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  const [form, setForm] = useState<BundleFormData>({
    name_he: "",
    name_en: "",
    description_he: "",
    description_en: "",
    items: [],
    bundle_price: 0,
    original_price: null,
    event_type_id: null,
    design_style_id: null,
    images: [],
    status: "draft",
    ...initial,
  });

  const set = <K extends keyof BundleFormData>(key: K, val: BundleFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const filteredStyles = styles.filter(
    (s) => !form.event_type_id || s.event_type_id === form.event_type_id
  );

  const calculatedOriginal = form.items.reduce(
    (sum, i) => sum + i.price_per_unit * i.quantity, 0
  );

  function addBundleItem() {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    const existing = form.items.find((i) => i.product_id === product.id);
    if (existing) {
      set("items", form.items.map((i) =>
        i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      set("items", [...form.items, {
        product_id: product.id,
        name_he: product.name_he,
        quantity: 1,
        price_per_unit: product.price_per_unit,
      }]);
    }
    setSelectedProductId("");
  }

  function updateItemQty(productId: string, qty: number) {
    if (qty <= 0) {
      set("items", form.items.filter((i) => i.product_id !== productId));
    } else {
      set("items", form.items.map((i) => i.product_id === productId ? { ...i, quantity: qty } : i));
    }
  }

  function addImage() {
    const url = newImageUrl.trim();
    if (!url) return;
    set("images", [...(form.images ?? []), url]);
    setNewImageUrl("");
  }

  function handleSubmit() {
    setError("");
    if (!form.name_he || !form.name_en) { setError("שם חובה"); return; }
    if (form.bundle_price <= 0) { setError("מחיר חבילה חובה"); return; }
    if (form.items.length === 0) { setError("נדרש לפחות מוצר אחד בחבילה"); return; }

    startTransition(async () => {
      let res;
      if (mode === "edit" && initial?.id) {
        res = await updateBundle(initial.id, form);
      } else {
        res = await createBundle(form);
      }
      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/admin/bundles");
        router.refresh();
      }
    });
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => router.push("/admin/bundles")}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowRight size={15} />
        חזרה לחבילות
      </button>

      <div className="space-y-5">
        {/* Names */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-800 text-sm">שמות ותיאור</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="שם בעברית *"><Input value={form.name_he} onChange={(e) => set("name_he", e.target.value)} placeholder="חבילת חתן כלה" /></Field>
            <Field label="שם באנגלית *"><Input value={form.name_en} onChange={(e) => set("name_en", e.target.value)} placeholder="Bride & Groom Package" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="תיאור עברית">
              <textarea value={form.description_he ?? ""} onChange={(e) => set("description_he", e.target.value)} rows={2}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 transition resize-none" />
            </Field>
            <Field label="תיאור אנגלית">
              <textarea value={form.description_en ?? ""} onChange={(e) => set("description_en", e.target.value)} rows={2}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 transition resize-none" />
            </Field>
          </div>
        </section>

        {/* Items */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-800 text-sm">מוצרים בחבילה</h2>
          <div className="flex gap-2">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="flex-1 text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white transition"
            >
              <option value="">— בחר מוצר —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name_he} — ₪{Number(p.price_per_unit).toLocaleString("he-IL")}</option>
              ))}
            </select>
            <button onClick={addBundleItem} disabled={!selectedProductId}
              className="flex items-center gap-1.5 text-sm px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:bg-stone-300 transition-colors">
              <Plus size={14} />הוסף
            </button>
          </div>

          {form.items.length > 0 && (
            <div className="border border-stone-100 rounded-xl overflow-hidden divide-y divide-stone-50">
              {form.items.map((item) => (
                <div key={item.product_id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 text-sm font-medium text-stone-800">{item.name_he}</div>
                  <div className="text-xs text-stone-400">₪{Number(item.price_per_unit).toLocaleString("he-IL")} ×</div>
                  <input type="number" min={1} value={item.quantity}
                    onChange={(e) => updateItemQty(item.product_id, Number(e.target.value))}
                    className="w-16 text-sm px-2 py-1 rounded border border-stone-200 text-center focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                  <div className="font-semibold text-stone-700 text-sm w-20 text-left">
                    ₪{(item.price_per_unit * item.quantity).toLocaleString("he-IL")}
                  </div>
                  <button onClick={() => updateItemQty(item.product_id, 0)} className="text-stone-300 hover:text-red-500 transition-colors">
                    <X size={15} />
                  </button>
                </div>
              ))}
              <div className="px-4 py-2 bg-stone-50 flex justify-between text-xs text-stone-500">
                <span>מחיר מלא (ללא הנחה)</span>
                <span className="font-semibold">₪{calculatedOriginal.toLocaleString("he-IL")}</span>
              </div>
            </div>
          )}
        </section>

        {/* Pricing */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-800 text-sm">תמחור</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="מחיר חבילה (₪) *">
              <Input type="number" min={0} step={0.01} value={form.bundle_price || ""}
                onChange={(e) => set("bundle_price", parseFloat(e.target.value) || 0)} placeholder="199" />
            </Field>
            <Field label="מחיר מקורי (לפני הנחה)">
              <Input type="number" min={0} step={0.01}
                value={(form.original_price ?? calculatedOriginal) || ""}
                onChange={(e) => set("original_price", e.target.value ? parseFloat(e.target.value) : null)}
                placeholder={String(calculatedOriginal || "")} />
            </Field>
          </div>
          {form.bundle_price > 0 && calculatedOriginal > 0 && (
            <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              חיסכון: ₪{(calculatedOriginal - form.bundle_price).toLocaleString("he-IL")} ({Math.round((1 - form.bundle_price / calculatedOriginal) * 100)}% הנחה)
            </p>
          )}
        </section>

        {/* Catalog */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-800 text-sm">שיוך לקטלוג</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="סוג אירוע">
              <select value={form.event_type_id ?? ""} onChange={(e) => { set("event_type_id", e.target.value || null); set("design_style_id", null); }}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white transition">
                <option value="">— ללא —</option>
                {eventTypes.map((et) => <option key={et.id} value={et.id}>{et.name_he}</option>)}
              </select>
            </Field>
            <Field label="סגנון עיצוב">
              <select value={form.design_style_id ?? ""} onChange={(e) => set("design_style_id", e.target.value || null)}
                disabled={!form.event_type_id}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white transition disabled:bg-stone-50 disabled:text-stone-400">
                <option value="">— ללא —</option>
                {filteredStyles.map((s) => <option key={s.id} value={s.id}>{s.name_he}</option>)}
              </select>
            </Field>
          </div>
        </section>

        {/* Images */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
          <h2 className="font-semibold text-stone-800 text-sm">תמונות</h2>
          {(form.images ?? []).map((url, i) => (
            <div key={i} className="flex items-center gap-2 text-xs bg-stone-50 rounded-lg px-3 py-2">
              <span className="text-stone-400 w-4">{i + 1}</span>
              <span className="flex-1 truncate text-stone-600 font-mono">{url}</span>
              <button onClick={() => set("images", (form.images ?? []).filter((_, idx) => idx !== i))} className="text-stone-300 hover:text-red-500 transition-colors"><X size={12} /></button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addImage()} placeholder="https://..." className="flex-1" />
            <button onClick={addImage} disabled={!newImageUrl.trim()}
              className="flex items-center gap-1.5 text-sm px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors">
              <Plus size={14} />הוסף
            </button>
          </div>
        </section>

        {/* Status */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-800 text-sm mb-4">סטטוס</h2>
          <div className="flex gap-3">
            {(["draft", "published", "archived"] as const).map((s) => (
              <button key={s} onClick={() => set("status", s)}
                className={`text-sm px-5 py-2 rounded-xl border font-medium transition-all ${form.status === s ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"}`}>
                {s === "draft" ? "טיוטה" : s === "published" ? "פעיל" : "ארכיון"}
              </button>
            ))}
          </div>
        </section>

        {error && <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        <div className="flex gap-3 pb-8">
          <button onClick={handleSubmit} disabled={isPending}
            className="flex items-center gap-2 text-sm px-6 py-3 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-400 text-white rounded-xl font-medium transition-colors">
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {mode === "new" ? "צור חבילה" : "שמור שינויים"}
          </button>
          <button onClick={() => router.push("/admin/bundles")}
            className="text-sm px-6 py-3 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors">
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
