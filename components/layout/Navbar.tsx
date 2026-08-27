"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const { items, openDrawer } = useCart();
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const otherLocale = locale === "he" ? "en" : "he";
  const switchLocale = () => {
    const segments = pathname.split("/");
    segments[1] = otherLocale;
    router.push(segments.join("/") || "/");
  };

  const navLinks = [
    { href: `/${locale}/catalog`, label: t("catalog") },
    { href: "#", label: t("brandedBars") },
    { href: "#", label: t("marketTable") },
    { href: `/${locale}/gallery`, label: t("gallery") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  return (
    <>
      <motion.header
        className="fixed top-0 inset-x-0 z-50 transition-colors duration-300"
        animate={{
          backgroundColor: scrolled ? "rgba(183,179,132,0.97)" : "rgba(183,179,132,0)",
          backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.06)" : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.3 }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo — masked to force the exact brand color (source PNG is already close, but not guaranteed exact) */}
          <Link href={`/${locale}`} className="shrink-0">
            <span
              role="img"
              aria-label="Rina Kadosh"
              className="block h-14"
              style={{
                aspectRatio: "3900 / 1000",
                backgroundColor: "#222813",
                WebkitMaskImage: "url(/images/logo2.png)",
                maskImage: "url(/images/logo2.png)",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            />
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-4">
            {navLinks.map((link, i) => (
              <li key={link.label} className="flex items-center gap-4">
                <Link
                  href={link.href}
                  className="text-sm font-medium text-[var(--charcoal)] hover:text-[var(--terracotta)] transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 start-0 w-0 h-px bg-[var(--terracotta)] transition-all group-hover:w-full" />
                </Link>
                {i < navLinks.length - 1 && (
                  <span aria-hidden="true" className="text-[var(--terracotta)] text-xs select-none">
                    ✦
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={switchLocale}
              className="hidden sm:flex text-xs font-medium px-2.5 py-1 rounded-full border border-[var(--terracotta)] text-[var(--terracotta)] hover:bg-[var(--terracotta)] hover:text-white transition-colors"
            >
              {otherLocale === "he" ? "עב" : "EN"}
            </button>

            {/* Cart */}
            <button
              onClick={openDrawer}
              className="relative p-2 text-[var(--charcoal)] hover:text-[var(--terracotta)] transition-colors"
              aria-label={t("cart")}
            >
              <ShoppingBag size={20} />
              {items.length > 0 && (
                <span className="absolute top-0.5 end-0.5 w-4 h-4 rounded-full bg-[var(--terracotta)] text-white text-[10px] font-bold flex items-center justify-center">
                  {items.length > 9 ? "9+" : items.length}
                </span>
              )}
            </button>

            {/* Mobile menu toggle — shown on mobile only */}
            <button
              className="md:hidden p-2 text-[var(--charcoal)]"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden bg-[var(--marble)] border-t border-gray-100"
            >
              <ul className="px-4 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block text-base font-medium text-[var(--charcoal)] hover:text-[var(--terracotta)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => { switchLocale(); setMobileOpen(false); }}
                    className="text-sm font-medium text-[var(--muted)] hover:text-[var(--terracotta)] transition-colors"
                  >
                    {otherLocale === "he" ? "עברית" : "English"}
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer so content doesn't hide under fixed header */}
      <div className="h-16" />
    </>
  );
}
