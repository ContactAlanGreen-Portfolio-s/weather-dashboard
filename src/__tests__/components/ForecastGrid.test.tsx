// src/__tests__/components/ForecastGrid.test.tsx
// Tests for ForecastGrid and ForecastCard components.
//
// WHY WE TEST THIS:
// ForecastGrid is responsible for rendering 5 daily forecast cards.
// We verify the correct number of cards render, day labels show,
// and temperatures display with the correct unit symbol.

import { render, screen } from "@testing-library/react";
import { ForecastGrid } from "@/components/weather/ForecastGrid";
import type { DailyForecast } from "@/types";

// Mock forecast data — 5 days as the API would return
const mockForecast: DailyForecast[] = [
  {
    date: new Date("2024-06-17"),
    dayLabel: "Mon",
    tempHigh: 21,
    tempLow: 14,
    description: "Partly cloudy",
    iconCode: "02d",
  },
  {
    date: new Date("2024-06-18"),
    dayLabel: "Tue",
    tempHigh: 18,
    tempLow: 12,
    description: "Light rain",
    iconCode: "10d",
  },
  {
    date: new Date("2024-06-19"),
    dayLabel: "Wed",
    tempHigh: 20,
    tempLow: 13,
    description: "Clear sky",
    iconCode: "01d",
  },
  {
    date: new Date("2024-06-20"),
    dayLabel: "Thu",
    tempHigh: 22,
    tempLow: 15,
    description: "Few clouds",
    iconCode: "02d",
  },
  {
    date: new Date("2024-06-21"),
    dayLabel: "Fri",
    tempHigh: 17,
    tempLow: 11,
    description: "Scattered clouds",
    iconCode: "03d",
  },
];

describe("ForecastGrid", () => {
  // ─────────────────────────────────────────────────────────────────────────
  // RENDERING TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it("renders exactly 5 forecast cards", () => {
    render(<ForecastGrid forecasts={mockForecast} units="metric" />);

    // Each card shows a day label — count how many appear
    const dayLabels = screen.getAllByText(/Mon|Tue|Wed|Thu|Fri/);
    expect(dayLabels).toHaveLength(5);
  });

  it("renders the section with accessible label", () => {
    render(<ForecastGrid forecasts={mockForecast} units="metric" />);
    expect(
      screen.getByRole("region", { name: /forecast/i }),
    ).toBeInTheDocument();
    // WHY: The forecast section should be labelled for screen readers
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DAY LABEL TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it("renders all 5 day labels correctly", () => {
    render(<ForecastGrid forecasts={mockForecast} units="metric" />);

    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEMPERATURE TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it("renders high temperatures in Celsius for metric units", () => {
    render(<ForecastGrid forecasts={mockForecast} units="metric" />);

    // First card should show 21°C high
    expect(screen.getByText("21°C")).toBeInTheDocument();
  });

  it("renders low temperatures in Celsius for metric units", () => {
    render(<ForecastGrid forecasts={mockForecast} units="metric" />);

    // First card should show 14°C low
    expect(screen.getByText("14°C")).toBeInTheDocument();
  });

  it("renders temperatures in Fahrenheit for imperial units", () => {
    render(<ForecastGrid forecasts={mockForecast} units="imperial" />);

    // Should show °F not °C
    expect(screen.getByText("21°F")).toBeInTheDocument();
    expect(screen.getByText("14°F")).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DESCRIPTION TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it("renders weather descriptions for each day", () => {
    render(<ForecastGrid forecasts={mockForecast} units="metric" />);

    expect(screen.getByText("Partly cloudy")).toBeInTheDocument();
    expect(screen.getByText("Light rain")).toBeInTheDocument();
    expect(screen.getByText("Clear sky")).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // EDGE CASES
  // ─────────────────────────────────────────────────────────────────────────

  it("renders correctly with fewer than 5 days", () => {
    // API might return fewer days in some edge cases
    const threeDays = mockForecast.slice(0, 3);
    render(<ForecastGrid forecasts={threeDays} units="metric" />);

    const dayLabels = screen.getAllByText(/Mon|Tue|Wed/);
    expect(dayLabels).toHaveLength(3);
  });

  it("renders with empty forecast array without crashing", () => {
    // Should not throw even with empty data
    expect(() => {
      render(<ForecastGrid forecasts={[]} units="metric" />);
    }).not.toThrow();
  });
});
