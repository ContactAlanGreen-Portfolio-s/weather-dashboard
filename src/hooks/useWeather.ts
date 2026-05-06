// src/hooks/useWeather.ts
// WHY TANSTACK QUERY?
// It handles the full lifecycle of an API call:
//   - Loading state (isLoading, isFetching)
//   - Error state (isError, error)
//   - Success state (data)
//   - Caching (don't re-fetch if data is fresh)
//   - Automatic background refetching
//   - Deduplication (two components requesting same query = one API call)
//
// Without TanStack Query, you'd manually write useState + useEffect + fetch
// in every component — and re-invent all of the above from scratch.

import { useQuery } from "@tanstack/react-query";
import { transformCurrentWeather } from "@/lib/transformers";
import type { CurrentWeather, Units, Coordinates } from "@/types";

type WeatherParams =
  | { type: "city"; city: string; units: Units }
  | { type: "coordinates"; coords: Coordinates; units: Units };

/**
 * Fetches current weather for a city or coordinates.
 * Returns transformed, UI-ready data.
 */

export function useWeather(params: WeatherParams | null) {
  return useQuery({
    // WHY THE QUERY KEY:
    // TanStack Query uses the key to cache and identify queries.
    // Different keys = different cache entries.
    // ['weather', 'london', 'metric'] ≠ ['weather', 'london', 'imperial']
    // → changing units triggers a new fetch, not a cache hit.
    queryKey: params
      ? params.type === "city"
        ? ["weather", params.city.toLowerCase(), params.units]
        : ["weather", params.coords.lat, params.coords.lon, params.units]
      : ["weather", "null"],
    queryFn: async (): Promise<CurrentWeather> => {
      if (!params) throw new Error("No search parameters provided");
      const searchParams = new URLSearchParams({ units: params.units });
      if (params.type === "city") {
        searchParams.set("city", params.city);
      } else {
        searchParams.set("lat", params.coords.lat.toString());
        searchParams.set("lon", params.coords.lon.toString());
      }

      const res = await fetch(`/api/weather?${searchParams}`);

      if (!res.ok) {
        const error = await res.json();
        // Attach the HTTP status to the error so the UI can handle 404 (city not found)
        const err = new Error(error.error || "Failed to fetch weather");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any).status = res.status;
        throw err;
      }

      const raw = await res.json();
      return transformCurrentWeather(raw);
    },

    // Core caching config:
    staleTime: 10 * 60 * 1000, // 10 minutes — data is "fresh" for 10 mins
    // WHY 10 MINUTES:
    // OpenWeatherMap updates data every 10 minutes on free tier.
    // Fetching more often gives identical data and wastes API calls.
    // If the user re-focuses the browser tab within 10 mins → no fetch.

    retry: (failureCount, error) => {
      // WHY CUSTOM RETRY:
      // Don't retry on 404 (city not found) — it won't suddenly appear.
      // Do retry on network errors or 5xx server errors.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).status === 404) return false;
      return failureCount < 2;
    },

    enabled: params !== null, // don't fetch until there's something to search for
  });
}
