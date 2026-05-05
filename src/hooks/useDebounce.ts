// src/hooks/useDebounce.ts
// WHY DEBOUNCING?
// Without debounce, every keystroke in the search bar fires an API call.
// If a user types "London" (6 chars), that's potentially 6 API calls.
// At 60 calls/minute, a fast typist could exhaust the rate limit quickly.
//
// Debounce waits until the user STOPS typing for 500ms before firing.
// "London" → user pauses → ONE API call after 500ms of silence.
//
// This is a standard pattern in production search interfaces.
// 300-500ms is the industry standard debounce delay for search.

import { useState, useEffect } from "react";

/**
 * Returns a debounced version of the value.
 * The debounced value only updates after `delay` milliseconds of no changes.
 *
 *@paramvalue - The value to debounce
 *@paramdelay - Delay in milliseconds (default: 500ms)
 */

export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the debounced value after `delay` ms
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // WHY THE CLEANUP: If `value` changes before the timer fires,
    // we cancel the previous timer and start a new one.
    // This is what makes debounce work — the cleanup cancels stale timers.

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
