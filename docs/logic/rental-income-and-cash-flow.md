# Rental income and cash flow logic

- **Status:** Approved on 2026-11-21 and implemented in `backend/app/domain/`. Defaults are starting points, not market facts.
- **Tests:** `backend/tests/domain/`

## Goals

Estimate a rental property's monthly cash flow for a first-time investor. Every assumption is visible, and the investor can change it.

## Formula

All amounts are monthly. Annual = monthly × 12.

```
effectiveRent     = rent - (rent × vacancyRate)
operatingExpenses = propertyTax + insurance + hoa + utilities + maintenance + management
NOI               = effectiveRent - operatingExpenses
cashFlow          = NOI - capex - debtService
```

| Line | Calculation | Default / source |
|---|---|---|
| Rent | Investor input (required for now) | Investor |
| Vacancy | `rent × vacancyRate` | 5% |
| Property tax | `annualTax / 12` | Investor or property data; **missing = 0, flagged** |
| Insurance | `annualPremium / 12` | Investor or property data; **missing = 0, flagged** |
| HOA | Monthly amount | 0 |
| Utilities | Landlord-paid utilities | $0 (tenant pays). Room to estimate later |
| Maintenance | `rent × rate(age)` | Age bands below |
| Management | `rent × managementRate`, only when "property manager" is chosen | 8% |
| CapEx reserve | `rent × capexRate` | 5% |
| Debt service | Mortgage payment (below) | By financing type |

### Maintenance

`age = currentYear - yearBuilt`

| Property age | Rate (of monthly rent) |
|---|---|
| 0-10 years | 5% |
| 11-25 years | 7% |
| 26-50 years | 10% |
| 51+ years | 12% |

Year built missing: 10% (conservative), marked as an estimate. A future renovation date should override the age band.

### Mortgage

```
loan    = price - downPayment
r       = annualRate / 12
n       = termYears × 12
payment = loan × r / (1 - (1 + r)^-n)        (loan / n when r = 0)
```

- All cash, or a loan of 0: payment is 0.
- Default term 30 years. Default rates: conventional 7.0%, DSCR 7.75%. These are placeholders to review.

## Where each number came from

Each line carries a `source` so the UI can label it:

| Source | Meaning |
|---|---|
| `investor` | Entered or overridden by the investor |
| `default` | One of the default assumptions above |
| `estimate` | Derived by a rule from other data (maintenance from age) |
| `missing` | No data; counted as 0 and should be flagged in the UI |

## Validation (invalid input raises `ValueError`; the API returns 422)

- Rent > 0, price > 0, 0 ≤ down payment ≤ price.
- Every rate between 0 and 1, term > 0, amounts ≥ 0.
- Year built not in the future.

## Decisions

- Maintenance is a percentage of monthly rent.
- Money is `float`, rounded to cents at the API response (not inside the calculation).
- Scope: NOI and cash flow. Cap rate and cash-on-cash need a closing-cost assumption and come next.
- No default rent per square foot, because there's no source for one. Rent is required for now.

## Results page behavior

1. **Defaults first.** The investor sees the full results without touching any setting.
2. **Advanced options.** The investor can change vacancy, operating expenses, mortgage inputs, CapEx and other assumptions, and the results update.
3. **Card hover.** Hovering a result card shows a plain-language explanation and a button (visible only on hover) that opens the advanced factors for that calculation.
4. **Accessibility.** The hover button and explanation must also appear on keyboard focus, with a tap alternative on touch screens.
5. **Overrides.** Values with source `investor` are marked in the UI so the investor can tell them from defaults.

## Open questions

1. How should the rent fallback work when the investor gives no rent (rent per square foot, labeled "Lower confidence")? Where does the rate come from?
2. Should the investor be able to reset one value, or all values, to the defaults?
3. What is the basis for estimating utilities, if landlord-paid utilities are added later?
4. Cap rate and cash-on-cash: what closing-cost assumption?
