"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";

const QUOTE_HE = "כי כל פרט קטן — מספר סיפור גדול.";
const QUOTE_EN = "Because every small detail — tells a big story.";

export default function InspirationSection() {
  const locale = useLocale();

  return (
    <section className="relative py-24 bg-[var(--charcoal)] overflow-hidden">
      {/* Background decorative star */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
        <span className="text-[22rem] font-bold text-white leading-none">✦</span>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Decorative line */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-12"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="h-px w-16 bg-[var(--gold)]/50" />
          <span className="text-[var(--gold)]">✦</span>
          <div className="h-px w-16 bg-[var(--gold)]/50" />
        </motion.div>

        {/* Quote */}
        <motion.blockquote
          className="text-3xl sm:text-4xl lg:text-5xl font-serif italic text-white leading-relaxed mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.1 }}
        >
          {locale === "he" ? QUOTE_HE : QUOTE_EN}
        </motion.blockquote>

        {/* Author */}
        <motion.p
          className="text-[var(--gold)] text-sm tracking-widest uppercase"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          — {locale === "he" ? "רינה קדוש" : "Rina Kadosh"}
        </motion.p>
      </div>
    </section>
  );
}
