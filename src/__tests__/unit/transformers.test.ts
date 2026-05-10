// src/__tests__/unit/transformers.test.ts
// WHY UNITTEST TRANSFORMERS:
// These are pure functions. No mocking needed.
// They're the most important logic in the app — if they break, the UI breaks.
// Fast to run, easy to write, high confidence.

import { describe, it, expect } from "vitest";
import { transformCurrentWeather, transformForecast } from "@/lib/transformers";
import type { CurrentWeatherResponse, ForecastResponse } from "@/types";

// Minimal mock data that matches the API shape
const mockCurrentWeatherResponse: CurrentWeatherResponse = {
  name: "London",
  sys: { country: "GB" },
  main: {
    temp: 18.7,
    feels_like: 17.3,
    temp_min: 15.2,
    temp_max: 21.1,
    humidity: 72,
    pressure: 1012,
  },
  weather: [
    { id: 801, main: "Clouds", description: "few clouds", icon: "02d" },
  ],
  wind: { speed: 3.9, deg: 240 },
  visibility: 10000,
  dt: 1718358000,
};

describe("transformCurrentWeather", () => {
  it("rounds temperature values to whole numbers", () => {
    const result = transformCurrentWeather(mockCurrentWeatherResponse);
    expect(result.temp).toBe(19); // 18.7 → 19
    expect(result.feelsLike).toBe(17); // 17.3 → 17
  });

  it("converts visibility from metres to kilometres", () => {
    const result = transformCurrentWeather(mockCurrentWeatherResponse);
    expect(result.visibility).toBe(10); // 10000m → 10km
  });

  it("converts wind speed from m/s to km/h", () => {
    const result = transformCurrentWeather(mockCurrentWeatherResponse);
    // 3.9 m/s × 3.6 = 14.04 km/h → rounded to 14
    expect(result.windSpeed).toBe(14);
  });

  it("capitalises the weather description", () => {
    const result = transformCurrentWeather(mockCurrentWeatherResponse);
    expect(result.description).toBe("Few clouds"); // not 'few clouds'
  });

  it("converts the Unix timestamp to a Date object", () => {
    const result = transformCurrentWeather(mockCurrentWeatherResponse);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("maps city and country correctly", () => {
    const result = transformCurrentWeather(mockCurrentWeatherResponse);
    expect(result.city).toBe("London");
    expect(result.country).toBe("GB");
  });
});

const mockForecastResponse: ForecastResponse = {
  city: { name: "London", country: "GB" },
  list: [
    // Day 1 — multiple 3-hour slots
    {
      dt: 1718352000,
      main: {
        temp: 15,
        feels_like: 14,
        temp_min: 14,
        temp_max: 16,
        humidity: 80,
        pressure: 1010,
      },
      weather: [
        { id: 500, main: "Rain", description: "light rain", icon: "10d" },
      ],
      dt_txt: "2024-06-14 09:00:00",
    },
    {
      dt: 1718363000,
      main: {
        temp: 16,
        feels_like: 15,
        temp_min: 15,
        temp_max: 18,
        humidity: 75,
        pressure: 1011,
      },
      weather: [
        { id: 801, main: "Clouds", description: "few clouds", icon: "02d" },
      ],
      dt_txt: "2024-06-14 12:00:00",
    },
    {
      dt: 1718374000,
      main: {
        temp: 17,
        feels_like: 16,
        temp_min: 15,
        temp_max: 17,
        humidity: 70,
        pressure: 1012,
      },
      weather: [
        { id: 801, main: "Clouds", description: "few clouds", icon: "02d" },
      ],
      dt_txt: "2024-06-14 15:00:00",
    },
    // Day 2
    {
      dt: 1718438400,
      main: {
        temp: 20,
        feels_like: 19,
        temp_min: 18,
        temp_max: 22,
        humidity: 60,
        pressure: 1015,
      },
      weather: [
        { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
      ],
      dt_txt: "2024-06-15 12:00:00",
    },
  ],
};

describe("transformForecast", () => {
  it("groups slots by day and returns one entry per day", () => {
    const result = transformForecast(mockForecastResponse);
    expect(result).toHaveLength(2); // 2 unique days in mock data
  });

  it("uses the midday slot (12:00) as the representative", () => {
    const result = transformForecast(mockForecastResponse);
    // Day 1 has slots at 09:00, 12:00, 15:00 — should use 12:00 (few clouds)
    expect(result[0].description).toBe("Few clouds");
  });

  it("calculates tempHigh as the max across all day slots", () => {
    const result = transformForecast(mockForecastResponse);
    // Day 1 has temp_max of 16, 18, 17 → max is 18
    expect(result[0].tempHigh).toBe(18);
  });

  it("calculates tempLow as the min across all day slots", () => {
    const result = transformForecast(mockForecastResponse);
    // Day 1 has temp_min of 14, 15, 15 → min is 14
    expect(result[0].tempLow).toBe(14);
  });
});
