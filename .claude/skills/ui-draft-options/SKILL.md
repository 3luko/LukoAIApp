---
name: ui-draft-options
description: Present two testable drafts when deciding a specific UI change or addition, and give UI test notes after any UI work. Use when there's a real layout or interaction choice, such as how the hover card or advanced options panel should work. Skip for trivial tweaks.
---
# UI draft options and test notes

## When there's a real UI choice
1. Say in two lines what's being decided and the two directions (A and B). Don't pick silently.
2. Build **both drafts as working UI** the developer can click, not just descriptions. Keep them small and reuse existing components.
3. Make them switchable without new dependencies: read `?ui=a` or `?ui=b` with react-router's `useSearchParams`. Default to A. Show a small "Draft A / Draft B" label while both exist.
4. Both drafts use the same props and data, so the choice is purely about the UI. Use mock data where the backend doesn't exist yet, labeled as sample data.
5. Give the **test notes** (below) for each draft, plus a short comparison: what each does well, and its risks (accessibility, mobile, complexity).
6. Wait for the developer to choose. After they choose: delete the other draft and the switch, keep the chosen one, run `npm run build` and `npm run lint`.

This mechanism is temporary scaffolding, not a permanent feature. Adding the switch doesn't need approval. Changing the app's structure does.

## UI test notes (after any UI change)
Tell the developer where to test, every time:
- **Run:** `npm run dev` in `frontend/`, and the URL or route to open (including the `?ui=` value for drafts).
- **Steps:** what to click, hover, type or submit.
- **Check:** expected result, mobile and desktop width, keyboard only (Tab, focus visible, hover content also on focus), and loading/error/empty states.
- **Known gaps:** anything still mock data or not wired up.

Example: for the metric card hover, Draft A shows the explanation as a tooltip with a hover-only "Advanced factors" button. Draft B expands the card in place. Test notes say to hover and Tab to the card on `/results`, check the button also shows on focus, and check it at phone width.
