// src/__tests__/components/CurrentWeatherCard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurrentWeatherCard } from "@/components/weather/CurrentWeatherCard";
import type { CurrentWeather } from "@/types";

const mockWeather: CurrentWeather = {
  city: "London",
  country: "GB",
  temp: 18,
  feelsLike: 17,
  tempMin: 14,
  tempMax: 21,
  description: "Partly cloudy",
  iconCode: "02d",
  humidity: 72,
  windSpeed: 14,
  visibility: 10,
  updatedAt: new Date("2024-06-14T14:00:00Z"),
};

describe("CurrentWeatherCard", () => {
  it("renders the city name and country", () => {
    render(<CurrentWeatherCard weather={mockWeather} units="metric" />);
    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("GB")).toBeInTheDocument();
  });

  it("renders the temperature with correct unit", () => {
    render(<CurrentWeatherCard weather={mockWeather} units="metric" />);
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("°C")).toBeInTheDocument();
  });

  it("renders Fahrenheit symbol when imperial units selected", () => {
    render(<CurrentWeatherCard weather={mockWeather} units="imperial" />);
    expect(screen.getByText("°F")).toBeInTheDocument();
  });

  it("renders humidity, wind speed, and visibility stats", () => {
    render(<CurrentWeatherCard weather={mockWeather} units="metric" />);
    expect(screen.getByText("72%")).toBeInTheDocument();
    expect(screen.getByText("14 km/h")).toBeInTheDocument();
    expect(screen.getByText("10 km")).toBeInTheDocument();
  });

  it("renders the weather description", () => {
    render(<CurrentWeatherCard weather={mockWeather} units="metric" />);
    expect(screen.getByText("Partly cloudy")).toBeInTheDocument();
  });
});
