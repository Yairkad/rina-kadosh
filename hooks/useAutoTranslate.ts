import { useCallback, useRef } from "react";

export function useAutoTranslate(debounceMs = 800) {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  /**
   * Schedule a he→en translation.
   * Only fires if `currentEnValue` is empty — so manual edits are never overwritten.
   * `onResult` receives the translated string; use functional state update to re-check before setting.
   */
  const scheduleTranslate = useCallback(
    (key: string, heText: string, currentEnValue: string, onResult: (t: string) => void) => {
      if (timers.current[key]) clearTimeout(timers.current[key]);
      if (!heText.trim() || currentEnValue.trim()) return;

      timers.current[key] = setTimeout(async () => {
        try {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: heText }),
          });
          const data = await res.json();
          if (data.translation) onResult(data.translation as string);
        } catch {
          // silent — translation is best-effort
        }
      }, debounceMs);
    },
    [debounceMs]
  );

  return { scheduleTranslate };
}
