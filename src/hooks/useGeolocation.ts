// src/hooks/useGeolocation.ts
// WHY A CUSTOM HOOK?
// The browser Geolocation API is callback-based, not Promise-based.
// This hook wraps it in React state so components can react to it cleanly.
// It also normalises the three possible states: idle, loading, success, error.

import { useState, useCallback } from "react";
import type { Coordinates } from "@/types";

type GeolocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; coordinates: Coordinates }
  | { status: "error"; message: string };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: "idle" });

  const requestLocation = useCallback(() => {
    // Check if the browser supports geolocation
    if (!navigator.geolocation) {
      setState({
        status: "error",
        message: "Geolocation is not supported by your browser",
      });
      return;
    }

    setState({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        setState({
          status: "success",
          coordinates: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
        });
      },
      // Error callback
      (error) => {
        // Map the browser's error codes to human-readable messages
        // WHY: The raw error messages are technical and user-unfriendly
        const messages: Record<number, string> = {
          1: "Location access denied. Please enable location permissions and try again.",
          2: "Location unavailable. Please check your connection and try again.",
          3: "Location request timed out. Please try again.",
        };
        setState({
          status: "error",
          message: messages[error.code] ?? "Could not get your location",
        });
      },
      {
        timeout: 10000, // 10 seconds before timing out
        maximumAge: 5 * 60_000, // use cached location up to 5 minutes old
        // WHY: If the user already allowed location 3 mins ago, use that — don't ask again
      },
    );
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, requestLocation, reset };
}
