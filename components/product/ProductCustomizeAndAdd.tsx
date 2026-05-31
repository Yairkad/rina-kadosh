"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Minus, Plus, ShoppingBag, Check, ChevronDown, Upload, X, Sparkles } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface Props {
  productId: string;
  name: string;
  pricePerUnit: number;
  image: string | null;
  minType: "units" | "amount" | null;
  minValue: number | null;
  eventSlug: string;
  styleSlug: string;
}

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "application/pdf"];
const MAX_SIZE = 500 * 1024;

export default function ProductCustomizeAndAdd({
  productId, name, pricePerUnit, image, minType, minValue, eventSlug, styleSlug,
}: Props) {
  const t = useTranslations("product");
  const locale = useLocale();
  const { addItem, validateItem } = useCart();

  const initialQty = minType === "units" && minValue ? Math.ceil(minValue) : 1;
  const [qty, setQty] = useState(initialQty);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCustomize, setShowCustomize] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const change = (delta: number) => {
    const next = Math.max(1, qty + delta);
    setQty(next);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);

    if (!ALLOWED_MIME.includes(file.type)) {
      setImageError(locale === "he" ? "סוג קובץ לא נתמך. השתמש ב-PNG, JPG או PDF" : "Unsupported file type. Use PNG, JPG, or PDF");
      return;
    }
    if (file.size > MAX_SIZE) {
      setImageError(locale === "he" ? "הקובץ גדול מדי. מקסימום 500KB" : "File too large. Max 500KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomImage(ev.target?.result as string);
      setCustomImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    const validation = validateItem({ price_per_unit: pricePerUnit, min_type: minType, min_value: minValue }, qty);
    if (!validation.valid) {
      setError(validation.error ?? (locale === "he" ? "כמות לא תקינה" : "Invalid quantity"));
      return;
    }
    addItem({
      id: productId,
      name,
      price_per_unit: pricePerUnit,
      quantity: qty,
      image,
      is_bundle: false,
      min_type: minType,
      min_value: minValue,
      event_slug: eventSlug,
      style_slug: styleSlug,
      custom_text: customText.trim() || undefined,
      custom_image: customImage ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const subtotal = (pricePerUnit * qty).toLocaleString("he-IL");
  const hasCustomization = customText.trim() || customImage;

  return (
    <div className="space-y-4">
      {/* Min order info */}
      {minType && minValue && (
        <p className="text-xs text-[var(--muted)] bg-[var(--cream)] px-3 py-2 rounded-lg">
          {t("minOrder")}: {minType === "units" ? t("minUnits", { value: minValue }) : t("minAmount", { value: minValue })}
        </p>
      )}

      {/* Personalization section */}
      <div className="border border-[var(--gold)]/30 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCustomize(!showCustomize)}
          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
            showCustomize || hasCustomization
              ? "bg-[var(--gold)]/10 text-[var(--gold)]"
              : "bg-[var(--cream)] text-[var(--charcoal)] hover:bg-[var(--gold)]/5"
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles size={15} />
            {locale === "he" ? "עיצוב מותאם אישית" : "Custom Design"}
            {hasCustomization && (
              <span className="text-[10px] bg-[var(--gold)] text-white rounded-full px-2 py-0.5 leading-4">
                {locale === "he" ? "נוסף" : "Added"}
              </span>
            )}
          </span>
          <motion.div animate={{ rotate: showCustomize ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {showCustomize && (
            <motion.div
              key="customize-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4 border-t border-[var(--gold)]/20">
                {/* Custom text */}
                <div>
                  <label className="block text-xs font-medium text-[var(--charcoal)] mb-1.5">
                    {locale === "he" ? "טקסט לעיצוב" : "Design Text"}
                  </label>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder={
                      locale === "he"
                        ? "הכנס את הטקסט שיופיע על המוצר..."
                        : "Enter text to appear on the product..."
                    }
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-[var(--gold)]/50 focus:ring-2 focus:ring-[var(--gold)]/10 placeholder:text-gray-300 text-[var(--charcoal)]"
                  />
                </div>

                {/* Image upload */}
                <div>
                  <label className="block text-xs font-medium text-[var(--charcoal)] mb-1.5">
                    {locale === "he" ? "העלאת לוגו / תמונה" : "Upload Logo / Image"}
                  </label>

                  {customImage ? (
                    <div className="flex items-center gap-3 p-3 border border-[var(--gold)]/30 rounded-xl bg-[var(--cream)]">
                      <img
                        src={customImage}
                        alt="custom"
                        className="w-12 h-12 object-contain rounded-lg bg-white border border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--charcoal)] truncate">{customImageName}</p>
                        <p className="text-[10px] text-[var(--muted)]">
                          {locale === "he" ? "תמונה מותאמת אישית" : "Custom image"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomImage(null);
                          setCustomImageName(null);
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                        aria-label="הסר תמונה"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed border-[var(--gold)]/30 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[var(--gold)]/60 hover:bg-[var(--cream)] transition-all duration-200"
                    >
                      <Upload size={20} className="text-[var(--gold)]/60" />
                      <span className="text-xs text-[var(--muted)]">
                        {locale === "he" ? "לחץ להעלאת קובץ" : "Click to upload"}
                      </span>
                      <span className="text-[10px] text-gray-300">
                        PNG, JPG, PDF · {locale === "he" ? "עד 500KB" : "up to 500KB"}
                      </span>
                    </button>
                  )}

                  <input
                    ref={fileRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf,.svg"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {imageError && <p className="text-red-500 text-xs mt-1">{imageError}</p>}
                </div>

                <p className="text-[10px] text-[var(--muted)]">
                  {locale === "he"
                    ? "פרטי ההתאמה יצורפו להזמנה ויועברו לעיצוב"
                    : "Customization details will be attached to the order"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Qty + subtotal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => change(-10)}
            className="px-3 py-3 text-[var(--muted)] hover:text-[var(--charcoal)] hover:bg-gray-50 transition-colors text-xs"
          >
            ‒10
          </button>
          <button onClick={() => change(-1)} className="px-3 py-3 text-[var(--muted)] hover:text-[var(--charcoal)] hover:bg-gray-50 transition-colors">
            <Minus size={14} />
          </button>
          <span className="w-12 text-center text-sm font-semibold text-[var(--charcoal)]">{qty}</span>
          <button onClick={() => change(1)} className="px-3 py-3 text-[var(--muted)] hover:text-[var(--charcoal)] hover:bg-gray-50 transition-colors">
            <Plus size={14} />
          </button>
          <button
            onClick={() => change(10)}
            className="px-3 py-3 text-[var(--muted)] hover:text-[var(--charcoal)] hover:bg-gray-50 transition-colors text-xs"
          >
            +10
          </button>
        </div>

        <div className="text-end">
          <p className="text-xs text-[var(--muted)]">{locale === "he" ? "סה״כ" : "Total"}</p>
          <p className="text-lg font-bold text-[var(--charcoal)]">₪{subtotal}</p>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* Add to Cart button */}
      <motion.button
        onClick={handleAdd}
        whileTap={{ scale: 0.97 }}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-all duration-300 ${
          added
            ? "bg-green-500 text-white"
            : "bg-[var(--gold)] text-white hover:bg-[#b8915a] shadow-md shadow-[var(--gold)]/20"
        }`}
      >
        {added ? (
          <>
            <Check size={18} />
            {locale === "he" ? "נוסף לסל!" : "Added!"}
          </>
        ) : (
          <>
            <ShoppingBag size={18} />
            {t("addToCart")}
          </>
        )}
      </motion.button>
    </div>
  );
}
