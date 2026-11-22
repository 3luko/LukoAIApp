---
name: api-integration
description: Integrate an external or internal API in LukoAI - RentCast and Gemini on the backend, or our own backend from the frontend. Use for clients, caching, timeouts and error handling. A new external service, or a change that affects API cost, needs the developer's approval first.
---
# API integration

**Backend to RentCast or Gemini** (in `backend/app/clients/`, called from services):
1. Approval first for any new external service or anything that changes credit usage. Read `docs/decisions/0001-address-lookup-on-demand.md`. Lookups are deliberate, cached (24 hours), and never run on every keystroke.
2. Keys come from settings (`core/config.py`) and the environment. Never in the frontend, never in logs, never committed.
3. Set a timeout, handle HTTP errors and malformed responses, and return a clear error type. Retry only safe requests, with a limit.
4. Validate the external payload with a Pydantic model before using it. Treat missing fields as `missing`, don't guess.
5. Check the cache before spending credits. Avoid repeat requests for the same address.
6. Tests mock the client. No live calls.

**Frontend to our backend** (in `frontend/src/lib/api/`):
1. One typed function per endpoint. Types mirror the backend schemas in `types/`.
2. Handle loading, timeout, failure and empty states in the UI. Show the user a useful message.
3. Debounce edits that trigger recalculation, and cancel stale requests so old results don't overwrite new ones.
4. The frontend only calls our own backend, never RentCast or Gemini.

Example: the results page edits an override, `useAnalysis` debounces it, `analysisApi.calculate` posts to `/analysis/calculate`, and the UI shows a loading state, then the result or an error.
