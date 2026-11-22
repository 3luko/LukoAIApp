---
name: fastapi-endpoint
description: Add or change a FastAPI endpoint in the LukoAI backend. Use when building a route such as POST /analysis/calculate. A new endpoint or a changed request/response shape is an API contract change and needs the developer's approval first.
---
# FastAPI endpoint

0. **Approval first.** A new endpoint or a changed schema is a public API contract. Propose it (request, response, errors) and wait for approval.
1. Follow the layering: `api/routes/<area>.py` (thin) → `services/` → `domain/`. Register new routers in `app/main.py`.
2. Define the request and response as Pydantic models in `schemas/`. Validate ranges there (for example rates between 0 and 1).
3. The route validates, calls a service, and returns the response model. No formulas or database code in the route.
4. Return predictable structures. Map domain `ValueError` to a 422 with a clear message. Don't leak internals in errors.
5. Don't call RentCast or Gemini from the calculate path (ADR 0002). External calls go through `clients/` in a service.
6. Tests: success, validation failure (422), boundary values, and an override equal to the default. Use FastAPI's `TestClient` (`httpx` is installed) and mock any client.
7. Run `python -m pytest` in `backend/`.
8. Update the matching TypeScript types in `frontend/src/types/` when the schema changes, and tell the developer.

Example: `POST /analysis/calculate` takes property data plus optional overrides, builds `CashFlowInputs`, calls `calculate_cash_flow`, and returns the breakdown with each line's `source`, rounded to cents at the response.
