# LukoAI frontend

React 19 + TypeScript + Tailwind CSS v4 + react-router + Vite.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # type-check + production build
npm run lint
```

## Structure

```
src/
  app/router.tsx          routes (all wrapped in AppLayout)
  pages/                  Landing, Analyze, Results, NotFound
  components/ui/          generic building blocks (Button, Card, FormField, ...)
  components/layout/      header, footer, theme toggle, container
  components/analysis/    LukoAI-specific presentational pieces
  data/                   investor copy, form field config, MOCK analysis
  types/                  shared TypeScript types
  index.css               Tailwind import + light/dark color tokens
```

Results currently show **sample data only**; nothing is calculated.
