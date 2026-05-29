"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Option = { id: string; name_he: string };

export default function ProductFilters({
  eventTypes,
  designStyles,
}: {
  eventTypes: Option[];
  designStyles: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 on filter change
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <select
        value={searchParams.get("event") ?? ""}
        onChange={(e) => update("event", e.target.value)}
        className="text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
      >
        <option value="">כל האירועים</option>
        {eventTypes.map((e) => (
          <option key={e.id} value={e.id}>{e.name_he}</option>
        ))}
      </select>

      <select
        value={searchParams.get("style") ?? ""}
        onChange={(e) => update("style", e.target.value)}
        className="text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
      >
        <option value="">כל הקטגוריות</option>
        {designStyles.map((s) => (
          <option key={s.id} value={s.id}>{s.name_he}</option>
        ))}
      </select>

      {(searchParams.get("event") || searchParams.get("style")) && (
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("event");
            params.delete("style");
            router.push(`${pathname}?${params.toString()}`);
          }}
          className="text-sm px-3 py-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition"
        >
          נקה פילטרים
        </button>
      )}
    </div>
  );
}
