// src/components/weather/CurrentWeatherCard.tsx
import { Droplets, Wind, Eye } from "lucide-react";
import { WeatherIcon } from "./WeatherIcon";
import { formatTemp, formatWindSpeed, formatUpdatedAt } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CurrentWeather, Units } from "@/types";

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  units: Units;
}

export function CurrentWeatherCard({
  weather,
  units,
}: CurrentWeatherCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm",
        "transition-all duration-300",
      )}
    >
      {/* City and last updated */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {weather.city}
            <span className="ml-2 text-lg font-normal text-slate-500">
              {weather.country}
            </span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Last updated: {formatUpdatedAt(weather.updatedAt)}
          </p>
        </div>
        <WeatherIcon iconCode={weather.iconCode} size="xl" />
      </div>

      {/* Main temperature*/}
      <div className="mb-6">
        <div className="flex items-end gap-3">
          <span className="text-7xl font-light text-slate-800 leading-none">
            {weather.temp}
          </span>
          <span className="mb-2 text-4xl font-light text-slate-500">
            {units === "metric" ? "°C" : "°F"}
          </span>
        </div>
        <p className="mt-1 text-lg text-slate-600 capitalize">
          {weather.description}
        </p>
        <p className="text-sm text-slate-400">
          Feels like {formatTemp(weather.feelsLike, units)} &nbsp;·&nbsp; H:{" "}
          {weather.tempMax}° &nbsp;L: {weather.tempMin}°
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4">
        <StatItem
          icon={<Droplets className="h-4 w-4 text-sky-500" />}
          label="Humidity"
          value={`${weather.humidity}%`}
        />
        <StatItem
          icon={<Wind className="h-4 w-4 text-sky-500" />}
          label="Wind"
          value={formatWindSpeed(weather.windSpeed, units)}
        />
        <StatItem
          icon={<Eye className="h-4 w-4 text-sky-500" />}
          label="Visibility"
          value={`${weather.visibility} km`}
        />
      </div>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}
