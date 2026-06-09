import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations("nav");

  return (
    <footer className="bg-[var(--charcoal)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-semibold text-[var(--gold-light,#E8D5A3)] mb-2">
              רינה קדוש
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              מוצרים מודפסים למיתוג ושדרוג אווירה באירועים
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              ניווט
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href={`/${locale}`} className="hover:text-[var(--gold)] transition-colors">בית</Link></li>
              <li><Link href={`/${locale}/catalog`} className="hover:text-[var(--gold)] transition-colors">{t("catalog")}</Link></li>
              <li><Link href={`/${locale}/gallery`} className="hover:text-[var(--gold)] transition-colors">{t("gallery")}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-[var(--gold)] transition-colors">{t("contact")}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              יצירת קשר
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--gold)] transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} רינה קדוש. כל הזכויות שמורות.
        </div>
      </div>
    </footer>
  );
}
