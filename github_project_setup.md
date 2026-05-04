# GitHub Project Setup — Weather Dashboard (Project 2)

> Step-by-step instructions to set up the GitHub repository, labels,
> milestones, project board, and all 23 issues for this project.
> Do this BEFORE writing any code.

---

## Step 1: Create the Repository

```bash
# Option A: GitHub CLI (recommended)
gh repo create weather-dashboard \
  --public \
  --description "Responsive weather dashboard with 5-day forecast, geolocation, and API caching" \
  --clone

cd weather-dashboard

# Option B: Manual
# 1. Go to github.com → New Repository
# 2. Name: weather-dashboard
# 3. Visibility: Public
# 4. Add README: No (we'll create our own)
# 5. .gitignore: Node
# 6. Clone locally
```

---

## Step 2: Create Labels

Go to **GitHub → Issues → Labels → New Label** and create:

| Label Name | Colour | Description |
|------------|--------|-------------|
| `phase-1` | `#0075ca` | System design phase |
| `sprint-1` | `#e4e669` | Core integration sprint |
| `sprint-2` | `#ffa500` | UI engineering sprint |
| `sprint-3` | `#d93f0b` | Edge cases and polish sprint |
| `design` | `#c5def5` | Design and planning tasks |
| `setup` | `#bfd4f2` | Project configuration |
| `security` | `#b60205` | Security-related tasks |
| `hooks` | `#8b5cf6` | React hooks |
| `data-fetching` | `#1d76db` | API and data layer |
| `state` | `#0052cc` | State management |
| `verification` | `#006b75` | End-to-end verification tasks |
| `ui` | `#e4b429` | UI components |
| `data` | `#5319e7` | Data transformation |
| `ux` | `#fbca04` | User experience and polish |
| `performance` | `#0e8a16` | Performance optimisation |
| `testing` | `#84b6eb` | Test writing |
| `ci-cd` | `#cccccc` | CI/CD pipeline |
| `deployment` | `#000000` | Deployment tasks |
| `bug` | `#d73a4a` | Something isn't working |
| `documentation` | `#0075ca` | Documentation updates |

---

## Step 3: Create Milestones

Go to **GitHub → Issues → Milestones → New Milestone**:

| Milestone | Description | Due Date |
|-----------|-------------|----------|
| Phase 1: System Design | Architecture, API strategy, UI wireframe | Week 1 |
| Sprint 1: Core Integration | Working search → raw data flow | Week 2 |
| Sprint 2: UI Engineering | Polished, responsive UI with state | Week 3 |
| Sprint 3: Polish & Deploy | Edge cases, tests, CI, live deployment | Week 4 |

---

## Step 4: Create the GitHub Project Board

1. Go to **github.com/orgs/YOUR_ORG/projects** → **New Project**
2. Select **Board** template
3. Name: `Project 2 — Weather Dashboard`
4. Rename columns:

| Column | Description |
|--------|-------------|
| `Backlog` | All planned issues start here |
| `In Progress` | Actively being built (max 2 at a time) |
| `In Review` | PR open, self-reviewing before merge |
| `Done` | Merged to main, issue closed |

5. Link the project to your repository:
   **Project Settings → Linked Repositories → Add Repository → weather-dashboard**

---

## Step 5: Create All Issues

Create each issue below with its title, labels, milestone, and body.

---

### PHASE 1 ISSUES

---

**Issue #1 — [Design] Define UI/UX layout and wireframe**

```
Labels:     design, phase-1
Milestone:  Phase 1: System Design
Assignee:   yourself

Body:
Plan the layout for the Weather Dashboard before writing any code.

## Deliverable
A documented layout plan covering:
- [ ] Search bar placement and design
- [ ] Main weather card — what data is shown and where
- [ ] 5-day forecast grid — card structure
- [ ] Empty state (before first search)
- [ ] Loading state (skeleton layout)
- [ ] Error states (city not found, API down)
- [ ] Mobile responsiveness considerations (≤375px)

## Reference
See the layout plan in project2_weather_dashboard.md → Phase 1 → Section 1.1
```

---

**Issue #2 — [Design] API strategy — endpoints, rate limits, caching plan**

```
Labels:     design, phase-1
Milestone:  Phase 1: System Design

Body:
Document the API strategy before any code is written.

## Deliverable
- [ ] Identify exact OpenWeatherMap endpoints to use (current weather, forecast, geocoding)
- [ ] Document free tier rate limits (60/min, 1M/month)
- [ ] Document staleTime strategy (10 minutes) and why
- [ ] Document debounce strategy (500ms) and why
- [ ] Document proxy strategy (api/ serverless functions) and why

## Reference
See project2_weather_dashboard.md → Phase 1 → Section 1.2
```

---

**Issue #3 — [Design] Define TypeScript interfaces**

```
Labels:     design, phase-1
Milestone:  Phase 1: System Design

Body:
Define all TypeScript interfaces before writing components.

## Deliverable
- [ ] Raw API types: CurrentWeatherResponse, ForecastResponse, WeatherCondition, etc.
- [ ] Normalised UI types: CurrentWeather, DailyForecast
- [ ] State types: Units, SearchMode, Coordinates
- [ ] All types live in src/types/index.ts

## Reference
See project2_weather_dashboard.md → Phase 1 → Section 1.3
```

---

### SPRINT 1 ISSUES

---

**Issue #4 — [Sprint 1] Initialise Vite + React + TS + Tailwind**

```
Labels:     sprint-1, setup
Milestone:  Sprint 1: Core Integration

Body:
Set up the base project.

## Steps
- [ ] Run: npm create vite@latest weather-dashboard -- --template react-ts
- [ ] Install Tailwind with Vite plugin (@tailwindcss/vite)
- [ ] Configure vite.config.ts with @ path alias
- [ ] Configure tsconfig.json with paths
- [ ] Add .env.local and .env.example
- [ ] Verify: npm run dev shows Vite welcome page
- [ ] Verify: Tailwind class turns text blue

## Reference
See project2_weather_dashboard.md → Sprint 1 → Steps 1–4
```

---

**Issue #5 — [Sprint 1] Implement Vercel serverless proxy (API key security)**

```
Labels:     sprint-1, security
Milestone:  Sprint 1: Core Integration

Body:
The API key must never reach the browser bundle.

## Steps
- [ ] Create api/weather.ts (proxy for current weather)
- [ ] Create api/forecast.ts (proxy for 5-day forecast)
- [ ] Install @vercel/node types
- [ ] Install vercel CLI globally
- [ ] Run vercel dev and verify /api/weather?city=London returns JSON
- [ ] Open DevTools → Network → confirm NO calls to openweathermap.org from browser

## Acceptance Criteria
Browser Network tab shows /api/weather calls only. No direct OpenWeatherMap calls.

## Reference
See project2_weather_dashboard.md → Sprint 1 → Step 5
```

---

**Issue #6 — [Sprint 1] Build useDebounce custom hook**

```
Labels:     sprint-1, hooks
Milestone:  Sprint 1: Core Integration

Body:
500ms debounce to prevent API spam on every keystroke.

## Steps
- [ ] Create src/hooks/useDebounce.ts
- [ ] Implement debounce using useEffect + clearTimeout
- [ ] Write unit test verifying: value only updates after delay

## Test cases to cover
- debounced value updates after delay
- debounced value does NOT update before delay
- timer resets when value changes mid-flight

## Reference
See project2_weather_dashboard.md → Sprint 1 → Step 11
```

---

**Issue #7 — [Sprint 1] Build TanStack Query hooks (useWeather, useForecast)**

```
Labels:     sprint-1, data-fetching
Milestone:  Sprint 1: Core Integration

Body:
Central hooks for all weather API interactions.

## Steps
- [ ] Install @tanstack/react-query + devtools
- [ ] Create src/hooks/useWeather.ts
- [ ] Create src/hooks/useForecast.ts
- [ ] staleTime = 10 minutes on both
- [ ] retry = false on 404, retry twice on other errors
- [ ] enabled = false when params are null
- [ ] Wrap app in QueryClientProvider in main.tsx

## Reference
See project2_weather_dashboard.md → Sprint 1 → Steps 13–14
```

---

**Issue #8 — [Sprint 1] Set up Zustand store**

```
Labels:     sprint-1, state
Milestone:  Sprint 1: Core Integration

Body:
Global state for unit preference and last searched city.

## Steps
- [ ] Install zustand
- [ ] Create src/store/weatherStore.ts
- [ ] Implement: units (metric | imperial), setUnits
- [ ] Implement: lastSearchedCity, setLastSearchedCity
- [ ] Add persist middleware (saves to localStorage)
- [ ] Verify: unit preference survives page refresh

## Reference
See project2_weather_dashboard.md → Sprint 1 → Step 10
```

---

**Issue #9 — [Sprint 1] Verify end-to-end data flow**

```
Labels:     sprint-1, verification
Milestone:  Sprint 1: Core Integration

Body:
Before building UI, prove the data pipeline works.

## Steps
- [ ] Build minimal App.tsx with raw input + pre tag
- [ ] Connect useWeather + useForecast hooks
- [ ] Verify: type "London" → raw JSON appears on screen
- [ ] Verify: 500ms debounce delays the fetch (check Network tab timing)
- [ ] Verify: ReactQuery DevTools shows cached query
- [ ] Verify: changing city updates the cache entry

## Reference
See project2_weather_dashboard.md → Sprint 1 → Step 14
```

---

### SPRINT 2 ISSUES

---

**Issue #10 — [Sprint 2] Build Header with unit toggle**

```
Labels:     sprint-2, ui
Milestone:  Sprint 2: UI Engineering

Body:
- [ ] Logo with Cloud icon from Lucide
- [ ] Toggle switch (°C / °F) connected to Zustand store
- [ ] Toggle is keyboard accessible (role="switch", aria-checked)
- [ ] Toggle colour changes based on active unit

## Reference
See project2_weather_dashboard.md → Sprint 2 → Step 15
```

---

**Issue #11 — [Sprint 2] Build SearchBar**

```
Labels:     sprint-2, ui
Milestone:  Sprint 2: UI Engineering

Body:
- [ ] Debounced text input (500ms, min 2 chars)
- [ ] Geolocation button (useGeolocation hook)
- [ ] Loading spinner inside input when fetching
- [ ] Clear button (X) when input has value
- [ ] Geolocation error message displayed below
- [ ] Mobile-friendly layout (location button label hides on small screens)

## Reference
See project2_weather_dashboard.md → Sprint 2 → Steps 12, 16
```

---

**Issue #12 — [Sprint 2] Build CurrentWeatherCard**

```
Labels:     sprint-2, ui
Milestone:  Sprint 2: UI Engineering

Body:
- [ ] City name + country code
- [ ] Large temperature display with unit symbol
- [ ] Feels like + H/L temperatures
- [ ] Weather description
- [ ] Weather icon (WeatherIcon component)
- [ ] Humidity / Wind / Visibility stats grid
- [ ] "Last updated" timestamp

## Reference
See project2_weather_dashboard.md → Sprint 2 → Step 18
```

---

**Issue #13 — [Sprint 2] Build ForecastGrid and ForecastCard**

```
Labels:     sprint-2, ui
Milestone:  Sprint 2: UI Engineering

Body:
- [ ] ForecastCard: day label, icon, description, high/low temp
- [ ] ForecastGrid: 5-column responsive grid of ForecastCards
- [ ] Section has accessible label ("5-Day Forecast")

## Reference
See project2_weather_dashboard.md → Sprint 2 → Step 19
```

---

**Issue #14 — [Sprint 2] Implement transformer functions**

```
Labels:     sprint-2, data
Milestone:  Sprint 2: UI Engineering

Body:
- [ ] transformCurrentWeather(): rounds temps, converts units, capitalises description
- [ ] transformForecast(): groups by day, picks midday slot, scans all slots for min/max
- [ ] Unit tests written and passing for both transformers

## Reference
See project2_weather_dashboard.md → Sprint 1 → Step 7
    testing_guide_project2.md → Layer 1 → Section 1.1
```

---

**Issue #15 — [Sprint 2] Build WeatherIcon component**

```
Labels:     sprint-2, ui
Milestone:  Sprint 2: UI Engineering

Body:
- [ ] Create src/lib/weatherIcons.ts — icon code → Lucide icon map
- [ ] Create src/components/weather/WeatherIcon.tsx
- [ ] All known icon codes mapped (01d–50n)
- [ ] Unknown codes fall back to Wind icon
- [ ] Size prop: sm | md | lg | xl
- [ ] aria-hidden="true" on the icon (decorative)

## Reference
See project2_weather_dashboard.md → Sprint 2 → Steps 9, 17
```

---

### SPRINT 3 ISSUES

---

**Issue #16 — [Sprint 3] Implement skeleton loading components**

```
Labels:     sprint-3, ux
Milestone:  Sprint 3: Polish & Deploy

Body:
No spinners. Skeleton loaders only.

- [ ] Base Skeleton component (animate-pulse)
- [ ] WeatherCardSkeleton — matches layout of CurrentWeatherCard
- [ ] ForecastGridSkeleton — 5 placeholder cards
- [ ] Skeletons are aria-hidden="true"
- [ ] Skeletons render when isLoading is true in App.tsx

## Reference
See project2_weather_dashboard.md → Sprint 2 → Step 20
```

---

**Issue #17 — [Sprint 3] Implement graceful error states**

```
Labels:     sprint-3, ux
Milestone:  Sprint 3: Polish & Deploy

Body:
Three distinct error states:

- [ ] City not found (404) → MapPinOff icon + "City not found" message
- [ ] API down (503) → CloudOff icon + "Weather data unavailable"
- [ ] Generic error → AlertTriangle icon + "Something went wrong"
- [ ] Each has a role="alert" for screen readers
- [ ] Optional retry button fires onRetry callback

## Reference
See project2_weather_dashboard.md → Sprint 2 → Step 20 (ErrorMessage)
```

---

**Issue #18 — [Sprint 3] Implement EmptyState**

```
Labels:     sprint-3, ux
Milestone:  Sprint 3: Polish & Deploy

Body:
- [ ] Shows when no city has been searched
- [ ] CloudSun icon, heading, and helper text
- [ ] Icon is aria-hidden
- [ ] Replaced by weather data once a search is made

## Reference
See project2_weather_dashboard.md → Sprint 2 → Step 20 (EmptyState)
```

---

**Issue #19 — [Sprint 3] Verify caching and debounce behaviour**

```
Labels:     sprint-3, performance
Milestone:  Sprint 3: Polish & Deploy

Body:
Manually verify all rate-limiting protections work.

- [ ] Search "London" → check Network tab → 2 requests (/api/weather + /api/forecast)
- [ ] Re-focus browser tab within 10 mins → 0 new requests (staleTime working)
- [ ] Type "P-a-r-i-s" quickly → check Network tab → only 1 request fires (debounce working)
- [ ] Switch units (°C → °F) → 2 new requests with units=imperial param
- [ ] Search same city again after 10 mins → fresh request fires (stale cache invalidated)

## Reference
See project2_weather_dashboard.md → Phase 1 → Section 1.2 (rate limit strategy)
```

---

**Issue #20 — [Sprint 3] Write component tests (Vitest + RTL)**

```
Labels:     sprint-3, testing
Milestone:  Sprint 3: Polish & Deploy

Body:
- [ ] SearchBar.test.tsx — debounce, min chars, loading state, geolocation error
- [ ] CurrentWeatherCard.test.tsx — stats, unit symbols, description
- [ ] ForecastGrid.test.tsx — 5 cards render, day labels, temperatures
- [ ] ErrorMessage.test.tsx — each error type, retry button
- [ ] EmptyState.test.tsx — heading visible
- [ ] All tests pass: npm run test

## Reference
See testing_guide_project2.md → Layer 2
```

---

**Issue #21 — [Sprint 3] Write E2E tests (Playwright)**

```
Labels:     sprint-3, testing
Milestone:  Sprint 3: Polish & Deploy

Body:
- [ ] Configure playwright.config.ts
- [ ] Write e2e/weather.spec.ts covering:
  - Empty state on load
  - City search → weather card appears
  - Invalid city → error state
  - Unit toggle → °C / °F changes
  - Page title correct
  - Unit preference persists across reload
- [ ] All E2E tests pass: npm run test:e2e

## Reference
See testing_guide_project2.md → Layer 3
```

---

**Issue #22 — [Sprint 3] Set up GitHub Actions CI**

```
Labels:     sprint-3, ci-cd
Milestone:  Sprint 3: Polish & Deploy

Body:
- [ ] Create .github/workflows/ci.yml
- [ ] Jobs: type-check, lint, format check, vitest run
- [ ] Push to main → Actions tab → all jobs pass (green)
- [ ] Create a PR with a type error → CI fails as expected

## Reference
See project2_weather_dashboard.md → Sprint 3 → Step 27
```

---

**Issue #23 — [Sprint 3] Deploy to Vercel and verify production**

```
Labels:     sprint-3, deployment
Milestone:  Sprint 3: Polish & Deploy

Body:
- [ ] Push code to GitHub
- [ ] Import repo on vercel.com
- [ ] Set OPENWEATHER_API_KEY in Vercel environment variables
- [ ] Successful first deployment
- [ ] Search a city on the live URL — weather loads
- [ ] Verify: DevTools Network tab shows /api/weather (not openweathermap.org directly)
- [ ] Verify: unit preference persists across page reload
- [ ] Add Vercel live URL to README.md

## Reference
See project2_weather_dashboard.md → Sprint 3 → Step 28
```

---

## Step 6: Add Issues to Project Board

After creating all issues:

1. Go to your GitHub Project board
2. Click **+ Add items** → select all 23 issues → add to **Backlog**
3. Set milestones on each issue by opening it → right panel → Milestone

---

## Step 7: Branch Protection Rules

**GitHub → Settings → Branches → Add branch protection rule**

```
Branch name pattern: main

✓ Require a pull request before merging
✓ Require status checks to pass before merging
  Status checks:  (add after CI is set up)
  - Type Check & Lint & Test
✓ Require branches to be up to date before merging
✓ Do not allow bypassing the above settings
```

---

## Project Board: Working Convention

- Move an issue to **In Progress** when you start work (max 2 at once)
- Create a branch: `git checkout -b feature/issue-5-api-proxy`
- When PR is open: move to **In Review**
- When merged: move to **Done** and close the issue
- Reference issues in commits: `feat: add api proxy (#5)`

---

*Set this up before Sprint 1. A well-organised project board is itself a portfolio signal.*
