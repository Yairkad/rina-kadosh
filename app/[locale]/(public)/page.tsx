import { createClient } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import HeroSection from "@/components/home/HeroSection";
import WhySection from "@/components/home/WhySection";
import ExpandingEventCards from "@/components/catalog/ExpandingEventCards";
import type { EventTypeItem } from "@/components/catalog/ExpandingEventCards";

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getTranslations("home");
  const supabase = await createClient();

  const { data: eventTypes } = await supabase
    .from("event_types")
    .select("id, slug, name_he, name_en, image")
    .eq("status", "published")
    .order("display_order");

  const eventItems: EventTypeItem[] = (eventTypes ?? []).map((e) => ({
    id: e.id,
    slug: e.slug,
    name: locale === "he" ? e.name_he : e.name_en,
    image: e.image,
  }));

  return (
    <>
      <HeroSection />

      {/* Event Type Selection — ExpandingCards */}
      {eventItems.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-semibold text-[var(--charcoal)]">
                {t("events_title")}
              </h2>
              <p className="mt-3 text-[var(--muted)] text-sm">{t("events_subtitle")}</p>
            </div>
            <ExpandingEventCards items={eventItems} />
          </div>
        </section>
      )}

      <WhySection />

      {/* Bottom CTA */}
      <section className="py-20 px-4 bg-[var(--cream)]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-[var(--charcoal)] mb-6">
            {t("contact_cta")}
          </h2>
          <Link
            href={`/${locale}/contact`}
            className="inline-block px-10 py-3.5 rounded-full bg-[var(--gold)] text-white font-medium text-sm hover:bg-[#b8915a] transition-colors shadow-md"
          >
            {t("contact_cta")}
          </Link>
        </div>
      </section>
    </>
  );
}
