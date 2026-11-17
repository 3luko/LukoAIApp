# LukoAI

LukoAI is a real estate ownership intelligence platform for **first-time property investors** evaluating a rental property (cash flow, returns, risk). The product is investor-only; there is no homebuyer experience. Don't add homebuyer features (primary residence affordability, credit score inputs, owner-occupied financing) unless the developer asks.

## Architecture

```
frontend/   React 19 + TypeScript + Tailwind v4 + react-router + Vite   (exists)
backend/    Python + FastAPI                                             (planned)
```
- Planned services: PostgreSQL (still under consideration), the RentCast API for property data, and Google Gemini Flash for written summaries.
- API keys stay in the backend. The frontend never calls RentCast or Gemini directly.
- The frontend currently shows **mock data only** (`frontend/src/data/`), and it's labeled as sample data in the UI.
- Conventions live in `.claude/rules/frontend.md` and `.claude/rules/backend.md`.

## Commands (run in `frontend/`)
- `npm run dev`: start the dev server
- `npm run build`: type-check, then build. Run this before saying frontend work is finished.
- `npm run lint`

## Learning-first workflow

The developer is building LukoAI to grow as a software engineer, so split the work like this:

**Claude handles:** boilerplate, UI scaffolding and styling, formatting, straightforward refactors, repetitive test setup, docs, and other tedious, low-risk tasks. Do these efficiently, without turning them into lessons.

**The developer handles:** business logic, financial calculations, API design and implementation, architecture decisions, important React behavior, state management and data flow, and debugging.

When the developer asks for help with something they own:
1. Briefly explain the approach.
2. Ask guiding questions when they help.
3. Give hints before full solutions, and keep code snippets short unless a full implementation is explicitly requested.
4. Encourage them to write the important logic themselves, then review it and explain possible improvements.

If a delegated task touches code the developer owns, scaffold around it and leave a `// TODO(you): <hint>` comment (Python: `# TODO(you):`). Don't fill it in.

**Never make significant architectural decisions alone.** This includes new dependencies, folder structure, state libraries, database or schema choices, API contracts and auth. Propose the change and wait for approval. The `architecture-decision` skill covers how.

## Models and delegation

- The main conversation model is set in `.claude/settings.json` (`opusplan`: Opus in plan mode, Sonnet otherwise). This file can't change the model. The developer switches by hand with `/model`.
- Delegate to a subagent when a task clearly matches its job, choosing the cheapest one that can do it reliably:

| Subagent | Model | Use for |
|---|---|---|
| `chore-runner` | haiku | formatting, docs, renames, repetitive styling |
| `ui-scaffolder` | sonnet | presentational components, layout, theming |
| `code-reviewer` | sonnet | reviewing the developer's changes (read-only) |
| `architecture-reviewer` | opus | architecture, security, reviewing financial logic (read-only) |

- Handle routine React/TypeScript work and debugging in the main conversation. Don't delegate a task that's faster to do directly.
- Skills: `architecture-decision`, `learning-review`, `test-planning` and `financial-logic-validation`.
