import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import CartRecoveryPopup from "@/components/cart/CartRecoveryPopup";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "רינה קדוש | מוצרים מודפסים לאירועים",
  description: "מוצרים מודפסים מעוצבים לחתונות, בר מצוות, שבתות ואירועי חברה. הזמנות, תפריטים, כרטיסי שולחן ועוד — עיצוב אישי ואיכות גבוהה.",
  openGraph: {
    title: "רינה קדוש | מוצרים מודפסים לאירועים",
    description: "מוצרים מודפסים מעוצבים לחתונות, בר מצוות, שבתות ואירועי חברה. עיצוב אישי ואיכות גבוהה.",
    url: "https://rina-kadosh.vercel.app",
    siteName: "רינה קדוש",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "https://rina-kadosh.vercel.app/api/og",
        width: 1200,
        height: 630,
        alt: "רינה קדוש — מוצרים מודפסים לאירועים",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "רינה קדוש | מוצרים מודפסים לאירועים",
    description: "מוצרים מודפסים מעוצבים לחתונות, בר מצוות, שבתות ואירועי חברה.",
    images: ["https://rina-kadosh.vercel.app/api/og"],
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "he" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            {children}
            <CartDrawer />
            <CartRecoveryPopup />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
