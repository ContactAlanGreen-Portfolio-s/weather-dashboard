// src/hooks/useForecast.ts
// Same pattern as useWeather.ts — proxied through /api/forecast

import { useQuery } from "@tanstack/react-query";
import { transformForecast } from "@/lib/transformers";
import type { DailyForecast, Units, Coordinates } from "@/types";

type ForecastParams =
  | { type: "city"; city: string; units: Units }
  | { type: "coordinates"; coords: Coordinates; units: Units };

export function useForecast(params: ForecastParams | null) {
  return useQuery({
    queryKey: params
      ? params.type === "city"
        ? ["forecast", params.city.toLowerCase(), params.units]
        : ["forecast", params.coords.lat, params.coords.lon, params.units]
      : ["forecast", null],

    queryFn: async (): Promise<DailyForecast[]> => {
      if (!params) throw new Error("No search params provided");

      const searchParams = new URLSearchParams({ units: params.units });
      if (params.type === "city") {
        searchParams.set("city", params.city);
      } else {
        searchParams.set("lat", params.coords.lat.toString());
        searchParams.set("lon", params.coords.lon.toString());
      }

      const res = await fetch(`/api/forecast?${searchParams}`);

      if (!res.ok) {
        const error = await res.json();
        const err = new Error(error.error || "Failed to fetch forecast");
        // In useWeather.ts and useForecast.ts — replace the (err as any) lines with:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any).status = res.status;
        throw err;
      }

      const raw = await res.json();
      return transformForecast(raw);
    },

    staleTime: 10 * 60 * 1000,

    retry: (failureCount, error) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).status === 404) return false;
      return failureCount < 2;
    },

    enabled: params !== null,
  });
}
