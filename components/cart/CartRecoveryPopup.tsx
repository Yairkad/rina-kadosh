"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { useLocale } from "next-intl";
import { ShoppingBag } from "lucide-react";

export default function CartRecoveryPopup() {
  const { hasSavedCart, dismissRecovery, openDrawer, items } = useCart();
  const locale = useLocale();

  const handleContinue = () => {
    dismissRecovery();
    openDrawer();
  };

  return (
    <AnimatePresence>
      {hasSavedCart && items.length > 0 && (
        <motion.div
          className="fixed bottom-24 md:bottom-6 start-4 md:start-6 z-50 max-w-xs bg-white rounded-2xl shadow-xl border border-gray-100 p-4"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.8 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--gold)] flex items-center justify-center flex-shrink-0">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--charcoal)]">
                {locale === "he" ? "יש לך עגלה שמורה" : "You have a saved cart"}
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {locale === "he" ? "רוצה להמשיך מאיפה שעצרת?" : "Want to continue where you left off?"}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleContinue}
                  className="text-xs font-medium px-3 py-1.5 bg-[var(--charcoal)] text-white rounded-lg hover:bg-[var(--gold)] transition-colors"
                >
                  {locale === "he" ? "המשך" : "Continue"}
                </button>
                <button
                  onClick={dismissRecovery}
                  className="text-xs font-medium px-3 py-1.5 text-[var(--muted)] hover:text-[var(--charcoal)] transition-colors"
                >
                  {locale === "he" ? "התחל מחדש" : "Start fresh"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
