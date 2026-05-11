// e2e/weather.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Weather Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows empty state on initial load", async ({ page }) => {
    await expect(page.getByText("What's the weather like?")).toBeVisible();
    await expect(page.getByPlaceholder("Search for a city...")).toBeVisible();
  });

  test("searches for a city and displays weather", async ({ page }) => {
    // Type in search box
    await page.getByPlaceholder("Search for a city...").fill("London");

    // Wait for the weather card to appear (real API call)
    await expect(page.getByText("London")).toBeVisible({ timeout: 10_000 });

    // Verify weather card elements
    await expect(page.getByText("GB")).toBeVisible();
    await expect(page.getByText("5-Day Forecast")).toBeVisible();
  });

  test("shows city not found error for invalid city", async ({ page }) => {
    await page.getByPlaceholder("Search for a city...").fill("xzxzxzxzxz");
    await expect(page.getByText("City not found")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("unit toggle switches between Celsius and Fahrenheit", async ({
    page,
  }) => {
    // Search for a city first
    await page.getByPlaceholder("Search for a city...").fill("Paris");
    await page.getByText("FR").waitFor({ timeout: 10_000 });

    // Verify °C is shown initially
    await expect(page.getByText("°C")).toBeVisible();

    // Click the unit toggle
    await page.getByRole("switch", { name: "Toggle temperature unit" }).click();

    // Verify °F is now shown
    await expect(page.getByText("°F")).toBeVisible();
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/WeatherDash/);
  });
});
