export const revalidate = 300;

import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export default async function GalleryPage() {
  const locale = await getLocale();
  const supabase = await createClient();

  const [{ data: items }, { data: eventTypes }] = await Promise.all([
    supabase
      .from("gallery_items")
      .select("id, title_he, title_en, images, event_type_id")
      .eq("active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("event_types")
      .select("id, name_he, name_en")
      .eq("status", "published"),
  ]);

  const isHe = locale === "he";

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <section className="pt-16 pb-12 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--charcoal)] mb-3 tracking-tight">
          {isHe ? "גלריה" : "Gallery"}
        </h1>
        <p className="text-[var(--muted)] text-sm max-w-md mx-auto leading-relaxed">
          {isHe
            ? "השראה ועבודות שאנחנו גאים בהן"
            : "Inspiration and works we're proud of"}
        </p>
        <div className="mt-5 w-12 h-px bg-[var(--gold)] mx-auto" />
      </section>

      <GalleryGrid
        items={items ?? []}
        eventTypes={eventTypes ?? []}
        locale={locale}
      />
    </div>
  );
}
