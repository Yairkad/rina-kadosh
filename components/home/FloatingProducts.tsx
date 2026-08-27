"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

// Positions started as the user's Illustrator mockup (2169x1000 canvas)
// percentages, then were shifted right + spread apart so the whole
// composition sits centered on the page with more breathing room between
// items (the mockup itself was left-weighted and tighter). The pearls
// overlay below is shifted by the same translation (not the full scale —
// see cerebrum: a scaled, animated, overflow-clipped full-bleed layer is
// the suspected cause of a Chromium tearing bug reported on this section;
// dropping the scale is the current fix attempt) so it stays roughly
// aligned with the shifted products. Add more products by adding an entry
// here (drop the cutout PNG in public/floating/ first).
const PEARLS_TRANSFORM = "translateX(12.25%)";

const FLOATING_IMAGES: {
  src: string;
  alt: string;
  width: number;
  height: number;
  widthPct: number;
  centerXPct: number;
  centerYPct: number;
  delay: number;
  durationS: number;
}[] = [
  {
    src: "/floating/scroll-seal.png",
    alt: "מגילת ברכה עם חותם שעווה אדום",
    width: 1000,
    height: 1000,
    widthPct: 16,
    centerXPct: 31,
    centerYPct: 22,
    delay: 0,
    durationS: 5.4,
  },
  {
    src: "/floating/gift-box.png",
    alt: "מארז שי מעוצב עם סרט",
    width: 1000,
    height: 1000,
    widthPct: 12,
    centerXPct: 77,
    centerYPct: 33,
    delay: 300,
    durationS: 6.6,
  },
  {
    src: "/floating/wax-seal.png",
    alt: "הזמנה עם חותם שעווה ומונוגרם",
    width: 813,
    height: 1000,
    widthPct: 17,
    centerXPct: 84,
    centerYPct: 60,
    delay: 600,
    durationS: 7.2,
  },
  {
    src: "/floating/bencher-stand.png",
    alt: "ברכת המזון בעיצוב אישי",
    width: 942,
    height: 1000,
    widthPct: 15,
    centerXPct: 18,
    centerYPct: 65,
    delay: 900,
    durationS: 5.9,
  },
];

export default function FloatingProducts() {
  const t = useTranslations("home");

  return (
    <section className="relative w-full aspect-[2169/1000] min-h-[420px] sm:min-h-0 overflow-hidden">
      {/* Pearls — pre-composed overlay matching the mockup canvas exactly. Shifted to roughly track
          the products' recentered positions below. Shift and animation live on separate nested
          elements — a CSS animation on `transform` clobbers any other transform (inline or class)
          set on the same element. */}
      <div
        className="absolute inset-0 z-40 pointer-events-none"
        style={{ transform: PEARLS_TRANSFORM }}
      >
        <div className="relative w-full h-full animate-float-slow">
          <Image
            src="/floating/pearls-overlay.png"
            alt=""
            fill
            aria-hidden
            className="object-cover select-none"
            sizes="100vw"
          />
        </div>
      </div>

      {/* Floating product images */}
      {FLOATING_IMAGES.map((img) => (
        <div
          key={img.src}
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `${img.widthPct}%`,
            left: `${img.centerXPct}%`,
            top: `${img.centerYPct}%`,
          }}
        >
          {/* Nested so the float animation's own `transform` doesn't clobber the centering translate
              above. Duration varies per item (not just delay) so they drift in and out of phase
              rather than reading as one synchronized group. */}
          <div
            className="animate-float"
            style={{ animationDelay: `${img.delay}ms`, animationDuration: `${img.durationS}s` }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              className="w-full h-auto object-contain drop-shadow-xl"
              sizes="(min-width: 768px) 260px, 140px"
            />
          </div>
        </div>
      ))}

      {/* Text block — centered, with a small brand accent above the lead line */}
      <motion.div
        className="absolute z-30 text-center"
        style={{ left: "31%", top: "31%", width: "38%" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span aria-hidden className="text-[var(--terracotta)] text-sm">✦</span>
        <p className="mt-4 font-heading text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide text-[var(--charcoal)] leading-relaxed">
          {t("floating_lead")}
        </p>
        <p className="mt-5 text-sm sm:text-base md:text-lg text-[var(--charcoal)]/75 leading-relaxed">
          {t("floating_body1")}
        </p>
      </motion.div>
    </section>
  );
}
