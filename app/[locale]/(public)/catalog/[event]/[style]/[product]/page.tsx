import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductAddToCart from "@/components/product/ProductAddToCart";
import ProductCard from "@/components/catalog/ProductCard";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rina-kadosh.vercel.app";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product: productId } = await params;
  const locale = await getLocale();
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("name_he, name_en, price_per_unit, images, seo_title_he, seo_title_en, seo_description_he, seo_description_en")
    .eq("id", productId)
    .single();

  if (!data) return {};

  const name = locale === "he" ? (data.seo_title_he || data.name_he) : (data.seo_title_en || data.name_en);
  const description = locale === "he" ? data.seo_description_he : data.seo_description_en;
  const img = data.images?.[0];

  const ogUrl = new URL(`${SITE_URL}/api/og`);
  ogUrl.searchParams.set("name", locale === "he" ? data.name_he : data.name_en);
  ogUrl.searchParams.set("price", String(data.price_per_unit));
  if (img) ogUrl.searchParams.set("img", img);

  return {
    title: `${name} | רינה קדוש`,
    description: description ?? undefined,
    openGraph: {
      title: name,
      description: description ?? undefined,
      images: [{ url: ogUrl.toString(), width: 1200, height: 630 }],
    },
  };
}

interface Props {
  params: Promise<{ locale: string; event: string; style: string; product: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { event, style, product: productId } = await params;
  const locale = await getLocale();
  const supabase = await createClient();

  const [{ data: productData }, { data: eventType }, { data: designStyle }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name_he, name_en, description_he, description_en, price_per_unit, min_type, min_value, images, related_products")
      .eq("id", productId)
      .eq("status", "published")
      .is("deleted_at", null)
      .single(),
    supabase
      .from("event_types")
      .select("id, name_he, name_en")
      .eq("slug", event)
      .single(),
    supabase
      .from("design_styles")
      .select("id, name_he, name_en")
      .eq("slug", style)
      .single(),
  ]);

  if (!productData || !eventType || !designStyle) notFound();

  const name = locale === "he" ? productData.name_he : productData.name_en;
  const description = locale === "he" ? productData.description_he : productData.description_en;
  const eventName = locale === "he" ? eventType.name_he : eventType.name_en;
  const styleName = locale === "he" ? designStyle.name_he : designStyle.name_en;
  const images: string[] = productData.images ?? [];

  // Fetch related products
  let relatedProducts: { id: string; name_he: string; name_en: string; price_per_unit: number; images: string[]; min_type: string; min_value: number }[] = [];
  if (productData.related_products?.length > 0) {
    const { data } = await supabase
      .from("products")
      .select("id, name_he, name_en, price_per_unit, images, min_type, min_value")
      .in("id", productData.related_products)
      .eq("status", "published")
      .is("deleted_at", null)
      .limit(4);
    relatedProducts = data ?? [];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back + Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-10 flex-wrap">
        <Link href={`/${locale}`} className="hover:text-[var(--gold)] transition-colors">
          {locale === "he" ? "בית" : "Home"}
        </Link>
        <span>/</span>
        <Link href={`/${locale}/catalog/${event}`} className="hover:text-[var(--gold)] transition-colors">
          {eventName}
        </Link>
        <span>/</span>
        <Link href={`/${locale}/catalog/${event}/${style}`} className="hover:text-[var(--gold)] transition-colors">
          {styleName}
        </Link>
        <span>/</span>
        <span className="text-[var(--charcoal)] font-medium truncate max-w-[180px]">{name}</span>
      </div>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Gallery */}
        <ProductImageGallery images={images} name={name} />

        {/* Info */}
        <div className="md:sticky md:top-24 space-y-6">
          {/* Category badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-[var(--cream)] text-[var(--gold)] border border-[var(--gold)]/30">
              {eventName}
            </span>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-[var(--cream)] text-[var(--muted)]">
              {styleName}
            </span>
          </div>

          {/* Name */}
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--charcoal)] leading-tight">
            {name}
          </h1>

          {/* Price */}
          <div>
            <p className="text-xs text-[var(--muted)] mb-0.5">
              {locale === "he" ? "מחיר ליחידה" : "Price per unit"}
            </p>
            <p className="text-3xl font-bold text-[var(--charcoal)]">
              ₪{productData.price_per_unit.toLocaleString("he-IL")}
            </p>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-[var(--muted)] leading-relaxed border-t border-gray-100 pt-5">
              {description}
            </p>
          )}

          {/* Add to Cart */}
          <div className="pt-2">
            <ProductAddToCart
              productId={productData.id}
              name={name}
              pricePerUnit={productData.price_per_unit}
              image={images[0] ?? null}
              minType={productData.min_type}
              minValue={productData.min_value}
              eventSlug={event}
              styleSlug={style}
            />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-semibold text-[var(--charcoal)] mb-8">
            {locale === "he" ? "מוצרים משלימים" : "Complementary Products"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={locale === "he" ? p.name_he : p.name_en}
                price={p.price_per_unit}
                image={p.images?.[0] ?? null}
                eventSlug={event}
                styleSlug={style}
                minType={p.min_type}
                minValue={p.min_value}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
