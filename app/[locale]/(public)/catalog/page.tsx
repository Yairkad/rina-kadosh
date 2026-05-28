import { createClient } from "@/lib/supabase/server";
import ExpandingEventCards from "@/components/catalog/ExpandingEventCards";
import type { EventTypeItem } from "@/components/catalog/ExpandingEventCards";
import { getLocale } from "next-intl/server";

export default async function CatalogPage() {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: eventTypes } = await supabase
    .from("event_types")
    .select("id, slug, name_he, name_en, image")
    .eq("status", "published")
    .order("display_order");

  const items: EventTypeItem[] = (eventTypes ?? []).map((e) => ({
    id: e.id,
    slug: e.slug,
    name: locale === "he" ? e.name_he : e.name_en,
    image: e.image,
  }));

  return (
    <section className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--charcoal)] mb-3">
            {locale === "he" ? "בחרו סוג אירוע" : "Choose Event Type"}
          </h1>
          <p className="text-[var(--muted)] text-sm">
            {locale === "he"
              ? "בחרו את סוג האירוע שלכם לצפייה במוצרים המתאימים"
              : "Select your event type to explore matching products"}
          </p>
        </div>

        {items.length > 0 ? (
          <ExpandingEventCards items={items} />
        ) : (
          <div className="text-center py-24 text-[var(--muted)]">
            <p>אין סוגי אירועים זמינים כרגע</p>
          </div>
        )}
      </div>
    </section>
  );
}
