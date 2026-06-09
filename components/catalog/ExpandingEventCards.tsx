"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

export interface EventTypeItem {
  id: string;
  slug: string;
  name: string;
  image: string | null;
}

interface ExpandingEventCardsProps {
  items: EventTypeItem[];
}

export default function ExpandingEventCards({ items }: ExpandingEventCardsProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = React.useState<number | null>(null);
  const [navigating, setNavigating] = React.useState<number | null>(null);
  const [isDesktop, setIsDesktop] = React.useState(false);
  const locale = useLocale();
  const router = useRouter();

  React.useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const gridStyle = React.useMemo(() => {
    if (isDesktop) {
      return {
        gridTemplateColumns: items.map((_, i) => i === activeIndex ? "5fr" : "1fr").join(" "),
        gridTemplateRows: "1fr",
      };
    }
    return {
      gridTemplateColumns: "1fr",
      gridTemplateRows: items.map((_, i) => i === activeIndex ? "4fr" : "1fr").join(" "),
    };
  }, [activeIndex, items.length, isDesktop]);

  const navigate = (index: number, slug: string) => {
    setNavigating(index);
    router.push(`/${locale}/catalog/${slug}`);
  };

  const handleClick = (index: number, slug: string) => {
    if (isDesktop) {
      navigate(index, slug);
    } else {
      if (clickedIndex === index) {
        navigate(index, slug);
      } else {
        setClickedIndex(index);
        setActiveIndex(index);
      }
    }
  };

  if (items.length === 0) return null;

  return (
    <ul
      className={cn(
        "w-full max-w-6xl mx-auto gap-2 grid",
        "h-[520px] md:h-[480px]",
        "transition-[grid-template-columns,grid-template-rows] duration-500 ease-out"
      )}
      style={gridStyle}
    >
      {items.map((item, index) => {
        const active = activeIndex === index;
        return (
          <li
            key={item.id}
            className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-sm md:min-w-[72px] min-h-0"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={() => handleClick(index, item.slug)}
            tabIndex={0}
            onFocus={() => setActiveIndex(index)}
            onKeyDown={(e) => e.key === "Enter" && handleClick(index, item.slug)}
          >
            {/* Background image or placeholder */}
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-all duration-500",
                  active ? "scale-100 grayscale-0" : "scale-110 grayscale-[30%]"
                )}
              />
            ) : (
              <div className="absolute inset-0 bg-[var(--charcoal)]" />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

            {/* Loading indicator */}
            {navigating === index && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--gold)] border-t-transparent animate-spin" />
              </div>
            )}

            {/* Collapsed label — vertical watermark on desktop */}
            <h3
              className={cn(
                "absolute bottom-4 right-3 font-bold text-white/25 whitespace-nowrap select-none pointer-events-none",
                "transition-opacity duration-500",
                "hidden md:block",
                active ? "opacity-0" : "opacity-100",
              )}
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                fontSize: "clamp(1.6rem, 3vw, 2.8rem)",
                letterSpacing: "0.05em",
                fontFeatureSettings: '"liga" 1, "dlig" 1, "calt" 1, "kern" 1',
              }}
            >
              {item.name}
            </h3>

            {/* Collapsed label — horizontal, bottom-right on mobile */}
            <h3
              className={cn(
                "absolute bottom-2 right-3 font-bold text-white/40 whitespace-nowrap select-none pointer-events-none",
                "text-lg tracking-wide transition-opacity duration-500",
                "block md:hidden",
                active ? "opacity-0" : "opacity-100",
              )}
            >
              {item.name}
            </h3>

            {/* Expanded content */}
            <article className="absolute inset-0 flex flex-col justify-end p-5">
              <h3
                className={cn(
                  "text-2xl font-bold text-white transition-all duration-300",
                  active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                )}
              >
                {item.name}
              </h3>
              <p
                className={cn(
                  "mt-1 text-sm text-white/70 transition-all duration-300 delay-75",
                  active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                )}
              >
                לחץ לצפייה בסגנונות
              </p>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
