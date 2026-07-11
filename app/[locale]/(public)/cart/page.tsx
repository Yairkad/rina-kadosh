"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Trash2, Upload, CheckCircle, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { createClient } from "@/lib/supabase/client";
import { submitOrder } from "@/app/actions/submit-order";
import { applyCoupon } from "@/app/actions/apply-coupon";
import { sanitizePhone, isValidPhone, PHONE_ERROR_HE, PHONE_ERROR_EN } from "@/lib/phone";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

type AppliedCoupon = { code: string; discount_type: "percent" | "amount"; discount_value: number };

function couponErrorMessage(code: string, locale: string) {
  const MAP: Record<string, [string, string]> = {
    not_found:         ["קוד קופון לא קיים", "Coupon code not found"],
    inactive:          ["קופון זה אינו פעיל", "This coupon is inactive"],
    not_yet_valid:     ["קופון זה עדיין לא בתוקף", "This coupon is not yet valid"],
    expired:           ["קופון זה פג תוקף", "This coupon has expired"],
    max_uses_reached:  ["קופון זה מוצה", "This coupon has reached its usage limit"],
    invalid:           ["קוד קופון לא תקין", "Invalid coupon code"],
  };
  const [he, en] = MAP[code] ?? MAP.invalid;
  return locale === "he" ? he : en;
}

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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
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
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_MIME.includes(file.type)) {
      setLogoError(locale === "he" ? "סוג קובץ לא נתמך. השתמש ב-JPG, PNG, WEBP, GIF או PDF." : "Unsupported file type. Use JPG, PNG, WEBP, GIF or PDF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setLogoError(locale === "he" ? "הקובץ גדול מדי (מקסימום 5MB)." : "File too large (max 5MB).");
      return;
    }

    setLogoError(null);
    uploadLogo(file);
  }

  function uploadLogo(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const path = `orders/${Date.now()}.${ext}`;
    const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/logos/${path}`;

    setLogoFile(file);
    setLogoUrl(null);
    setLogoUploading(true);
    setLogoProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    xhr.setRequestHeader("Authorization", `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setLogoProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      setLogoUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        setLogoUrl(createClient().storage.from("logos").getPublicUrl(path).data.publicUrl);
      } else {
        setLogoFile(null);
        setLogoError(locale === "he" ? "לא ניתן להעלות את הלוגו. אנא נסה שוב." : "Could not upload logo. Please try again.");
      }
    };
    xhr.onerror = () => {
      setLogoUploading(false);
      setLogoFile(null);
      setLogoError(locale === "he" ? "לא ניתן להעלות את הלוגו. אנא נסה שוב." : "Could not upload logo. Please try again.");
    };
    xhr.send(file);
  }

  function removeLogo() {
    setLogoFile(null);
    setLogoUrl(null);
    setLogoProgress(0);
    setLogoError(null);
  }

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;

    setCouponApplying(true);
    setCouponError(null);
    const result = await applyCoupon(code);
    setCouponApplying(false);

    if (!result.valid) {
      setCouponError(couponErrorMessage(result.error, locale));
      return;
    }

    setAppliedCoupon({ code: code.toUpperCase(), discount_type: result.discount_type, discount_value: result.discount_value });
    setCouponInput("");
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponError(null);
  }

  const discountAmount = appliedCoupon
    ? Math.min(
        Math.round(
          (appliedCoupon.discount_type === "percent"
            ? totalAmount * appliedCoupon.discount_value / 100
            : appliedCoupon.discount_value) * 100
        ) / 100,
        totalAmount
      )
    : 0;
  const finalTotal = Math.round((totalAmount - discountAmount) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isValidPhone(form.phone)) {
      setError(locale === "he" ? PHONE_ERROR_HE : PHONE_ERROR_EN);
      setLoading(false);
      return;
    }

    if (logoUploading) {
      setError(locale === "he" ? "המתן לסיום העלאת הלוגו." : "Please wait for the logo upload to finish.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      // Upload any per-item custom images (base64 → Supabase Storage)
      const itemsWithCustomization = await Promise.all(
        items.map(async (item) => {
          let custom_image_url: string | undefined;
          if (item.custom_image) {
            try {
              const res = await fetch(item.custom_image);
              const blob = await res.blob();
              const ext = blob.type.includes("pdf") ? "pdf" : blob.type.split("/")[1] || "png";
              const path = `personalizations/${Date.now()}-${item.id}.${ext}`;
              const { data: up } = await supabase.storage.from("logos").upload(path, blob);
              if (up) custom_image_url = supabase.storage.from("logos").getPublicUrl(path).data.publicUrl;
            } catch {
              // non-fatal — proceed without image URL
            }
          }
          return {
            id:               item.id,
            is_bundle:        item.is_bundle,
            quantity:         item.quantity,
            custom_text:      item.custom_text      || undefined,
            custom_image_url: custom_image_url      || undefined,
          };
        })
      );

      const payload = {
        customer_name:    form.name,
        customer_phone:   form.phone,
        customer_email:   form.email,
        delivery_method:  form.delivery_method,
        delivery_address: form.delivery_method === "delivery" ? form.address : undefined,
        delivery_notes:   form.delivery_notes || undefined,
        logo_url:         logoUrl || undefined,
        special_requests: form.notes || undefined,
        coupon_code:      appliedCoupon?.code,
        items:            itemsWithCustomization,
      };
      console.log("[submitOrder] payload:", payload);

      // Server action validates prices, computes total, inserts order
      const result = await submitOrder(payload);
      console.log("[submitOrder] result:", result);

      setLoading(false);

      if ("error" in result) {
        console.error("[submitOrder] failed:", result.error);
        if (result.error === "invalid_coupon") {
          setAppliedCoupon(null);
          setError(locale === "he" ? "הקופון כבר אינו תקף. הוא הוסר — נסה לשלוח שוב." : "The coupon is no longer valid. It's been removed — please try submitting again.");
        } else {
          setError(locale === "he" ? `שגיאה בשליחת ההזמנה: ${result.error}` : `Error submitting order: ${result.error}`);
        }
        return;
      }

      setOrderNumber(result.order_number);
      clearCart();
    } catch (err) {
      console.error("[submitOrder] threw:", err);
      setLoading(false);
      setError(locale === "he" ? `שגיאה בלתי צפויה: ${err instanceof Error ? err.message : String(err)}` : `Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
    }
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
            <input type="tel" placeholder={t("phone")} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: sanitizePhone(e.target.value) }))} required inputMode="numeric" className={inputClass} />
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

          {!logoFile ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 text-[var(--muted)] text-sm hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
            >
              <Upload size={15} />
              {t("logo")}
            </button>
          ) : (
            <div className="px-4 py-3 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-[var(--charcoal)] truncate">{logoFile.name}</span>
                <button type="button" onClick={removeLogo} className="text-gray-400 hover:text-red-400 transition-colors shrink-0">
                  <X size={15} />
                </button>
              </div>
              {logoUploading && (
                <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[var(--gold)] transition-all" style={{ width: `${logoProgress}%` }} />
                </div>
              )}
              {!logoUploading && logoUrl && (
                <p className="mt-1 text-xs text-[var(--gold)]">{locale === "he" ? "הועלה בהצלחה" : "Uploaded"}</p>
              )}
            </div>
          )}
          {logoError && <p className="text-red-500 text-xs">{logoError}</p>}

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
            disabled={loading || logoUploading}
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

          {/* Coupon */}
          <div className="pt-4 border-t border-gray-200">
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder={t("couponPlaceholder")}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-[var(--charcoal)] placeholder:text-gray-400 focus:outline-none focus:border-[var(--gold)] transition-colors uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponApplying || !couponInput.trim()}
                  className="shrink-0 px-4 py-2 rounded-lg bg-[var(--charcoal)] text-white text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
                >
                  {couponApplying ? (locale === "he" ? "בודק..." : "Checking...") : t("couponApply")}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white border border-[var(--gold)]/40">
                <span className="text-sm text-[var(--charcoal)]">
                  {t("couponApplied")}: <b className="font-mono">{appliedCoupon.code}</b>
                </span>
                <button type="button" onClick={removeCoupon} className="text-gray-400 hover:text-red-400 transition-colors shrink-0">
                  <X size={15} />
                </button>
              </div>
            )}
            {couponError && <p className="text-red-500 text-xs mt-1.5">{couponError}</p>}
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-2">
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--muted)]">{t("couponApplied")}</span>
                <span className="text-[var(--gold)] font-medium">-₪{discountAmount.toLocaleString("he-IL")}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[var(--charcoal)]">{tc("total")}</span>
              <span className="font-bold text-2xl text-[var(--charcoal)]">
                ₪{finalTotal.toLocaleString("he-IL")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
