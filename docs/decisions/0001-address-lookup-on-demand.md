# 0001: Look up property data on demand, from the address

- **Status:** Proposed
- **Date:** 2026-11-17

## Context

The investor form could pre-fill the listing price from an external property API (RentCast is the planned source). Each lookup costs API credits, and users may type the wrong address or change their mind. Lookups must therefore be deliberate.

Scraping listing sites (Zillow, Redfin, and similar) is out of scope. Their terms generally forbid it, and their pages change without notice. Lookups use address-based data from an official API.

## Decision

1. **The user starts every lookup.** The address field has a "Look up property" button. Nothing is fetched while the user types.
2. **The backend handles the lookup.** The frontend calls our own endpoint, and only the backend holds the API key and talks to RentCast.
3. **Cache before calling the API.** The backend normalizes the address (case, punctuation, abbreviations) and returns a cached result if one is still fresh. A cache hit costs no credits.
4. **Show the matched address before using the price.** The response includes the address the API matched. The UI shows it next to the price, so the user can catch a wrong match. No second call is needed.
5. **Changing the address clears the result.** Editing the address after a lookup removes the old price. A new lookup needs a new click.
6. **The price is offered inline, not forced.** When a listing price is found, an inline prompt under the address field offers "Use this price" or "Keep my price." The user's own typed price always wins until they choose otherwise.
7. **`listPrice` is optional.** The lookup may find no listing (for example, an off-market property), so the form must still work without it.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. Lookup when the address field loses focus** | Fastest; no extra click | Costs credits for typos and changed minds |
| **B. Lookup on submit** | Only one call per analysis | Price isn't known until the end; the user can't review it |
| **C. Explicit button, cache, matched-address check (chosen)** | Credits are spent only on deliberate lookups; caching avoids repeats; the matched address catches mistakes | One extra click |

Pop-up choice: an **inline prompt** (chosen) was preferred over a **modal**. An inline prompt doesn't block the page, and it's simpler to make accessible. A modal would be right only if the price had to be settled before continuing.

## Consequences

- We need a backend (FastAPI) with a cache store before this works. The cache can start as a database table, or in memory for early testing.
- The cache needs an expiry time, because listings change. Results should show when they were fetched.
- The frontend gains a small state machine for the lookup: idle, loading, found, not found, error. This is worth designing carefully.
- Address normalization becomes its own piece of logic and needs tests.

## Decided

- **Cache lifetime:** a cached lookup stays fresh for 24 hours.
- **RentCast endpoints:** the lookup can draw on four endpoints, each with a different purpose:
  - `/v1/properties`: the property record and listing card (the source for the list price)
  - `/v1/avm/value`: estimated value and sales comparables
  - `/v1/avm/rent/long-term`: rental estimate and comparable rents
  - `/v1/markets`: local sale and rental market trends

  Each endpoint has its own cost. The lookup button should call only what the analysis needs. This is in the Open questions below.

## Open questions

1. **Which endpoints run on one lookup?** Options: (a) `/v1/properties` only, with the others called later only when the analysis needs them; (b) all four on each lookup. Option (a) saves credits, but the analysis may need a second round trip. Option (b) costs more per lookup, but the cached result covers the whole analysis.
2. **Matching multiple results:** if the API returns several properties for one address (for example, multi-unit buildings), what does the user pick?
3. **Cost limits:** should we cap lookups per user or per day while the app is in testing?
