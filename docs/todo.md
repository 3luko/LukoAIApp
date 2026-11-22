# TODO

## How it works (landing page)

The landing page has a **disabled "How it works" button** marked "Coming soon". It isn't a link, because there's nothing to open yet. Build the feature, then turn the button into a real link.

Decide what it should be (a page, a section, or a short walkthrough). The copy that used to be on the landing page, saved here so it isn't lost:

- **Three steps to a clearer decision**
  1. *Enter the property:* the address, listing price, and property type you are considering.
  2. *Add rent and financing:* your down payment, financing type, reserves, and expected rent.
  3. *Get a clear analysis:* cash flow, return indicators, and risks, explained in plain language.
- **Built for investors:** LukoAI focuses on the questions first-time investors ask: will this property pay for itself, and what could go wrong?

## Design follow-ups

- Remove the unused `ExperienceCard` and `PropertySummaryCard` components, or keep `PropertySummaryCard` for the RentCast lookup (see decision 0001).
- When the results page uses real numbers, make sure tone-colored values carry a sign or label (for example "−$140", "Negative"), so meaning never depends on color alone.
