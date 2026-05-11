// src/components/layout/Header.tsx

import { Cloud } from "lucide-react";
import { useWeatherStore } from "@/store/weatherStore";
import { cn } from "@/lib/utils";

export function Header() {
  const { units, setUnits } = useWeatherStore();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Cloud className="h-5 w-5 text-sky-500" />
          <span>WeatherDash</span>
        </div>

        {/* Units Toggle */}
        {/* WHY: Zustand's setUnits updates global state instantly.
            Every component reading units (temperature displays, wind speed)
            re-renders with the new value — no prop drilling needed. */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span
            className={cn("font-medium", units === "metric" && "text-sky-600")}
          >
            °C
          </span>

          <button
            role="switch"
            aria-label="Toggle temperature unit"
            aria-checked={units === "imperial"}
            onClick={() => setUnits(units === "metric" ? "imperial" : "metric")}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              units === "imperial" ? "bg-sky-500" : "bg-slate-200",
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                units === "imperial" ? "translate-x-6" : "translate-x-1",
              )}
            />
          </button>

          <span
            className={cn(
              "font-medium",
              units === "imperial" && "text-sky-600",
            )}
          >
            °F
          </span>
        </div>
      </div>
    </header>
  );
}
