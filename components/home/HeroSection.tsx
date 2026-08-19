"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { GeometricPattern } from "@/components/ui/GeometricPattern";

export default function HeroSection() {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <section className="relative -mt-16 min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Marble background */}
      <Image
        src="/textures/marble-bg.jpg"
        alt=""
        fill
        priority
        quality={65}
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-white/55" />

      {/* Decorative pattern — full-bleed across the whole hero background */}
      <GeometricPattern
        className="absolute inset-0 pointer-events-none"
        color="var(--terracotta)"
        opacity={0.08}
        size={48}
      />

      {/* Main content */}
      <div className="relative text-center px-4 max-w-3xl mx-auto">
        <motion.div
          className="flex items-center justify-center gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span aria-hidden className="text-[var(--terracotta)] text-xs">✦</span>
          <span className="text-xs font-semibold text-[var(--terracotta)] tracking-[0.25em] uppercase">
            {t("tagline")}
          </span>
          <span aria-hidden className="text-[var(--terracotta)] text-xs">✦</span>
        </motion.div>

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
            className="px-9 py-3.5 rounded-full bg-[var(--terracotta)] text-white font-medium text-sm tracking-wide hover:bg-[var(--terracotta-dark)] transition-colors shadow-lg shadow-[var(--terracotta)]/20 hover:shadow-xl hover:shadow-[var(--terracotta)]/30"
          >
            {t("cta")}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="px-9 py-3.5 rounded-full border border-[var(--charcoal)]/30 text-[var(--charcoal)] font-medium text-sm tracking-wide hover:border-[var(--terracotta)] hover:text-[var(--terracotta)] transition-colors"
          >
            {t("contact_cta")}
          </Link>
        </motion.div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[var(--cream)] to-transparent pointer-events-none" />

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
