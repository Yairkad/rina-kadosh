export const revalidate = 300;

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { GeometricPattern } from "@/components/ui/GeometricPattern";

interface Props {
  params: Promise<{ locale: string; event: string }>;
}

export default async function EventPage({ params }: Props) {
  const { event } = await params;
  const locale = await getLocale();
  const t = await getTranslations("catalog");
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
    <section className="relative min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      {/* Marble background */}
      <Image
        src="/textures/marble-bg.jpg"
        alt=""
        fill
        quality={60}
        sizes="100vw"
        className="object-cover -z-10"
      />
      <div className="absolute inset-0 -z-10 bg-white/55" />

      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--terracotta)] transition-colors mb-10"
        >
          <span>{locale === "he" ? "→" : "←"}</span>
          {t("backToHome")}
        </Link>

        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--terracotta)] mb-2">
            {t("chooseStyle")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--charcoal)]">
            {eventName}
          </h1>
        </div>

        {(styles ?? []).length > 0 ? (
          <ul className="space-y-16 sm:space-y-20 max-w-4xl mx-auto">
            {(styles ?? []).map((style, index) => {
              const name = locale === "he" ? style.name_he : style.name_en;
              const reversed = index % 2 === 1;
              return (
                <li key={style.id}>
                  <Link
                    href={`/${locale}/catalog/${event}/${style.slug}`}
                    className={`group flex flex-col sm:items-center gap-8 sm:gap-14 ${
                      reversed ? "sm:flex-row-reverse" : "sm:flex-row"
                    }`}
                  >
                    {/* Large circle photo up front, small pattern square peeking out from behind */}
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 mx-auto sm:mx-0">
                      <div className="absolute bottom-0 end-0 w-[55%] h-[55%] rounded-2xl bg-[var(--olive)] overflow-hidden">
                        <GeometricPattern className="absolute inset-0" color="var(--terracotta)" opacity={0.35} size={16} />
                      </div>
                      {style.og_image ? (
                        <div className="absolute top-0 start-0 w-[82%] h-[82%] rounded-full overflow-hidden shadow-lg">
                          <Image
                            src={style.og_image}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="absolute top-0 start-0 w-[82%] h-[82%] rounded-full bg-[var(--olive)] overflow-hidden shadow-lg">
                          <GeometricPattern className="absolute inset-0" color="var(--terracotta)" opacity={0.35} size={16} />
                        </div>
                      )}
                      <span className="absolute top-1 end-1 text-lg text-[var(--terracotta)]">✦</span>
                    </div>

                    {/* Text */}
                    <div className={`flex-1 text-center ${reversed ? "sm:text-end" : "sm:text-start"}`}>
                      {style.name_en && (
                        <p className="font-script text-3xl text-[var(--terracotta)] mb-1">
                          {style.name_en} Collection
                        </p>
                      )}
                      <h3 className="text-xl sm:text-2xl font-semibold text-[var(--charcoal)] mb-5">
                        {t("collectionLabel", { style: name })}
                      </h3>
                      <span className="inline-block px-6 py-2 rounded-full bg-[var(--terracotta)] text-white text-sm font-medium group-hover:bg-[var(--terracotta-dark)] transition-colors">
                        {t("ctaOrder")}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-24 text-[var(--muted)]">
            <p>{t("noStyles")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
