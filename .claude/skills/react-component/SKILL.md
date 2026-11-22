---
name: react-component
description: Build or change a React component in the LukoAI frontend. Use when adding a card, form control, panel, page section or other UI piece, for example the results-page metric card with its hover explanation.
---
# React component

1. Look at the nearest existing component first (`components/ui` for generic pieces, `components/analysis` for LukoAI-specific ones) and match its pattern.
2. Pick the right folder. `ui/` knows nothing about LukoAI. `analysis/` is presentational: typed props in, no fetching. Pages compose components and hold little logic.
3. Type the props with a TypeScript interface. Mirror shared shapes from `types/`, don't redefine them.
4. Cover the states that apply: **loading**, **error**, **empty/missing data** (for example `expectedRent` not provided), and the normal state.
5. Accessibility: semantic elements, labels, visible focus. Anything revealed on hover must also appear on keyboard focus and have a touch alternative.
6. Style with Tailwind v4 and the semantic tokens from `src/index.css` (`bg-surface`, `text-muted`, ...). No raw palette colors, no component CSS files. Mobile first.
7. No new dependencies without approval. No financial formulas or verdict text in components.
8. Run `npm run build` and `npm run lint` in `frontend/`.
9. Finish with **UI test notes**: URL, steps, and what to check (see `ui-draft-options`).

When there's a real design choice (layout or interaction), offer two drafts using `ui-draft-options` instead of picking silently.

Example: a metric card takes `{ label, value, hint?, explanation }`, shows the hint on hover and focus, and exposes an "Advanced factors" button on hover and focus that calls an `onOpenAdvanced` prop. The card itself calculates nothing.
