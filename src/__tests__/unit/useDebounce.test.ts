// src/__tests__/unit/useDebounce.test.ts
// Unit tests for the useDebounce hook.
//
// WHY WE TEST THIS:
// The debounce hook is critical to preventing API spam.
// If it breaks, every keystroke fires an API call and the rate limit gets hit.
// These tests verify the timing logic works exactly as expected.
//
// IMPORTANT TESTING TECHNIQUE — Fake Timers:
// The real debounce uses setTimeout (waits 500ms).
// We don't want tests that literally wait 500ms — they'd be slow and fragile.
// vi.useFakeTimers() gives us control over time:
//   vi.advanceTimersByTime(600) → instantly skips 600ms in the test

import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce", () => {
  // Before each test: switch to fake timers so we control time
  beforeEach(() => {
    vi.useFakeTimers();
  });

  // After each test: restore real timers so other tests aren't affected
  afterEach(() => {
    vi.useRealTimers();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 1: Basic behaviour — returns the initial value immediately
  // ─────────────────────────────────────────────────────────────────────────
  it("returns the initial value immediately on first render", () => {
    // renderHook renders a hook without needing a full component
    const { result } = renderHook(() => useDebounce("London", 500));

    // The debounced value should equal the initial value straight away
    // (No delay on the first render — only updates are debounced)
    expect(result.current).toBe("London");
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 2: Value does NOT update before the delay expires
  // ─────────────────────────────────────────────────────────────────────────
  it("does NOT update the debounced value before the delay has passed", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "London" } },
    );

    // Change the value (simulates user typing)
    rerender({ value: "Paris" });

    // Advance time — but NOT past the 500ms delay
    act(() => {
      vi.advanceTimersByTime(400); // only 400ms have passed
    });

    // The debounced value should still be the OLD value
    // WHY: The timer hasn't fired yet — debounce is still waiting
    expect(result.current).toBe("London");
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 3: Value DOES update after the delay expires
  // ─────────────────────────────────────────────────────────────────────────
  it("updates the debounced value after the delay has passed", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "London" } },
    );

    // Change the value
    rerender({ value: "Paris" });

    // Advance time PAST the 500ms delay
    act(() => {
      vi.advanceTimersByTime(600); // 600ms > 500ms delay
    });

    // Now the debounced value should have updated
    expect(result.current).toBe("Paris");
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 4: Rapid changes — only the LAST value fires
  // This is the core debounce behaviour — simulates a user typing quickly
  // ─────────────────────────────────────────────────────────────────────────
  it("only updates to the last value when value changes rapidly", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "" } },
    );

    // Simulate user typing "London" character by character with short gaps
    rerender({ value: "L" });
    act(() => {
      vi.advanceTimersByTime(100);
    }); // 100ms gap

    rerender({ value: "Lo" });
    act(() => {
      vi.advanceTimersByTime(100);
    }); // 100ms gap

    rerender({ value: "Lon" });
    act(() => {
      vi.advanceTimersByTime(100);
    }); // 100ms gap

    rerender({ value: "Lond" });
    act(() => {
      vi.advanceTimersByTime(100);
    }); // 100ms gap

    rerender({ value: "London" });
    // Total time so far: 400ms — NOT past the 500ms delay yet

    // Debounced value should still be empty — no timer has fired
    expect(result.current).toBe("");

    // Now the user stops typing — advance past the delay
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Debounced value should jump straight to the final value
    // WHY: Each keystroke cancelled the previous timer.
    // Only the last timer (after "London") actually completed.
    expect(result.current).toBe("London");
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 5: Custom delay is respected
  // ─────────────────────────────────────────────────────────────────────────
  it("respects a custom delay value", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 1000), // 1 second delay
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "updated" });

    // 500ms passes — not enough for a 1000ms delay
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe("initial"); // still old value

    // Another 600ms passes — now past the 1000ms delay
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current).toBe("updated"); // now updated
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 6: Default delay of 500ms works when no delay is specified
  // ─────────────────────────────────────────────────────────────────────────
  it("uses 500ms as the default delay when none is specified", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value), // no delay argument
      { initialProps: { value: "first" } },
    );

    rerender({ value: "second" });

    // 499ms — just under the default 500ms
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe("first"); // not yet updated

    // 1ms more — now past 500ms
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("second"); // now updated
  });
});
