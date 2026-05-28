export const revalidate = 300;

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import ProductCard from "@/components/catalog/ProductCard";

interface Props {
  params: Promise<{ locale: string; event: string; style: string }>;
}

export default async function StylePage({ params }: Props) {
  const { event, style } = await params;
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: eventType } = await supabase
    .from("event_types")
    .select("id, name_he, name_en")
    .eq("slug", event)
    .single();

  if (!eventType) notFound();

  const { data: designStyle } = await supabase
    .from("design_styles")
    .select("id, name_he, name_en")
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
    .order("created_at", { ascending: false });

  const { data: bundles } = await supabase
    .from("bundles")
    .select("id, name_he, name_en, bundle_price, original_price, images")
    .eq("design_style_id", designStyle.id)
    .eq("status", "published");

  const styleName = locale === "he" ? designStyle.name_he : designStyle.name_en;

  const eventName = locale === "he" ? eventType.name_he : eventType.name_en;

  return (
    <section className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link
          href={`/${locale}/catalog/${event}`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors mb-10"
        >
          <span>{locale === "he" ? "→" : "←"}</span>
          {locale === "he" ? `חזרה לסגנונות ${eventName}` : `Back to ${eventName} styles`}
        </Link>

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-2">{eventName}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--charcoal)]">
            {styleName}
          </h1>
        </div>

        {/* Bundles section */}
        {(bundles ?? []).length > 0 && (
          <div className="mb-14">
            <h2 className="text-lg font-semibold text-[var(--charcoal)] mb-6 flex items-center gap-2">
              <span className="text-[var(--gold)]">✦</span>
              {locale === "he" ? "חבילות מומלצות" : "Recommended Bundles"}
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
                    className="rounded-xl border border-[var(--gold-light,#E8D5A3)] bg-white p-5 flex gap-4"
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
                        <span className="text-xs font-medium px-2 py-0.5 bg-[var(--gold)] text-white rounded-full">
                          {locale === "he" ? "חבילה" : "Bundle"}
                        </span>
                        {savings && (
                          <span className="text-xs text-green-600 font-medium">
                            -{savings}%
                          </span>
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
        <div>
          <h2 className="text-lg font-semibold text-[var(--charcoal)] mb-6">
            {locale === "he" ? "כל המוצרים" : "All Products"}
          </h2>
          {(products ?? []).length > 0 ? (
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
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
              <p>{locale === "he" ? "אין מוצרים זמינים כרגע" : "No products available yet"}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
