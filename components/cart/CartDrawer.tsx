"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function CartDrawer() {
  const locale = useLocale();
  const { items, isOpen, closeDrawer, removeItem, updateQuantity, totalAmount } = useCart();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeDrawer]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isRTL = locale === "he";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />

          {/* Drawer — side on desktop, bottom on mobile */}
          <motion.div
            className={[
              "fixed z-50 bg-[var(--cream)] shadow-2xl flex flex-col",
              // Mobile: bottom sheet
              "bottom-0 inset-x-0 rounded-t-2xl max-h-[90vh]",
              // Desktop: side panel
              "md:bottom-0 md:top-0 md:inset-x-auto md:rounded-none md:w-[400px]",
              isRTL ? "md:left-0" : "md:right-0",
            ].join(" ")}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            style={{}}
            // Override for desktop: slide from side
            // (handled via CSS classes above + framer override below)
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-[var(--charcoal)] flex items-center gap-2">
                <ShoppingBag size={18} className="text-[var(--gold)]" />
                {locale === "he" ? "העגלה שלך" : "Your Cart"}
                {items.length > 0 && (
                  <span className="text-sm text-[var(--muted)] font-normal">
                    ({items.reduce((s, i) => s + i.quantity, 0)})
                  </span>
                )}
              </h2>
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[var(--muted)] transition-colors"
                aria-label="סגור"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-[var(--muted)] gap-3">
                  <ShoppingBag size={32} className="opacity-30" />
                  <p className="text-sm">{locale === "he" ? "העגלה ריקה" : "Your cart is empty"}</p>
                  <button
                    onClick={closeDrawer}
                    className="text-xs text-[var(--gold)] underline underline-offset-2"
                  >
                    {locale === "he" ? "המשיכו לקנות" : "Continue shopping"}
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200 text-lg">✦</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-[var(--charcoal)] line-clamp-2 leading-snug">
                          {item.name}
                          {item.is_bundle && (
                            <span className="ms-1 text-[10px] font-medium px-1.5 py-0.5 bg-[var(--gold)] text-white rounded-full">
                              חבילה
                            </span>
                          )}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                          aria-label="הסר"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {/* Qty controls — bundles can't change qty */}
                        {item.is_bundle ? (
                          <span className="text-xs text-[var(--muted)]">×{item.quantity}</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-[var(--charcoal)] transition-colors"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-[var(--charcoal)] transition-colors"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        )}
                        <span className="text-sm font-semibold text-[var(--charcoal)]">
                          ₪{item.subtotal.toLocaleString("he-IL")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 px-5 py-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">{locale === "he" ? "סה\"כ" : "Total"}</span>
                  <span className="text-lg font-bold text-[var(--charcoal)]">
                    ₪{totalAmount.toLocaleString("he-IL")}
                  </span>
                </div>
                <Link
                  href={`/${locale}/cart`}
                  onClick={closeDrawer}
                  className="block w-full text-center bg-[var(--charcoal)] text-white text-sm font-medium py-3 rounded-xl hover:bg-[var(--gold)] transition-colors"
                >
                  {locale === "he" ? "המשך להזמנה" : "Proceed to Order"}
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
