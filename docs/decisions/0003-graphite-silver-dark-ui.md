# 0003: Dark-only Graphite & Silver UI, monospace-first

- **Status:** Accepted
- **Date:** 2026-11-22 (landing page revised the same day: see decisions 4 and 5)

## Context

LukoAI should feel like a modern, professional AI property-intelligence platform: neutral, simple and easy to navigate. The first version used a light and dark theme with a teal accent, several decorated landing-page sections, and a theme toggle.

## Decision

1. **Dark only.** One theme, Graphite & Silver. The theme toggle, light variables, `dark:` variant, theme script and theme local-storage key are removed.
2. **Centralized tokens.** Color, typography, radius and motion are defined once in `frontend/src/index.css`. Components use semantic names (`bg-surface`, `text-muted`, `rounded-card`, ...) and never hardcode values. The accent is silver, and teal is gone.
3. **Monospace-first typography.** JetBrains Mono is the default font (wordmark, navigation, headings, buttons, labels, metrics). The system sans font is used only for long explanatory text. It is installed as the self-hosted package `@fontsource-variable/jetbrains-mono`.
4. **Minimal landing page.** One open composition: a large centered wordmark, the tagline "Know the property. Understand the investment.", an "Analyze a property" button, and a disabled "How it works" button marked "Coming soon". Two small static labels balance the corners diagonally: "PROPERTY INTELLIGENCE" (top right) and "INTELLIGENCE IN OWNERSHIP" (bottom left, inside the page and not in the footer). The landing page has no header bar and no divider lines. No cards, illustrations, gradients or extra sections.
5. **Wordmark entrance.** On load the large wordmark starts 80px to the right, slightly oversized and blurred, then glides left into its centered position while sharpening and fading in (1.2 seconds). It doesn't shrink or move into the navigation. (An earlier logo-to-navigation animation was tried and replaced.)
6. **Restrained motion.** Motion stays smooth and purposeful: `transform`, `opacity` and (for the wordmark only) blur, no bouncing, no animation library, and `prefers-reduced-motion` removes it.
7. **Slide + fade page transition.** Between the landing page and the Analyze page the old page fades out while shifting 20px, and the new page fades in while moving 25px, in the opposite direction on the way back (about 520ms). It uses the browser's View Transitions API through React Router's `viewTransition` option, so there is no new dependency, no routing change and no delay to navigation.
8. **Semantic colors stay sparse.** Positive, caution and negative colors mark outcomes, warnings and errors, and always come with text or a sign.
9. **Champagne gold marks focus, and only focus.** A focused form field gets a gold border (`--focus`, `#C9A86C`), a soft 3px ring (`--focus-ring`) and a gold label. Gold is never a brand color, a button color or a background. An invalid field stays red while focused, and disabled fields never turn gold. It is plain CSS (`focus:` and `group-focus-within:`), with no React state.

## How the landing page works

- `AppLayout` hides the header bar and the footer divider on `/`. Every other page keeps its header (small wordmark plus the "Analyze property" link) and footer.
- The entrance is a CSS animation (`wordmark-enter` in `index.css`, timing in `--duration-wordmark`). There is no JavaScript, state or measuring, and it plays each time the landing page mounts.
- The two corner labels are plain text: not links, not buttons, and not part of the footer.

## How the page transition works

- Links with the `viewTransition` prop (the landing page's "Analyze a property" button and the header's logo link) tell React Router to run the page change inside `document.startViewTransition`. The browser snapshots the old page, React renders the new one immediately, and CSS animates the two snapshots (`::view-transition-old(root)` and `::view-transition-new(root)` in `index.css`).
- React Router also replays the transition for the browser's Back and Forward buttons between pages it has already transitioned between.
- `AppLayout` sets `data-page-transition` on `<html>`: going to the landing page is `back`, anything else is `forward`. The CSS reads it to pick the direction.
- Nothing remounts, so the animation can't change form state. Browsers without the API simply navigate instantly. `prefers-reduced-motion` turns the animation off, and the page stays clickable while it runs.

## Options considered

| Decision | Chosen | Alternative |
|---|---|---|
| Font delivery | Self-hosted `@fontsource-variable/jetbrains-mono` (one new dependency, no third-party request) | Google Fonts `<link>`: no dependency, but an external request |
| Animation | A CSS keyframe on the wordmark | An animation library or a scripted logo-to-navigation move: heavier, not justified |
| Theme | Dark only | Keep the toggle: more code and two palettes to keep consistent |

## Consequences

- One new dependency, with the font files bundled in the build.
- Every component must work on the dark palette only, which simplifies testing.
- `ExperienceCard` and `PropertySummaryCard` no longer have a use. Remove them, or keep `PropertySummaryCard` for the property lookup (see 0001).
- Metric values that use tone colors should carry a sign or label in the real data, so meaning never depends on color alone.
- The entrance and the corner labels need a manual check in a browser at desktop, tablet and phone widths, and with reduced motion on.
