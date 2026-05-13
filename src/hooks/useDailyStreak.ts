import { useCallback, useEffect, useState } from 'react';

/**
 * Tracks per-day completion for a domain (training/recovery) using localStorage.
 * Each "tick" is a YYYY-MM-DD date string.
 */

const todayKey = (d: Date = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const dateOffset = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayKey(d);
};

export function useDailyStreak(storageKey: string) {
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: Set<string>) => {
      setDone(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  );

  const today = todayKey();
  const isDoneToday = done.has(today);

  const toggleToday = useCallback(() => {
    const next = new Set(done);
    if (next.has(today)) next.delete(today);
    else next.add(today);
    persist(next);
  }, [done, persist, today]);

  // Current streak = consecutive days ending today (or yesterday if today not done)
  let streak = 0;
  let cursor = isDoneToday ? 0 : 1;
  while (done.has(dateOffset(cursor))) {
    streak += 1;
    cursor += 1;
  }

  // Last 7 days (oldest -> today)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const key = dateOffset(6 - i);
    return { key, done: done.has(key), isToday: key === today };
  });

  return { isDoneToday, toggleToday, streak, last7, totalDone: done.size };
}

export const __test__ = { todayKey, dateOffset };
