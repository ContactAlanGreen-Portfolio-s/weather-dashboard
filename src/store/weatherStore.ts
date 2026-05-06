// src/store/weatherStore.ts
// STUB — placeholder until Issue #8
// Returns hardcoded defaults so App.tsx can import without errors.
// Full implementation (with persist middleware) comes in Issue #8.

import { create } from "zustand";
import type { Units } from "@/types";

interface WeatherStore {
  units: Units;
  lastSearchedCity: string;
  setUnits: (units: Units) => void;
  setLastSearchedCity: (city: string) => void;
}

export const useWeatherStore = create<WeatherStore>()((set) => ({
  units: "metric",
  lastSearchedCity: "",
  setUnits: (units) => set({ units }),
  setLastSearchedCity: (city) => set({ lastSearchedCity: city }),
}));
