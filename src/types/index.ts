// src/types/index.ts
// Centralised type definitions — all interfaces in one file for this project size.
// WHY: Easier to find and update. If the project grows, split into separate files.

// ── Raw API response types (from OpenWeatherMap) ──────────────────────────────

export interface WeatherCondition {
  id: number
  main: string
  description: string
  icon: string
}

export interface MainMetrics {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  humidity: number
  pressure: number
}

export interface CurrentWeatherResponse {
  name: string
  sys: { country: string }
  main: MainMetrics
  weather: WeatherCondition[]
  wind: { speed: number; deg: number }
  visibility: number
  dt: number
}

export interface ForecastSlot {
  dt: number
  main: MainMetrics
  weather: WeatherCondition[]
  dt_txt: string
}

export interface ForecastResponse {
  city: { name: string; country: string }
  list: ForecastSlot[]
}

// ── Normalised UI types (transformed from raw API) ────────────────────────────

export interface CurrentWeather {
  city: string
  country: string
  temp: number
  feelsLike: number
  tempMin: number
  tempMax: number
  description: string
  iconCode: string
  humidity: number
  windSpeed: number
  visibility: number
  updatedAt: Date
}

export interface DailyForecast {
  date: Date
  dayLabel: string
  tempHigh: number
  tempLow: number
  description: string
  iconCode: string
}

// ── State types ────────────────────────────────────────────────────────────────

export type Units = 'metric' | 'imperial'

export type SearchMode = 'city' | 'coordinates'

export interface Coordinates {
  lat: number
  lon: number
}
