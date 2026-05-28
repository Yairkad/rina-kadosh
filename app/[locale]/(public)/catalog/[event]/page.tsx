export const revalidate = 300;

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";

interface Props {
  params: Promise<{ locale: string; event: string }>;
}

export default async function EventPage({ params }: Props) {
  const { event } = await params;
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: eventType } = await supabase
    .from("event_types")
    .select("id, name_he, name_en")
    .eq("slug", event)
    .eq("status", "published")
    .single();

  if (!eventType) notFound();

  const { data: styles } = await supabase
    .from("design_styles")
    .select("id, slug, name_he, name_en, og_image")
    .eq("event_type_id", eventType.id)
    .eq("status", "published")
    .order("display_order");

  const eventName = locale === "he" ? eventType.name_he : eventType.name_en;

  return (
    <section className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors mb-10"
        >
          <span>{locale === "he" ? "→" : "←"}</span>
          {locale === "he" ? "חזרה לדף הבית" : "Back to Home"}
        </Link>

        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-2">
            {locale === "he" ? "סגנונות עיצוב" : "Design Styles"}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--charcoal)]">
            {eventName}
          </h1>
        </div>

        {(styles ?? []).length > 0 ? (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {(styles ?? []).map((style) => {
              const name = locale === "he" ? style.name_he : style.name_en;
              return (
                <li key={style.id}>
                  <Link
                    href={`/${locale}/catalog/${event}/${style.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
                      {style.og_image ? (
                        <Image
                          src={style.og_image}
                          alt={name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                          <span className="text-3xl text-gray-200">✦</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <h3 className="absolute bottom-4 start-4 text-white font-semibold text-lg">
                        {name}
                      </h3>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-24 text-[var(--muted)]">
            <p>אין סגנונות זמינים כרגע</p>
          </div>
        )}
      </div>
    </section>
  );
}
