// src/lib/transformers.ts
// WHY THIS FILE EXISTS:
// Raw API data doesn't match what our UI components need.
// Transformer functions act as a clean translation layer.
// If OpenWeatherMap changes their API schema, we update ONLY this file.
// Components remain untouched. This is the "adapter" design pattern.

import type {
  CurrentWeatherResponse,
  CurrentWeather,
  ForecastResponse,
  DailyForecast,
} from "@/types";
import { format } from "date-fns";

/**
 * Transforms the raw current weather API response into a clean UI-friendly shape.
 */

export function transformCurrentWeather(
  raw: CurrentWeatherResponse,
): CurrentWeather {
  return {
    city: raw.name,
    country: raw.sys.country,
    temp: Math.round(raw.main.temp),
    feelsLike: Math.round(raw.main.feels_like),
    tempMin: Math.round(raw.main.temp_min),
    tempMax: Math.round(raw.main.temp_max),
    description: capitalise(raw.weather[0]?.description ?? "Unknown"),
    iconCode: raw.weather[0]?.icon ?? "01d",
    humidity: raw.main.humidity,
    windSpeed: Math.round(raw.wind.speed * 3.6), // m/s → km/h for metric
    // WHY: OpenWeatherMap gives wind in m/s. UI shows km/h. Convert here, not in the component.
    visibility: Math.round(raw.visibility / 1000), // metres → km
    updatedAt: new Date(raw.dt * 1000), // Unix seconds → JS Date
  };
}

/**
 * Transforms the raw 5-day forecast response into an array of daily summaries.
 * The API returns 3-hour intervals (40 entries). We group by day and pick the
 * midday reading (closest to 12:00) as the representative for each day.
 */
export function transformForecast(raw: ForecastResponse): DailyForecast[] {
  // Group all 3-hour slots by calendar date (YYYY-MM-DD)
  const grouped = raw.list.reduce<Record<string, typeof raw.list>>(
    (acc, slot) => {
      const dateKey = slot.dt_txt.split(" ")[0]; // "2024-06-14"
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(slot);
      return acc;
    },
    {},
  );

  return Object.entries(grouped)
    .slice(0, 5) // take 5 days only
    .map(([dateKey, slots]) => {
      // Pick midday slot (12:00) as the representative — best represents the day's weather
      // Fallback to first slot if 12:00 isn't available (e.g. for today)
      const midday =
        slots.find((s) => s.dt_txt.includes("12:00:00")) ?? slots[0];

      // For temp_min/max, scan ALL slots of the day — not just midday
      const tempHigh = Math.round(
        Math.max(...slots.map((s) => s.main.temp_max)),
      );
      const tempLow = Math.round(
        Math.min(...slots.map((s) => s.main.temp_min)),
      );

      const date = new Date(dateKey + "T12:00:00");

      return {
        date,
        dayLabel: format(date, "EEE"), // e.g. "Mon", "Tue"
        tempHigh,
        tempLow,
        description: capitalise(midday.weather[0]?.description ?? "Unknown"),
        iconCode: midday.weather[0]?.icon ?? "01d",
      };
    });
}

function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
