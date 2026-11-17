---
paths:
  - "frontend/**/*.{ts,tsx,css}"
---
# Frontend rules
- Use TypeScript types for API contracts and handle loading, missing data, and error states.
- Favor small reusable React components and accessible controls.
- For unfamiliar React patterns, explain the concept briefly and leave meaningful implementation work for me.
- Do not hardcode financial verdicts or API secrets in the frontend.

## Structure (`frontend/src/`)
- `app/`: the root App and route definitions (react-router).
- `pages/`: one component per route. Pages compose other components and hold as little logic as possible.
- `components/ui/`: generic building blocks (Button, Card, Badge, FormField). They know nothing about LukoAI.
- `components/layout/`: the app shell (header, footer, container, theme toggle).
- `components/analysis/`: presentational pieces specific to LukoAI. They receive data through props and don't fetch anything.
- `data/`: mock data, always labeled as sample data in the UI. `types/`: shared TypeScript types.

## Styling
- Use Tailwind v4 only. Avoid component CSS files.
- Use the semantic color tokens defined in `src/index.css` (`bg-bg`, `bg-surface`, `text-fg`, `text-muted`, `border-border`, `bg-accent`, ...). Don't use raw palette colors, so light and dark mode both keep working.
- Dark mode is the default. Theme switching uses the `dark` class on `<html>`.
- Design for mobile first, then add `sm:`/`md:`/`lg:` breakpoints.
