"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { Search, X } from "lucide-react";

type EventType   = { id: string; name_he: string };
type DesignStyle = { id: string; name_he: string; event_type_id: string };
type ProductName = { id: string; name_he: string };

export default function ProductFilters({
  eventTypes,
  designStyles,
  productNames,
}: {
  eventTypes: EventType[];
  designStyles: DesignStyle[];
  productNames: ProductName[];
}) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const selectedEvent = searchParams.get("event") ?? "";
  const selectedStyle = searchParams.get("style") ?? "";
  const currentSearch = searchParams.get("search") ?? "";

  const [query, setQuery]     = useState(currentSearch);
  const [open, setOpen]       = useState(false);
  const searchRef             = useRef<HTMLDivElement>(null);

  // keep input in sync when URL changes externally
  useEffect(() => { setQuery(currentSearch); }, [currentSearch]);

  // close dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = query.trim().length >= 1
    ? productNames.filter((p) => p.name_he.includes(query.trim())).slice(0, 8)
    : [];

  const visibleStyles = selectedEvent
    ? designStyles.filter((s) => s.event_type_id === selectedEvent)
    : [];

  function updateParams(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v); else params.delete(k);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleEventChange(eventId: string) {
    updateParams({ event: eventId, style: "" });
  }

  function handleStyleChange(styleId: string) {
    updateParams({ style: styleId });
  }

  function submitSearch(value: string) {
    setOpen(false);
    updateParams({ search: value });
  }

  function clearAll() {
    setQuery("");
    updateParams({ event: "", style: "", search: "" });
  }

  const hasFilter = selectedEvent || selectedStyle || currentSearch;

  return (
    <div className="flex flex-wrap gap-2 mb-6 items-center">

      {/* Free-text search with autocomplete */}
      <div ref={searchRef} className="relative">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 bg-white focus-within:ring-2 focus-within:ring-stone-400 transition">
          <Search size={14} className="text-stone-400 shrink-0" />
          <input
            type="text"
            value={query}
            placeholder="חפש מוצר..."
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => { if (e.key === "Enter") submitSearch(query); if (e.key === "Escape") setOpen(false); }}
            className="text-sm outline-none bg-transparent w-44 text-stone-700 placeholder:text-stone-400"
          />
          {query && (
            <button onClick={() => { setQuery(""); submitSearch(""); }} className="text-stone-300 hover:text-stone-500 transition">
              <X size={13} />
            </button>
          )}
        </div>

        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 top-full mt-1 w-full min-w-[200px] bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden">
            {suggestions.map((p) => (
              <li
                key={p.id}
                onMouseDown={() => { setQuery(p.name_he); submitSearch(p.name_he); }}
                className="px-4 py-2.5 text-sm text-stone-800 cursor-pointer hover:bg-stone-50 transition-colors"
              >
                {p.name_he}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Event filter */}
      <select
        value={selectedEvent}
        onChange={(e) => handleEventChange(e.target.value)}
        className="text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
      >
        <option value="">כל האירועים</option>
        {eventTypes.map((e) => (
          <option key={e.id} value={e.id}>{e.name_he}</option>
        ))}
      </select>

      {/* Style filter — only when event selected */}
      {selectedEvent && (
        <select
          value={selectedStyle}
          onChange={(e) => handleStyleChange(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
        >
          <option value="">כל הקטגוריות</option>
          {visibleStyles.map((s) => (
            <option key={s.id} value={s.id}>{s.name_he}</option>
          ))}
        </select>
      )}

      {hasFilter && (
        <button
          onClick={clearAll}
          className="text-sm px-3 py-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition"
        >
          נקה
        </button>
      )}
    </div>
  );
}
