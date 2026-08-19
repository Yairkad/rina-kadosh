export const revalidate = 300; // cache 5 min

import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import HeroSection from "@/components/home/HeroSection";
import ProcessSteps from "@/components/home/ProcessSteps";
import ExpandingEventCards from "@/components/catalog/ExpandingEventCards";
import type { EventTypeItem } from "@/components/catalog/ExpandingEventCards";
import { GeometricPattern } from "@/components/ui/GeometricPattern";

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
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Marble texture — short strip at the very top only, ends well above the cards */}
          <div className="absolute top-0 inset-x-0 h-[320px] sm:h-[380px] -z-20 overflow-hidden">
            <Image
              src="/textures/marble-bg.jpg"
              alt=""
              fill
              quality={60}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[var(--cream)]/70" />
          </div>

          {/* Geometric pattern — inset on all 4 sides (never touches the section edges), taller than the marble strip */}
          <GeometricPattern
            className="absolute inset-8 sm:inset-10 lg:inset-12 -z-10"
            color="var(--terracotta)"
            opacity={0.14}
            size={40}
          />

          <div className="max-w-7xl mx-auto relative z-10">
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

      <ProcessSteps />

    </>
  );
}
