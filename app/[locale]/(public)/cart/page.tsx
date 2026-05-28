"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Trash2, Upload, CheckCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { createClient } from "@/lib/supabase/client";
import { submitOrder } from "@/app/actions/submit-order";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function CartPage() {
  const locale = useLocale();
  const t = useTranslations("order");
  const tc = useTranslations("cart");
  const { items, totalAmount, removeItem, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    delivery_method: "pickup" as "pickup" | "delivery",
    address: "",
    delivery_notes: "",
    notes: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[var(--charcoal)] placeholder:text-gray-400 focus:outline-none focus:border-[var(--gold)] transition-colors text-sm";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) { setLogoFile(null); return; }

    if (!ALLOWED_MIME.includes(file.type)) {
      setError(locale === "he" ? "סוג קובץ לא נתמך. השתמש ב-JPG, PNG, WEBP, GIF או PDF." : "Unsupported file type. Use JPG, PNG, WEBP, GIF or PDF.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(locale === "he" ? "הקובץ גדול מדי (מקסימום 5MB)." : "File too large (max 5MB).");
      e.target.value = "";
      return;
    }

    setError(null);
    setLogoFile(file);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Upload logo client-side (binary) then pass URL to server action
    let logoUrl: string | undefined;
    if (logoFile) {
      const supabase = createClient();
      const ext = logoFile.name.split(".").pop()?.toLowerCase();
      const path = `orders/${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from("logos").upload(path, logoFile);
      if (uploadError || !uploadData) {
        setError(locale === "he" ? "לא ניתן להעלות את הלוגו. אנא נסה שוב." : "Could not upload logo. Please try again.");
        setLoading(false);
        return;
      }
      logoUrl = supabase.storage.from("logos").getPublicUrl(path).data.publicUrl;
    }

    // Server action validates prices, computes total, inserts order
    const result = await submitOrder({
      customer_name:    form.name,
      customer_phone:   form.phone,
      customer_email:   form.email,
      delivery_method:  form.delivery_method,
      delivery_address: form.delivery_method === "delivery" ? form.address : undefined,
      delivery_notes:   form.delivery_notes || undefined,
      logo_url:         logoUrl,
      special_requests: form.notes || undefined,
      items: items.map((item) => ({
        id:        item.id,
        is_bundle: item.is_bundle,
        quantity:  item.quantity,
      })),
    });

    setLoading(false);

    if ("error" in result) {
      setError(locale === "he" ? "שגיאה בשליחת ההזמנה. אנא נסה שוב." : "Error submitting order. Please try again.");
      return;
    }

    setOrderNumber(result.order_number);
    clearCart();
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (orderNumber) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
        >
          <CheckCircle className="mx-auto text-[var(--gold)] mb-5" size={72} strokeWidth={1.2} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-2xl font-bold text-[var(--charcoal)] mb-3">{t("success")}</h1>
          <p className="text-[var(--muted)] text-sm mb-2">{t("orderNumber")}</p>
          <p className="font-mono font-bold text-xl text-[var(--charcoal)] mb-8 tracking-wider">
            {orderNumber}
          </p>
          <p className="text-sm text-[var(--muted)] mb-10">
            {locale === "he" ? "נחזור אליך בהקדם עם אישור ופרטים נוספים." : "We'll be in touch soon with confirmation and details."}
          </p>
          <Link
            href={`/${locale}`}
            className="px-10 py-3.5 rounded-full bg-[var(--gold)] text-white font-medium text-sm hover:bg-[#b8915a] transition-colors"
          >
            {locale === "he" ? "חזרה לדף הבית" : "Back to Home"}
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-6">🛍️</p>
        <h1 className="text-xl font-semibold text-[var(--charcoal)] mb-3">{tc("empty")}</h1>
        <Link href={`/${locale}/catalog`} className="text-[var(--gold)] font-medium text-sm hover:underline">
          {locale === "he" ? "לקטלוג המוצרים" : "Browse catalog"}
        </Link>
      </div>
    );
  }

  // ── Cart + Form ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-10">
        {locale === "he" ? "פרטי ההזמנה" : "Order Details"}
      </h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-start">
        {/* ── Form ─────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="text" placeholder={t("name")} value={form.name} onChange={set("name")} required className={inputClass} />
            <input type="tel" placeholder={t("phone")} value={form.phone} onChange={set("phone")} required className={inputClass} />
          </div>
          <input type="email" placeholder={t("email")} value={form.email} onChange={set("email")} required className={inputClass} />

          {/* Delivery toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {(["pickup", "delivery"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setForm((p) => ({ ...p, delivery_method: method }))}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  form.delivery_method === method
                    ? "bg-[var(--gold)] text-white"
                    : "bg-white text-[var(--muted)] hover:text-[var(--charcoal)]"
                }`}
              >
                {t(method)}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {form.delivery_method === "delivery" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  placeholder={t("address")}
                  value={form.address}
                  onChange={set("address")}
                  required
                  className={inputClass}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input type="text" placeholder={t("deliveryNotes")} value={form.delivery_notes} onChange={set("delivery_notes")} className={inputClass} />

          {/* Logo upload */}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" className="hidden"
            onChange={handleFileChange} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 text-[var(--muted)] text-sm hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
          >
            <Upload size={15} />
            {logoFile ? logoFile.name : t("logo")}
          </button>

          <textarea
            placeholder={t("notes")}
            value={form.notes}
            onChange={set("notes")}
            rows={3}
            className={`${inputClass} resize-none`}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[var(--gold)] text-white rounded-xl font-semibold text-sm hover:bg-[#b8915a] transition-colors disabled:opacity-60 shadow-md"
          >
            {loading ? (locale === "he" ? "שולח..." : "Sending...") : t("submit")}
          </button>
        </form>

        {/* ── Order Summary ─────────────────────────────────────────────────── */}
        <div className="bg-[var(--cream)] rounded-2xl p-6 lg:sticky lg:top-24">
          <h2 className="font-semibold text-[var(--charcoal)] mb-5">{tc("title")}</h2>
          <ul className="space-y-4 mb-6">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--charcoal)] truncate">{item.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {item.quantity} × ₪{item.price_per_unit}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-[var(--charcoal)]">
                    ₪{item.subtotal.toLocaleString("he-IL")}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-[var(--charcoal)]">{tc("total")}</span>
            <span className="font-bold text-2xl text-[var(--charcoal)]">
              ₪{totalAmount.toLocaleString("he-IL")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
