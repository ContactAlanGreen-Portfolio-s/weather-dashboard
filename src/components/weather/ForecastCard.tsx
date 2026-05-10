// src/components/weather/ForecastCard.tsx
import { WeatherIcon } from "./WeatherIcon";
import { formatTemp } from "@/lib/utils";
import type { DailyForecast, Units } from "@/types";

interface ForecastCardProps {
  forecast: DailyForecast;
  units: Units;
}

export function ForecastCard({ forecast, units }: ForecastCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {forecast.dayLabel}
      </span>
      <WeatherIcon iconCode={forecast.iconCode} size="md" />
      <p className="text-xs text-slate-400 capitalize text-center">
        {forecast.description}
      </p>
      <div className="mt-1 flex w-full justify-between text-sm">
        <span className="font-semibold text-slate-800">
          {formatTemp(forecast.tempHigh, units)}
        </span>
        <span className="text-slate-400">
          {formatTemp(forecast.tempLow, units)}
        </span>
      </div>
    </div>
  );
}
