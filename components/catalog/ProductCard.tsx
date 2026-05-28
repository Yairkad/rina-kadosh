"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { QuickAddOverlay, QuickAddMobileButton } from "@/components/cart/QuickAdd";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  eventSlug: string;
  styleSlug: string;
  minType?: "units" | "amount" | null;
  minValue?: number | null;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  eventSlug,
  styleSlug,
  minType,
  minValue,
}: ProductCardProps) {
  const locale = useLocale();
  const href = `/${locale}/catalog/${eventSlug}/${styleSlug}/${id}`;
  const [hovered, setHovered] = useState(false);

  const quickAddProps = {
    productId: id,
    name,
    pricePerUnit: price,
    image: image ?? null,
    minType: minType ?? null,
    minValue: minValue ?? null,
    eventSlug,
    styleSlug,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="group block">
        {/* Image container */}
        <div
          className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100 cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Link href={href} className="absolute inset-0">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <span className="text-4xl text-gray-200">✦</span>
              </div>
            )}
          </Link>

          {/* Desktop: hover overlay */}
          <div className="hidden md:block">
            <AnimatePresence>
              {hovered && <QuickAddOverlay {...quickAddProps} />}
            </AnimatePresence>
          </div>

          {/* Mobile: persistent + button */}
          <div className="md:hidden">
            <QuickAddMobileButton {...quickAddProps} />
          </div>
        </div>

        {/* Text */}
        <Link href={href}>
          <div className="mt-3 px-1">
            <h3 className="text-sm font-medium text-[var(--charcoal)] leading-snug line-clamp-2">
              {name}
            </h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-sm font-semibold text-[var(--charcoal)]">
                ₪{price.toLocaleString("he-IL")}
              </span>
              {minType && minValue && (
                <span className="text-xs text-[var(--muted)]">
                  {minType === "units" ? `מינ׳ ${minValue} יח׳` : `מינ׳ ₪${minValue}`}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
