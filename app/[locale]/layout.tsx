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
  title: "רינה קדוש | Rina Kadosh",
  description: "מוצרים מודפסים למיתוג ושדרוג אווירה באירועים",
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
