"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2, PackagePlus, AlertTriangle, ShoppingCart } from "lucide-react";

function stripLeadingZero(val: string) { return val.replace(/^0+(\d)/, "$1"); }
import {
  createMaterial, updateMaterial, deleteMaterial,
  addStockQuantity,
} from "@/app/admin/actions/materials";

type Unit = "sheet" | "meter" | "piece" | "gram" | "roll";
type Material = {
  id: string; name_he: string; unit: Unit;
  stock_quantity: number; low_stock_threshold: number;
  cost_per_unit: number; supplier_notes: string | null; order_url: string | null;
};
type BOMRow = { product_id: string; material_id: string; quantity_per_unit: number };
type OpenOrder = { items: { product_id?: string; quantity: number; is_bundle: boolean }[] };

const UNIT_LABELS: Record<Unit, string> = {
  sheet: "גיליון", meter: "מטר", piece: "יחידה", gram: "גרם", roll: "גליל",
};

const EMPTY: Omit<Material, "id"> = {
  name_he: "", unit: "piece", stock_quantity: 0,
  low_stock_threshold: 0, cost_per_unit: 0, supplier_notes: null, order_url: null,
};

function stockStatus(m: Material) {
  if (m.stock_quantity <= 0) return "empty";
  if (m.stock_quantity <= m.low_stock_threshold) return "low";
  return "ok";
}

const STATUS_BADGE: Record<string, string> = {
  ok: "bg-green-100 text-green-700",
  low: "bg-amber-100 text-amber-700",
  empty: "bg-red-100 text-red-600",
};
const STATUS_LABEL: Record<string, string> = { ok: "תקין", low: "נמוך", empty: "אזל" };

function MaterialForm({ initial, onSave, onCancel, loading, error }: {
  initial: Omit<Material, "id">; onSave: (d: Omit<Material, "id">) => void;
  onCancel: () => void; loading: boolean; error: string;
}) {
  const [f, setF] = useState(initial);
  const set = (k: keyof typeof f, v: string | number | null) => setF((p) => ({ ...p, [k]: v }));

  return (
    <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs text-stone-500 mb-1">שם חומר *</label>
          <input value={f.name_he} onChange={(e) => set("name_he", e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="נייר A4 לבן" />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">יחידת מידה *</label>
          <select value={f.unit} onChange={(e) => set("unit", e.target.value as Unit)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white">
            {(Object.entries(UNIT_LABELS) as [Unit, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-stone-500 mb-1">כמות במלאי</label>
          <input type="number" min={0} step={0.001} value={f.stock_quantity}
            onFocus={(e) => e.target.select()}
            onChange={(e) => set("stock_quantity", Number(stripLeadingZero(e.target.value)))}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">סף התראה</label>
          <input type="number" min={0} step={0.001} value={f.low_stock_threshold}
            onFocus={(e) => e.target.select()}
            onChange={(e) => set("low_stock_threshold", Number(stripLeadingZero(e.target.value)))}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">עלות ליחידה (₪)</label>
          <input type="number" min={0} step={0.01} value={f.cost_per_unit}
            onFocus={(e) => e.target.select()}
            onChange={(e) => set("cost_per_unit", Number(stripLeadingZero(e.target.value)))}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-stone-500 mb-1">הערות ספק</label>
          <input value={f.supplier_notes ?? ""} onChange={(e) => set("supplier_notes", e.target.value || null)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="שם ספק, קוד מוצר..." />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">קישור להזמנה (URL)</label>
          <input type="url" value={f.order_url ?? ""} onChange={(e) => set("order_url", e.target.value || null)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="https://..." />
        </div>
      </div>
      {error && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="flex gap-2">
        <button onClick={() => onSave(f)} disabled={loading || !f.name_he}
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

export default function MaterialsManager({ materials, bom, openOrders }: {
  materials: Material[]; bom: BOMRow[];
  openOrders: OpenOrder[];
}) {
  const [adding, setAdding]       = useState(false);
  const [editing, setEditing]     = useState<string | null>(null);
  const [restocking, setRestocking] = useState<string | null>(null);
  const [restockAmt, setRestockAmt] = useState<string>("");
  const [isPending, start]        = useTransition();
  const [formError, setFormError] = useState("");

  // Forecast: total material needed for all open orders
  const forecast = new Map<string, number>();
  for (const order of openOrders) {
    for (const item of order.items) {
      if (item.is_bundle || !item.product_id) continue;
      const productBOM = bom.filter((b) => b.product_id === item.product_id);
      for (const b of productBOM) {
        forecast.set(b.material_id, (forecast.get(b.material_id) ?? 0) + Number(b.quantity_per_unit) * item.quantity);
      }
    }
  }

  const lowOrEmpty = materials.filter((m) => stockStatus(m) !== "ok");

  function act(fn: () => Promise<{ error?: string; success?: boolean }>) {
    setFormError("");
    start(async () => {
      const res = await fn();
      if (res?.error) { setFormError(res.error); return; }
      setAdding(false); setEditing(null); setRestocking(null); setRestockAmt("");
    });
  }

  return (
    <div className="space-y-6">

      {/* Alerts */}
      {lowOrEmpty.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">חומרים הדורשים תשומת לב</p>
            <ul className="text-sm text-amber-700 space-y-0.5">
              {lowOrEmpty.map((m) => (
                <li key={m.id}>
                  <span className="font-medium">{m.name_he}</span>
                  {" — "}
                  {stockStatus(m) === "empty"
                    ? "אזל מהמלאי"
                    : `${Number(m.stock_quantity).toLocaleString("he-IL")} ${UNIT_LABELS[m.unit]} (סף: ${m.low_stock_threshold})`}
                  {forecast.has(m.id) && (
                    <span className="text-amber-500 mr-1">· נדרש להזמנות פתוחות: {Number(forecast.get(m.id)).toFixed(2)} {UNIT_LABELS[m.unit]}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Forecast summary */}
      {forecast.size > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">תחזית — הזמנות פתוחות</span>
            <span className="text-xs text-stone-400">{openOrders.length} הזמנות</span>
          </div>
          <div className="divide-y divide-stone-50">
            {Array.from(forecast.entries()).map(([matId, needed]) => {
              const mat = materials.find((m) => m.id === matId);
              if (!mat) return null;
              const toOrder = Math.max(0, needed - Number(mat.stock_quantity));
              return (
                <div key={matId} className="flex items-center gap-4 px-5 py-3 text-sm">
                  <span className="flex-1 font-medium text-stone-800">{mat.name_he}</span>
                  <span className="text-stone-500">נדרש: <b>{Number(needed).toFixed(2)}</b> {UNIT_LABELS[mat.unit]}</span>
                  <span className="text-stone-500">במלאי: <b>{Number(mat.stock_quantity).toFixed(2)}</b></span>
                  {toOrder > 0 ? (
                    <span className="text-red-600 font-semibold">להזמין: {toOrder.toFixed(2)} {UNIT_LABELS[mat.unit]}</span>
                  ) : (
                    <span className="text-green-600 text-xs font-medium">✓ מספיק</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Materials list */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">חומרי גלם ({materials.length})</span>
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 transition-colors">
            <Plus size={13} /> חומר חדש
          </button>
        </div>

        {adding && (
          <div className="p-4 border-b border-stone-100">
            <MaterialForm initial={EMPTY} loading={isPending} error={formError}
              onCancel={() => { setAdding(false); setFormError(""); }}
              onSave={(d) => act(() => createMaterial(d))} />
          </div>
        )}

        {materials.length === 0 && !adding ? (
          <div className="py-12 text-center text-stone-400 text-sm">אין חומרי גלם עדיין</div>
        ) : (
          <div className="divide-y divide-stone-50">
            {materials.map((m) => {
              const status = stockStatus(m);
              const needed = forecast.get(m.id) ?? 0;
              const toOrder = Math.max(0, needed - Number(m.stock_quantity));
              return (
                <div key={m.id}>
                  {editing === m.id ? (
                    <div className="p-4">
                      <MaterialForm
                        initial={{ name_he: m.name_he, unit: m.unit, stock_quantity: m.stock_quantity, low_stock_threshold: m.low_stock_threshold, cost_per_unit: m.cost_per_unit, supplier_notes: m.supplier_notes }}
                        loading={isPending} error={formError}
                        onCancel={() => { setEditing(null); setFormError(""); }}
                        onSave={(d) => act(() => updateMaterial(m.id, d))} />
                    </div>
                  ) : restocking === m.id ? (
                    <div className="flex items-center gap-3 px-5 py-3 bg-stone-50">
                      <span className="text-sm font-medium text-stone-700">{m.name_he} — הוסף למלאי</span>
                      <input type="number" min={0.001} step={0.001} value={restockAmt}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setRestockAmt(stripLeadingZero(e.target.value))}
                        placeholder="כמות להוספה"
                        className="text-sm px-3 py-1.5 rounded-lg border border-stone-200 w-36 focus:outline-none focus:ring-2 focus:ring-stone-400" />
                      <span className="text-sm text-stone-500">{UNIT_LABELS[m.unit]}</span>
                      <button onClick={() => act(() => addStockQuantity(m.id, Number(restockAmt)))}
                        disabled={isPending || !restockAmt || Number(restockAmt) <= 0}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-stone-800 text-white rounded-lg disabled:bg-stone-300 transition-colors">
                        {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} אשר
                      </button>
                      <button onClick={() => { setRestocking(null); setRestockAmt(""); }}
                        className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors"><X size={15} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50/80 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-stone-800 text-sm">{m.name_he}</span>
                          <span className="text-xs text-stone-400">{UNIT_LABELS[m.unit]}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[status]}`}>
                            {STATUS_LABEL[status]}
                          </span>
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5 flex gap-3 flex-wrap">
                          <span>מלאי: <b className="text-stone-600">{Number(m.stock_quantity).toLocaleString("he-IL")}</b></span>
                          <span>סף: {m.low_stock_threshold}</span>
                          <span>עלות: ₪{Number(m.cost_per_unit).toLocaleString("he-IL")}</span>
                          {m.supplier_notes && <span className="text-stone-400">{m.supplier_notes}</span>}
                          {toOrder > 0 && <span className="text-red-500 font-medium">להזמין: {toOrder.toFixed(2)}</span>}
                        </div>
                      </div>
                      {m.order_url && (
                        <a href={m.order_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-2.5 py-1.5 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100 active:scale-95">
                          <ShoppingCart size={13} /> הזמן
                        </a>
                      )}
                      <button onClick={() => { setRestocking(m.id); setRestockAmt(""); }}
                        className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 border border-stone-200 rounded-lg px-2.5 py-1.5 hover:bg-stone-100 transition-colors opacity-0 group-hover:opacity-100 active:scale-95">
                        <PackagePlus size={13} /> קבלת סחורה
                      </button>
                      <button onClick={() => setEditing(m.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors opacity-0 group-hover:opacity-100">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => act(() => deleteMaterial(m.id))} disabled={isPending}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
