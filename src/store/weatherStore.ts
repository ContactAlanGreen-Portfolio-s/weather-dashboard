// src/store/weatherStore.ts
// WHY ZUSTAND?
// We need to share two pieces of state across multiple components:
//   1. units (metric/imperial) — used in Header toggle AND all weather displays
//   2. lastSearchedCity — persist the city across re-renders
//
// React's useState would require prop-drilling through 3+ component levels.
// Context API would work, but causes full tree re-renders on every state change.
// Zustand is lightweight (1kb), simple, and updates only subscribers.
//
// Compare: Redux is overkill for 2 values. Context is fine but noisy.
// Zustand is the junior/mid level sweet spot in 2026.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Units } from "@/types";

interface WeatherStore {
  units: Units;
  lastSearchedCity: string;
  setUnits: (units: Units) => void;
  setLastSearchedCity: (city: string) => void;
}

export const useWeatherStore = create<WeatherStore>()(
  // persist middleware — saves state to localStorage automatically
  // WHY: When user refreshes, their unit preference and last city are restored.
  persist(
    (set) => ({
      units: "metric",
      lastSearchedCity: "",
      setUnits: (units) => set({ units }),
      setLastSearchedCity: (city) => set({ lastSearchedCity: city }),
    }),
    {
      name: "weather-preferences", // localStorage key
      partialize: (state) => ({
        //only persist preferences, not derived data
        units: state.units,
        lastSearchedCity: state.lastSearchedCity,
      }),
    },
  ),
);
