# Guided Learning — Project 2: Weather Dashboard

> **What this document is:** A companion to the build guide that explains the *why*
> behind every major concept, technology, and line of code. Don't just copy-paste
> the code — understand what each piece does and why it exists.
>
> **How to use it:** Read a concept section, then go and implement it. Come back if
> you get stuck. The goal is for you to be able to explain everything in this
> project to a technical interviewer confidently.

---

## Table of Contents

1. [The Stack — What and Why](#1-the-stack--what-and-why)
2. [Core Concept: Environment Variables and Secrets](#2-core-concept-environment-variables-and-secrets)
3. [Core Concept: The Proxy Pattern (Serverless Functions)](#3-core-concept-the-proxy-pattern-serverless-functions)
4. [Core Concept: Debouncing](#4-core-concept-debouncing)
5. [Core Concept: API Caching with TanStack Query](#5-core-concept-api-caching-with-tanstack-query)
6. [Core Concept: The Adapter/Transformer Pattern](#6-core-concept-the-adaptertransformer-pattern)
7. [Core Concept: Zustand State Management](#7-core-concept-zustand-state-management)
8. [Core Concept: Custom React Hooks](#8-core-concept-custom-react-hooks)
9. [Core Concept: Asynchronous UI States](#9-core-concept-asynchronous-ui-states)
10. [Core Concept: TypeScript Generics and Type Safety](#10-core-concept-typescript-generics-and-type-safety)
11. [Core Concept: Accessibility in UI Components](#11-core-concept-accessibility-in-ui-components)
12. [Core Concept: Testing Pure Functions vs. Side Effects](#12-core-concept-testing-pure-functions-vs-side-effects)
13. [Key Code Lines Explained](#13-key-code-lines-explained)
14. [Interview Questions and Answers](#14-interview-questions-and-answers)

---

## 1. The Stack — What and Why

### Vite

**What it is:** A build tool and development server for JavaScript/TypeScript projects.

**Why it's used here:** Vite is blazingly fast in development — it uses native ES modules
in the browser instead of bundling everything first. The dev server starts in milliseconds.
For a pure frontend SPA (no server-side rendering needed), Vite is the standard in 2026.

**Why NOT Next.js this time:** Next.js is a full-stack framework with SSR and API routes.
This project has no database, no authentication, no SEO requirements. Using Next.js here
would be using a sledgehammer to crack a nut — and demonstrates poor tool selection.
Vite is the right tool for a client-side app.

```bash
# What happens when you run: npm run dev
# Vite starts a local dev server on port 5173
# It serves your files as native ES modules — no bundling step
# Changes to files are reflected in the browser almost instantly (HMR)
```

---

### React 18

**What it is:** A UI library for building component-based interfaces.

**Why component-based matters:** Instead of writing one giant HTML file, you break the
UI into small, reusable, self-contained pieces. `SearchBar` doesn't know about
`ForecastGrid`. They can be developed, tested, and debugged independently.

**React 18 specifically:** Introduces Concurrent Mode features. You don't need to
understand all of them — but `Suspense` (which TanStack Query integrates with) is one.

---

### TypeScript

**What it is:** JavaScript with a type system. Your editor catches bugs before you run the code.

**Why it matters for this project specifically:**

The OpenWeatherMap API returns a large JSON object. Without TypeScript, you'd have to
mentally track what fields exist, what type they are, and whether they could be `null`.
With TypeScript, the compiler tracks it for you.

```typescript
// Without TypeScript — runtime error waiting to happen:
const temp = data.main.temp    // you HOPE this path exists
const upper = temp.toUpperCase()  // CRASH: numbers don't have toUpperCase

// With TypeScript — caught at compile time:
const temp: number = data.main.temp   // editor knows this is a number
const upper = temp.toUpperCase()      // ❌ ERROR: Property 'toUpperCase' does not exist on type 'number'
```

**Strict mode matters:** With `"strict": true` in tsconfig, TypeScript is maximally
protective. Every possible `null` or `undefined` must be handled explicitly.

---

### Tailwind CSS

**What it is:** A utility-first CSS framework. Instead of writing CSS files, you apply
pre-built classes directly to HTML elements.

**Why it's used here:**

- No context switching between HTML and CSS files
- No naming things (no `.weather-card__temperature--highlighted`)
- Styles live exactly where the element is defined — easy to read
- The production build removes unused classes (tree-shaking) — tiny CSS output

```tsx
// Without Tailwind:
// <div className="weather-card">...</div>
// + a separate CSS file with .weather-card { ... }

// With Tailwind:
<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  // Every style is right here, no CSS file needed
</div>
```

---

### TanStack Query (React Query)

**What it is:** A library for managing server state — data that comes from an external API.

**Why not just `useEffect` + `fetch`?**

Every time you write `useEffect(() => { fetch(...) }, [])` you're reinventing:
- Loading state tracking (`isLoading`)
- Error state tracking (`isError`)
- Data caching (same city = same cached result, no re-fetch)
- Background refetching
- Deduplication (two components requesting the same data = one fetch)
- Stale-while-revalidate

TanStack Query gives you all of this with zero extra code.

**The mental model:** Think of TanStack Query as a smart cache layer between your
components and the server. It decides when to fetch, when to serve cache, and when to
refetch in the background.

---

### Zustand

**What it is:** A minimalist global state manager for React.

**Why not Context API?**

Context API works for global state, but has a key problem: when any value in the context
changes, every component that consumes that context re-renders — even if it doesn't
use the changed value.

Zustand uses a subscription model: components only re-render when the specific slice
of state they subscribe to changes.

**Why not Redux?**

Redux requires: actions, reducers, action creators, a store, a provider, selectors, middleware.
Zustand requires: one `create()` call. For two values (units + last city), Redux is
massive overkill.

---

### Lucide React

**What it is:** A clean, tree-shakeable icon library with React components.

**Why tree-shakeable matters:** If you import ALL icons, your bundle includes thousands
of SVGs you don't use. Lucide is built so only the icons you import are included in
the build:

```typescript
import { Sun, Cloud } from 'lucide-react'
// Only Sun and Cloud SVG data is in your final bundle
```

---

### Vitest

**What it is:** A test runner built for Vite projects. Same API as Jest.

**Why not Jest?**

Jest requires Babel to transform TypeScript and ESM. With Vite, you'd need to configure
Jest to use the same TypeScript transforms as Vite — configuration nightmares.
Vitest shares Vite's transform pipeline — zero extra configuration needed.

---

### Playwright

**What it is:** A browser automation library for end-to-end testing.

**Why Playwright over Cypress?**

- Playwright supports all major browsers (Chrome, Firefox, Safari) out of the box
- Playwright is faster (parallel execution by default)
- Playwright is the modern standard for E2E testing in 2026
- Playwright has better TypeScript support

---

### Vercel Serverless Functions

**What they are:** Server-side functions that run in the cloud, deployed alongside your
frontend on Vercel. Any file in the `api/` directory becomes an HTTP endpoint.

**Why they matter for this project:** They allow a frontend-only app to have a server-side
secret (the API key) without a dedicated backend server. No Express, no Node server to
maintain — just a function.

---

## 2. Core Concept: Environment Variables and Secrets

### The Problem

Your OpenWeatherMap API key is a secret. If someone gets it, they can:
- Make thousands of API calls on your account
- Hit your rate limit
- Get your account banned

### The Wrong Way (Common Beginner Mistake)

```typescript
// src/hooks/useWeather.ts
const res = await fetch(
  `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=abc123secret`
)
// ❌ "abc123secret" is now in your JavaScript bundle
// Anyone can open DevTools → Sources → search for "appid" → found it
```

Even using a Vite env variable with `VITE_` prefix doesn't help:

```typescript
// .env.local
VITE_API_KEY=abc123secret

// In your component:
const key = import.meta.env.VITE_API_KEY  // ❌ Still bundled into browser JS
```

`VITE_` prefix tells Vite to include the value in the browser bundle. That's its purpose.

### The Right Way

```typescript
// .env.local — no VITE_ prefix
OPENWEATHER_API_KEY=abc123secret

// api/weather.ts (server-side, runs on Vercel's servers)
const apiKey = process.env.OPENWEATHER_API_KEY  // ✅ Only accessible server-side
```

The browser calls `/api/weather` → your serverless function runs on Vercel's server →
it attaches the key and calls OpenWeatherMap → returns the data to the browser.
The key never travels to the browser.

### Verify It's Working

Open DevTools → Network → search for a city → click the `/api/weather` request.
The browser should be calling YOUR proxy, not openweathermap.org directly.

---

## 3. Core Concept: The Proxy Pattern (Serverless Functions)

### What a Proxy Does

A proxy sits between two parties and forwards requests on their behalf.

```
Without proxy:
Browser ──[with API key exposed]──▶ OpenWeatherMap API

With proxy:
Browser ──[no key]──▶ /api/weather ──[with API key, server-side]──▶ OpenWeatherMap API
```

### The Key Code to Understand

```typescript
// api/weather.ts

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Validate the incoming request (from our browser)
  const { city, units = 'metric' } = req.query
  if (!city) return res.status(400).json({ error: 'City required' })

  // 2. Get the secret from the server environment (never exposed to browser)
  const apiKey = process.env.OPENWEATHER_API_KEY

  // 3. Call the real API with the secret attached
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`
  )

  // 4. Forward the response back to the browser (without the API key)
  const data = await response.json()
  return res.status(200).json(data)
}
```

**Line by line:**

- `req.query` — reads URL parameters from the browser's request (e.g., `?city=London`)
- `process.env.OPENWEATHER_API_KEY` — reads an environment variable. This only works server-side.
- `fetch(...)` — the serverless function calls OpenWeatherMap (server-to-server call)
- `res.status(200).json(data)` — sends the weather data back to the browser

### Cache-Control Header

```typescript
res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60')
```

This tells Vercel's CDN to cache the response for 600 seconds (10 minutes).
If two users search for "London" within 10 minutes, the second request hits the CDN
cache — no API call to OpenWeatherMap. This is a second layer of rate limit protection.

---

## 4. Core Concept: Debouncing

### The Problem Without Debouncing

```
User types: L → Lo → Lon → Lond → Londo → London
API calls:  1 → 2  → 3  → 4   → 5    → 6     (6 API calls!)

Most of these return wrong or useless results.
At 60 calls/minute, a fast typist can exhaust the rate limit alone.
```

### What Debouncing Does

```
User types: L → Lo → Lon → Lond → Londo → London
              ← user pauses for 500ms →
API call:   (only fires after pause)                  → 1 API call
```

### The Code to Understand

```typescript
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Start a timer. When it fires, update the debounced value.
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // ← THIS IS THE KEY PART:
    // If `value` changes BEFORE the timer fires, this cleanup function runs.
    // It cancels the timer. Then a new timer starts with the new value.
    // This is what makes debounce work — stale timers are always cancelled.
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])  // re-run effect whenever value changes

  return debouncedValue
}
```

**How to mentally trace through it:**

1. User types "L" → `value = "L"` → timer starts (500ms)
2. User types "o" → `value = "Lo"` → cleanup cancels the "L" timer → new timer starts (500ms)
3. User types "n" → cleanup cancels "Lo" timer → new timer for "Lon"
4. User pauses → 500ms passes → timer fires → `debouncedValue = "Lon"` → search triggers

### Where It's Used

```typescript
// src/components/search/SearchBar.tsx
const [inputValue, setInputValue] = useState('')
const debouncedValue = useDebounce(inputValue, 500)

useEffect(() => {
  if (debouncedValue.length >= 2) {
    onCitySearch(debouncedValue)  // only fires after 500ms pause AND 2+ chars
  }
}, [debouncedValue])
```

---

## 5. Core Concept: API Caching with TanStack Query

### The Problem Without Caching

```
User searches "London" → API call → data renders
User clicks away → comes back → another API call → same data
User toggles tab → API call again → same data
User closes laptop, opens later → API call → same data

In 10 minutes: potentially 10+ identical API calls.
OpenWeatherMap only updates data every 10 minutes anyway.
You're fetching identical data multiple times for nothing.
```

### What staleTime Does

```typescript
useQuery({
  queryKey: ['weather', 'london', 'metric'],
  queryFn: fetchWeather,
  staleTime: 10 * 60 * 1000,  // 10 minutes in milliseconds
})
```

**The lifecycle:**

```
00:00 — First search for "London" → fetch fires → data stored in cache, marked FRESH
00:01 — User switches tab and comes back → staleTime not expired → NO fetch, serves cache
05:00 — User minimises browser → opens again → still under 10 mins → NO fetch
10:01 — staleTime expires → data marked STALE
10:02 — User switches tab and comes back → data is stale → background refetch fires
         (user sees cached data immediately, then new data arrives silently)
```

### The Query Key — Critical to Understand

```typescript
queryKey: ['weather', city.toLowerCase(), units]
// e.g.: ['weather', 'london', 'metric']
// or:   ['weather', 'london', 'imperial']
```

The query key is the cache identifier. Think of it as a filing system label.

- `['weather', 'london', 'metric']` and `['weather', 'london', 'imperial']` are **different cache entries**.
- When the user toggles from °C to °F, the units change → the key changes → TanStack Query
  knows this is a different query → fetches with the new unit.
- If the user toggles back to °C, the `metric` cache entry may still be fresh → serves immediately.

### The enabled Flag

```typescript
enabled: params !== null
```

This prevents the query from firing on mount when there's no city yet.
Without `enabled: false`, TanStack Query would fire an API call with `city=undefined`
the moment the component mounts — giving you an immediate error.

### The retry Logic

```typescript
retry: (failureCount, error) => {
  if ((error as any).status === 404) return false  // city not found — don't retry
  return failureCount < 2                           // network errors — retry twice
}
```

**Why distinguish 404?**

A 404 from the weather API means "city not found". No amount of retrying will make a
misspelled city name resolve. Retrying wastes API calls.

A network error (connection timeout) is transient — the next attempt might succeed.
So we retry those, but limit it to 2 attempts to avoid hammering the server.

---

## 6. Core Concept: The Adapter/Transformer Pattern

### The Problem

Your components shouldn't know or care about the raw API structure.

```typescript
// If components use raw API data directly:
<p>{weatherData.main.temp}</p>
<p>{weatherData.weather[0].description}</p>
<p>{weatherData.wind.speed * 3.6} km/h</p>  // conversion logic in component!

// If OpenWeatherMap changes their structure: "main" → "current", "temp" → "temperature"
// You have to find every component that accesses this and update it.
// That's 5-10 files, each needing changes. High risk of missing one.
```

### The Solution: Transform at the Boundary

```typescript
// src/lib/transformers.ts — one place to deal with the raw API shape
export function transformCurrentWeather(raw: CurrentWeatherResponse): CurrentWeather {
  return {
    city: raw.name,
    temp: Math.round(raw.main.temp),          // rounding here, not in component
    windSpeed: Math.round(raw.wind.speed * 3.6), // conversion here, not in component
    description: capitalise(raw.weather[0]?.description ?? 'Unknown'),
    updatedAt: new Date(raw.dt * 1000),        // timestamp conversion here
    // ...
  }
}
```

Now components consume `CurrentWeather` — a clean, stable, UI-focused type:

```typescript
// In CurrentWeatherCard.tsx — no knowledge of the raw API shape
<p>{weather.temp}</p>            // already a whole number
<p>{weather.description}</p>     // already capitalised
<p>{weather.windSpeed} km/h</p>  // already converted
```

**If the API changes:** you update `transformCurrentWeather()` in ONE file. Components
are untouched. This is the **adapter** design pattern.

### Key Transformer Logic to Understand

```typescript
// Picking midday forecast as the day's representative:
const midday = slots.find(s => s.dt_txt.includes('12:00:00')) ?? slots[0]

// WHY: The API returns data every 3 hours. "12:00:00" is most representative of a day.
// ?? slots[0] is the nullish coalescing fallback — if no 12:00 slot exists (e.g. today),
// use the first available slot.
```

```typescript
// Getting the real min/max across ALL slots of a day:
const tempHigh = Math.round(Math.max(...slots.map(s => s.main.temp_max)))
const tempLow = Math.round(Math.min(...slots.map(s => s.main.temp_min)))

// WHY NOT just use midday's temp_min/temp_max?
// The API gives temp_min/temp_max for each 3-hour window, not the whole day.
// To get the true daily high/low, we must check all 8 windows (8 × 3h = 24h).
// ...slots.map(s => s.main.temp_max) → [16, 18, 17, 15, ...]
// Math.max(...[16, 18, 17, 15]) → 18
```

---

## 7. Core Concept: Zustand State Management

### Why Global State at All?

The `units` value (metric/imperial) is needed in:
- `Header` (toggle switch)
- `CurrentWeatherCard` (temperature display)
- `ForecastCard` (high/low temps)
- `useWeather` hook (query key + API param)
- `useForecast` hook (query key + API param)

If you used `useState` in `App.tsx`, you'd have to pass `units` as a prop down through
every level. That's called **prop drilling** — and it's painful.

### The Zustand Code to Understand

```typescript
// src/store/weatherStore.ts
export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set) => ({
      // STATE:
      units: 'metric',
      lastSearchedCity: '',

      // ACTIONS (functions that update state):
      setUnits: (units) => set({ units }),
      setLastSearchedCity: (city) => set({ lastSearchedCity: city }),
    }),
    {
      name: 'weather-preferences', // localStorage key
    }
  )
)
```

**The `persist` middleware:**

Without `persist`, when the user refreshes the page, Zustand resets to initial values.
The `persist` middleware automatically saves and restores state to/from `localStorage`.

```
User sets units to °F
→ Zustand calls localStorage.setItem('weather-preferences', '{"units":"imperial",...}')
User refreshes page
→ Zustand calls localStorage.getItem('weather-preferences')
→ Restores state: units = 'imperial'
→ User sees °F, not °C (preference preserved)
```

**Using Zustand in a component:**

```typescript
// In any component — no props, no context needed
const { units, setUnits } = useWeatherStore()

// units is the current value
// setUnits is the function to change it — triggers re-render only in components that use units
```

---

## 8. Core Concept: Custom React Hooks

### What Makes Something a "Custom Hook"?

Any function that:
1. Starts with `use`
2. Calls other React hooks (`useState`, `useEffect`, `useQuery`, etc.)

Custom hooks let you extract stateful logic OUT of components.

### useGeolocation — Breaking It Down

```typescript
// src/hooks/useGeolocation.ts

export function useGeolocation() {
  // Internal state — tracks all possible states of a geolocation request
  const [state, setState] = useState<GeolocationState>({ status: 'idle' })

  const requestLocation = useCallback(() => {
    // 1. Check browser support
    if (!navigator.geolocation) {
      setState({ status: 'error', message: 'Not supported' })
      return
    }

    // 2. Mark as loading
    setState({ status: 'loading' })

    // 3. Request coordinates from the browser
    //    This shows the browser's location permission prompt
    navigator.geolocation.getCurrentPosition(
      // SUCCESS:
      (position) => {
        setState({
          status: 'success',
          coordinates: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
        })
      },
      // ERROR:
      (error) => {
        const messages: Record<number, string> = {
          1: 'Location access denied.',   // User clicked "Block"
          2: 'Location unavailable.',      // Hardware/network issue
          3: 'Request timed out.',         // Took too long
        }
        setState({ status: 'error', message: messages[error.code] ?? 'Unknown error' })
      }
    )
  }, [])  // useCallback with [] means this function reference never changes

  return { state, requestLocation }
}
```

**Why `useCallback`?**

When `requestLocation` is passed to a child component as a prop, you don't want the
child to re-render every time the parent renders (because a new function reference
is created each render). `useCallback` memoizes the function so it only changes when
its dependencies change (here, `[]` means never).

### The Union Type State Machine

```typescript
type GeolocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; coordinates: Coordinates }
  | { status: 'error'; message: string }
```

This is a **discriminated union** type. The `status` field is the discriminator.

```typescript
// TypeScript knows exactly what fields are available based on status:
if (state.status === 'success') {
  console.log(state.coordinates)  // ✅ TypeScript knows .coordinates exists here
  console.log(state.message)      // ❌ Error: 'message' does not exist on success state
}
```

This prevents a whole class of bugs: accessing `state.coordinates` when you're in the
error state (where it doesn't exist) is caught at compile time, not at runtime.

---

## 9. Core Concept: Asynchronous UI States

Every data fetch has four possible states. You must handle all four:

```typescript
// The four states:
| State   | When                                    | What to show          |
|---------|─────────────────────────────────────|───────────────────────|
| Idle    | No search made yet                      | EmptyState            |
| Loading | Fetch in progress                       | Skeleton components   |
| Error   | Fetch failed (network, 404, etc.)       | ErrorMessage          |
| Success | Data available                          | WeatherCard + Forecast|
```

### How This Maps to Code

```typescript
// src/App.tsx — the state machine that drives the UI
const weather = useWeather(weatherParams)
const forecast = useForecast(weatherParams)

return (
  <div>
    {/* IDLE: no search params yet */}
    {searchParams === null && <EmptyState />}

    {/* LOADING: one or both queries still in progress */}
    {isLoading && (
      <>
        <WeatherCardSkeleton />
        <ForecastGridSkeleton />
      </>
    )}

    {/* ERROR: one or both queries failed */}
    {!isLoading && isError && (
      <ErrorMessage type={getErrorType(error)} />
    )}

    {/* SUCCESS: both queries have data */}
    {!isLoading && hasData && (
      <>
        <CurrentWeatherCard weather={weather.data!} units={units} />
        <ForecastGrid forecast={forecast.data!} units={units} />
      </>
    )}
  </div>
)
```

**Why this matters in interviews:**

"Graceful error handling" and "asynchronous UI states" are buzzwords that interviewers
love. Being able to say "I handled all four async states — idle, loading, error, and
success — with distinct, appropriate UI for each" is a strong answer.

---

## 10. Core Concept: TypeScript Generics and Type Safety

### The Generic in useDebounce

```typescript
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  // ...
  return debouncedValue
}
```

The `<T>` is a **type parameter** — a placeholder for whatever type you pass in.

```typescript
// When used with a string:
const debounced = useDebounce<string>('London', 500)
// T = string → returns string

// When used with a number:
const debounced = useDebounce<number>(42, 500)
// T = number → returns number

// TypeScript infers T automatically from the argument:
const debounced = useDebounce('London', 500)  // T inferred as string
```

The benefit: the function works for any type, and TypeScript guarantees the return type
matches the input type. No `any` needed.

### Non-Null Assertion (`!`)

```typescript
<CurrentWeatherCard weather={weather.data!} units={units} />
```

The `!` after `weather.data` is a non-null assertion. It tells TypeScript:
"I guarantee this value is not null/undefined at this point."

This is safe here because we only render this component inside `{!isLoading && hasData}` —
we know the data exists before we reach this JSX. But use `!` sparingly — overuse hides bugs.

### `(error as any).status`

```typescript
retry: (failureCount, error) => {
  if ((error as any).status === 404) return false
  // ...
}
```

`error` is typed as `unknown` (good — we don't know what shape errors have).
We cast it to `any` temporarily to access `.status`. A cleaner approach:

```typescript
// Better — use type narrowing:
function isApiError(err: unknown): err is { status: number } {
  return typeof err === 'object' && err !== null && 'status' in err
}

retry: (failureCount, error) => {
  if (isApiError(error) && error.status === 404) return false
  // ...
}
```

This is a pattern worth knowing for interviews — it shows TypeScript fluency.

---

## 11. Core Concept: Accessibility in UI Components

Accessibility (a11y) is not optional — it's a basic engineering standard and a frequent
topic in interviews at quality-focused companies.

### aria-hidden

```tsx
<WeatherIcon iconCode={iconCode} aria-hidden="true" />
```

This tells screen readers to skip this element. Weather icons are decorative — the
condition is described in text ("Partly cloudy"). Screen readers would say "SVG" or
"Cloud icon" which adds no value. `aria-hidden` prevents this.

### role="switch" on the Unit Toggle

```tsx
<button
  role="switch"
  aria-checked={units === 'imperial'}
  aria-label="Toggle temperature unit"
>
```

`role="switch"` tells assistive technology this is a toggle. Screen readers announce:
"Toggle temperature unit, switch, off" (metric) or "...switch, on" (imperial).
Without this, screen readers just say "button" — not useful.

### role="alert" on Error Messages

```tsx
<div role="alert">
  City not found.
</div>
```

When this element appears in the DOM, screen readers immediately announce its content —
even if focus is elsewhere. This is critical for dynamic error messages that appear
without a page reload.

### Minimum 2-Character Search

```typescript
if (debouncedValue.length >= 2) {
  onCitySearch(debouncedValue)
}
```

This is partly accessibility: searching on single characters could show unexpected
results or errors that confuse all users, including those with cognitive disabilities.

---

## 12. Core Concept: Testing Pure Functions vs. Side Effects

### Pure Functions (Easy to Test)

A pure function:
- Always returns the same output for the same input
- Has no side effects (no API calls, no DOM changes, no state updates)

```typescript
// transformCurrentWeather is pure:
const result = transformCurrentWeather(mockWeatherData)
expect(result.temp).toBe(19)

// No mocking needed. No setup. No teardown.
// Just call it with known input and assert the output.
```

This is why we write the most tests for transformers and utils.

### Functions with Side Effects (Harder to Test)

A function with side effects:
- Calls `fetch` (network)
- Reads from `localStorage`
- Accesses `navigator.geolocation`
- Calls `setTimeout`

These require mocking — replacing the real implementation with a fake one that
you control in tests.

```typescript
// Testing SearchBar's debounce requires controlling setTimeout:
vi.useFakeTimers()
await user.type(input, 'London')

// Without advancing fake timers, the debounce hasn't fired yet:
expect(mockCallback).not.toHaveBeenCalled()

// Advance time past the debounce delay:
vi.advanceTimersByTime(600)

// Now the debounce has fired:
expect(mockCallback).toHaveBeenCalledWith('London')
```

### The Testing Pyramid Applied Here

```
Few     │  E2E (Playwright)
        │  - Full user flows with real API
        │  - Slow, network-dependent, hard to debug
        │
Medium  │  Component Tests (Vitest + RTL)
        │  - Rendering, user interactions, mocked hooks
        │  - Medium speed, no real network
        │
Many    │  Unit Tests (Vitest)
        │  - Pure functions: transformers, utils, icon mapping
        │  - Fast, no mocking, deterministic
```

Test the things that are easiest to test the most. Test the things hardest to test
only for the most critical user paths.

---

## 13. Key Code Lines Explained

Each of the following lines appears in the build guide. These are the ones that
tend to confuse developers initially. Read each one until it clicks.

---

### Line: `staleTime: 10 * 60 * 1000`

```typescript
staleTime: 10 * 60 * 1000   // = 600,000 milliseconds = 10 minutes
```

TanStack Query works in milliseconds. `10 * 60 * 1000` is intentionally written
as a calculation (not `600000`) so a reader immediately understands: 10 minutes.
**Always write time constants this way — it's self-documenting.**

---

### Line: `enabled: params !== null`

```typescript
useQuery({
  queryKey: [...],
  queryFn: fetchWeather,
  enabled: params !== null,  // ← only run the query when we have params
})
```

If `enabled` is `false`, TanStack Query puts the query in an "idle" state and
doesn't fire the `queryFn`. This prevents the hook from firing on mount before
the user has searched for anything.

---

### Line: `const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }`

(This one is from Project 1 but the pattern appears here too for Zustand store access.)

```typescript
// In Zustand:
export const useWeatherStore = create<WeatherStore>()(persist(...))

// The () after create<WeatherStore>() is required when using middleware.
// It's calling the outer function first, then the inner function.
// create<T>() → returns a function → that function takes the store definition
// Think of it as: create<T>()(storeDefinition)
```

---

### Line: `const timer = setTimeout(() => { setDebouncedValue(value) }, delay)`

```typescript
// setTimeout takes two arguments:
// 1. A callback function to run after the delay
// 2. The delay in milliseconds

const timer = setTimeout(
  () => { setDebouncedValue(value) },  // run this...
  delay                                 // ...after this many ms
)

// The return value (timer) is a timer ID — used to cancel it with clearTimeout(timer)
```

---

### Line: `const dateKey = slot.dt_txt.split(' ')[0]`

```typescript
// slot.dt_txt looks like: "2024-06-14 12:00:00"
// .split(' ') splits on the space:
// → ["2024-06-14", "12:00:00"]
// [0] takes the first element:
// → "2024-06-14"

const dateKey = slot.dt_txt.split(' ')[0]  // → "2024-06-14"
```

This is how we group forecast slots by date — we extract just the date portion
and use it as a dictionary key.

---

### Line: `const tempHigh = Math.round(Math.max(...slots.map(s => s.main.temp_max)))`

```typescript
// Step by step:
slots.map(s => s.main.temp_max)
// → [15.8, 17.3, 16.9, 14.2]  (temp_max from each 3-hour slot)

Math.max(...[15.8, 17.3, 16.9, 14.2])
// The spread operator (...) unpacks the array as individual arguments
// Math.max(15.8, 17.3, 16.9, 14.2) → 17.3

Math.round(17.3)
// → 17

// Result: the highest temperature recorded across all 3-hour windows on this day
```

---

### Line: `res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60')`

```
's-maxage=600'              → CDN (Vercel Edge) caches this response for 600 seconds (10 mins)
'stale-while-revalidate=60' → After expiry, serve the stale cache for 60 more seconds
                              while fetching fresh data in the background
```

This means users always get a fast response (even stale cache) while fresh data
is fetched behind the scenes. This is the "stale-while-revalidate" pattern —
the same concept TanStack Query implements on the frontend, but at the CDN level.

---

### Line: `const Icon = getWeatherIcon(iconCode)`

```typescript
// getWeatherIcon returns a Lucide React component — a function, not JSX
const Icon = getWeatherIcon('02d')  // → Cloud (the component function)

// You can then render it like any component:
return <Icon className="h-10 w-10 text-sky-500" />

// This works because React components are just functions.
// Storing a component in a variable and rendering it is valid React.
```

---

### Line: `type GeolocationState = { status: 'idle' } | { status: 'loading' } | ...`

```typescript
// This is a discriminated union — a TypeScript pattern for modelling
// mutually exclusive states cleanly.

// Without this:
const [status, setStatus] = useState<string>('idle')
const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
const [errorMessage, setErrorMessage] = useState<string | null>(null)
// 3 separate state variables, easy to get out of sync
// Nothing stops you from having status='success' AND errorMessage set simultaneously

// With discriminated union:
const [state, setState] = useState<GeolocationState>({ status: 'idle' })
// One state variable, impossible to be in two states at once
// TypeScript enforces the valid shapes
```

---

## 14. Interview Questions and Answers

These are questions a technical interviewer might ask about this project.
Practice saying these answers out loud.

---

**Q: Why did you use Vite instead of Next.js for this project?**

A: "Next.js is a full-stack framework — it adds SSR, API routes, and file-based routing.
This project has no server-side rendering requirements, no database, and no auth. Using
Next.js would be over-engineering. Vite is the standard build tool for SPAs in 2026 —
fast development server, minimal configuration, and perfect for a client-side app."

---

**Q: How did you protect your API key?**

A: "I proxied all OpenWeatherMap calls through Vercel Serverless Functions. The browser
calls my `/api/weather` endpoint — never OpenWeatherMap directly. The API key lives
in Vercel's environment variables, only accessible server-side. If you inspect the
browser's network requests, you'll only see calls to my proxy — the key is never in
the JavaScript bundle."

---

**Q: What is debouncing and why did you use it?**

A: "Debouncing is a technique that delays executing a function until after a user has
stopped triggering it. In my search bar, without debounce, every keystroke fires an
API call. If a user types 'London', that's 6 calls, most returning wrong results.
With a 500ms debounce, only one call fires — after the user pauses. It protects the
free tier rate limit and improves performance."

---

**Q: How did TanStack Query help with the API integration?**

A: "TanStack Query handled the full lifecycle of my API calls — loading state, error
state, caching, and background refetching. I set a 10-minute staleTime because
OpenWeatherMap only updates data every 10 minutes on the free tier. This means if a
user re-focuses the browser tab within 10 minutes, no new API call fires — cached data
is served instantly. I also configured the query key to include the unit preference,
so switching between Celsius and Fahrenheit triggers a new fetch with the correct
unit parameter."

---

**Q: What is the adapter pattern and where did you use it?**

A: "The adapter pattern converts an external interface into one that suits your application.
I used it in the transformer functions — `transformCurrentWeather()` converts the raw
OpenWeatherMap response into a clean `CurrentWeather` type that my components consume.
Components have no knowledge of the raw API shape. If OpenWeatherMap changes their schema,
I update one file. Nothing else changes."

---

**Q: How did you handle errors in the UI?**

A: "I designed three distinct error states. A 404 error means the city wasn't found —
I show a map pin icon with a 'City not found' message. A 503 error means the API is
down — I show a cloud-off icon with a 'Service unavailable' message. Any other error
shows a generic message with a retry button. I used a discriminated union type to model
these states, and each error type has a matching `role='alert'` for screen readers."

---

**Q: Why did you choose Zustand over Context API or Redux?**

A: "I needed to share two values across multiple components: the unit preference and the
last searched city. Context API would cause unnecessary re-renders because any context
change re-renders all consumers. Redux is the right tool for complex state with many
actions, but for two values and two setters, it's massive overkill. Zustand is
lightweight, has a subscribe-based model (only re-renders components that use the
changed value), and the persist middleware gave me localStorage persistence in one line."

---

**Q: What's the difference between unit tests and integration tests in this project?**

A: "Unit tests test pure functions in isolation — my transformer functions take raw API
data in and return clean UI types out. No mocking needed. Integration tests test
components — they render the component in a simulated browser environment, simulate
user interactions (like typing), and assert on what appears in the DOM. For example,
I tested that the SearchBar doesn't call the search callback until the user has typed
at least 2 characters and paused for 500ms. Mock timers let me control the debounce
timing without actually waiting."

---

*Understanding beats memorising. If you can explain why every decision was made, you're interview-ready.*
