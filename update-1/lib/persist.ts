"use client";

import { useEffect, useState } from "react";

// Remembers a value in the browser so it is still there after a refresh.
// Later, the real database replaces this.
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      // Saved data was unreadable, so we keep the starting values.
    }
  }, [key]);

  function set(next: T | ((prev: T) => T)) {
    setValue((prev) => {
      const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {
        // Storage is blocked, so this lasts for this visit only.
      }
      return v;
    });
  }

  return [value, set] as const;
}
