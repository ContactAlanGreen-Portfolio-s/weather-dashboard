# AGENTS.md — Weather Dashboard (Project 2)

> Guidance for AI coding agents (Claude Code, Devin, GitHub Copilot Workspace, etc.)
> operating autonomously in this repository. Read before taking any action.

---

## Repo Context

| Property | Value |
|----------|-------|
| Project | Weather Dashboard — Portfolio Project 2 |
| Type | Frontend SPA + Vercel Serverless Functions |
| Framework | Vite + React 18 + TypeScript |
| Test Runner | Vitest (unit/component), Playwright (E2E) |
| Deployment | Vercel |

---

## Before You Make Any Change

1. Read `CLAUDE.md` — it defines architectural rules you must not violate
2. Run `npm run type-check` to understand the current TypeScript state
3. Run `npm run test` to establish a green baseline before your changes
4. Read the relevant section of `project2_weather_dashboard.md` for context

---

## Safe Operations (No Approval Needed)

- Adding or updating unit tests in `src/__tests__/unit/`
- Adding or updating component tests in `src/__tests__/components/`
- Fixing TypeScript type errors without changing runtime behaviour
- Updating comments or JSDoc in existing files
- Fixing lint warnings (`no-unused-vars`, missing `key` props, etc.)
- Updating `README.md` or documentation files

---

## Operations Requiring Careful Judgment

### Modifying `src/lib/transformers.ts`

The transformer functions are the most critical logic in the project. Any change
must be accompanied by updated unit tests that cover:
- The changed calculation
- The edge cases around it (null values, empty arrays, rounding)

Run `npm run test -- --coverage` and verify transformer coverage stays at 100%.

### Modifying Caching Configuration

Do not change `staleTime` values in `useWeather.ts` or `useForecast.ts` without
understanding the reason they exist (protecting the free API tier from overuse).
If a change is needed, document the reason in the PR.

### Modifying the Zustand Store

The store uses `persist` middleware. Adding new fields requires a migration
strategy if the stored shape changes — otherwise users with the old localStorage
value will encounter a type mismatch on load.

### Adding New Environment Variables

All new variables that contain secrets must be server-side only (no `VITE_` prefix).
Variables can only be used in `api/` files — never in `src/`.

---

## Forbidden Operations

- **Do not** add a `VITE_` prefix to the OpenWeatherMap API key
- **Do not** call `https://api.openweathermap.org` directly from any file in `src/`
- **Do not** install new major dependencies without noting the reason in the commit message
- **Do not** remove the debounce or reduce its delay below 300ms
- **Do not** change `staleTime` to less than 5 minutes
- **Do not** add `any` types — use `unknown` and narrow instead
- **Do not** add spinners — use skeleton components for loading states

---

## Verification Checklist

After completing any task, verify:

```bash
npm run type-check   # 0 TypeScript errors
npm run lint         # 0 lint errors
npm run test         # all tests pass
npm run build        # production build succeeds
```

If any of these fail after your changes, fix them before finishing.

---

## Commit Message Format

```
type(scope): short description

Types: feat | fix | chore | refactor | test | docs | style
Scope: optional (search, forecast, store, ci, api, etc.)

Examples:
  feat(search): add city search history dropdown
  fix(transformer): correct wind speed conversion for imperial units
  test(components): add ForecastCard edge case for single-day data
  chore: update TanStack Query to v5.40
```

---

## Project Documentation Map

| File | Purpose |
|------|---------|
| `project2_weather_dashboard.md` | Full step-by-step build guide |
| `testing_guide_project2.md` | Testing strategy and test case definitions |
| `CLAUDE.md` | Architecture rules and conventions |
| `AGENTS.md` | This file — agent-specific guidance |
| `github_project_setup.md` | GitHub Project board and issue setup |
| `guided_learning_project2.md` | Concept explanations and code walkthroughs |
