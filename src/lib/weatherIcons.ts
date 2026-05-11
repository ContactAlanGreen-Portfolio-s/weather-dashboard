// src/lib/weatherIcons.ts
// WHY: OpenWeatherMap returns icon codes like "01d", "10n", "04d".
// Lucide doesn't have a 1-to-1 mapping, so we translate to the closest match.
// This centralises all icon decisions. Components just call getWeatherIcon(iconCode).

import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Wind,
  type LucideIcon,
} from "lucide-react";

// OpenWeatherMap icon codes → Lucide icon components
// Codes ending in 'd' are day variants, 'n' are night variants
// Full code list: https://openweathermap.org/weather-conditions#Icon-list
const ICON_MAP: Record<string, LucideIcon> = {
  "01d": Sun, // clear sky (day)
  "01n": Sun, // clear sky (night) — no moon icon in Lucide free tier
  "02d": Cloud, // few clouds
  "02n": Cloud,
  "03d": Cloud, // scattered clouds
  "03n": Cloud,
  "04d": Cloud, // broken/overcast clouds
  "04n": Cloud,
  "09d": CloudDrizzle, // shower rain
  "09n": CloudDrizzle,
  "10d": CloudRain, // rain
  "10n": CloudRain,
  "11d": CloudLightning, // thunderstorm
  "11n": CloudLightning,
  "13d": CloudSnow, // snow
  "13n": CloudSnow,
  "50d": CloudFog, // mist/fog/haze
  "50n": CloudFog,
};

export function getWeatherIcon(iconCode: string): LucideIcon {
  return ICON_MAP[iconCode] ?? Wind; // fallback if unknown code
}
