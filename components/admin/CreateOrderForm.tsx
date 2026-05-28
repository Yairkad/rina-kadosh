"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { createManualOrder, type ManualOrderItem } from "@/app/admin/actions/create-order";

type Product = {
  id: string;
  name_he: string;
  name_en: string;
  price_per_unit: number;
  min_type: string | null;
  min_value: number | null;
};

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 transition ${props.className ?? ""}`}
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function CreateOrderForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [items, setItems] = useState<ManualOrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);

  const totalAmount = items.reduce((sum, i) => sum + i.price_per_unit * i.quantity, 0);

  function addItem() {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + selectedQty } : i
        );
      }
      return [...prev, {
        id: product.id,
        name_he: product.name_he,
        quantity: selectedQty,
        price_per_unit: product.price_per_unit,
        is_bundle: false,
      }];
    });

    setSelectedProductId("");
    setSelectedQty(1);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) return removeItem(id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  }

  function handleSubmit() {
    setError("");
    if (!customer.name || !customer.phone || !customer.email) {
      setError("שם, טלפון ואימייל הם שדות חובה");
      return;
    }
    if (items.length === 0) {
      setError("נדרש לפחות פריט אחד");
      return;
    }
    if (delivery === "delivery" && !address) {
      setError("נדרשת כתובת למשלוח");
      return;
    }

    startTransition(async () => {
      const res = await createManualOrder({
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        delivery_method: delivery,
        delivery_address: address || undefined,
        delivery_notes: deliveryNotes || undefined,
        special_requests: specialRequests || undefined,
        admin_notes: adminNotes || undefined,
        items,
        total_amount: totalAmount,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(`הזמנה ${res.order_number} נוצרה בהצלחה`);
        setTimeout(() => router.push(`/admin/orders/${res.id}`), 1200);
      }
    });
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Customer */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <h2 className="font-semibold text-stone-800 text-sm">פרטי לקוחה</h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label="שם מלא *">
            <Input value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} placeholder="ישראלה ישראלי" />
          </Field>
          <Field label="טלפון *">
            <Input value={customer.phone} onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))} placeholder="050-1234567" />
          </Field>
          <Field label="אימייל *">
            <Input type="email" value={customer.email} onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))} placeholder="name@example.com" />
          </Field>
        </div>
      </section>

      {/* Delivery */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <h2 className="font-semibold text-stone-800 text-sm">אספקה</h2>
        <div className="flex gap-3">
          {(["pickup", "delivery"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setDelivery(m)}
              className={`text-sm px-5 py-2 rounded-xl border font-medium transition-all ${delivery === m ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"}`}
            >
              {m === "pickup" ? "איסוף עצמי" : "משלוח"}
            </button>
          ))}
        </div>
        {delivery === "delivery" && (
          <div className="space-y-3">
            <Field label="כתובת *">
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="רחוב, עיר" />
            </Field>
            <Field label="הערות משלוח">
              <Input value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} placeholder="קומה, הוראות..." />
            </Field>
          </div>
        )}
      </section>

      {/* Items */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <h2 className="font-semibold text-stone-800 text-sm">פריטים</h2>

        <div className="flex gap-2">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="flex-1 text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white transition"
          >
            <option value="">— בחר מוצר —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name_he} — ₪{Number(p.price_per_unit).toLocaleString("he-IL")}
              </option>
            ))}
          </select>
          <Input
            type="number"
            min={1}
            value={selectedQty}
            onChange={(e) => setSelectedQty(Number(e.target.value))}
            className="w-20"
          />
          <button
            onClick={addItem}
            disabled={!selectedProductId}
            className="flex items-center gap-1.5 text-sm px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:bg-stone-300 transition-colors whitespace-nowrap"
          >
            <Plus size={14} />
            הוסף
          </button>
        </div>

        {items.length > 0 && (
          <div className="divide-y divide-stone-50 border border-stone-100 rounded-xl overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 font-medium text-stone-800 text-sm">{item.name_he}</div>
                <div className="text-xs text-stone-400">
                  ₪{Number(item.price_per_unit).toLocaleString("he-IL")} ×
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQty(item.id, Number(e.target.value))}
                  className="w-16 text-sm px-2 py-1 rounded border border-stone-200 text-center focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
                <div className="font-semibold text-stone-700 text-sm w-20 text-left">
                  ₪{(item.price_per_unit * item.quantity).toLocaleString("he-IL")}
                </div>
                <button onClick={() => removeItem(item.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                  <X size={15} />
                </button>
              </div>
            ))}
            <div className="flex justify-between px-4 py-3 bg-stone-50">
              <span className="font-semibold text-stone-700 text-sm">סה״כ</span>
              <span className="font-bold text-stone-800">₪{totalAmount.toLocaleString("he-IL")}</span>
            </div>
          </div>
        )}
      </section>

      {/* Notes */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <h2 className="font-semibold text-stone-800 text-sm">הערות</h2>
        <Field label="הערות לקוחה">
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={2}
            className="w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 transition resize-none"
            placeholder="בקשות מיוחדות..."
          />
        </Field>
        <Field label="הערות פנימיות">
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={2}
            className="w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 transition resize-none"
            placeholder="הערות לשימוש פנימי..."
          />
        </Field>
      </section>

      {error && <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}
      {success && <p className="text-green-700 text-sm bg-green-50 rounded-xl px-4 py-3">{success}</p>}

      <div className="pb-8">
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex items-center gap-2 text-sm px-8 py-3 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-400 text-white rounded-xl font-medium transition-colors"
        >
          {isPending && <Loader2 size={15} className="animate-spin" />}
          צור הזמנה
        </button>
      </div>
    </div>
  );
}
