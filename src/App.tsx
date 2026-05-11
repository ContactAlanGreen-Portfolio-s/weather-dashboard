// src/App.tsx — Final version (replaces the Sprint 1 raw data version)
import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { SearchBar } from "@/components/search/SearchBar";
import { CurrentWeatherCard } from "@/components/weather/CurrentWeatherCard";
import { ForecastGrid } from "@/components/weather/ForecastGrid";
import {
  WeatherCardSkeleton,
  ForecastGridSkeleton,
} from "@/components/ui/Skeleton";
import { ErrorMessage, getErrorType } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { useWeather } from "@/hooks/useWeather";
import { useForecast } from "@/hooks/useForecast";
import { useWeatherStore } from "@/store/weatherStore";
import type { Coordinates } from "@/types";

// Params shape that drives both query hooks
type SearchParams =
  | { type: "city"; city: string }
  | { type: "coordinates"; coords: Coordinates }
  | null;

export default function App() {
  const { units } = useWeatherStore();
  const [searchParams, setSearchParams] = useState<SearchParams>(null);
  
  // Deliberate type error for CI testing
  const deliberateError: string = 123;

  // Stable callbacks to prevent SearchBar re-renders on every App render
  const handleCitySearch = useCallback((city: string) => {
    setSearchParams({ type: "city", city });
  }, []);

  const handleLocationSearch = useCallback((coords: Coordinates) => {
    setSearchParams({ type: "coordinates", coords });
  }, []);

  // Construct TanStack Query params — includes units so changing units refetches
  const weatherParams = searchParams
    ? searchParams.type === "city"
      ? { type: "city" as const, city: searchParams.city, units }
      : { type: "coordinates" as const, coords: searchParams.coords, units }
    : null;

  const weather = useWeather(weatherParams);
  const forecast = useForecast(weatherParams);

  // Determine overall loading and error state
  const isLoading = weather.isLoading || forecast.isLoading;
  const isError = weather.isError || forecast.isError;
  const error = weather.error || forecast.error;

  const hasData = !!(weather.data && forecast.data);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Search section */}
        <section className="mb-8">
          <SearchBar
            onCitySearch={handleCitySearch}
            onLocationSearch={handleLocationSearch}
            isLoading={isLoading}
          />
        </section>

        {/* Content section */}
        <div className="space-y-6">
          {/* Empty state — no search yet */}
          {searchParams === null && <EmptyState />}

          {/* Loading skeletons */}
          {isLoading && (
            <>
              <WeatherCardSkeleton />
              <ForecastGridSkeleton />
            </>
          )}

          {/* Error state */}
          {!isLoading && isError && (
            <ErrorMessage
              type={getErrorType(error)}
              onRetry={() => setSearchParams(null)}
            />
          )}

          {/* Success state */}
          {!isLoading && hasData && (
            <>
              <CurrentWeatherCard weather={weather.data!} units={units} />
              <ForecastGrid forecasts={forecast.data!} units={units} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
