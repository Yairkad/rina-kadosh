"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

// Photo carousel removed until better-quality hero photos are provided —
// see components/home/HeroSection.tsx entry in .wolf/cerebrum.md. Also
// need a dedicated (not just scaled-down) mobile hero image when those arrive.

export default function HeroSection() {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <section className="relative -mt-16 min-h-[100dvh] flex items-center justify-center overflow-hidden bg-marble bg-cover bg-center">
      {/* Circles motif — spans the full hero height, tiled across the width, behind the content */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: "url(/hero/circles-pattern.png)",
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "center",
        }}
      />

      {/* Main content — centered on the physical middle of the section regardless of RTL document direction */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center px-4">
        <motion.div
          className="w-40 sm:w-52 md:w-60"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Image
            src="/hero/monogram.png"
            alt="Rina Kadosh"
            width={1604}
            height={1000}
            className="w-full h-auto"
          />
        </motion.div>

        <motion.h1
          className="mt-6 font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-tight whitespace-nowrap"
          style={{ color: "#222813" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.85, delay: 0.25 }}
        >
          {t("hero_line1")}
          <br />
          {t("hero_line2")}
        </motion.h1>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
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
