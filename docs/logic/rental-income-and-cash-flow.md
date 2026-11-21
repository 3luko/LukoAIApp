# Rental income and cash flow logic

- **Status:** Draft (the developer's design notes, written up; nothing here is implemented yet)
- **Date:** 2026-11-21
- **Owner:** the developer writes the calculations. This document records the rules they chose.

## Goals

Estimate a rental property's monthly rent and monthly cash flow for a first-time investor. Every assumption is visible, and the investor can change it.

## 1. Monthly rental income

Comparable rents in the same city or neighborhood would give the best estimate. Each comparable lookup costs API credits (see [0001](../decisions/0001-address-lookup-on-demand.md)), so the app does not fetch them automatically.

Sources, in priority order:

| Priority | Source | Confidence label |
|---|---|---|
| 1 | The investor enters the monthly rent | Investor-provided |
| 2 | Rent per square foot (when no other data exists) | **Lower confidence** |

- The rent input is available on the analysis form.
- The estimate by rent per square foot is always labeled "Lower confidence" in the UI.
- TODO(you): where does the rent-per-square-foot figure come from (a fixed default, the city, user input)? How is it combined with the property's square footage?

## 2. Maintenance percentage

Used when we can't tell whether the house was recently renovated.

```
propertyAge = currentYear - yearBuilt
```

| Property age | Maintenance (% of ...) |
|---|---|
| 0-10 years | 5% |
| 11-25 years | 7% |
| 26-50 years | 10% |
| 50+ years | 12% |

- TODO(you): decide what the percentage applies to (monthly rent, property value, or annual rent). The result changes a lot depending on the base.
- TODO(you): the table says "26-50" and "50+". Decide which band a 50-year-old property falls in, and write the boundaries as exact ranges.
- If renovation data exists later, it should override the age band.

## 3. Monthly expense lines

| Line | How it's calculated | Source |
|---|---|---|
| Insurance | `annualPremium / 12` | Investor or estimate |
| Utilities | Estimate | Estimate (landlord-paid utilities only) |
| HOA | Property data | Property record |
| Property taxes | Annual tax / 12 | Property data |
| Vacancy | Percentage of rent | Default, editable |
| Operating expenses | TODO(you) | Default, editable |
| Mortgage payment | TODO(you) | Loan inputs, editable |
| CapEx (major repairs) | TODO(you) | Default, editable |

- TODO(you): define each line's unit (monthly or annual) and its default value.
- TODO(you): the cash flow formula itself:
  `monthlyCashFlow = effectiveRent - (all monthly expense lines)`. Decide how vacancy enters (reducing income, or listed as an expense).

## 4. Results page behavior

The results page shows everything computed from the defaults above.

1. **Defaults first.** The investor sees the full results without touching any setting.
2. **Advanced options.** A section lets the investor change vacancy, operating expenses, mortgage payment, CapEx, and the other assumptions. Results update when they change.
3. **Card hover.** Hovering over a result card shows:
   - a plain-language explanation of that card, and
   - a button (visible only on hover) that opens the advanced factors for that specific calculation.
4. **Accessibility.** Hover-only controls need a keyboard equivalent: the button and explanation must also appear on keyboard focus, and on touch devices, where hover doesn't exist, they need a tap alternative.

## Open questions

1. ~~Where do user overrides live?~~ Proposed in [0002](../decisions/0002-stateless-calculation-and-shareable-analyses.md): overrides are held in component state and sent to a stateless backend calculation endpoint. This still needs approval.
2. Should an overridden value be marked in the UI, so the investor can tell their number from the default?
3. Can the investor reset a single value, or all of them, to the defaults?
4. Does property management (a percentage of rent) belong in the default expenses?
5. What does "Utilities = estimate" use as its basis?
