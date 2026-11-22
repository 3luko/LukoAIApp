---
name: financial-calculations
description: Write or change a financial calculation in the LukoAI backend (cash flow, NOI, mortgage, cap rate, cash-on-cash). Use when adding or editing anything in backend/app/domain/. Changing a formula or a default assumption needs the developer's approval. To stress-test an existing formula, use financial-logic-validation.
---
# Financial calculations

1. **Rules first.** The formula, defaults and boundary cases live in `docs/logic/`. If they aren't written and approved, propose them and wait. Changing an approved formula or default needs approval too.
2. Pure functions in `backend/app/domain/`: no HTTP, database or AI imports. Same input, same output, input not mutated. Never let an LLM generate an authoritative number.
3. Separate assumptions from formulas: defaults go in `assumptions.py` as named constants, formulas in their own functions.
4. Units are explicit: rates are fractions (0.05 = 5%), amounts say monthly or annual in the name, annual = monthly × 12.
5. Validate and raise `ValueError` for zero, negative, out-of-range and impossible input (rent ≤ 0, price ≤ 0, rate outside 0 to 1, future year built). Avoid division by zero (0% interest, no loan).
6. **Never silently invent missing data.** Missing tax or insurance is `0` with source `missing`, and the UI flags it. Tag every number with its source: `investor`, `default`, `estimate` or `missing`.
7. Rounding: compute unrounded, round to cents once at the API response, never in between.
8. Test each function on its own (see `test-generator`), with hand-computed expected values. Then run `financial-logic-validation` on anything substantial.
9. Update `docs/logic/` so the doc and the code agree.

Example: `calculate_cash_flow` builds the result from small functions (`mortgage_payment`, `maintenance_rate`, `effective_monthly_rent`) and never touches the network.
