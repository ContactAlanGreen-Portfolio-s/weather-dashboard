// src/components/weather/ForecastGrid.tsx
import { ForecastCard } from "./ForecastCard";
import type { DailyForecast, Units } from "@/types";

interface ForecastGridProps {
  forecasts: DailyForecast[];
  units: Units;
}

export function ForecastGrid({ forecasts, units }: ForecastGridProps) {
  return (
    <section aria-label="5-day forecast">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        5-Day Forecast
      </h3>
      <div className="grid grid-cols-5 gap-3">
        {forecasts.map((day) => (
          <ForecastCard
            key={day.date.toISOString()}
            forecast={day}
            units={units}
          />
        ))}
      </div>
    </section>
  );
}
