# TODO

## How it works (landing page)

The landing page has a **disabled "How it works" button** marked "Coming soon". It isn't a link, because there's nothing to open yet. Build the feature, then turn the button into a real link.

Decide what it should be (a page, a section, or a short walkthrough). The copy that used to be on the landing page, saved here so it isn't lost:

- **Three steps to a clearer decision**
  1. *Enter the property:* the address, listing price, and property type you are considering.
  2. *Add rent and financing:* your down payment, financing type, reserves, and expected rent.
  3. *Get a clear analysis:* cash flow, return indicators, and risks, explained in plain language.
- **Built for investors:** LukoAI focuses on the questions first-time investors ask: will this property pay for itself, and what could go wrong?

## Results page follow-ups

### 1. Collect property tax, insurance, HOA and year built (do this first)

Right now the form asks for only price, down payment, financing, rent and management. The results page therefore warns that property tax and insurance are missing, and the headline cash flow looks better than it really is (a missing cost counts as $0).

- **Add optional form fields:** annual property tax, annual insurance, monthly HOA, and year built. The backend already accepts them (`annualPropertyTax`, `annualInsurance`, `monthlyHoa`, `yearBuilt`), so no backend change is needed.
- **Why year built matters:** without it, maintenance falls back to a conservative 10% estimate instead of the age-based rate.
- **Touches:** `types/form.ts`, `data/formFields.ts`, `lib/validateInvestorForm.ts` (including the `isInvestorFormValues` check), `AnalyzePage.tsx` (the conversion to numbers), `InputSummaryCard.tsx`, and `buildCalculateRequest` in `lib/api/analysisApi.ts`.
- **Decide first:** are these fields required, or optional with the "missing" warning kept? Optional matches the backend contract.
- **Later:** the RentCast lookup (decision 0001) could fill these in automatically.
> Prompt: "Add optional property tax, insurance, HOA and year built fields to the analyze form and send them to the calculate endpoint. Validate them, show them on the inputs card, and make the missing-cost warning disappear when they are filled in."

### 2. Advanced options and card hover explanations

The "Assumptions used" card shows the defaults, but the investor can't change them yet. Each result card should show a plain-language explanation on hover (and keyboard focus), plus a hover-only button that opens the advanced factors for that calculation. `useAnalysis` already accepts an `assumptions` argument and debounces changes, so the editing UI is the main work. Mark values the investor changed, and decide whether they can reset one value or all of them. Offer two testable drafts first.
> Prompt: "Build the advanced options panel and the result card hover explanations. Give me two drafts to test first (ui-draft-options)."

### 3. More metrics

Cap rate, cash-on-cash return, DSCR and break-even rent aren't calculated yet, so they're not shown. Cap rate and cash-on-cash need a closing-cost assumption, so decide that first. The summary, risks and next steps on the results page are still sample content until the written summary exists.
> Prompt: "Propose the formulas, defaults and boundary cases for cap rate and cash-on-cash, including closing costs."

## Design follow-ups

- Remove the unused `ExperienceCard` and `PropertySummaryCard` components, or keep `PropertySummaryCard` for the RentCast lookup (see decision 0001).
- When the results page uses real numbers, make sure tone-colored values carry a sign or label (for example "−$140", "Negative"), so meaning never depends on color alone.
