// src/lib/transformers.ts
// STUB — placeholder until Issue #14
// These functions will be fully implemented in Sprint 2.
// Created now so useWeather.ts and useForecast.ts can import without errors.

import type {
  CurrentWeatherResponse,
  ForecastResponse,
  CurrentWeather,
  DailyForecast,
} from "@/types";

export function transformCurrentWeather(
  raw: CurrentWeatherResponse,
): CurrentWeather {
  // Stub — returns minimal shape so TypeScript is satisfied
  // Full implementation comes in Issue #14
  return {
    city: raw.name,
    country: raw.sys.country,
    temp: Math.round(raw.main.temp),
    feelsLike: Math.round(raw.main.feels_like),
    tempMin: Math.round(raw.main.temp_min),
    tempMax: Math.round(raw.main.temp_max),
    description: raw.weather[0]?.description ?? "Unknown",
    iconCode: raw.weather[0]?.icon ?? "01d",
    humidity: raw.main.humidity,
    windSpeed: Math.round(raw.wind.speed * 3.6),
    visibility: Math.round(raw.visibility / 1000),
    updatedAt: new Date(raw.dt * 1000),
  };
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function transformForecast(_raw: ForecastResponse): DailyForecast[] {
  // Stub — returns empty array until Issue #14
  return [];
}
