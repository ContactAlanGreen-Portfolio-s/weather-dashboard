# CLAUDE.md — Weather Dashboard (Project 2)

> This file instructs AI coding assistants (Claude Code, Copilot, Cursor, etc.)
> on the conventions, constraints, and architecture of this project.
> Always read this file before making changes.

---

## Project Summary

A responsive weather dashboard SPA built with Vite + React + TypeScript.
Shows current weather and a 5-day forecast for a searched city or the user's
geolocation. Frontend-only — all third-party API calls are proxied through
Vercel Serverless Functions to keep the API key server-side.

**Live URL:** [add after deployment]
**Stack:** Vite, React 18, TypeScript, Tailwind CSS, TanStack Query, Zustand, Lucide

---

## Architecture Rules

### 1. The API Key Must Never Reach the Browser

All OpenWeatherMap calls go through `/api/weather` and `/api/forecast` (Vercel
Serverless Functions in the `api/` directory). The `OPENWEATHER_API_KEY` env var
is server-side only — never prefixed with `VITE_`, never referenced in `src/`.

**Correct:**

```typescript
// In src/ — call our proxy
const res = await fetch("/api/weather?city=London");
```

**Wrong:**

```typescript
// In src/ — direct API call with exposed key
const res = await fetch(
  `https://api.openweathermap.org/...&appid=${import.meta.env.VITE_API_KEY}`,
);
```

### 2. Transform at the Boundary

Raw API responses must be transformed in `src/lib/transformers.ts` before
reaching any component. Components consume `CurrentWeather` and `DailyForecast`
types — never raw `CurrentWeatherResponse` or `ForecastResponse`.

### 3. No Logic in Components

Components render UI only. Business logic belongs in:

- `src/lib/transformers.ts` — data transformation
- `src/lib/utils.ts` — formatting utilities
- `src/hooks/` — data fetching and side effects
- `src/store/weatherStore.ts` — global state

### 4. TypeScript Strict Mode

All types are defined in `src/types/index.ts`. Do not use `any`. If an external
type is genuinely unknown, use `unknown` and narrow it explicitly.

---

## File Conventions

```
Component files:   PascalCase.tsx     (WeatherIcon.tsx)
Hook files:        camelCase.ts       (useDebounce.ts)
Utility files:     camelCase.ts       (transformers.ts)
Test files:        [name].test.ts(x)  (transformers.test.ts)
```

All components use named exports (not default exports), except `App.tsx`.

---

## State Management

| State                               | Tool              | Location                    |
| ----------------------------------- | ----------------- | --------------------------- |
| Server data (weather, forecast)     | TanStack Query    | `src/hooks/`                |
| User preferences (units, last city) | Zustand + persist | `src/store/weatherStore.ts` |
| Local UI state (input value)        | useState          | Inside component            |

Do not add Zustand state for things that belong in React local state.
Do not add TanStack Query queries that aren't fetching from an external source.

---

## Caching Rules

- TanStack Query `staleTime` for all weather queries: **10 minutes**
- `refetchOnWindowFocus`: **false** (weather data doesn't change on tab focus)
- Debounce on search input: **500ms**
- Minimum search query length: **2 characters**
- Do not shorten the staleTime — it protects the free API tier

---

## Testing Requirements

Before submitting any change:

```bash
npm run type-check    # must pass with 0 errors
npm run lint          # must pass with 0 errors
npm run test          # all unit + component tests must pass
```

- Unit tests for any new transformer or utility function are mandatory
- Component tests for any new component are expected
- Mocking strategy is defined in `testing_guide_project2.md`

---

## Environment Variables

| Variable              | Location                                         | Purpose                           |
| --------------------- | ------------------------------------------------ | --------------------------------- |
| `OPENWEATHER_API_KEY` | Server-side only (`.env.local`, Vercel env vars) | OpenWeatherMap API authentication |

Do not add `VITE_` prefix to this variable. It must not appear in the browser bundle.

---

## Commands

```bash
vercel dev          # start local dev server (Vite + serverless functions)
npm run type-check  # TypeScript check
npm run lint        # ESLint
npm run test        # Vitest unit + component tests
npm run test:e2e    # Playwright E2E tests
npm run build       # production build
```

---

## Do Not

- Add a spinner as a loading state — use skeleton components only
- Import directly from `@tanstack/react-query` in component files — use hooks from `src/hooks/`
- Add a database or authentication — this is intentionally a stateless SPA
- Use `localStorage` directly — all persistence goes through Zustand's `persist` middleware
- Commit `.env.local` — the gitignore already blocks it, but double-check
- Add `console.log` in production code paths — remove before committing
