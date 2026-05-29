"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type EventType = { id: string; name_he: string };
type DesignStyle = { id: string; name_he: string; event_type_id: string };

export default function ProductFilters({
  eventTypes,
  designStyles,
}: {
  eventTypes: EventType[];
  designStyles: DesignStyle[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedEvent = searchParams.get("event") ?? "";
  const selectedStyle = searchParams.get("style") ?? "";

  const visibleStyles = selectedEvent
    ? designStyles.filter((s) => s.event_type_id === selectedEvent)
    : [];

  function navigate(event: string, style: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (event) params.set("event", event); else params.delete("event");
    if (style) params.set("style", style); else params.delete("style");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleEventChange(eventId: string) {
    navigate(eventId, ""); // reset style when event changes
  }

  function handleStyleChange(styleId: string) {
    navigate(selectedEvent, styleId);
  }

  const hasFilter = selectedEvent || selectedStyle;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
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
          onClick={() => navigate("", "")}
          className="text-sm px-3 py-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition"
        >
          נקה
        </button>
      )}
    </div>
  );
}
