# 0002: Stateless calculation endpoint and shareable analysis links

- **Status:** Proposed
- **Date:** 2026-11-21

## Context

The results page shows computed numbers (monthly rent, cash flow, and related metrics). Investors can change assumptions (vacancy, operating expenses, mortgage payment, CapEx) in an advanced options section and through per-card controls. See [rental income and cash flow logic](../logic/rental-income-and-cash-flow.md).

Constraints:

- The app has no user accounts for now.
- The database holds only data from external API calls (see [0001](0001-address-lookup-on-demand.md)). User-entered values are not reused for other users' analyses.
- The backend also needs the numbers for the Gemini written summary, so the calculation should not live in two languages.
- Overrides must never cause extra RentCast calls.

## Decision

1. **The calculation lives in the backend only.** One implementation in FastAPI is the single source of truth. The frontend contains no financial formulas.
2. **A stateless calculate endpoint.** The frontend sends the property data plus the current overrides, and the backend returns the computed results. It reads and writes no user state.
3. **Overrides live in frontend component state**, held as one typed object. That object is the request body, so it needs no translation before sending.
4. **The calculate endpoint never calls RentCast.** Property data comes from the request or the existing cache from 0001.
5. **Shareable links.** The investor can create a link to an analysis. The backend saves the analysis under an unguessable ID, and opening the link restores the form inputs, overrides and results.
6. **No accounts.** Anyone with the link can view the analysis, and nobody "owns" it.
7. **User-entered figures are used only in their own analysis.** They never feed another user's results.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. Calculation in the frontend** | Instant edits; no server needed | Backend needs the numbers for the Gemini summary: duplicated logic, or trusting numbers sent from the browser |
| **B. Stateless backend calculation (chosen)** | One source of truth; testable in Python; no duplicate logic | Each edit is a round trip; needs loading and error states and request debouncing |
| **C. Backend persists every edit** | Always saved | Slow edits; needs identity; stores more data than needed |

## Consequences

- The backend must exist before the results page can show real numbers. Until then the frontend keeps showing labeled sample data.
- The frontend needs loading, error and "stale result" states while a calculation is in flight. Debouncing edits (for example, 300 ms) keeps the number of requests down.
- The request and response shapes become an API contract. Types in `frontend/src/types/` should mirror the backend schema.
- Shareable links need a database table for saved analyses, and the database choice is still open.
- The saved analysis contains user-entered data (price, rent, assumptions), so it needs a retention policy and privacy handling.

## Open questions

1. ~~What does a saved analysis contain?~~ **Decided:** a snapshot of the stats shown on the results page, with the AI-written summary highlighted. The link shows what the sharer saw and is not recalculated on open.
2. **Link format and strength.** The ID must be random and unguessable, not sequential.
3. **Deleting.** **Decided:** the creator can delete a link. With no accounts, the open question is how the backend knows who the creator is. A common approach is a secret delete token returned once at creation and kept in the creator's browser, separate from the shareable ID.
4. **Expiry.** Should saved analyses also expire automatically after a set time?
5. **Abuse limits.** Should the calculate endpoint and link creation be rate limited?
5. **Validation.** The backend must validate all numeric inputs (ranges, zero values), because the browser's checks can't be trusted.
