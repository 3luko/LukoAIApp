---
paths:
  - "frontend/**/*.{ts,tsx,css}"
---
# Frontend rules
- Use TypeScript types for API contracts and handle loading, missing data, and error states.
- Favor small reusable React components and accessible controls.
- Implement React work directly, including state and data flow. Explain a pattern only when asked or when the choice is non-obvious.
- Do not hardcode financial verdicts or API secrets in the frontend.

## Structure (`frontend/src/`)
- `app/`: the root App and route definitions (react-router).
- `pages/`: one component per route. Pages compose other components and hold as little logic as possible.
- `components/ui/`: generic building blocks (Button, Card, Badge, FormField). They know nothing about LukoAI.
- `components/layout/`: the app shell (header, footer, container, wordmark).
- `components/analysis/`: presentational pieces specific to LukoAI. They receive data through props and don't fetch anything.
- `data/`: mock data, always labeled as sample data in the UI. `types/`: shared TypeScript types.

## Styling
Design direction: dark-only **Graphite & Silver**, monospace-first, minimal. Decided in `docs/decisions/0003-graphite-silver-dark-ui.md`.
- Use Tailwind v4 only. Avoid component CSS files.
- There is one theme (dark). No light theme, no theme switching, no `dark:` variants.
- Design tokens (color, typography, radius, motion) live in `src/index.css`. Use the semantic tokens (`bg-bg`, `bg-surface`, `text-fg`, `text-muted`, `text-subtle`, `border-border`, `bg-accent`, `rounded-card`, `rounded-control`, ...). Never hardcode hex values or raw palette colors in components.
- Monospace is the identity: JetBrains Mono is the default font. Use `font-sans` only for long explanatory text. Financial values use `tabular-nums`.
- Keep it minimal: no shadows, gradients or decoration, single 1px borders, generous whitespace.
- Motion is smooth and purposeful: animate `transform` and `opacity` (plus blur on the landing wordmark), use the motion tokens, and respect `prefers-reduced-motion`. Page transitions use the View Transitions API via React Router's `viewTransition` prop, not a library. The landing wordmark's entrance is a CSS-only fade and shift (`wordmark-enter` in `src/index.css`).
- Champagne gold (`focus`, `focus-ring` tokens) is only for the focus state of form fields: a gold border, a soft ring and label. Never use it for buttons, backgrounds or decoration, and an invalid field keeps its red border while focused.
- Semantic colors (positive, caution, negative) are only for outcomes, warnings and errors. Always pair them with text or a sign so color is never the only signal.
- Design for mobile first, then add `sm:`/`md:`/`lg:` breakpoints.
