// src/__tests__/unit/utils.test.ts
import { describe, it, expect } from "vitest";
import { formatTemp, formatWindSpeed } from "@/lib/utils";

describe("formatTemp", () => {
  it("formats Celsius correctly", () => {
    expect(formatTemp(18, "metric")).toBe("18°C");
  });

  it("formats Fahrenheit correctly", () => {
    expect(formatTemp(64, "imperial")).toBe("64°F");
  });

  it("handles negative temperatures", () => {
    expect(formatTemp(-5, "metric")).toBe("-5°C");
  });
});

describe("formatWindSpeed", () => {
  it("shows km/h for metric", () => {
    expect(formatWindSpeed(14, "metric")).toBe("14 km/h");
  });

  it("shows mph for imperial", () => {
    expect(formatWindSpeed(9, "imperial")).toBe("9 mph");
  });
});
