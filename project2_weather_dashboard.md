# Project 2: Weather Dashboard

## Complete Step-by-Step Build Guide

> **How to use this document:** Follow every step in order. Nothing is skipped.
> Every command, every file, every config is shown. When you see a ✅ checkbox,
> it means you can verify that step worked before moving on.
>
> **Why explanations matter:** Every significant decision in this guide includes
> a "WHY" comment. This is not just for learning — it's what you say in interviews
> when asked "walk me through your technical decisions."

---

## Table of Contents

- [Phase 0 — Prerequisites & Environment](#phase-0--prerequisites--environment)
- [Phase 1 — System Design (Waterfall)](#phase-1--system-design-waterfall)
- [Sprint 1 — Core Integration](#sprint-1--core-integration)
- [Sprint 2 — UI Engineering & State](#sprint-2--ui-engineering--state)
- [Sprint 3 — Edge Cases & Polish](#sprint-3--edge-cases--polish)
- [Testing Strategy](#testing-strategy)
- [GitHub Issues & Project Board Setup](#github-issues--project-board-setup)
- [Git Workflow Reference](#git-workflow-reference)
- [Common Errors & Fixes](#common-errors--fixes)
- [Checklist: Definition of Done](#checklist-definition-of-done)

---

# Phase 0 — Prerequisites & Environment

> These need to exist before writing a single line of code.
> Don't skip this phase — it prevents hours of debugging environment issues later.

## 0.1 Stack Decision: Why Vite Instead of Next.js

Project 1 used Next.js. This project deliberately uses **Vite + React** to demonstrate versatility.

```
WHY VITE FOR THIS PROJECT?

Next.js is a full-stack framework. It shines when you need:
  - Server-side rendering (SEO-critical pages)
  - API routes (backend endpoints)
  - File-based routing at scale

This project is a pure frontend SPA (Single Page Application). There is:
  - No database
  - No user accounts
  - No server-rendered pages
  - One API dependency (OpenWeatherMap)

Vite is the industry-standard build tool for SPAs in 2026.
Using it here shows you can choose the right tool for the job —
not just reach for Next.js because you know it.

IMPORTANT: The one server-side concern (hiding the API key) is handled
by a Vercel Serverless Function — a separate, minimal proxy endpoint.
This is covered in Sprint 1.
```

## 0.2 Accounts to Create

```
Before starting, verify you have:

1. GitHub          → github.com           (already set up from Project 1)
2. Vercel          → vercel.com           (already set up from Project 1)
3. OpenWeatherMap  → openweathermap.org   ← NEW: create a free account

OpenWeatherMap Free Tier gives you:
  - 60 API calls / minute
  - 1,000,000 API calls / month
  - Current weather data
  - 5-day / 3-hour forecast
  - Geocoding API (city name → coordinates)
  - Data updates every 10 minutes

Getting your API key:
  1. Sign up at openweathermap.org
  2. Go to API Keys tab
  3. A default key is auto-generated
  4. IMPORTANT: New keys take up to 2 hours to activate
     → Create your account NOW, before you need to test API calls
```

## 0.3 Tools to Install / Verify

```bash
# Verify Node.js (same from Project 1)
node --version    # should print v20.x.x or higher
npm --version     # should print 10.x.x

# Verify Git
git --version

# VS Code extensions — same as Project 1 plus:
# - Vite (antfu.vite) — Vite tooling support
# - REST Client (humao.rest-client) — test API calls from VS Code
```

## 0.4 VS Code Workspace Settings

```jsonc
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

# Phase 1 — System Design (Waterfall)

> **Do this BEFORE writing any code.** System design first is what separates
> developers who build ad hoc from those who think architecturally.
> In interviews, you'll be asked "how did you plan this?" — this section is your answer.

## 1.1 UI/UX Layout Plan

Plan the layout on paper (or Figma/Excalidraw) before building. Here is the agreed design:

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER                                  │
│   🌤 WeatherDash                        [°C] ──●── [°F]        │
│   (logo + app name)                  (unit toggle — Zustand)    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SEARCH BAR                                 │
│   ┌──────────────────────────────┐  ┌──────────────────┐       │
│   │  🔍 Search for a city...     │  │ 📍 Use my location│       │
│   └──────────────────────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   MAIN WEATHER CARD                             │
│                                                                 │
│   London, UK                                🌤                 │
│   Last updated: 14:32                  (weather icon)          │
│                                                                 │
│         18°C                                                    │
│         Partly Cloudy                                           │
│                                                                 │
│   💧 Humidity: 72%    💨 Wind: 14 km/h    👁 Visibility: 8km  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    5-DAY FORECAST GRID                          │
│                                                                 │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  │
│  │ MON    │  │ TUE    │  │ WED    │  │ THU    │  │ FRI    │  │
│  │  🌧    │  │  ⛅    │  │  🌤    │  │  ☀️    │  │  🌦    │  │
│  │ 16°    │  │ 18°    │  │ 20°    │  │ 22°    │  │ 17°    │  │
│  │ 11°    │  │ 12°    │  │ 13°    │  │ 15°    │  │ 12°    │  │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────────┘

EMPTY STATE (no city searched yet):
  - Hero illustration or icon
  - "Search for a city to see the weather"
  - OR: auto-load user's location if geolocation allowed

ERROR STATES:
  - City not found → friendly message, suggestions
  - API down       → "Weather data unavailable. Try again later."
  - Location denied → "Location access denied. Search for a city manually."

LOADING STATE:
  - Skeleton cards replacing the weather card and forecast grid
  - NOT a spinner — skeleton loaders are the industry standard
```

## 1.2 API Strategy ✅

### OpenWeatherMap Free Tier — Endpoints We Will Use

```
BASE URL: https://api.openweathermap.org

─────────────────────────────────────────────────────────────────────
ENDPOINT 1: CURRENT WEATHER BY CITY NAME
─────────────────────────────────────────────────────────────────────
GET /data/2.5/weather

Query params:
  q       → city name (e.g. "London" or "London,GB")
  appid   → your API key
  units   → "metric" (Celsius) or "imperial" (Fahrenheit)
  lang    → "en" (English response)

Example:
  https://api.openweathermap.org/data/2.5/weather?q=London&appid=KEY&units=metric

Response shape (abbreviated):
{
  "name": "London",
  "sys": { "country": "GB" },
  "main": {
    "temp": 18.4,
    "feels_like": 17.2,
    "temp_min": 15.1,
    "temp_max": 20.6,
    "humidity": 72,
    "pressure": 1012
  },
  "weather": [{ "id": 801, "main": "Clouds", "description": "few clouds", "icon": "02d" }],
  "wind": { "speed": 3.9, "deg": 240 },
  "visibility": 10000,
  "dt": 1718358000          ← Unix timestamp of data
}

─────────────────────────────────────────────────────────────────────
ENDPOINT 2: 5-DAY FORECAST (3-HOUR INTERVALS) BY CITY NAME
─────────────────────────────────────────────────────────────────────
GET /data/2.5/forecast

Same query params as above.

Response shape (abbreviated):
{
  "city": { "name": "London", "country": "GB" },
  "list": [
    {
      "dt": 1718370000,
      "main": { "temp": 17.8, "temp_min": 16.2, "temp_max": 18.9, "humidity": 74 },
      "weather": [{ "main": "Rain", "description": "light rain", "icon": "10d" }],
      "dt_txt": "2024-06-14 12:00:00"
    },
    ... (40 entries total — one every 3 hours for 5 days)
  ]
}

NOTE: The forecast returns data every 3 hours, so 8 entries per day × 5 days = 40 entries.
We will GROUP these by day and take the midday entry (12:00:00) as the representative
temperature for each day to build our 5-day forecast UI.

─────────────────────────────────────────────────────────────────────
ENDPOINT 3: CURRENT WEATHER BY COORDINATES (Geolocation)
─────────────────────────────────────────────────────────────────────
GET /data/2.5/weather

Query params:
  lat     → latitude (from browser Geolocation API)
  lon     → longitude (from browser Geolocation API)
  appid   → your API key
  units   → "metric" or "imperial"

Example:
  https://api.openweathermap.org/data/2.5/weather?lat=51.5074&lon=-0.1278&appid=KEY&units=metric

GET /data/2.5/forecast (same lat/lon params for forecast by coordinates)

─────────────────────────────────────────────────────────────────────
RATE LIMITS — HOW WE HANDLE THEM
─────────────────────────────────────────────────────────────────────

Free tier:
  - 60 calls / minute
  - 1,000,000 calls / month

Our defence mechanisms:
  1. TanStack Query staleTime = 10 minutes
     → If user re-focuses tab or re-mounts component within 10 mins,
       NO new API call is made. Cached data is served.

  2. 500ms debounce on search input
     → User typing "London" fires ZERO API calls until they pause typing.
       Without debounce, each keystroke fires a call: L → Lo → Lon → ...

  3. Query only fires when city string is ≥ 2 characters
     → Prevents API calls on single-character input.

  4. Separate queries for current + forecast (2 calls per search)
     → At 60 calls/minute, a user would need to search 30 different cities
       per minute to hit the limit. Not realistic.
```

### Why We Proxy the API Key

```
SECURITY CONCERN WITH VITE:

In a Vite app, environment variables prefixed with VITE_ are bundled
into the JavaScript that ships to the browser. This means:

  VITE_OPENWEATHER_API_KEY=abc123

→ Anyone who opens DevTools → Sources → main.js can find "abc123"
→ They can use your key for their own requests
→ OpenWeatherMap can rate-limit or ban your account

THE SOLUTION: A Vercel Serverless Function as a proxy

Instead of the browser calling OpenWeatherMap directly:
  Browser → OpenWeatherMap API (key exposed)

We route through a server-side function:
  Browser → /api/weather (no key exposed) → OpenWeatherMap API (key is server-side)

The API key lives only in Vercel's environment variables, never in the browser bundle.

This is the same pattern used at scale: weather apps, payment apps, map apps
all proxy third-party API calls through their own backend to protect keys.
```

## 1.3 Data Models — TypeScript Interfaces

Design the types before you write a single component. This is the contract everything else conforms to.

```typescript
// Shared TypeScript interfaces — plan before implementation

// ── OpenWeatherMap API response types ─────────────────────────────────────────

interface WeatherCondition {
  id: number;
  main: string;          // "Clouds", "Rain", "Clear", etc.
  description: string;   // "few clouds", "light rain", etc.
  icon: string;          // "02d", "10n" — used to determine which Lucide icon to show
}

interface MainMetrics {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
}

interface Wind {
  speed: number;         // m/s in metric, mph in imperial
  deg: number;
}

// Current weather API response
interface CurrentWeatherResponse {
  name: string;
  sys: { country: string };
  main: MainMetrics;
  weather: WeatherCondition[];
  wind: Wind;
  visibility: number;    // metres
  dt: number;            // Unix timestamp
}

// Forecast API — individual 3-hour slot
interface ForecastSlot {
  dt: number;
  main: MainMetrics;
  weather: WeatherCondition[];
  dt_txt: string;        // "2024-06-14 12:00:00"
}

// Forecast API response
interface ForecastResponse {
  city: { name: string; country: string };
  list: ForecastSlot[];
}

// ── Transformed / normalised types used by UI components ──────────────────────
// WHY: We transform raw API data into clean, UI-focused shapes.
// Components should never depend directly on the raw API response shape.
// If OpenWeatherMap changes their schema, we only update the transformer function.

interface CurrentWeather {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  description: string;
  iconCode: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  updatedAt: Date;
}

interface DailyForecast {
  date: Date;
  dayLabel: string;      // "Mon", "Tue", etc.
  tempHigh: number;
  tempLow: number;
  description: string;
  iconCode: string;
}

// ── Zustand store shape ────────────────────────────────────────────────────────

type Units = 'metric' | 'imperial';

interface WeatherStore {
  units: Units;
  lastSearchedCity: string;
  setUnits: (units: Units) => void;
  setLastSearchedCity: (city: string) => void;
}
```

## 1.4 Folder Structure

Plan before creating. Every directory has a purpose.

```
weather-dashboard/
├── .github/
│   └── workflows/
│       └── ci.yml                    ← GitHub Actions CI
├── .vscode/
│   └── settings.json
├── api/                              ← Vercel Serverless Functions
│   ├── weather.ts                    ← proxy: current weather
│   └── forecast.ts                  ← proxy: 5-day forecast
├── public/
│   └── vite.svg
├── src/
│   ├── main.tsx                      ← React entry point
│   ├── App.tsx                       ← root component + layout
│   ├── index.css                     ← Tailwind directives
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.tsx            ← logo + unit toggle
│   │   ├── search/
│   │   │   └── SearchBar.tsx         ← debounced input + geolocation button
│   │   ├── weather/
│   │   │   ├── CurrentWeatherCard.tsx  ← main weather display
│   │   │   ├── ForecastGrid.tsx       ← 5-day forecast row
│   │   │   ├── ForecastCard.tsx       ← individual day card
│   │   │   └── WeatherIcon.tsx        ← Lucide icon mapper
│   │   └── ui/
│   │       ├── Skeleton.tsx           ← loading skeleton primitives
│   │       ├── ErrorMessage.tsx       ← reusable error display
│   │       └── EmptyState.tsx         ← initial / no results state
│   ├── hooks/
│   │   ├── useWeather.ts             ← TanStack Query: current weather
│   │   ├── useForecast.ts            ← TanStack Query: 5-day forecast
│   │   ├── useGeolocation.ts         ← browser Geolocation API wrapper
│   │   └── useDebounce.ts            ← 500ms debounce custom hook
│   ├── store/
│   │   └── weatherStore.ts           ← Zustand: units + last city
│   ├── lib/
│   │   ├── transformers.ts           ← raw API → clean UI types
│   │   ├── weatherIcons.ts           ← icon code → Lucide icon mapping
│   │   └── utils.ts                  ← formatTemp, formatWind, formatDate
│   └── types/
│       └── index.ts                  ← all TypeScript interfaces
├── src/__tests__/
│   ├── unit/
│   │   ├── transformers.test.ts
│   │   └── utils.test.ts
│   └── components/
│       ├── SearchBar.test.tsx
│       ├── CurrentWeatherCard.test.tsx
│       └── ForecastGrid.test.tsx
├── e2e/
│   └── weather.spec.ts               ← Playwright E2E tests
├── .env.local                        ← secrets (NEVER commit)
├── .env.example                      ← template (commit this)
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

# Sprint 1 — Core Integration

> **Goal:** By the end of Sprint 1, you have a working search bar that calls the
> weather API and renders raw JSON on screen. No styling yet — prove the data flow
> works end to end first.

## Step 1: Initialise the Project

```bash
# Create a new Vite + React + TypeScript project
npm create vite@latest weather-dashboard -- --template react-ts

cd weather-dashboard

# Verify it runs
npm install
npm run dev
# Open http://localhost:5173 — should see Vite welcome page
```

✅ **Verify:** You see the Vite + React default page at localhost:5173.

## Step 2: Install Tailwind CSS ✅

```bash
# Install Tailwind and its Vite plugin (2026 approach — no PostCSS config needed)
npm install -D tailwindcss @tailwindcss/vite

# This is different from Project 1 (Next.js had its own Tailwind setup)
# With Vite, we use the dedicated Vite plugin
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),   // WHY: Vite processes Tailwind at build time — no separate PostCSS step
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),   // WHY: enables @/components/... imports
    },
  },
})
```

```css
/* src/index.css — replace all content */
@import "tailwindcss";
```

```typescript
// tsconfig.json — add path alias support
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
    // ... rest of existing config
  }
}
```

✅ **Verify:** Add `className="text-blue-500"` to App.tsx — text should turn blue.

## Step 3: Install All Dependencies

```bash
# Core dependencies
npm install \
  @tanstack/react-query \       # server state + API caching
  @tanstack/react-query-devtools \  # inspect cache in dev
  zustand \                     # global UI state (metric/imperial)
  lucide-react \                # icon library — clean, tree-shakeable
  clsx \                        # conditional className utility
  tailwind-merge \              # merges Tailwind classes without conflicts
  date-fns                      # date formatting (same as Project 1)

# Dev dependencies
npm install -D \
  vitest \                      # Vite-native test runner (replaces Jest)
  @vitest/ui \                  # visual test runner UI
  @testing-library/react \      # component testing
  @testing-library/user-event \ # simulates real user interactions
  @testing-library/jest-dom \   # custom matchers (toBeInTheDocument, etc.)
  jsdom \                       # browser environment for tests
  prettier \
  prettier-plugin-tailwindcss \
  @playwright/test              # E2E testing

# WHY Vitest instead of Jest?
# Vitest is the native test runner for Vite projects.
# It shares the same config as Vite — no separate Babel/transform setup.
# Jest requires extra configuration to work with Vite's ESM setup.
# In 2026, Vitest is the standard choice for Vite projects.
```

## Step 4: Configure Environment Variables ✅

```bash
# Create .env.local — NEVER commit this
touch .env.local

# Create .env.example — safe to commit
touch .env.example
```

```bash
# .env.local — fill in your actual API key
# NOTE: We do NOT use VITE_ prefix here because this key
# should NEVER reach the browser bundle.
# The key is only used in the serverless proxy function (api/).

OPENWEATHER_API_KEY="your-openweathermap-api-key-here"
```

```bash
# .env.example — commit this as a template
OPENWEATHER_API_KEY=""
```

```bash
# .gitignore — verify these are present (Vite adds them, double-check)
.env
.env.local
.env.*.local
```

## Step 5: Build the Vercel Serverless Proxy Functions

> This is the most important security step in the project.

```typescript
// api/weather.ts
// WHY THIS FILE EXISTS:
// Vercel treats any file in the /api directory as a serverless function.
// When deployed, Vercel runs this code on a server, not in the browser.
// This means OPENWEATHER_API_KEY is never exposed to the client.
// The browser calls /api/weather?city=London, not OpenWeatherMap directly.

import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { city, lat, lon, units = 'metric' } = req.query

  // Validate: must have either city OR coordinates
  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: 'Provide either city or lat/lon coordinates' })
  }

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    // This should never happen in production — indicates a misconfigured deployment
    console.error('[api/weather] OPENWEATHER_API_KEY is not set')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    // Build query string depending on search type
    const params = new URLSearchParams({
      appid: apiKey,
      units: units as string,
      lang: 'en',
    })

    if (city) {
      params.set('q', city as string)
    } else {
      params.set('lat', lat as string)
      params.set('lon', lon as string)
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?${params}`
    )

    // Forward OpenWeatherMap's status code to the client
    // WHY: 404 means city not found — the frontend needs to know this
    if (!response.ok) {
      const error = await response.json()
      return res.status(response.status).json({ error: error.message || 'Weather API error' })
    }

    const data = await response.json()

    // Cache the response for 10 minutes at the CDN level
    // WHY: This is defence-in-depth — even if the frontend re-queries,
    // Vercel's CDN serves the cached response without hitting OpenWeatherMap.
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60')

    return res.status(200).json(data)
  } catch (error) {
    console.error('[api/weather] Upstream fetch failed:', error)
    return res.status(503).json({ error: 'Weather service unavailable' })
  }
}
```

```typescript
// api/forecast.ts
// Same pattern as api/weather.ts — proxies the 5-day forecast endpoint

import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { city, lat, lon, units = 'metric' } = req.query

  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: 'Provide either city or lat/lon coordinates' })
  }

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const params = new URLSearchParams({
      appid: apiKey,
      units: units as string,
      lang: 'en',
    })

    if (city) {
      params.set('q', city as string)
    } else {
      params.set('lat', lat as string)
      params.set('lon', lon as string)
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?${params}`
    )

    if (!response.ok) {
      const error = await response.json()
      return res.status(response.status).json({ error: error.message || 'Forecast API error' })
    }

    const data = await response.json()

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60')
    return res.status(200).json(data)
  } catch (error) {
    console.error('[api/forecast] Upstream fetch failed:', error)
    return res.status(503).json({ error: 'Forecast service unavailable' })
  }
}
```

```bash
# Install Vercel node types for the serverless functions
npm install -D @vercel/node

# Test locally with Vercel CLI
npm install -g vercel
vercel dev    # starts both the Vite frontend AND the serverless functions locally
# Frontend: http://localhost:3000 (Vercel's port, not Vite's 5173)
```

✅ **Verify:** Visit `http://localhost:3000/api/weather?city=London` — you should see raw JSON weather data returned.

## Step 6: Set Up TypeScript Interfaces ✅

```typescript
// src/types/index.ts
// Centralised type definitions — all interfaces in one file for this project size.
// WHY: Easier to find and update. If the project grows, split into separate files.

// ── Raw API response types (from OpenWeatherMap) ──────────────────────────────

export interface WeatherCondition {
  id: number
  main: string
  description: string
  icon: string
}

export interface MainMetrics {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  humidity: number
  pressure: number
}

export interface CurrentWeatherResponse {
  name: string
  sys: { country: string }
  main: MainMetrics
  weather: WeatherCondition[]
  wind: { speed: number; deg: number }
  visibility: number
  dt: number
}

export interface ForecastSlot {
  dt: number
  main: MainMetrics
  weather: WeatherCondition[]
  dt_txt: string
}

export interface ForecastResponse {
  city: { name: string; country: string }
  list: ForecastSlot[]
}

// ── Normalised UI types (transformed from raw API) ────────────────────────────

export interface CurrentWeather {
  city: string
  country: string
  temp: number
  feelsLike: number
  tempMin: number
  tempMax: number
  description: string
  iconCode: string
  humidity: number
  windSpeed: number
  visibility: number
  updatedAt: Date
}

export interface DailyForecast {
  date: Date
  dayLabel: string
  tempHigh: number
  tempLow: number
  description: string
  iconCode: string
}

// ── State types ────────────────────────────────────────────────────────────────

export type Units = 'metric' | 'imperial'

export type SearchMode = 'city' | 'coordinates'

export interface Coordinates {
  lat: number
  lon: number
}
```

## Step 7: Build the Transformer Functions

```typescript
// src/lib/transformers.ts
// WHY THIS FILE EXISTS:
// Raw API data doesn't match what our UI components need.
// Transformer functions act as a clean translation layer.
// If OpenWeatherMap changes their API schema, we update ONLY this file.
// Components remain untouched. This is the "adapter" design pattern.

import type {
  CurrentWeatherResponse,
  ForecastResponse,
  CurrentWeather,
  DailyForecast,
} from '@/types'
import { format } from 'date-fns'

/**
 * Transforms the raw current weather API response into a clean UI-friendly shape.
 */
export function transformCurrentWeather(raw: CurrentWeatherResponse): CurrentWeather {
  return {
    city: raw.name,
    country: raw.sys.country,
    temp: Math.round(raw.main.temp),
    feelsLike: Math.round(raw.main.feels_like),
    tempMin: Math.round(raw.main.temp_min),
    tempMax: Math.round(raw.main.temp_max),
    description: capitalise(raw.weather[0]?.description ?? 'Unknown'),
    iconCode: raw.weather[0]?.icon ?? '01d',
    humidity: raw.main.humidity,
    windSpeed: Math.round(raw.wind.speed * 3.6), // m/s → km/h for metric
    // WHY: OpenWeatherMap gives wind in m/s. UI shows km/h. Convert here, not in the component.
    visibility: Math.round(raw.visibility / 1000), // metres → km
    updatedAt: new Date(raw.dt * 1000), // Unix seconds → JS Date
  }
}

/**
 * Transforms the raw 5-day forecast response into an array of daily summaries.
 * The API returns 3-hour intervals (40 entries). We group by day and pick the
 * midday reading (closest to 12:00) as the representative for each day.
 */
export function transformForecast(raw: ForecastResponse): DailyForecast[] {
  // Group all 3-hour slots by calendar date (YYYY-MM-DD)
  const grouped = raw.list.reduce<Record<string, typeof raw.list>>((acc, slot) => {
    const dateKey = slot.dt_txt.split(' ')[0] // "2024-06-14"
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(slot)
    return acc
  }, {})

  return Object.entries(grouped)
    .slice(0, 5) // take 5 days only
    .map(([dateKey, slots]) => {
      // Pick midday slot (12:00) as the representative — best represents the day's weather
      // Fallback to first slot if 12:00 isn't available (e.g. for today)
      const midday = slots.find(s => s.dt_txt.includes('12:00:00')) ?? slots[0]

      // For temp_min/max, scan ALL slots of the day — not just midday
      const tempHigh = Math.round(Math.max(...slots.map(s => s.main.temp_max)))
      const tempLow = Math.round(Math.min(...slots.map(s => s.main.temp_min)))

      const date = new Date(dateKey + 'T12:00:00')

      return {
        date,
        dayLabel: format(date, 'EEE'), // "Mon", "Tue", etc.
        tempHigh,
        tempLow,
        description: capitalise(midday.weather[0]?.description ?? 'Unknown'),
        iconCode: midday.weather[0]?.icon ?? '01d',
      }
    })
}

function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
```

## Step 8: Build Utility Functions

```typescript
// src/lib/utils.ts

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Units } from '@/types'

/**
 * Merges Tailwind CSS classes safely.
 * WHY: Without tailwind-merge, classes like "p-2 p-4" don't resolve correctly.
 * clsx handles conditional logic, twMerge handles Tailwind conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a temperature number with the correct unit symbol.
 */
export function formatTemp(temp: number, units: Units): string {
  return `${temp}°${units === 'metric' ? 'C' : 'F'}`
}

/**
 * Formats wind speed with the correct unit.
 * WHY: Metric shows km/h, imperial shows mph.
 * Note: the transformer already converts m/s → km/h for metric.
 * For imperial, OpenWeatherMap returns mph directly — no conversion needed.
 */
export function formatWindSpeed(speed: number, units: Units): string {
  return `${speed} ${units === 'metric' ? 'km/h' : 'mph'}`
}

/**
 * Formats the "last updated" timestamp in a human-readable way.
 */
export function formatUpdatedAt(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
```

## Step 9: Map Weather Icon Codes to Lucide Icons

```typescript
// src/lib/weatherIcons.ts
// WHY: OpenWeatherMap returns icon codes like "01d", "10n", "04d".
// Lucide doesn't have a 1-to-1 mapping, so we translate to the closest match.
// This centralises all icon decisions. Components just call getWeatherIcon(iconCode).

import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Wind,
  type LucideIcon,
} from 'lucide-react'

// OpenWeatherMap icon codes → Lucide icon components
// Codes ending in 'd' are day variants, 'n' are night variants
// Full code list: https://openweathermap.org/weather-conditions#Icon-list
const ICON_MAP: Record<string, LucideIcon> = {
  '01d': Sun,            // clear sky (day)
  '01n': Sun,            // clear sky (night) — no moon icon in Lucide free tier
  '02d': Cloud,          // few clouds
  '02n': Cloud,
  '03d': Cloud,          // scattered clouds
  '03n': Cloud,
  '04d': Cloud,          // broken/overcast clouds
  '04n': Cloud,
  '09d': CloudDrizzle,   // shower rain
  '09n': CloudDrizzle,
  '10d': CloudRain,      // rain
  '10n': CloudRain,
  '11d': CloudLightning, // thunderstorm
  '11n': CloudLightning,
  '13d': CloudSnow,      // snow
  '13n': CloudSnow,
  '50d': CloudFog,       // mist/fog/haze
  '50n': CloudFog,
}

export function getWeatherIcon(iconCode: string): LucideIcon {
  return ICON_MAP[iconCode] ?? Wind // fallback if unknown code
}
```

## Step 10: Set Up Zustand Store

```typescript
// src/store/weatherStore.ts
// WHY ZUSTAND?
// We need to share two pieces of state across multiple components:
//   1. units (metric/imperial) — used in Header toggle AND all weather displays
//   2. lastSearchedCity — persist the city across re-renders
//
// React's useState would require prop-drilling through 3+ component levels.
// Context API would work, but causes full tree re-renders on every state change.
// Zustand is lightweight (1kb), simple, and updates only subscribers.
//
// Compare: Redux is overkill for 2 values. Context is fine but noisy.
// Zustand is the junior/mid level sweet spot in 2026.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Units } from '@/types'

interface WeatherStore {
  units: Units
  lastSearchedCity: string
  setUnits: (units: Units) => void
  setLastSearchedCity: (city: string) => void
}

export const useWeatherStore = create<WeatherStore>()(
  // persist middleware — saves state to localStorage automatically
  // WHY: When user refreshes, their unit preference and last city are restored.
  persist(
    (set) => ({
      units: 'metric',
      lastSearchedCity: '',
      setUnits: (units) => set({ units }),
      setLastSearchedCity: (city) => set({ lastSearchedCity: city }),
    }),
    {
      name: 'weather-preferences', // localStorage key
      partialise: (state) => ({    // only persist preferences, not derived data
        units: state.units,
        lastSearchedCity: state.lastSearchedCity,
      }),
    }
  )
)
```

## Step 11: Build the useDebounce Hook

```typescript
// src/hooks/useDebounce.ts
// WHY DEBOUNCING?
// Without debounce, every keystroke in the search bar fires an API call.
// If a user types "London" (6 chars), that's potentially 6 API calls.
// At 60 calls/minute, a fast typist could exhaust the rate limit quickly.
//
// Debounce waits until the user STOPS typing for 500ms before firing.
// "London" → user pauses → ONE API call after 500ms of silence.
//
// This is a standard pattern in production search interfaces.
// 300-500ms is the industry standard debounce delay for search.

import { useEffect, useState } from 'react'

/**
 * Returns a debounced version of the value.
 * The debounced value only updates after `delay` milliseconds of no changes.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set a timer to update the debounced value after `delay` ms
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // WHY THE CLEANUP: If `value` changes before the timer fires,
    // we cancel the previous timer and start a new one.
    // This is what makes debounce work — the cleanup cancels stale timers.
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
```

## Step 12: Build the useGeolocation Hook

```typescript
// src/hooks/useGeolocation.ts
// WHY A CUSTOM HOOK?
// The browser Geolocation API is callback-based, not Promise-based.
// This hook wraps it in React state so components can react to it cleanly.
// It also normalises the three possible states: idle, loading, success, error.

import { useState, useCallback } from 'react'
import type { Coordinates } from '@/types'

type GeolocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; coordinates: Coordinates }
  | { status: 'error'; message: string }

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' })

  const requestLocation = useCallback(() => {
    // Check if the browser supports geolocation
    if (!navigator.geolocation) {
      setState({
        status: 'error',
        message: 'Geolocation is not supported by your browser.',
      })
      return
    }

    setState({ status: 'loading' })

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        setState({
          status: 'success',
          coordinates: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
        })
      },
      // Error callback
      (error) => {
        // Map the browser's error codes to human-readable messages
        // WHY: The raw error messages are technical and user-unfriendly
        const messages: Record<number, string> = {
          1: 'Location access denied. Please enable location permissions and try again.',
          2: 'Location unavailable. Please check your connection and try again.',
          3: 'Location request timed out. Please try again.',
        }
        setState({
          status: 'error',
          message: messages[error.code] ?? 'Could not get your location.',
        })
      },
      {
        timeout: 10_000,           // 10 seconds before timing out
        maximumAge: 5 * 60_000,    // use cached location up to 5 mins old
        // WHY: If the user already allowed location 3 mins ago, use that — don't ask again
      }
    )
  }, [])

  const reset = useCallback(() => {
    setState({ status: 'idle' })
  }, [])

  return { state, requestLocation, reset }
}
```

## Step 13: Build the TanStack Query Hooks

```typescript
// src/hooks/useWeather.ts
// WHY TANSTACK QUERY?
// It handles the full lifecycle of an API call:
//   - Loading state (isLoading, isFetching)
//   - Error state (isError, error)
//   - Success state (data)
//   - Caching (don't re-fetch if data is fresh)
//   - Automatic background refetching
//   - Deduplication (two components requesting same query = one API call)
//
// Without TanStack Query, you'd manually write useState + useEffect + fetch
// in every component — and re-invent all of the above from scratch.

import { useQuery } from '@tanstack/react-query'
import { transformCurrentWeather } from '@/lib/transformers'
import type { CurrentWeather, Units, Coordinates } from '@/types'

type WeatherParams =
  | { type: 'city'; city: string; units: Units }
  | { type: 'coordinates'; coords: Coordinates; units: Units }

/**
 * Fetches current weather for a city or coordinates.
 * Returns transformed, UI-ready data.
 */
export function useWeather(params: WeatherParams | null) {
  return useQuery({
    // WHY THE QUERY KEY:
    // TanStack Query uses the key to cache and identify queries.
    // Different keys = different cache entries.
    // ['weather', 'london', 'metric'] ≠ ['weather', 'london', 'imperial']
    // → changing units triggers a new fetch, not a cache hit.
    queryKey: params
      ? params.type === 'city'
        ? ['weather', params.city.toLowerCase(), params.units]
        : ['weather', params.coords.lat, params.coords.lon, params.units]
      : ['weather', null],

    queryFn: async (): Promise<CurrentWeather> => {
      if (!params) throw new Error('No search params provided')

      const searchParams = new URLSearchParams({ units: params.units })
      if (params.type === 'city') {
        searchParams.set('city', params.city)
      } else {
        searchParams.set('lat', params.coords.lat.toString())
        searchParams.set('lon', params.coords.lon.toString())
      }

      const res = await fetch(`/api/weather?${searchParams}`)

      if (!res.ok) {
        const error = await res.json()
        // Attach the HTTP status to the error so the UI can handle 404 (city not found)
        const err = new Error(error.error || 'Failed to fetch weather')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(err as any).status = res.status
        throw err
      }

      const raw = await res.json()
      return transformCurrentWeather(raw)
    },

    // Core caching config:
    staleTime: 10 * 60 * 1000,  // 10 minutes — data is "fresh" for 10 mins
    // WHY 10 MINUTES:
    // OpenWeatherMap updates data every 10 minutes on free tier.
    // Fetching more often gives identical data and wastes API calls.
    // If the user re-focuses the browser tab within 10 mins → no fetch.

    retry: (failureCount, error) => {
      // WHY CUSTOM RETRY:
      // Don't retry on 404 (city not found) — it won't suddenly appear.
      // Do retry on network errors or 5xx server errors.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).status === 404) return false
      return failureCount < 2
    },

    enabled: params !== null, // don't fetch until there's something to search for
  })
}
```

```typescript
// src/hooks/useForecast.ts
// Same pattern as useWeather.ts — proxied through /api/forecast

import { useQuery } from '@tanstack/react-query'
import { transformForecast } from '@/lib/transformers'
import type { DailyForecast, Units, Coordinates } from '@/types'

type ForecastParams =
  | { type: 'city'; city: string; units: Units }
  | { type: 'coordinates'; coords: Coordinates; units: Units }

export function useForecast(params: ForecastParams | null) {
  return useQuery({
    queryKey: params
      ? params.type === 'city'
        ? ['forecast', params.city.toLowerCase(), params.units]
        : ['forecast', params.coords.lat, params.coords.lon, params.units]
      : ['forecast', null],

    queryFn: async (): Promise<DailyForecast[]> => {
      if (!params) throw new Error('No search params provided')

      const searchParams = new URLSearchParams({ units: params.units })
      if (params.type === 'city') {
        searchParams.set('city', params.city)
      } else {
        searchParams.set('lat', params.coords.lat.toString())
        searchParams.set('lon', params.coords.lon.toString())
      }

      const res = await fetch(`/api/forecast?${searchParams}`)

      if (!res.ok) {
        const error = await res.json()
        const err = new Error(error.error || 'Failed to fetch forecast')
        ;(err as any).status = res.status
        throw err
      }

      const raw = await res.json()
      return transformForecast(raw)
    },

    staleTime: 10 * 60 * 1000,

    retry: (failureCount, error) => {
      if ((error as any).status === 404) return false
      return failureCount < 2
    },

    enabled: params !== null,
  })
}
```

## Step 14: Set Up TanStack Query and Render Raw Data

```typescript
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.tsx'
import './index.css'

// WHY: Create ONE QueryClient for the whole app.
// It manages all query caching, deduplication, and background refetching.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // global default: 10 minutes
      refetchOnWindowFocus: false,
      // WHY: Weather data doesn't change while the user has another tab open.
      // Refetching on focus wastes API calls without adding value.
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      {/* WHY: DevTools only load in development. Zero impact on production bundle. */}
    </QueryClientProvider>
  </StrictMode>
)
```

```typescript
// src/App.tsx — Sprint 1 version: prove the data flow works
// We'll add layout and styling in Sprint 2

import { useState } from 'react'
import { useWeather } from '@/hooks/useWeather'
import { useForecast } from '@/hooks/useForecast'
import { useDebounce } from '@/hooks/useDebounce'
import { useWeatherStore } from '@/store/weatherStore'

export default function App() {
  const [inputValue, setInputValue] = useState('')
  const debouncedCity = useDebounce(inputValue, 500)
  const { units } = useWeatherStore()

  // Only create query params when city is at least 2 characters
  const params = debouncedCity.length >= 2
    ? { type: 'city' as const, city: debouncedCity, units }
    : null

  const weather = useWeather(params)
  const forecast = useForecast(params)

  return (
    <div className="p-8">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter city name..."
        className="border p-2 rounded"
      />

      {/* Raw data dump — Sprint 1 only, to verify API connection */}
      <pre className="mt-4 text-xs">
        {weather.isLoading && 'Loading weather...'}
        {weather.isError && `Error: ${(weather.error as Error).message}`}
        {weather.data && JSON.stringify(weather.data, null, 2)}
      </pre>

      <pre className="mt-4 text-xs">
        {forecast.data && JSON.stringify(forecast.data, null, 2)}
      </pre>
    </div>
  )
}
```

✅ **Verify Sprint 1:**
1. Run `vercel dev`
2. Type "London" in the input
3. After 500ms pause, raw weather JSON appears on screen
4. Check the Network tab — you should see `/api/weather?city=London` (NOT a direct call to openweathermap.org)
5. Open ReactQuery DevTools — you should see the query cached

---

# Sprint 2 — UI Engineering & State

> **Goal:** Replace raw JSON with beautiful, styled components. Implement the unit
> toggle and geolocation button. End of Sprint 2 = the app looks production-ready.

## Step 15: Build the Header Component

```tsx
// src/components/layout/Header.tsx
import { Cloud } from 'lucide-react'
import { useWeatherStore } from '@/store/weatherStore'
import { cn } from '@/lib/utils'

export function Header() {
  const { units, setUnits } = useWeatherStore()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Cloud className="h-5 w-5 text-sky-500" />
          <span>WeatherDash</span>
        </div>

        {/* Unit Toggle */}
        {/* WHY: Zustand's setUnits updates global state instantly.
            Every component reading units (temperature displays, wind speed)
            re-renders with the new value — no prop drilling needed. */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className={cn('font-medium', units === 'metric' && 'text-sky-600')}>°C</span>
          <button
            role="switch"
            aria-checked={units === 'imperial'}
            aria-label="Toggle temperature unit"
            onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              units === 'imperial' ? 'bg-sky-500' : 'bg-slate-200'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                units === 'imperial' ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
          <span className={cn('font-medium', units === 'imperial' && 'text-sky-600')}>°F</span>
        </div>
      </div>
    </header>
  )
}
```

## Step 16: Build the Search Bar Component

```tsx
// src/components/search/SearchBar.tsx
import { useState, useEffect } from 'react'
import { Search, MapPin, Loader2, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { useGeolocation } from '@/hooks/useGeolocation'
import { cn } from '@/lib/utils'
import type { Coordinates } from '@/types'

interface SearchBarProps {
  onCitySearch: (city: string) => void
  onLocationSearch: (coords: Coordinates) => void
  isLoading: boolean
}

export function SearchBar({ onCitySearch, onLocationSearch, isLoading }: SearchBarProps) {
  const [inputValue, setInputValue] = useState('')
  const debouncedValue = useDebounce(inputValue, 500)
  const { state: geoState, requestLocation, reset: resetGeo } = useGeolocation()

  // Fire search when debounced value settles (≥2 chars)
  // WHY useEffect here: we need a side effect when debouncedValue changes
  useEffect(() => {
    if (debouncedValue.length >= 2) {
      onCitySearch(debouncedValue)
    }
  }, [debouncedValue, onCitySearch])

  // When geolocation succeeds, trigger a location-based search
  useEffect(() => {
    if (geoState.status === 'success') {
      onLocationSearch(geoState.coordinates)
    }
  }, [geoState, onLocationSearch])

  function handleClear() {
    setInputValue('')
    resetGeo()
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      {/* Search input */}
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
              'w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10',
              'text-slate-800 placeholder-slate-400 shadow-sm',
              'focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100',
              'transition-all duration-150'
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
          disabled={geoState.status === 'loading'}
          aria-label="Use my current location"
          title="Use my location"
          className={cn(
            'flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3',
            'text-sm font-medium text-slate-600 shadow-sm',
            'hover:border-sky-400 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100',
            'disabled:cursor-not-allowed disabled:opacity-60',
            'transition-all duration-150'
          )}
        >
          {geoState.status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">My location</span>
        </button>
      </div>

      {/* Geolocation error message */}
      {geoState.status === 'error' && (
        <p className="text-sm text-red-500" role="alert">
          {geoState.message}
        </p>
      )}
    </div>
  )
}
```

## Step 17: Build the Weather Icon Component

```tsx
// src/components/weather/WeatherIcon.tsx
// WHY A SEPARATE COMPONENT:
// Icons need consistent sizing and colour classes across multiple places.
// A wrapper component enforces this and keeps consuming components clean.

import { getWeatherIcon } from '@/lib/weatherIcons'
import { cn } from '@/lib/utils'

interface WeatherIconProps {
  iconCode: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
}

export function WeatherIcon({ iconCode, size = 'md', className }: WeatherIconProps) {
  const Icon = getWeatherIcon(iconCode)

  return (
    <Icon
      className={cn(SIZE_CLASSES[size], 'text-sky-500', className)}
      aria-hidden="true"
      // WHY aria-hidden: This is a decorative icon.
      // The weather condition is described in text nearby.
      // Screen readers don't need to announce the icon separately.
    />
  )
}
```

## Step 18: Build the Current Weather Card

```tsx
// src/components/weather/CurrentWeatherCard.tsx
import { Droplets, Wind, Eye, Thermometer } from 'lucide-react'
import { WeatherIcon } from './WeatherIcon'
import { formatTemp, formatWindSpeed, formatUpdatedAt } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { CurrentWeather, Units } from '@/types'

interface CurrentWeatherCardProps {
  weather: CurrentWeather
  units: Units
}

export function CurrentWeatherCard({ weather, units }: CurrentWeatherCardProps) {
  return (
    <div className={cn(
      'rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm',
      'transition-all duration-300'
    )}>
      {/* City and last updated */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {weather.city}
            <span className="ml-2 text-lg font-normal text-slate-500">
              {weather.country}
            </span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Last updated: {formatUpdatedAt(weather.updatedAt)}
          </p>
        </div>
        <WeatherIcon iconCode={weather.iconCode} size="xl" />
      </div>

      {/* Main temperature */}
      <div className="mb-6">
        <div className="flex items-end gap-3">
          <span className="text-7xl font-light text-slate-800 leading-none">
            {weather.temp}
          </span>
          <span className="mb-2 text-4xl font-light text-slate-500">
            °{units === 'metric' ? 'C' : 'F'}
          </span>
        </div>
        <p className="mt-1 text-lg text-slate-600 capitalize">
          {weather.description}
        </p>
        <p className="text-sm text-slate-400">
          Feels like {formatTemp(weather.feelsLike, units)} &nbsp;·&nbsp;
          H:{weather.tempMax}° &nbsp;L:{weather.tempMin}°
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4">
        <StatItem
          icon={<Droplets className="h-4 w-4 text-sky-500" />}
          label="Humidity"
          value={`${weather.humidity}%`}
        />
        <StatItem
          icon={<Wind className="h-4 w-4 text-sky-500" />}
          label="Wind"
          value={formatWindSpeed(weather.windSpeed, units)}
        />
        <StatItem
          icon={<Eye className="h-4 w-4 text-sky-500" />}
          label="Visibility"
          value={`${weather.visibility} km`}
        />
      </div>
    </div>
  )
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  )
}
```

## Step 19: Build the Forecast Components

```tsx
// src/components/weather/ForecastCard.tsx
import { WeatherIcon } from './WeatherIcon'
import { formatTemp } from '@/lib/utils'
import type { DailyForecast, Units } from '@/types'

interface ForecastCardProps {
  forecast: DailyForecast
  units: Units
}

export function ForecastCard({ forecast, units }: ForecastCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {forecast.dayLabel}
      </span>
      <WeatherIcon iconCode={forecast.iconCode} size="md" />
      <p className="text-xs text-slate-400 capitalize text-center">
        {forecast.description}
      </p>
      <div className="mt-1 flex w-full justify-between text-sm">
        <span className="font-semibold text-slate-800">
          {formatTemp(forecast.tempHigh, units)}
        </span>
        <span className="text-slate-400">
          {formatTemp(forecast.tempLow, units)}
        </span>
      </div>
    </div>
  )
}
```

```tsx
// src/components/weather/ForecastGrid.tsx
import { ForecastCard } from './ForecastCard'
import type { DailyForecast, Units } from '@/types'

interface ForecastGridProps {
  forecast: DailyForecast[]
  units: Units
}

export function ForecastGrid({ forecast, units }: ForecastGridProps) {
  return (
    <section aria-label="5-day forecast">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        5-Day Forecast
      </h3>
      <div className="grid grid-cols-5 gap-3">
        {forecast.map((day) => (
          <ForecastCard
            key={day.date.toISOString()}
            forecast={day}
            units={units}
          />
        ))}
      </div>
    </section>
  )
}
```

## Step 20: Build the UI Primitive Components

```tsx
// src/components/ui/Skeleton.tsx
// WHY SKELETONS OVER SPINNERS:
// Loading spinners tell the user "something is happening" but not WHAT.
// Skeletons preserve layout — they show the SHAPE of the content that's loading.
// Users experience less layout shift when data arrives.
// This is the industry standard for 2026 — used by Twitter, LinkedIn, GitHub.

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200', className)}
      aria-hidden="true"
      // WHY aria-hidden: Screen readers should not announce loading skeletons.
      // They announce the real content when it arrives.
    />
  )
}

// Skeleton for the main weather card
export function WeatherCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-20 w-48" />
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="grid grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton for the forecast grid
export function ForecastGridSkeleton() {
  return (
    <div>
      <Skeleton className="mb-3 h-4 w-28" />
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-2">
            <Skeleton className="h-4 w-8 mx-auto" />
            <Skeleton className="h-10 w-10 rounded-full mx-auto" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

```tsx
// src/components/ui/ErrorMessage.tsx
import { AlertTriangle, CloudOff, MapPinOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type ErrorType = 'city-not-found' | 'api-down' | 'generic'

interface ErrorMessageProps {
  type?: ErrorType
  message?: string
  onRetry?: () => void
}

// Maps HTTP status codes to error types
export function getErrorType(error: unknown): ErrorType {
  const status = (error as any)?.status
  if (status === 404) return 'city-not-found'
  if (status === 503) return 'api-down'
  return 'generic'
}

export function ErrorMessage({ type = 'generic', message, onRetry }: ErrorMessageProps) {
  const config = {
    'city-not-found': {
      Icon: MapPinOff,
      title: 'City not found',
      description: message || 'We couldn\'t find that city. Check the spelling and try again.',
      colour: 'text-amber-500',
      bg: 'bg-amber-50 border-amber-200',
    },
    'api-down': {
      Icon: CloudOff,
      title: 'Weather data unavailable',
      description: 'The weather service is temporarily unavailable. Please try again shortly.',
      colour: 'text-slate-500',
      bg: 'bg-slate-50 border-slate-200',
    },
    'generic': {
      Icon: AlertTriangle,
      title: 'Something went wrong',
      description: message || 'An unexpected error occurred. Please try again.',
      colour: 'text-red-500',
      bg: 'bg-red-50 border-red-200',
    },
  }

  const { Icon, title, description, colour, bg } = config[type]

  return (
    <div
      role="alert"
      className={cn('rounded-2xl border p-6 text-center', bg)}
    >
      <Icon className={cn('mx-auto mb-3 h-10 w-10', colour)} aria-hidden="true" />
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}
```

```tsx
// src/components/ui/EmptyState.tsx
// Shown on initial load before the user has searched for anything
import { CloudSun } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <CloudSun className="mb-4 h-20 w-20 text-sky-300" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-slate-700">
        What's the weather like?
      </h2>
      <p className="mt-2 text-slate-400">
        Search for a city or use your location to get started.
      </p>
    </div>
  )
}
```

## Step 21: Assemble the Full App

```tsx
// src/App.tsx — Final version (replaces the Sprint 1 raw data version)
import { useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { SearchBar } from '@/components/search/SearchBar'
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard'
import { ForecastGrid } from '@/components/weather/ForecastGrid'
import { WeatherCardSkeleton, ForecastGridSkeleton } from '@/components/ui/Skeleton'
import { ErrorMessage, getErrorType } from '@/components/ui/ErrorMessage'
import { EmptyState } from '@/components/ui/EmptyState'
import { useWeather } from '@/hooks/useWeather'
import { useForecast } from '@/hooks/useForecast'
import { useWeatherStore } from '@/store/weatherStore'
import type { Coordinates } from '@/types'

// Params shape that drives both query hooks
type SearchParams =
  | { type: 'city'; city: string }
  | { type: 'coordinates'; coords: Coordinates }
  | null

export default function App() {
  const { units } = useWeatherStore()
  const [searchParams, setSearchParams] = useState<SearchParams>(null)

  // Stable callbacks to prevent SearchBar re-renders on every App render
  const handleCitySearch = useCallback((city: string) => {
    setSearchParams({ type: 'city', city })
  }, [])

  const handleLocationSearch = useCallback((coords: Coordinates) => {
    setSearchParams({ type: 'coordinates', coords })
  }, [])

  // Construct TanStack Query params — includes units so changing units refetches
  const weatherParams = searchParams
    ? searchParams.type === 'city'
      ? { type: 'city' as const, city: searchParams.city, units }
      : { type: 'coordinates' as const, coords: searchParams.coords, units }
    : null

  const weather = useWeather(weatherParams)
  const forecast = useForecast(weatherParams)

  // Determine overall loading and error state
  const isLoading = weather.isLoading || forecast.isLoading
  const isError = weather.isError || forecast.isError
  const error = weather.error || forecast.error

  const hasData = !!(weather.data && forecast.data)

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Search section */}
        <section className="mb-8">
          <SearchBar
            onCitySearch={handleCitySearch}
            onLocationSearch={handleLocationSearch}
            isLoading={isLoading}
          />
        </section>

        {/* Content section */}
        <div className="space-y-6">
          {/* Empty state — no search yet */}
          {searchParams === null && <EmptyState />}

          {/* Loading skeletons */}
          {isLoading && (
            <>
              <WeatherCardSkeleton />
              <ForecastGridSkeleton />
            </>
          )}

          {/* Error state */}
          {!isLoading && isError && (
            <ErrorMessage
              type={getErrorType(error)}
              onRetry={() => setSearchParams(null)}
            />
          )}

          {/* Success state */}
          {!isLoading && hasData && (
            <>
              <CurrentWeatherCard weather={weather.data!} units={units} />
              <ForecastGrid forecast={forecast.data!} units={units} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
```

✅ **Verify Sprint 2:**
1. Search "Paris" → loading skeletons appear → beautiful weather card renders
2. Toggle °C/°F → temperature updates instantly across all components
3. Click "My location" → geolocation prompt → weather for your location loads
4. Search a gibberish city ("xzxzxz") → friendly "City not found" message appears
5. Open DevTools → Network → disable network → search city → "Weather data unavailable" appears
6. Re-enable network, search again → works

---

# Sprint 3 — Edge Cases & Polish

> **Goal:** Harden the app against real-world conditions. Configure caching properly.
> Deploy to Vercel. This is what separates a portfolio project from a tutorial clone.

## Step 22: Set Up Vitest for Testing

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    // WHY jsdom: Our components use browser APIs (DOM, localStorage).
    // jsdom simulates a browser environment inside Node.js.
    globals: true,
    // WHY globals: Allows using describe/it/expect without importing them.
    // Same API as Jest — minimises learning curve.
    setupFiles: ['./src/__tests__/setup.ts'],
  },
})
```

```typescript
// src/__tests__/setup.ts
import '@testing-library/jest-dom'
// WHY: Adds custom matchers like toBeInTheDocument(), toHaveClass()
// These make assertions much more readable than standard Vitest matchers.
```

```json
// package.json — add test scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

## Step 23: Write Unit Tests

```typescript
// src/__tests__/unit/transformers.test.ts
// WHY UNIT TEST TRANSFORMERS:
// These are pure functions. No mocking needed.
// They're the most important logic in the app — if they break, the UI breaks.
// Fast to run, easy to write, high confidence.

import { describe, it, expect } from 'vitest'
import { transformCurrentWeather, transformForecast } from '@/lib/transformers'
import type { CurrentWeatherResponse, ForecastResponse } from '@/types'

// Minimal mock data that matches the API shape
const mockCurrentWeatherResponse: CurrentWeatherResponse = {
  name: 'London',
  sys: { country: 'GB' },
  main: {
    temp: 18.7,
    feels_like: 17.3,
    temp_min: 15.2,
    temp_max: 21.1,
    humidity: 72,
    pressure: 1012,
  },
  weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }],
  wind: { speed: 3.9, deg: 240 },
  visibility: 10000,
  dt: 1718358000,
}

describe('transformCurrentWeather', () => {
  it('rounds temperature values to whole numbers', () => {
    const result = transformCurrentWeather(mockCurrentWeatherResponse)
    expect(result.temp).toBe(19)      // 18.7 → 19
    expect(result.feelsLike).toBe(17) // 17.3 → 17
  })

  it('converts visibility from metres to kilometres', () => {
    const result = transformCurrentWeather(mockCurrentWeatherResponse)
    expect(result.visibility).toBe(10) // 10000m → 10km
  })

  it('converts wind speed from m/s to km/h', () => {
    const result = transformCurrentWeather(mockCurrentWeatherResponse)
    // 3.9 m/s × 3.6 = 14.04 km/h → rounded to 14
    expect(result.windSpeed).toBe(14)
  })

  it('capitalises the weather description', () => {
    const result = transformCurrentWeather(mockCurrentWeatherResponse)
    expect(result.description).toBe('Few clouds') // not 'few clouds'
  })

  it('converts the Unix timestamp to a Date object', () => {
    const result = transformCurrentWeather(mockCurrentWeatherResponse)
    expect(result.updatedAt).toBeInstanceOf(Date)
  })

  it('maps city and country correctly', () => {
    const result = transformCurrentWeather(mockCurrentWeatherResponse)
    expect(result.city).toBe('London')
    expect(result.country).toBe('GB')
  })
})

const mockForecastResponse: ForecastResponse = {
  city: { name: 'London', country: 'GB' },
  list: [
    // Day 1 — multiple 3-hour slots
    { dt: 1718352000, main: { temp: 15, feels_like: 14, temp_min: 14, temp_max: 16, humidity: 80, pressure: 1010 }, weather: [{ id: 500, main: 'Rain', description: 'light rain', icon: '10d' }], dt_txt: '2024-06-14 09:00:00' },
    { dt: 1718363000, main: { temp: 16, feels_like: 15, temp_min: 15, temp_max: 18, humidity: 75, pressure: 1011 }, weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }], dt_txt: '2024-06-14 12:00:00' },
    { dt: 1718374000, main: { temp: 17, feels_like: 16, temp_min: 15, temp_max: 17, humidity: 70, pressure: 1012 }, weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }], dt_txt: '2024-06-14 15:00:00' },
    // Day 2
    { dt: 1718438400, main: { temp: 20, feels_like: 19, temp_min: 18, temp_max: 22, humidity: 60, pressure: 1015 }, weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }], dt_txt: '2024-06-15 12:00:00' },
  ],
}

describe('transformForecast', () => {
  it('groups slots by day and returns one entry per day', () => {
    const result = transformForecast(mockForecastResponse)
    expect(result).toHaveLength(2) // 2 unique days in mock data
  })

  it('uses the midday slot (12:00) as the representative', () => {
    const result = transformForecast(mockForecastResponse)
    // Day 1 has slots at 09:00, 12:00, 15:00 — should use 12:00 (few clouds)
    expect(result[0].description).toBe('Few clouds')
  })

  it('calculates tempHigh as the max across all day slots', () => {
    const result = transformForecast(mockForecastResponse)
    // Day 1 has temp_max of 16, 18, 17 → max is 18
    expect(result[0].tempHigh).toBe(18)
  })

  it('calculates tempLow as the min across all day slots', () => {
    const result = transformForecast(mockForecastResponse)
    // Day 1 has temp_min of 14, 15, 15 → min is 14
    expect(result[0].tempLow).toBe(14)
  })
})
```

```typescript
// src/__tests__/unit/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatTemp, formatWindSpeed } from '@/lib/utils'

describe('formatTemp', () => {
  it('formats Celsius correctly', () => {
    expect(formatTemp(18, 'metric')).toBe('18°C')
  })

  it('formats Fahrenheit correctly', () => {
    expect(formatTemp(64, 'imperial')).toBe('64°F')
  })

  it('handles negative temperatures', () => {
    expect(formatTemp(-5, 'metric')).toBe('-5°C')
  })
})

describe('formatWindSpeed', () => {
  it('shows km/h for metric', () => {
    expect(formatWindSpeed(14, 'metric')).toBe('14 km/h')
  })

  it('shows mph for imperial', () => {
    expect(formatWindSpeed(9, 'imperial')).toBe('9 mph')
  })
})
```

## Step 24: Write Component Tests

```tsx
// src/__tests__/components/SearchBar.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '@/components/search/SearchBar'

// Mock the geolocation hook to avoid browser API calls in tests
vi.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: () => ({
    state: { status: 'idle' },
    requestLocation: vi.fn(),
    reset: vi.fn(),
  }),
}))

describe('SearchBar', () => {
  const mockOnCitySearch = vi.fn()
  const mockOnLocationSearch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // WHY fake timers: useDebounce uses setTimeout.
    // We control time in tests to avoid actually waiting 500ms.
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function renderSearchBar() {
    return render(
      <SearchBar
        onCitySearch={mockOnCitySearch}
        onLocationSearch={mockOnLocationSearch}
        isLoading={false}
      />
    )
  }

  it('renders the search input and location button', () => {
    renderSearchBar()
    expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument()
    expect(screen.getByLabelText('Use my current location')).toBeInTheDocument()
  })

  it('does NOT call onCitySearch for single character input', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderSearchBar()

    await user.type(screen.getByPlaceholderText('Search for a city...'), 'L')
    vi.advanceTimersByTime(600) // advance past 500ms debounce

    expect(mockOnCitySearch).not.toHaveBeenCalled()
    // WHY: We configured the hook to ignore input < 2 characters.
  })

  it('calls onCitySearch after debounce delay with valid input', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderSearchBar()

    await user.type(screen.getByPlaceholderText('Search for a city...'), 'Lo')
    vi.advanceTimersByTime(600) // advance past 500ms debounce

    expect(mockOnCitySearch).toHaveBeenCalledWith('Lo')
    expect(mockOnCitySearch).toHaveBeenCalledTimes(1)
    // WHY toHaveBeenCalledTimes(1): the debounce should have prevented multiple calls
  })

  it('shows a spinner when isLoading is true', () => {
    render(
      <SearchBar
        onCitySearch={mockOnCitySearch}
        onLocationSearch={mockOnLocationSearch}
        isLoading={true}
      />
    )
    // The Loader2 icon replaces the X clear button during loading
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
  })
})
```

```tsx
// src/__tests__/components/CurrentWeatherCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard'
import type { CurrentWeather } from '@/types'

const mockWeather: CurrentWeather = {
  city: 'London',
  country: 'GB',
  temp: 18,
  feelsLike: 17,
  tempMin: 14,
  tempMax: 21,
  description: 'Partly cloudy',
  iconCode: '02d',
  humidity: 72,
  windSpeed: 14,
  visibility: 10,
  updatedAt: new Date('2024-06-14T14:00:00Z'),
}

describe('CurrentWeatherCard', () => {
  it('renders the city name and country', () => {
    render(<CurrentWeatherCard weather={mockWeather} units="metric" />)
    expect(screen.getByText('London')).toBeInTheDocument()
    expect(screen.getByText('GB')).toBeInTheDocument()
  })

  it('renders the temperature with correct unit', () => {
    render(<CurrentWeatherCard weather={mockWeather} units="metric" />)
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByText('°C')).toBeInTheDocument()
  })

  it('renders Fahrenheit symbol when imperial units selected', () => {
    render(<CurrentWeatherCard weather={mockWeather} units="imperial" />)
    expect(screen.getByText('°F')).toBeInTheDocument()
  })

  it('renders humidity, wind speed, and visibility stats', () => {
    render(<CurrentWeatherCard weather={mockWeather} units="metric" />)
    expect(screen.getByText('72%')).toBeInTheDocument()
    expect(screen.getByText('14 km/h')).toBeInTheDocument()
    expect(screen.getByText('10 km')).toBeInTheDocument()
  })

  it('renders the weather description', () => {
    render(<CurrentWeatherCard weather={mockWeather} units="metric" />)
    expect(screen.getByText('Partly cloudy')).toBeInTheDocument()
  })
})
```

## Step 25: Write End-to-End Tests

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  // WHY retries in CI: E2E tests are occasionally flaky in CI environments.
  // 2 retries ensures a transient issue doesn't fail the pipeline.
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'vercel dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

```typescript
// e2e/weather.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Weather Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows empty state on initial load', async ({ page }) => {
    await expect(page.getByText('What\'s the weather like?')).toBeVisible()
    await expect(page.getByPlaceholder('Search for a city...')).toBeVisible()
  })

  test('searches for a city and displays weather', async ({ page }) => {
    // Type in search box
    await page.getByPlaceholder('Search for a city...').fill('London')

    // Wait for the weather card to appear (real API call)
    await expect(page.getByText('London')).toBeVisible({ timeout: 10_000 })

    // Verify weather card elements
    await expect(page.getByText('GB')).toBeVisible()
    await expect(page.getByText('5-Day Forecast')).toBeVisible()
  })

  test('shows city not found error for invalid city', async ({ page }) => {
    await page.getByPlaceholder('Search for a city...').fill('xzxzxzxzxz')
    await expect(page.getByText('City not found')).toBeVisible({ timeout: 10_000 })
  })

  test('unit toggle switches between Celsius and Fahrenheit', async ({ page }) => {
    // Search for a city first
    await page.getByPlaceholder('Search for a city...').fill('Paris')
    await page.getByText('FR').waitFor({ timeout: 10_000 })

    // Verify °C is shown initially
    await expect(page.getByText('°C')).toBeVisible()

    // Click the unit toggle
    await page.getByRole('switch', { name: 'Toggle temperature unit' }).click()

    // Verify °F is now shown
    await expect(page.getByText('°F')).toBeVisible()
  })

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/WeatherDash/)
  })
})
```

## Step 26: Set Up GitHub Repository and Branching

```bash
# Initialise git
git init
git add .
git commit -m "chore: initial project setup with Vite + React + TS"

# Create GitHub repo
gh repo create weather-dashboard --public --source=. --remote=origin --push
# OR: create on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/weather-dashboard.git
git push -u origin main

# Recommended branch protection (GitHub UI):
# Settings → Branches → Add rule
# Branch name pattern: main
# ✓ Require status checks to pass before merging
# ✓ Require branches to be up to date before merging

# Feature branch workflow:
git checkout -b feature/search-bar
# ... build the feature ...
git add .
git commit -m "feat: add debounced search bar with geolocation"
git push origin feature/search-bar
# Open Pull Request on GitHub → Review → Merge
```

## Step 27: Set Up GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    name: Type Check, Lint & Test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check
        # WHY: Catches TypeScript errors before they reach production.
        # Many runtime bugs are catchable at compile time with strict TS.

      - name: Lint
        run: npm run lint
        # WHY: Enforces code style and catches common mistakes (unused vars, etc.)

      - name: Check formatting
        run: npx prettier --check .
        # WHY: Ensures consistent formatting across the team.

      - name: Run unit + component tests
        run: npm run test
        # WHY: Verifies transformer logic and component rendering.
        # These run without network access — no real API calls in CI.
```

## Step 28: Deploy to Vercel

```
DEPLOYMENT STEPS:

1. Push your code to GitHub (Step 26 above)

2. Go to vercel.com → Add New Project → Import your GitHub repo

3. Framework preset: Vite (auto-detected)

4. Add Environment Variables (Settings → Environment Variables):
   OPENWEATHER_API_KEY  → your actual API key from openweathermap.org

5. Click Deploy → wait ~2 minutes

6. Your app is live at: https://weather-dashboard-xxx.vercel.app

WHY VERCEL FOR THIS PROJECT:
  - Vercel automatically handles the /api directory as serverless functions
  - No additional config needed — Vite app + serverless functions work out of the box
  - Free tier is generous: 100GB bandwidth, unlimited deploys

VERIFY PRODUCTION:
  - Visit your Vercel URL
  - Search for a city
  - Check Network tab → calls go to /api/weather, NOT openweathermap.org
  - The API key is never visible in the browser

CUSTOM DOMAIN (optional):
  - Vercel → Settings → Domains → Add Domain
  - Point your domain's DNS to Vercel's nameservers
```

✅ **Verify Production:**
1. Visit the Vercel URL
2. Search for a city — weather data appears
3. Reload the page — last city is restored (Zustand persist)
4. Toggle unit — preference saved across reloads
5. Open DevTools → Application → Local Storage → see "weather-preferences" stored

---

# Testing Strategy

> The same layered approach as Project 1, adapted for a Vite/frontend-only project.

## Test Structure

```
src/__tests__/
├── unit/                     # Pure function tests
│   ├── transformers.test.ts  # API → UI data transformation
│   └── utils.test.ts         # formatTemp, formatWind, etc.
└── components/               # React component rendering tests
    ├── SearchBar.test.tsx     # debounce, input, geolocation states
    ├── CurrentWeatherCard.test.tsx  # renders weather data correctly
    └── ForecastGrid.test.tsx  # renders 5 forecast cards

e2e/
└── weather.spec.ts           # full user flows with Playwright
```

## What Each Layer Tests

```
UNIT TESTS (Vitest)
  - transformCurrentWeather(): maths, rounding, conversions
  - transformForecast(): grouping, midday selection, min/max calculation
  - formatTemp(), formatWindSpeed(): output format correctness
  - getWeatherIcon(): returns fallback for unknown codes
  Purpose: verify pure logic in isolation, no browser/network needed

COMPONENT TESTS (Vitest + React Testing Library)
  - SearchBar: debounce fires after 500ms, not on every keystroke
  - SearchBar: ignores input < 2 characters
  - CurrentWeatherCard: renders all stats, correct unit symbol
  - ForecastGrid: renders 5 day cards
  - ErrorMessage: renders correct icon/text per error type
  - Skeleton: renders without crashing (smoke test)
  Purpose: verify UI renders correctly given props/state, no real API calls

E2E TESTS (Playwright)
  - Empty state renders on first load
  - Search for a real city → weather card appears
  - Invalid city → "City not found" error shows
  - Unit toggle → temperature unit changes across the page
  Purpose: test real user flows end-to-end with real API (uses real network in E2E)

WHAT WE DON'T TEST:
  - The Vercel serverless functions (api/weather.ts, api/forecast.ts)
    → These would need Jest + supertest to test in isolation.
       For a junior portfolio project, the E2E tests cover this path.
```

## Running Tests

```bash
# Unit + component tests (fast, no network)
npm run test

# Watch mode (re-runs on file change)
npm run test:watch

# Visual test UI
npm run test:ui

# With coverage report
npm run test:coverage

# E2E tests (requires app running via `vercel dev`)
npm run test:e2e

# Run everything
npm run test:all
```

---

# GitHub Issues & Project Board Setup

> Mirror the same GitHub Project board structure used in Project 1.
> Create these issues BEFORE starting to build.

## Recommended GitHub Issues

```
PHASE 1: SYSTEM DESIGN
─────────────────────────────────────────────────────────────
Issue #1  [Design] Define UI/UX layout and wireframe
  Labels: design, phase-1
  Body: Plan the search bar, main weather card, and 5-day forecast grid layout.
        Include mobile/responsive considerations.

Issue #2  [Design] API strategy — document endpoints, rate limits, caching plan
  Labels: design, phase-1
  Body: Review OpenWeatherMap docs. Plan exactly which endpoints to use.
        Document the 10-minute staleTime strategy and 500ms debounce rationale.

Issue #3  [Design] Define TypeScript interfaces for API and UI types
  Labels: design, phase-1
  Body: Plan CurrentWeatherResponse, ForecastResponse, CurrentWeather,
        DailyForecast types before writing any component code.

SPRINT 1: CORE INTEGRATION
─────────────────────────────────────────────────────────────
Issue #4  [Sprint 1] Initialise Vite + React + TS + Tailwind project
  Labels: sprint-1, setup
  Body: Create project, configure Tailwind with Vite plugin, set up path aliases.

Issue #5  [Sprint 1] Implement Vercel serverless proxy for API key security
  Labels: sprint-1, security
  Body: Create api/weather.ts and api/forecast.ts. Verify API key is not exposed
        in browser bundle. Test with vercel dev.

Issue #6  [Sprint 1] Build useDebounce custom hook
  Labels: sprint-1, hooks
  Body: 500ms debounce. Write unit test verifying debounce behaviour.

Issue #7  [Sprint 1] Build TanStack Query hooks (useWeather, useForecast)
  Labels: sprint-1, data-fetching
  Body: Implement with staleTime=10min, retry logic (no retry on 404),
        enabled=false when params are null.

Issue #8  [Sprint 1] Set up Zustand store for unit preferences
  Labels: sprint-1, state
  Body: Implement weatherStore with persist middleware.
        Verify unit preference survives page refresh.

Issue #9  [Sprint 1] Verify end-to-end data flow (raw JSON render)
  Labels: sprint-1, verification
  Body: Render raw API JSON on screen to confirm: search → debounce →
        proxy fetch → TanStack Query cache → UI.

SPRINT 2: UI ENGINEERING
─────────────────────────────────────────────────────────────
Issue #10 [Sprint 2] Build Header with unit toggle
  Labels: sprint-2, ui
  Body: Logo, °C/°F toggle switch. Toggle updates Zustand store.

Issue #11 [Sprint 2] Build SearchBar with debounce + geolocation
  Labels: sprint-2, ui
  Body: Debounced input (500ms), geolocation button (useGeolocation hook),
        clear button, loading indicator.

Issue #12 [Sprint 2] Build CurrentWeatherCard
  Labels: sprint-2, ui
  Body: City name, temperature, description, humidity/wind/visibility stats.
        Uses formatTemp() from utils.

Issue #13 [Sprint 2] Build ForecastGrid and ForecastCard
  Labels: sprint-2, ui
  Body: 5-day forecast cards with dayLabel, tempHigh/Low, Lucide icons.

Issue #14 [Sprint 2] Implement transformer functions
  Labels: sprint-2, data
  Body: transformCurrentWeather() and transformForecast().
        Write unit tests for rounding, conversions, midday selection.

Issue #15 [Sprint 2] Build WeatherIcon component with Lucide icon map
  Labels: sprint-2, ui
  Body: Map OpenWeatherMap icon codes to Lucide icons.

SPRINT 3: EDGE CASES & POLISH
─────────────────────────────────────────────────────────────
Issue #16 [Sprint 3] Implement loading skeleton components
  Labels: sprint-3, ux
  Body: WeatherCardSkeleton and ForecastGridSkeleton.
        Replaces any spinner implementation.

Issue #17 [Sprint 3] Implement graceful error states
  Labels: sprint-3, ux
  Body: City not found (404), API down (503), generic error.
        Each has a distinct icon, message, and optional retry button.

Issue #18 [Sprint 3] Implement EmptyState for initial load
  Labels: sprint-3, ux
  Body: Friendly message + icon shown before any search.

Issue #19 [Sprint 3] Configure TanStack Query staleTime and refetch strategy
  Labels: sprint-3, performance
  Body: Verify staleTime=10min prevents re-fetching on tab focus.
        Verify debounce prevents keystroke-level API calls.

Issue #20 [Sprint 3] Write component tests (Vitest + RTL)
  Labels: sprint-3, testing
  Body: SearchBar, CurrentWeatherCard, ForecastGrid tests.

Issue #21 [Sprint 3] Write E2E tests (Playwright)
  Labels: sprint-3, testing
  Body: Empty state, search flow, invalid city, unit toggle, page title.

Issue #22 [Sprint 3] Set up GitHub Actions CI
  Labels: sprint-3, ci-cd
  Body: type-check, lint, format check, vitest run on every push to main.

Issue #23 [Sprint 3] Deploy to Vercel and verify production behaviour
  Labels: sprint-3, deployment
  Body: Set OPENWEATHER_API_KEY in Vercel env vars. Verify API key is server-side.
        Verify Zustand persist works in production. Test all edge cases live.
```

## GitHub Project Board Columns

```
BACKLOG        → All issues start here
IN PROGRESS    → Issues actively being worked on (max 2 at once — stay focused)
IN REVIEW      → PR open, awaiting self-review before merge
DONE           → Merged to main, issue closed
```

---

# Git Workflow Reference

> Same discipline as Project 1 — use it every time.

```bash
# Start a new feature
git checkout main
git pull origin main
git checkout -b feature/search-bar    # branch naming: feature/short-description

# Work... commit often with clear messages
git add -p                            # interactive staging — review every change
git commit -m "feat: add debounced search input"

# Commit message format: type(scope): description
# type options:
#   feat     → new feature or behaviour
#   fix      → bug fix
#   chore    → setup, config, deps
#   refactor → code change without behaviour change
#   test     → adding or updating tests
#   docs     → documentation
#   style    → formatting only (no logic change)

# Examples:
#   feat: add geolocation hook with error handling
#   fix: prevent double API call when units change on mount
#   chore: install vitest and configure test setup
#   refactor: extract weather stat rendering to StatItem component
#   test: add transformer unit tests for forecast grouping logic

git push origin feature/search-bar

# On GitHub: Create Pull Request → review the diff → merge
# After merge:
git checkout main
git pull origin main
git branch -d feature/search-bar     # clean up local branch
```

---

# Common Errors & Fixes

```
ERROR: "401 Unauthorized" from /api/weather
FIX:   OPENWEATHER_API_KEY is incorrect or the key hasn't activated yet.
       New OpenWeatherMap keys take up to 2 hours to activate.
       Check the key in .env.local — no quotes, no spaces.
       Test the key directly:
       curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY"

ERROR: /api/weather works in 'vercel dev' but returns 404 on Vercel deployment
FIX:   Check that OPENWEATHER_API_KEY is set in Vercel Dashboard → Settings → Environment Variables.
       After adding env vars, redeploy. Variables set AFTER a deployment need a new deploy.

ERROR: "Cannot find module '@/hooks/useWeather'"
FIX:   Check vite.config.ts has the alias: '@': path.resolve(__dirname, './src')
       Also check tsconfig.json has the same paths configuration.
       Restart the dev server after changing vite.config.ts.

ERROR: Zustand persist not working — preferences lost on refresh
FIX:   Check the 'name' field in persist() config is unique.
       Open DevTools → Application → Local Storage → verify the key exists.
       If key exists but wrong value, clear localStorage and test again.

ERROR: TanStack Query fires a request immediately without waiting for debounce
FIX:   Verify `enabled: params !== null` in useQuery.
       Also confirm the SearchBar only calls onCitySearch after the debounce delay.
       Use ReactQuery DevTools to watch query states in real time.

ERROR: "window is not defined" in a test
FIX:   You're using a browser API (window.confirm, localStorage) in a component.
       In tests, mock these: vi.stubGlobal('confirm', () => true)
       Or use the useGeolocation mock pattern shown in the test files.

ERROR: Vitest can't find '@/...' imports in tests
FIX:   Check vitest.config.ts has the same resolve.alias as vite.config.ts.
       They are separate configs — Vitest doesn't inherit Vite's config automatically
       unless you import defineConfig from 'vitest/config' (which merges them).

ERROR: Playwright E2E test times out waiting for weather data
FIX:   E2E tests make real API calls — they're network-dependent.
       Increase timeout in playwright.config.ts or the individual test.
       Check that 'vercel dev' is running before running 'npm run test:e2e'.
       Verify your API key is set in .env.local for local E2E tests.

ERROR: Temperature shows as "NaN°C"
FIX:   The transformer received undefined from the API response.
       Add a console.log of the raw API response to see the actual shape.
       Verify the API is returning the expected fields.
       Check if the units parameter changed mid-flight (stale closure).

ERROR: Vite build succeeds locally but Vercel build fails
FIX:   Run 'npm run type-check' and 'npm run build' locally first.
       Vercel runs 'tsc -b && vite build' — all TypeScript errors must be 0.
       Common cause: type errors that VSCode shows but you ignored.

ERROR: Forecast shows fewer than 5 days
FIX:   OpenWeatherMap's free forecast only covers ~5 days from NOW.
       If you search late at night, "today" may have only 1-2 remaining 3-hour slots.
       The transformer's slice(0, 5) is correct — the data itself has fewer days.
       This is expected behaviour.

ERROR: Geolocation button has no effect
FIX:   Browser requires HTTPS for Geolocation API (except localhost).
       In production (Vercel), HTTPS is automatic — should work.
       In local dev via 'vercel dev', use localhost (not 127.0.0.1) — same issue.
       User may have denied permission — check browser address bar for location icon.
```

---

# Checklist: Definition of Done

> Every item must be ticked before calling this project complete.

## Core Functionality

- [ ] Empty state shows on initial load before any search
- [ ] User can type a city name and receive current weather
- [ ] Search is debounced — no API calls fire on every keystroke
- [ ] Search requires at least 2 characters to trigger
- [ ] Current weather card shows: temperature, description, humidity, wind, visibility
- [ ] 5-day forecast grid shows: day label, icon, high/low temperatures, description
- [ ] "My location" button requests browser geolocation and loads local weather
- [ ] Unit toggle switches between Celsius and Fahrenheit across all displays
- [ ] Unit preference persists across page refreshes (Zustand + localStorage)
- [ ] Last searched city is restored on page refresh

## Error Handling (Critical for Interviews)

- [ ] Invalid city name → "City not found" error state with distinct message
- [ ] API unavailable → "Weather data unavailable" error state with retry button
- [ ] Location access denied → friendly error message explaining next steps
- [ ] Location unsupported → graceful message, no crash

## Performance & Caching

- [ ] TanStack Query staleTime = 10 minutes (no re-fetch on tab focus within 10 mins)
- [ ] Debounce = 500ms (verify in Network tab — no waterfall of requests while typing)
- [ ] Changing units re-fetches with new unit parameter (cache key includes units)
- [ ] ReactQuery DevTools visible in development, absent in production build

## UI Quality

- [ ] Loading skeletons replace the weather card and forecast grid during loading
- [ ] No raw spinner used anywhere (industry standard is skeletons)
- [ ] Layout is responsive — works on mobile (≤375px) and desktop (≥1280px)
- [ ] All interactive elements have accessible labels (aria-label where needed)
- [ ] Unit toggle is keyboard accessible (works with Tab + Space)

## Security

- [ ] API key is stored in .env.local — NOT committed to git
- [ ] API key is server-side only — NOT visible in browser DevTools → Sources
- [ ] Browser Network tab shows /api/weather calls, NOT direct openweathermap.org calls
- [ ] .env.example is committed with empty key value as a template

## Code Quality

- [ ] `npm run type-check` → 0 errors
- [ ] `npm run lint` → 0 errors
- [ ] `npm run format` → no diff (all files formatted)
- [ ] No `any` types (or if unavoidable, commented with reason)
- [ ] Transformer functions are pure — no side effects

## Testing

- [ ] Unit tests: transformCurrentWeather passes (rounding, conversions, capitalisation)
- [ ] Unit tests: transformForecast passes (grouping, midday selection, min/max)
- [ ] Unit tests: formatTemp, formatWindSpeed pass
- [ ] Component tests: SearchBar — debounce behaviour verified
- [ ] Component tests: CurrentWeatherCard — renders all stats correctly
- [ ] Component tests: unit toggle changes °C/°F symbol
- [ ] E2E tests: empty state, city search, invalid city, unit toggle all pass

## DevOps

- [ ] GitHub Actions CI passes on every push (type-check + lint + tests)
- [ ] App deployed to Vercel — live URL works
- [ ] OPENWEATHER_API_KEY set in Vercel environment variables (not hardcoded)
- [ ] .env.local is NOT in git history (verify with: git log --all --full-history -- .env.local)

---

## What This Project Demonstrates in Interviews

```
You can now say:

"I built a production-deployed weather dashboard that demonstrates:

  - Third-party API integration with rate limit awareness and caching strategy
  - API key security via a serverless proxy — the key never reaches the browser
  - Frontend caching with TanStack Query and a deliberate 10-minute staleTime
    to avoid unnecessary API calls without sacrificing data freshness
  - Debounced search input — 500ms delay prevents API spam on every keystroke
  - Zustand for global preference state (metric/imperial) with localStorage persistence
  - Geolocation API integration with graceful permission handling
  - Layered error handling: city not found, API down, and location denied all have
    distinct, user-friendly error states
  - Skeleton loaders instead of spinners — the industry standard for perceived performance
  - A typed data transformation layer separating raw API shapes from UI types
  - Vitest + React Testing Library for unit and component tests
  - Playwright for end-to-end tests covering all critical user flows
  - GitHub Actions CI with type checking, linting, and automated testing
  - Deployed to Vercel with serverless functions"

This covers: external APIs, caching strategy, security, async UI states,
TypeScript data modelling, state management, testing, and deployment.
That's a well-rounded frontend engineering portfolio piece.
```

---

*Plan first. Build deliberately. Handle every failure. Ship with confidence.*
