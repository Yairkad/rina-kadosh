export const revalidate = 300;

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/catalog/ProductCard";

interface Props {
  params: Promise<{ locale: string; event: string; style: string }>;
}

/** Renders a single atmosphere source as video or image, based on its file extension. */
function AtmosphereMedia({ src, alt }: { src: string; alt: string }) {
  return /\.(mp4|webm|mov)$/i.test(src) ? (
    <video src={src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
  ) : (
    <Image src={src} alt={alt} fill className="object-cover" priority />
  );
}

export default async function StylePage({ params }: Props) {
  const { event, style } = await params;
  const locale = await getLocale();
  const t = await getTranslations("catalog");
  const supabase = await createClient();

  const { data: eventType } = await supabase
    .from("event_types")
    .select("id, name_he, name_en")
    .eq("slug", event)
    .single();

  if (!eventType) notFound();

  const { data: designStyle } = await supabase
    .from("design_styles")
    .select("id, name_he, name_en, atmosphere_image, atmosphere_image_mobile, background_image")
    .eq("slug", style)
    .eq("event_type_id", eventType.id)
    .eq("status", "published")
    .single();

  if (!designStyle) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("id, name_he, name_en, price_per_unit, images, min_type, min_value")
    .eq("design_style_id", designStyle.id)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("display_order");

  const { data: bundles } = await supabase
    .from("bundles")
    .select("id, name_he, name_en, bundle_price, original_price, images")
    .eq("design_style_id", designStyle.id)
    .eq("status", "published");

  const styleName = locale === "he" ? designStyle.name_he : designStyle.name_en;
  const eventName = locale === "he" ? eventType.name_he : eventType.name_en;
  const hasAtmosphere = true; // always show hero — placeholder until image uploaded

  return (
    <div className="min-h-screen">

      {/* ── Atmosphere Hero ── */}
      {hasAtmosphere ? (
        <div
          className="relative w-full h-[45vh] sm:h-[60vh] lg:h-[80vh] overflow-hidden"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, black 25%, rgba(0,0,0,0.9) 45%, rgba(0,0,0,0.4) 68%, transparent 92%)",
            maskImage: "linear-gradient(to bottom, black 25%, rgba(0,0,0,0.9) 45%, rgba(0,0,0,0.4) 68%, transparent 92%)",
          }}
        >
          {designStyle.atmosphere_image ? (
            <>
              <div className="absolute inset-0 md:hidden">
                <AtmosphereMedia
                  src={designStyle.atmosphere_image_mobile || designStyle.atmosphere_image}
                  alt={styleName}
                />
              </div>
              <div className="absolute inset-0 hidden md:block">
                <AtmosphereMedia src={designStyle.atmosphere_image} alt={styleName} />
              </div>
            </>
          ) : (
            <Image
              src="/textures/marble-bg.jpg"
              alt=""
              fill
              className="object-cover"
              priority
            />
          )}

          {/* Scrim for text readability — darker over photos, olive tint over the marble fallback */}
          <div
            className={
              designStyle.atmosphere_image
                ? "absolute inset-0 bg-black/35"
                : "absolute inset-0 bg-[var(--olive)]/55"
            }
          />

          {/* Back button — top overlay */}
          <Link
            href={`/${locale}/catalog/${event}`}
            className="absolute top-6 start-6 z-10 inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            <span>{locale === "he" ? "→" : "←"}</span>
            {t("backToStyles", { event: eventName })}
          </Link>

          {/* Style name — centered on the image */}
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: "10%" }}>
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--terracotta)] mb-5">
              {eventName}
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white text-center px-6"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.55)" }}
            >
              {styleName}
            </h1>
            <div className="mt-6 w-16 h-px bg-[var(--terracotta)]" />
          </div>
        </div>
      ) : (
        /* No atmosphere: standard header */
        <div className="pt-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Link
              href={`/${locale}/catalog/${event}`}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--terracotta)] transition-colors mb-10"
            >
              <span>{locale === "he" ? "→" : "←"}</span>
              {t("backToStyles", { event: eventName })}
            </Link>
            <div className="mb-10 text-center">
              <p className="text-xs uppercase tracking-widest text-[var(--terracotta)] mb-2">{eventName}</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--charcoal)]">{styleName}</h1>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <section
        className="relative z-10 -mt-[22vh] px-4 pb-16 sm:px-6 lg:px-8 pt-8 bg-marble bg-cover bg-center bg-fixed"
        style={designStyle.background_image ? { backgroundImage: `url(${designStyle.background_image})` } : undefined}
      >
        {/* Cream wash over the marble texture for readability */}
        <div className="absolute inset-0 bg-[var(--cream)]/88" />

        {/* Subtle terracotta radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 90% 55% at 50% 0%, rgba(200,87,65,0.08) 0%, transparent 70%)" }}
        />

        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto relative z-10">
          {/* Bundles */}
          {(bundles ?? []).length > 0 && (
            <div className="mb-14">
              <h2 className="text-lg font-semibold text-[var(--charcoal)] mb-6 flex items-center gap-2">
                <span className="text-[var(--terracotta)]">✦</span>
                {t("bundles")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(bundles ?? []).map((bundle) => {
                  const name = locale === "he" ? bundle.name_he : bundle.name_en;
                  const savings = bundle.original_price
                    ? Math.round(((bundle.original_price - bundle.bundle_price) / bundle.original_price) * 100)
                    : null;
                  return (
                    <div
                      key={bundle.id}
                      className="rounded-xl border border-[var(--olive)] bg-white p-5 flex gap-4"
                    >
                      {bundle.images?.[0] && (
                        <img
                          src={bundle.images[0]}
                          alt={name}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 bg-[var(--terracotta)] text-white rounded-full">
                            {locale === "he" ? "חבילה" : "Bundle"}
                          </span>
                          {savings && (
                            <span className="text-xs text-green-600 font-medium">-{savings}%</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-[var(--charcoal)] text-sm">{name}</h3>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="font-bold text-[var(--charcoal)]">
                            ₪{bundle.bundle_price.toLocaleString("he-IL")}
                          </span>
                          {bundle.original_price && (
                            <span className="text-xs text-[var(--muted)] line-through">
                              ₪{bundle.original_price.toLocaleString("he-IL")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Products grid */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[var(--charcoal)] mb-6">
              {t("allProducts")}
            </h2>
            {(products ?? []).length > 0 ? (
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                {(products ?? []).map((product) => (
                  <li key={product.id}>
                    <ProductCard
                      id={product.id}
                      name={locale === "he" ? product.name_he : product.name_en}
                      price={product.price_per_unit}
                      image={product.images?.[0] ?? null}
                      eventSlug={event}
                      styleSlug={style}
                      minType={product.min_type}
                      minValue={product.min_value}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-20 text-[var(--muted)]">
                <p>{t("noProducts")}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
