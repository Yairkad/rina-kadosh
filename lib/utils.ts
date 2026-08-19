import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Rewrites a Supabase Storage public URL to a same-origin path (/api/media/...).
 * Some Israeli content filters (Netfree and similar) block shared multi-tenant
 * domains like *.supabase.co by domain reputation, regardless of the actual
 * content — routing through our own domain avoids that.
 */
export function toProxiedMediaUrl(url: string): string {
  const marker = "/object/public/";
  const i = url.indexOf(marker);
  if (i === -1) return url;
  return `/api/media/${url.slice(i + marker.length)}`;
}
