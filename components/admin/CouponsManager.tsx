"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { createCoupon, updateCoupon, deleteCoupon, type CouponData } from "@/app/admin/actions/coupons";

type Coupon = CouponData & { id: string; times_used: number };

const EMPTY: CouponData = {
  code: "", discount_type: "percent", discount_value: 10,
  max_uses: null, valid_from: null, valid_until: null, active: true,
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("he-IL");
}

function isExpired(c: Coupon) {
  if (c.valid_until && new Date(c.valid_until) < new Date()) return true;
  if (c.max_uses !== null && c.times_used >= c.max_uses) return true;
  return false;
}

function CouponForm({ initial, onSave, onCancel, loading, error }: {
  initial: CouponData; onSave: (d: CouponData) => void;
  onCancel: () => void; loading: boolean; error: string;
}) {
  const [f, setF] = useState(initial);
  const set = <K extends keyof CouponData>(k: K, v: CouponData[K]) => setF((p) => ({ ...p, [k]: v }));

  return (
    <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-stone-500 mb-1">קוד קופון *</label>
          <input value={f.code} onChange={(e) => set("code", e.target.value.toUpperCase())}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 uppercase" placeholder="SUMMER10" />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">סוג הנחה *</label>
          <select value={f.discount_type} onChange={(e) => set("discount_type", e.target.value as CouponData["discount_type"])}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white">
            <option value="percent">אחוז הנחה (%)</option>
            <option value="amount">סכום קבוע (₪)</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-stone-500 mb-1">
            {f.discount_type === "percent" ? "אחוז הנחה" : "סכום הנחה (₪)"} *
          </label>
          <input type="number" min={0} step={f.discount_type === "percent" ? 1 : 0.01} value={f.discount_value}
            onFocus={(e) => e.target.select()}
            onChange={(e) => set("discount_value", Number(e.target.value))}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">מקסימום שימושים (ריק = ללא הגבלה)</label>
          <input type="number" min={1} value={f.max_uses ?? ""}
            onFocus={(e) => e.target.select()}
            onChange={(e) => set("max_uses", e.target.value === "" ? null : Number(e.target.value))}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-stone-500 mb-1">תקף מתאריך</label>
          <input type="date" value={f.valid_from ?? ""}
            onChange={(e) => set("valid_from", e.target.value || null)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">תקף עד תאריך</label>
          <input type="date" value={f.valid_until ?? ""}
            onChange={(e) => set("valid_until", e.target.value || null)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-stone-600">
        <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)}
          className="w-4 h-4 rounded border-stone-300" />
        פעיל
      </label>
      {error && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="flex gap-2">
        <button onClick={() => onSave(f)} disabled={loading || !f.code || !f.discount_value}
          className="flex items-center gap-1.5 text-sm px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all active:scale-95">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} שמור
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 text-sm px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors">
          <X size={14} /> ביטול
        </button>
      </div>
    </div>
  );
}

export default function CouponsManager({ coupons }: { coupons: Coupon[] }) {
  const [adding, setAdding]       = useState(false);
  const [editing, setEditing]     = useState<string | null>(null);
  const [isPending, start]        = useTransition();
  const [formError, setFormError] = useState("");

  function act(fn: () => Promise<{ error?: string; success?: boolean }>) {
    setFormError("");
    start(async () => {
      const res = await fn();
      if (res?.error) { setFormError(res.error); return; }
      setAdding(false); setEditing(null);
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">קופונים ({coupons.length})</span>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 transition-colors">
          <Plus size={13} /> קופון חדש
        </button>
      </div>

      {adding && (
        <div className="p-4 border-b border-stone-100">
          <CouponForm initial={EMPTY} loading={isPending} error={formError}
            onCancel={() => { setAdding(false); setFormError(""); }}
            onSave={(d) => act(() => createCoupon(d))} />
        </div>
      )}

      {coupons.length === 0 && !adding ? (
        <div className="py-12 text-center text-stone-400 text-sm">אין קופונים עדיין</div>
      ) : (
        <div className="divide-y divide-stone-50">
          {coupons.map((c) => (
            <div key={c.id}>
              {editing === c.id ? (
                <div className="p-4">
                  <CouponForm
                    initial={{
                      code: c.code, discount_type: c.discount_type, discount_value: c.discount_value,
                      max_uses: c.max_uses, valid_from: c.valid_from, valid_until: c.valid_until, active: c.active,
                    }}
                    loading={isPending} error={formError}
                    onCancel={() => { setEditing(null); setFormError(""); }}
                    onSave={(d) => act(() => updateCoupon(c.id, d))} />
                </div>
              ) : (
                <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50/80 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-stone-800 text-sm">{c.code}</span>
                      <span className="text-xs text-stone-500">
                        {c.discount_type === "percent" ? `${c.discount_value}%` : `₪${c.discount_value}`}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        !c.active ? "bg-stone-100 text-stone-500" : isExpired(c) ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                      }`}>
                        {!c.active ? "מושבת" : isExpired(c) ? "פג תוקף" : "פעיל"}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5 flex gap-3 flex-wrap">
                      <span>שימושים: <b className="text-stone-600">{c.times_used}{c.max_uses !== null ? ` / ${c.max_uses}` : " / ∞"}</b></span>
                      <span>מ-{fmtDate(c.valid_from)} עד {fmtDate(c.valid_until)}</span>
                    </div>
                  </div>
                  <button onClick={() => setEditing(c.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors opacity-0 group-hover:opacity-100">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => act(() => deleteCoupon(c.id))} disabled={isPending}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
