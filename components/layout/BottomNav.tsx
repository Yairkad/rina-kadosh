"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Info, ShoppingBag, Phone } from "lucide-react";

export default function BottomNav() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();

  const links = [
    { href: `/${locale}`, icon: Home, label: "בית" },
    { href: `/${locale}/catalog`, icon: BookOpen, label: t("catalog") },
    { href: `/${locale}/about`, icon: Info, label: "אודות" },
    { href: `/${locale}/cart`, icon: ShoppingBag, label: t("cart") },
    { href: `/${locale}/contact`, icon: Phone, label: t("contact") },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[var(--cream)] border-t border-gray-200 safe-area-pb">
      <ul className="flex items-center justify-around h-16">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== `/${locale}` && pathname.startsWith(href));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2 transition-colors ${
                  active ? "text-[var(--gold)]" : "text-[var(--muted)]"
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
