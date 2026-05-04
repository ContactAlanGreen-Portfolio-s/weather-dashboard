# Testing Guide — Project 2: Weather Dashboard

> **Purpose:** This document defines the full testing strategy for the Weather Dashboard.
> Written BEFORE tests are implemented, so every test has a clear reason to exist.
> This mirrors real-world engineering practice — test plans precede test code.

---

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Runner Setup](#test-runner-setup)
- [Layer 1: Unit Tests](#layer-1-unit-tests)
- [Layer 2: Component Tests](#layer-2-component-tests)
- [Layer 3: End-to-End Tests](#layer-3-end-to-end-tests)
- [What We Deliberately Don't Test](#what-we-deliberately-dont-test)
- [Mocking Strategy](#mocking-strategy)
- [Running the Test Suite](#running-the-test-suite)
- [CI Integration](#ci-integration)
- [Coverage Targets](#coverage-targets)

---

## Testing Philosophy

This project uses a **testing pyramid** approach:

```
        ▲
       / \
      /E2E\         Few, slow, expensive — test critical user journeys
     /─────\
    /       \
   /Component\      Medium — test UI rendering and interactions
  /───────────\
 /             \
/  Unit Tests   \   Many, fast, cheap — test pure logic
/───────────────\
```

The rule: **test behaviour, not implementation.**

We ask "does this work for the user?" not "is this function called?".

### Key Principle: Don't Mock What You Own

- We DO mock: the browser Geolocation API (not ours), fetch calls to external APIs (not ours)
- We DON'T mock: transformer functions, utility functions, our own hooks
- We test our own code against real inputs and expected outputs

---

## Test Runner Setup

```
Tool          Purpose
──────────────────────────────────────────────────────────
Vitest        Test runner — Vite-native, fast, Jest-compatible API
RTL           React Testing Library — renders components, queries DOM
userEvent     Simulates real user interactions (type, click, tab)
jest-dom      Custom matchers (toBeInTheDocument, toHaveClass, etc.)
jsdom         Simulates browser environment inside Node
Playwright    Full browser automation for E2E tests
```

### Setup File

```typescript
// src/__tests__/setup.ts
// Runs before every test file — extends Vitest with DOM matchers

import '@testing-library/jest-dom'
```

### Why jsdom over happy-dom?

jsdom is more mature and has wider browser API support. happy-dom is faster but
has gaps in some browser APIs (Geolocation, certain DOM events). For this project,
jsdom's reliability is worth the slight speed penalty.

---

## Layer 1: Unit Tests

**Location:** `src/__tests__/unit/`
**Tool:** Vitest
**Speed:** < 100ms per file
**Network required:** No

### 1.1 — Transformer Tests (`transformers.test.ts`)

These are the most important tests in the project. The transformers convert raw API
data into what the UI renders. If they're wrong, every component shows wrong data.

#### `transformCurrentWeather()`

| Test | Input | Expected Output | Why |
|------|-------|-----------------|-----|
| Rounds temp | `temp: 18.7` | `temp: 19` | UI shows whole numbers — no decimals |
| Rounds feelsLike | `feels_like: 17.3` | `feelsLike: 17` | Same reason |
| Rounds tempMin/Max | `temp_min: 15.2` | `tempMin: 15` | Consistency |
| Converts visibility | `visibility: 10000` (metres) | `visibility: 10` (km) | API gives metres, UI shows km |
| Converts wind speed | `wind.speed: 3.9` (m/s) | `windSpeed: 14` (km/h) | API gives m/s, UI shows km/h |
| Capitalises description | `"few clouds"` | `"Few clouds"` | Sentence case for display |
| Converts timestamp | `dt: 1718358000` | `updatedAt: Date` object | Unix seconds → JS Date |
| Maps city/country | `name: "London", sys.country: "GB"` | `city: "London", country: "GB"` | Flat structure for components |
| Handles missing weather | `weather: []` | `iconCode: "01d"` fallback | API could return empty array |

#### `transformForecast()`

| Test | Input | Expected Output | Why |
|------|-------|-----------------|-----|
| Groups by day | 40 3-hour slots | 5 daily entries | Core grouping logic |
| Picks midday slot | slots at 06:00, 12:00, 18:00 | description from 12:00 | Representative daily weather |
| Falls back to first slot | no 12:00 slot for today | description from first slot | Today often has no midday slot |
| Calculates tempHigh | all slots' temp_max | max across the day | Not just midday — scan all |
| Calculates tempLow | all slots' temp_min | min across the day | Not just midday |
| Formats dayLabel | date object | "Mon", "Tue", etc. | UI day labels |
| Returns max 5 entries | 6 days of data | 5 entries | Slice to 5 days |

### 1.2 — Utility Tests (`utils.test.ts`)

| Test | Function | Input | Expected Output |
|------|----------|-------|-----------------|
| Celsius format | `formatTemp` | `(18, 'metric')` | `"18°C"` |
| Fahrenheit format | `formatTemp` | `(64, 'imperial')` | `"64°F"` |
| Negative temp | `formatTemp` | `(-5, 'metric')` | `"-5°C"` |
| Zero temp | `formatTemp` | `(0, 'metric')` | `"0°C"` |
| Wind metric | `formatWindSpeed` | `(14, 'metric')` | `"14 km/h"` |
| Wind imperial | `formatWindSpeed` | `(9, 'imperial')` | `"9 mph"` |

### 1.3 — Icon Mapping Tests (`weatherIcons.test.ts`)

| Test | Input | Expected Output |
|------|-------|-----------------|
| Known day icon | `"01d"` | `Sun` component |
| Known night icon | `"10n"` | `CloudRain` component |
| Unknown icon code | `"99x"` | `Wind` (fallback) |
| Empty string | `""` | `Wind` (fallback) |

---

## Layer 2: Component Tests

**Location:** `src/__tests__/components/`
**Tool:** Vitest + React Testing Library
**Speed:** < 500ms per file
**Network required:** No (all API calls mocked)

### 2.1 — SearchBar Tests (`SearchBar.test.tsx`)

The SearchBar is the most complex component — it has debounce, geolocation,
loading states, and clear functionality. It needs thorough testing.

#### Setup

```typescript
// Mock the geolocation hook — the browser API isn't available in jsdom
vi.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: () => ({
    state: { status: 'idle' },
    requestLocation: vi.fn(),
    reset: vi.fn(),
  }),
}))

// Use fake timers to control the debounce without actually waiting 500ms
vi.useFakeTimers()
```

#### Test Cases

| Test | Action | Expected | Why |
|------|--------|----------|-----|
| Renders input | render | input with placeholder visible | Smoke test |
| Renders location button | render | button with aria-label visible | Accessibility check |
| No call on 1 char | type "L" + advance 600ms | `onCitySearch` NOT called | Min 2 chars requirement |
| Calls after debounce | type "Lo" + advance 600ms | `onCitySearch("Lo")` called once | Core debounce behaviour |
| No calls during typing | type "London" fast | `onCitySearch` called once (not 6 times) | Debounce consolidates calls |
| Shows spinner when loading | `isLoading={true}` | Loader2 icon visible, not X | Loading state feedback |
| Shows clear button | type "ab" | X button appears | Clear affordance |
| Geolocation error shown | geo state = error | error message rendered | Error state |

### 2.2 — CurrentWeatherCard Tests (`CurrentWeatherCard.test.tsx`)

| Test | Props | Expected DOM content | Why |
|------|-------|----------------------|-----|
| City and country | `{city:"London", country:"GB"}` | "London" and "GB" visible | Basic data render |
| Temperature (metric) | `{temp:18, units:'metric'}` | "18" and "°C" visible | Correct unit symbol |
| Temperature (imperial) | `{temp:64, units:'imperial'}` | "°F" visible | Unit switching |
| Humidity | `{humidity:72}` | "72%" visible | Stat render |
| Wind metric | `{windSpeed:14, units:'metric'}` | "14 km/h" visible | Wind with units |
| Wind imperial | `{windSpeed:9, units:'imperial'}` | "9 mph" visible | Imperial wind |
| Visibility | `{visibility:10}` | "10 km" visible | Visibility stat |
| Description | `{description:"Few clouds"}` | "Few clouds" visible | Description text |
| Icon renders | `{iconCode:"02d"}` | icon not throwing | Icon mapping works |

### 2.3 — ForecastGrid Tests (`ForecastGrid.test.tsx`)

| Test | Props | Expected | Why |
|------|-------|----------|-----|
| Renders 5 cards | 5 DailyForecast items | 5 card elements in DOM | Correct count |
| Renders day labels | `dayLabel:"Mon"` | "Mon" visible | Day label display |
| Renders high temp | `tempHigh:21, units:'metric'` | "21°C" visible | High temp display |
| Renders low temp | `tempLow:14, units:'metric'` | "14°C" visible | Low temp display |
| Section has accessible label | render | role="region" with label | Accessibility |

### 2.4 — ErrorMessage Tests (`ErrorMessage.test.tsx`)

| Test | Props | Expected | Why |
|------|-------|----------|-----|
| City not found | `type='city-not-found'` | "City not found" heading | Correct error shown |
| API down | `type='api-down'` | "Weather data unavailable" | Correct error shown |
| Generic error | `type='generic'` | "Something went wrong" | Fallback error |
| Retry button | `onRetry={fn}` | button visible | Retry affordance |
| Retry fires callback | click retry | `onRetry` called once | Callback wired |
| No retry without handler | no `onRetry` prop | button NOT in DOM | Optional retry |
| Has alert role | any type | `role="alert"` present | Screen reader announces |

### 2.5 — EmptyState Tests (`EmptyState.test.tsx`)

| Test | Expected |
|------|----------|
| Renders heading | "What's the weather like?" visible |
| Renders description | helper text visible |
| Icon is hidden from AT | icon has `aria-hidden="true"` |

### 2.6 — Skeleton Tests (`Skeleton.test.tsx`)

| Test | Expected |
|------|----------|
| WeatherCardSkeleton renders | doesn't throw |
| ForecastGridSkeleton renders | doesn't throw |
| Skeleton divs are aria-hidden | `aria-hidden="true"` on skeleton elements |

---

## Layer 3: End-to-End Tests

**Location:** `e2e/`
**Tool:** Playwright
**Speed:** 5-30 seconds per test (real network, real browser)
**Network required:** Yes (real OpenWeatherMap API calls via proxy)

> ⚠️ E2E tests require `vercel dev` to be running and OPENWEATHER_API_KEY to be set.

### 3.1 — Initial State (`weather.spec.ts`)

| Test | Steps | Expected |
|------|-------|----------|
| Empty state on load | navigate to `/` | "What's the weather like?" visible |
| Search input visible | navigate to `/` | placeholder input visible |
| Page title correct | navigate to `/` | page title contains "WeatherDash" |

### 3.2 — Search Flow

| Test | Steps | Expected |
|------|-------|----------|
| City search renders weather | type "London", wait | city name "London" appears in card |
| Country code shows | type "London", wait | "GB" appears |
| Forecast renders | type "London", wait | "5-Day Forecast" heading visible |
| 5 forecast cards appear | type "London", wait | 5 day cards in the grid |
| Stats visible | type "London", wait | Humidity/Wind/Visibility labels visible |

### 3.3 — Error States

| Test | Steps | Expected |
|------|-------|----------|
| Invalid city | type "xzxzxzxz", wait | "City not found" visible |
| Error is accessible | type invalid city | error has `role="alert"` |

### 3.4 — Unit Toggle

| Test | Steps | Expected |
|------|-------|----------|
| Default is Celsius | search city | "°C" visible |
| Toggle switches to Fahrenheit | search city, click toggle | "°F" visible |
| Toggle is keyboard accessible | Tab to toggle, press Space | unit changes |

### 3.5 — Persistence

| Test | Steps | Expected |
|------|-------|----------|
| Unit preference persists | set to °F, reload | still shows °F |
| Last city persists | search "Paris", reload | "Paris" shown again |

---

## What We Deliberately Don't Test

### The Vercel Serverless Functions (`api/weather.ts`, `api/forecast.ts`)

**Why not:** These would need a separate test runner (Jest + node-mocks-http) and
mock fetch calls to OpenWeatherMap. For a junior portfolio project, the E2E tests
cover this entire path (browser → proxy → API → response).

In a production team environment, you would write integration tests for these
functions. This is worth mentioning in an interview — "I made an informed trade-off
between test coverage and time investment."

### The Zustand Store in Isolation

**Why not:** Zustand stores are just JavaScript objects with setter functions.
Testing them in isolation would test the library, not our code. We test the store
indirectly through component tests (the unit toggle test verifies Zustand works).

### Icon Rendering Pixel-Perfect Accuracy

**Why not:** We verify the correct Lucide icon component is returned by `getWeatherIcon()`.
We don't verify that the SVG renders with exact pixel coordinates — that's the library's
responsibility, not ours.

---

## Mocking Strategy

### Browser Geolocation API

```typescript
// Geolocation is not available in jsdom — mock the entire hook
vi.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: () => ({
    state: { status: 'idle' },
    requestLocation: vi.fn(),
    reset: vi.fn(),
  }),
}))

// For testing the error state:
vi.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: () => ({
    state: { status: 'error', message: 'Location access denied.' },
    requestLocation: vi.fn(),
    reset: vi.fn(),
  }),
}))
```

### Fetch Calls (for hook tests)

```typescript
// Mock global fetch when testing useWeather / useForecast hooks directly
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: async () => mockCurrentWeatherResponse,
}))
```

### Timer Control (for debounce tests)

```typescript
// In describe block:
beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

// In test:
await user.type(input, 'London')
vi.advanceTimersByTime(600) // skip past the 500ms debounce
expect(mockCallback).toHaveBeenCalledWith('London')
```

### Window.confirm (if used)

```typescript
vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
```

---

## Running the Test Suite

```bash
# Run all unit + component tests once
npm run test

# Run in watch mode (re-runs on file change — use during development)
npm run test:watch

# Open the visual Vitest UI (browser-based test runner)
npm run test:ui

# Run with coverage report
npm run test:coverage

# Run a specific test file
npx vitest run src/__tests__/unit/transformers.test.ts

# Run E2E tests (requires vercel dev running)
npm run test:e2e

# Run everything
npm run test:all
```

---

## CI Integration

Unit and component tests run automatically on every push/PR via GitHub Actions:

```yaml
# From .github/workflows/ci.yml
- name: Run unit + component tests
  run: npm run test
```

E2E tests are NOT run in CI for this project. Reasons:
- They require a real API key in CI secrets (manageable but adds complexity)
- They depend on the live OpenWeatherMap API (network failures = flaky CI)
- For a portfolio project, the E2E tests are run manually before deployment

In a production team, you would:
1. Store the API key in GitHub Actions secrets
2. Mock the OpenWeatherMap API with a Playwright `route()` fixture
3. Run E2E tests in CI against the mocked API

This is worth discussing in interviews as a "next step" trade-off.

---

## Coverage Targets

```
File                        Target   Why
─────────────────────────────────────────────────────────
src/lib/transformers.ts     100%     Core logic — no untested paths acceptable
src/lib/utils.ts            100%     Pure functions — trivial to achieve 100%
src/lib/weatherIcons.ts     90%+     Known codes + fallback path
src/components/weather/*    80%+     Key rendering paths covered
src/components/search/*     80%+     Debounce + error states covered
src/components/ui/*         70%+     Smoke tests sufficient
src/hooks/*                 60%+     Hooks tested indirectly via components
src/store/*                 60%+     Tested indirectly via toggle tests
```

> Coverage is a health indicator, not a goal. 100% coverage with weak assertions
> is less valuable than 70% coverage with meaningful assertions.

---

*Tests document what the code is supposed to do. Write them like instructions to your future self.*
