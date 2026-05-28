"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
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

export default function ProductAddToCart({
  productId, name, pricePerUnit, image, minType, minValue, eventSlug, styleSlug,
}: Props) {
  const t = useTranslations("product");
  const locale = useLocale();
  const { addItem, validateItem } = useCart();

  const initialQty = minType === "units" && minValue ? Math.ceil(minValue) : 1;
  const [qty, setQty] = useState(initialQty);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const change = (delta: number) => {
    const next = Math.max(1, qty + delta);
    setQty(next);
    setError(null);
  };

  const handleAdd = () => {
    const validation = validateItem({ price_per_unit: pricePerUnit, min_type: minType, min_value: minValue }, qty);
    if (!validation.valid) {
      setError(validation.error ?? "כמות לא תקינה");
      return;
    }
    addItem({ id: productId, name, price_per_unit: pricePerUnit, quantity: qty, image, is_bundle: false, min_type: minType, min_value: minValue, event_slug: eventSlug, style_slug: styleSlug });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const subtotal = (pricePerUnit * qty).toLocaleString("he-IL");

  return (
    <div className="space-y-4">
      {/* Min order info */}
      {minType && minValue && (
        <p className="text-xs text-[var(--muted)] bg-[var(--cream)] px-3 py-2 rounded-lg">
          {t("minOrder")}: {minType === "units" ? t("minUnits", { value: minValue }) : t("minAmount", { value: minValue })}
        </p>
      )}

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
