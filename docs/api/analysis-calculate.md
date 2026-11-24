# POST /analysis/calculate

- **Status:** Approved 2026-11-21, implemented in the backend.
- **Decisions:** [0002](../decisions/0002-stateless-calculation-and-shareable-analyses.md). Rules: [cash flow logic](../logic/rental-income-and-cash-flow.md).
- **Code:** `backend/app/schemas/analysis.py` (contract), `api/routes/analysis.py`, `services/analysis_service.py`, `domain/`.

Stateless: it reads and writes no stored data and never calls RentCast or any other external service.

Strict input: the wire format is camelCase only (snake_case keys are unknown fields), numbers must be JSON numbers (a string like `"400000"` is rejected, not converted), and `loanTermYears` must be a whole number. Unknown fields are rejected, so a misspelled override fails and isn't silently ignored.

## Request

```json
{
  "property":    { "price": 400000, "yearBuilt": 2000,
                   "annualPropertyTax": 4800, "annualInsurance": 1800, "monthlyHoa": 0 },
  "investor":    { "downPayment": 80000, "financing": "conventional",
                   "monthlyRent": 3000, "management": "self" },
  "assumptions": { "vacancyRate": 0.05, "maintenanceRate": null, "managementRate": null,
                   "capexRate": null, "interestRate": null, "loanTermYears": null,
                   "monthlyUtilities": null }
}
```

| Field | Required | Rule |
|---|---|---|
| `property.price` | yes | > 0, ≤ 1,000,000,000 |
| `property.yearBuilt` | no | ≥ 1600, and not in the future (domain check) |
| `property.annualPropertyTax`, `annualInsurance`, `monthlyHoa` | no | ≥ 0. Missing tax or insurance counts as $0 and produces a warning |
| `investor.downPayment` | yes | 0 ≤ value ≤ `price` |
| `investor.financing` | yes | `conventional`, `dscr` or `cash` |
| `investor.monthlyRent` | yes | > 0 |
| `investor.management` | yes | `self` or `manager` |
| `assumptions.*Rate` | no | 0 to 1 (fractions, 0.05 = 5%) |
| `assumptions.loanTermYears` | no | whole number, 1 to 50 |
| `assumptions.monthlyUtilities` | no | ≥ 0 |
| `assumptions` (whole section) | no | may be omitted, but not null. Within it, omitted or null fields use the defaults |

## Response (200)

Money is rounded to cents. `annual` is rounded from the unrounded monthly amount × 12, not from the rounded monthly figure.

```json
{
  "income": {
    "grossRent":     { "monthly": 3000, "annual": 36000, "source": "investor" },
    "vacancy":       { "monthly": 150,  "annual": 1800,  "source": "default" },
    "effectiveRent": { "monthly": 2850, "annual": 34200 }
  },
  "expenses": {
    "propertyTax": { "monthly": 400, "annual": 4800, "source": "investor" },
    "insurance":   { "monthly": 150, "annual": 1800, "source": "investor" },
    "hoa":         { "monthly": 0,   "annual": 0,    "source": "default" },
    "utilities":   { "monthly": 0,   "annual": 0,    "source": "default" },
    "maintenance": { "monthly": 300, "annual": 3600, "source": "estimate" },
    "management":  { "monthly": 0,   "annual": 0,    "source": "default" },
    "total":       { "monthly": 850, "annual": 10200 }
  },
  "noi":         { "monthly": 2000, "annual": 24000 },
  "capex":       { "monthly": 150,  "annual": 1800, "source": "default" },
  "debtService": { "monthly": 2128.97, "annual": 25547.62, "source": "default" },
  "cashFlow":    { "monthly": -278.97, "annual": -3347.62 },
  "assumptions": {
    "vacancyRate":      { "value": 0.05, "source": "default" },
    "maintenanceRate":  { "value": 0.1,  "source": "estimate" },
    "managementRate":   { "value": 0.08, "source": "default" },
    "capexRate":        { "value": 0.05, "source": "default" },
    "interestRate":     { "value": 0.07, "source": "default" },
    "loanTermYears":    { "value": 30,   "source": "default" },
    "monthlyUtilities": { "value": 0,    "source": "default" }
  },
  "warnings": []
}
```

- `source` is one of `investor`, `default`, `estimate`, `missing`.
- `assumptions` echoes the resolved values so the advanced-options panel can prefill with defaults and mark the ones the investor changed.
- `managementRate` is returned even for a self-managed property (it applies only if the investor switches to a manager).
- For an all-cash purchase, `interestRate.value` and `loanTermYears.value` are `null`.
- `warnings` is a list of readable messages, for example "Property tax is missing and counted as $0."

## Errors (422)

Every 422 uses FastAPI's shape, so clients handle one format:

```json
{ "detail": [ { "loc": ["body", "investor", "monthlyRent"], "msg": "...", "type": "greater_than" } ] }
```

Domain rules that the schema doesn't catch (for example a future `yearBuilt`) return the same shape with `"loc": ["body"]` and `"type": "value_error"`.

## Not yet decided

- Closing costs, cap rate and cash-on-cash (see the open questions in the logic doc).
- Rent and price are required by both the form and this endpoint (decided 2026-11-21). A rent fallback is a possible later feature.
- A `/v1` path prefix.

## How the frontend calls it

- Code: `frontend/src/lib/api/analysisApi.ts` (client), `src/hooks/useAnalysis.ts` (debounced hook with loading, error and stale-data states), `src/types/calculate.ts` (types mirroring this contract), `src/lib/formatAnalysis.ts` (display strings).
- In development the browser calls `/api/analysis/calculate`, and the Vite dev server (`vite.config.ts`) forwards it to `http://localhost:8000/analysis/calculate`, so no CORS setup is needed. Set `VITE_API_BASE_URL` to call a different backend in a deployed build.
- The results page sends everything the form collects: price, year built, property tax, insurance, HOA, down payment, financing, rent and management. The form requires all of them (HOA may be 0), even though the API treats tax, insurance, HOA and year built as optional. If a caller leaves tax or insurance out, the response warns that it is missing and counted as $0.
