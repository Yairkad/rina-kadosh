"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function HeroSection() {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#FAF8F5] via-[#F5EEE3] to-[#FAF8F5]">
      {/* Background glow blobs */}
      <motion.div
        className="absolute top-16 end-[8%] w-72 h-72 rounded-full bg-[var(--gold)] opacity-[0.08] blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.18, 1], opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-24 start-[4%] w-96 h-96 rounded-full bg-[var(--gold)] opacity-[0.05] blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
      />

      {/* Floating dots */}
      <motion.div
        className="absolute top-28 start-[18%] w-2.5 h-2.5 rounded-full bg-[var(--gold)] opacity-50 pointer-events-none"
        animate={{ y: [-12, 12, -12] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-36 end-[22%] w-2 h-2 rounded-full bg-[var(--gold)] opacity-35 pointer-events-none"
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      />
      <motion.div
        className="absolute top-1/2 end-[6%] w-16 h-16 border border-[var(--gold)] opacity-15 rounded-full pointer-events-none"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-[30%] start-[6%] w-8 h-8 border border-[var(--gold)] opacity-10 rounded-full pointer-events-none"
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      />

      {/* Main content */}
      <div className="relative text-center px-4 max-w-3xl mx-auto">
        <motion.span
          className="inline-block text-xs font-semibold text-[var(--gold)] tracking-[0.25em] uppercase mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {t("tagline")}
        </motion.span>

        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-[var(--charcoal)] leading-tight"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.15 }}
        >
          {t("title")}
        </motion.h1>

        <motion.p
          className="mt-6 text-lg sm:text-xl text-[var(--muted)] max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.32 }}
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.48 }}
        >
          <Link
            href={`/${locale}/catalog`}
            className="px-9 py-3.5 rounded-full bg-[var(--gold)] text-white font-medium text-sm tracking-wide hover:bg-[#b8915a] transition-colors shadow-lg shadow-[var(--gold)]/20 hover:shadow-xl hover:shadow-[var(--gold)]/30"
          >
            {t("cta")}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="px-9 py-3.5 rounded-full border border-[var(--charcoal)]/30 text-[var(--charcoal)] font-medium text-sm tracking-wide hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
          >
            {t("contact_cta")}
          </Link>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40 pointer-events-none"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-px h-8 bg-[var(--charcoal)]" />
      </motion.div>
    </section>
  );
}
