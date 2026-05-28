"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, ShoppingBag, X } from "lucide-react";
import { useCart, type ValidationResult } from "@/contexts/CartContext";
import { useLocale } from "next-intl";

interface QuickAddProps {
  productId: string;
  name: string;
  pricePerUnit: number;
  image: string | null;
  minType: "units" | "amount" | null;
  minValue: number | null;
  eventSlug: string;
  styleSlug: string;
}

// Desktop hover overlay
export function QuickAddOverlay(props: QuickAddProps) {
  const { addItem, validateItem } = useCart();
  const locale = useLocale();
  const [qty, setQty] = useState(props.minValue && props.minType === "units" ? props.minValue : 1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const changeQty = (delta: number) => {
    setQty((q) => Math.max(1, q + delta));
    setError(null);
  };

  const handleAdd = () => {
    const result: ValidationResult = validateItem(
      { price_per_unit: props.pricePerUnit, min_type: props.minType, min_value: props.minValue },
      qty
    );
    if (!result.valid) { setError(result.error ?? "שגיאה"); return; }
    addItem({
      id: props.productId,
      name: props.name,
      price_per_unit: props.pricePerUnit,
      quantity: qty,
      image: props.image,
      is_bundle: false,
      min_type: props.minType,
      min_value: props.minValue,
      event_slug: props.eventSlug,
      style_slug: props.styleSlug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 rounded-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {added ? (
        <motion.div
          initial={{ scale: 0.8 }} animate={{ scale: 1 }}
          className="text-white text-sm font-medium flex items-center gap-2"
        >
          <ShoppingBag size={16} />
          {locale === "he" ? "נוסף!" : "Added!"}
        </motion.div>
      ) : (
        <>
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-2 py-1">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); changeQty(-1); }} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
              <Minus size={12} />
            </button>
            <span className="text-white font-semibold w-8 text-center tabular-nums">{qty}</span>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); changeQty(1); }} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
              <Plus size={12} />
            </button>
          </div>
          {error && <p className="text-red-300 text-xs px-3 text-center">{error}</p>}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAdd(); }}
            className="flex items-center gap-1.5 bg-white text-[var(--charcoal)] text-xs font-semibold px-4 py-2 rounded-full hover:bg-[var(--gold)] hover:text-white transition-colors"
          >
            <ShoppingBag size={13} />
            {locale === "he" ? "הוסף לסל" : "Add to Cart"}
          </button>
        </>
      )}
    </motion.div>
  );
}

// Mobile + button → mini modal
export function QuickAddMobileButton(props: QuickAddProps) {
  const { addItem, validateItem } = useCart();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(props.minValue && props.minType === "units" ? props.minValue : 1);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    const result = validateItem(
      { price_per_unit: props.pricePerUnit, min_type: props.minType, min_value: props.minValue },
      qty
    );
    if (!result.valid) { setError(result.error ?? "שגיאה"); return; }
    addItem({
      id: props.productId,
      name: props.name,
      price_per_unit: props.pricePerUnit,
      quantity: qty,
      image: props.image,
      is_bundle: false,
      min_type: props.minType,
      min_value: props.minValue,
      event_slug: props.eventSlug,
      style_slug: props.styleSlug,
    });
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className="absolute bottom-3 end-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[var(--charcoal)] hover:bg-[var(--gold)] hover:text-white transition-colors z-10"
        aria-label={locale === "he" ? "הוסף לסל" : "Add to Cart"}
      >
        <Plus size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl p-5 shadow-xl"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[var(--charcoal)] text-sm line-clamp-2">{props.name}</h3>
                  <p className="text-sm text-[var(--gold)] font-medium mt-0.5">₪{props.pricePerUnit.toLocaleString("he-IL")}</p>
                </div>
                <button onClick={() => setOpen(false)} className="p-1 text-[var(--muted)]"><X size={18} /></button>
              </div>

              <div className="flex items-center justify-center gap-4 mb-4">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center">
                  <Minus size={16} />
                </button>
                <span className="text-xl font-bold w-10 text-center tabular-nums">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center">
                  <Plus size={16} />
                </button>
              </div>

              {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}

              <button
                onClick={handleAdd}
                className="w-full bg-[var(--charcoal)] text-white font-medium py-3 rounded-xl hover:bg-[var(--gold)] transition-colors"
              >
                {locale === "he" ? "הוסף לסל" : "Add to Cart"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
