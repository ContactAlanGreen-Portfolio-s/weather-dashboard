// src/components/search/SearchBar.tsx
import { useState, useEffect } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useGeolocation } from "@/hooks/useGeolocation";
import { cn } from "@/lib/utils";
import type { Coordinates } from "@/types";

interface SearchBarProps {
  onCitySearch: (city: string) => void;
  onLocationSearch: (coords: Coordinates) => void;
  isLoading: boolean;
}

export function SearchBar({
  onCitySearch,
  onLocationSearch,
  isLoading,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebounce(inputValue, 500);
  const { state: geoState, requestLocation, reset: resetGo } = useGeolocation();

  // Fire search when debounced value settles (≥2 chars)
  // WHY useEffect here: we need a side effect when debouncedValue changes
  useEffect(() => {
    if (debouncedValue.length >= 2) {
      onCitySearch(debouncedValue);
    }
  }, [debouncedValue, onCitySearch]);

  // When geolocation succeeds, trigger a location-based search
  useEffect(() => {
    if (geoState.status === "success") {
      onLocationSearch(geoState.coordinates);
    }
  }, [geoState, onLocationSearch]);

  function handleClear() {
    setInputValue("");
    resetGo();
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      {/*Search Input*/}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search for a city..."
            aria-label="City search"
            className={cn(
              "w-full rounded-xl- border border-slate-200 bg-white py-3 pl-10 pr-10",
              "text-slate-800 placeholder-slate-400 shadow-sm",
              "focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100",
              "transition-all duration-150",
            )}
          />
          {/* Clear button — only visible when there is input */}
          {(inputValue || isLoading) && (
            <button
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {/* Geolocation button */}
        <button
          onClick={requestLocation}
          disabled={geoState.status === "loading"}
          aria-label="Use my current location"
          title="Use my location"
          className={cn(
            "flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3",
            "text-sm font-medium text-slate-600 shadow-sm",
            "hover:border-sky-400 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "transition-all duration-150",
          )}
        >
          {geoState.status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">My location</span>
        </button>
      </div>

      {/* Geolocation error message */}
      {geoState.status === "error" && (
        <p className="text-sm text-red-500" role="alert">
          {geoState.message}
        </p>
      )}
    </div>
  );
}
