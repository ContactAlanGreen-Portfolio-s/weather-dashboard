// src/App.tsx — Sprint 1 version: prove the data flow works
// We'll add layout and styling in Sprint 2

import { useState } from "react";
import { useWeather } from "@/hooks/useWeather";
import { useForecast } from "@/hooks/useForecast";
import { useDebounce } from "./hooks/useDebounce";
import { useWeatherStore } from "@/store/weatherStore";

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const debouncedCity = useDebounce(inputValue, 500);
  const { units } = useWeatherStore();

  //Only creare query params when city is at least 2 characters
  const params =
    debouncedCity.length >= 2
      ? { type: "city" as const, city: debouncedCity, units }
      : null;

  const weather = useWeather(params);
  const forecast = useForecast(params);

  return (
    <div className="p-8">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter city name"
        className="border p-2 rounded"
      />

      {/* Raw data dump — Sprint 1 only, to verify API connection */}
      <pre className="mt-4 text-xs">
        {weather.isLoading && "Loading weather..."}
        {weather.isError &&
          `Error: ${weather.error instanceof Error ? weather.error.message : "Unknown error"}`}
        {weather.data && JSON.stringify(weather.data, null, 2)}
      </pre>

      <pre className="mt-4 text-xs">
        {forecast.data && JSON.stringify(forecast.data, null, 2)}
      </pre>
    </div>
  );
}
