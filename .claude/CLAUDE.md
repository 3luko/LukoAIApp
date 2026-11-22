# LukoAI

LukoAI is a real estate ownership intelligence platform for **first-time property investors** evaluating a rental property (cash flow, returns, risk). The product is investor-only; there is no homebuyer experience. Don't add homebuyer features (primary residence affordability, credit score inputs, owner-occupied financing) unless the developer asks.

## Architecture

```
frontend/   React 19 + TypeScript + Tailwind v4 + react-router + Vite   (exists)
backend/    Python + FastAPI (layered: api/routes → services → domain)   (scaffolded; cash flow domain logic implemented and tested)
```
- Planned services: PostgreSQL (still under consideration), the RentCast API for property data, and Google Gemini Flash for written summaries.
- API keys stay in the backend. The frontend never calls RentCast or Gemini directly.
- The frontend currently shows **mock data only** (`frontend/src/data/`), and it's labeled as sample data in the UI.
- Conventions live in `.claude/rules/frontend.md` and `.claude/rules/backend.md`. Decisions are recorded in `docs/decisions/` and business rules in `docs/logic/`. The UI design direction (dark Graphite & Silver, monospace-first, minimal) is in `.claude/rules/frontend.md`.

## Commands
In `frontend/`:
- `npm run dev`: start the dev server
- `npm run build`: type-check, then build. Run this before saying frontend work is finished.
- `npm run lint`

In `backend/` (Windows; use the virtual environment in `.venv`):
- `.venv/Scripts/python -m pytest`: run the tests. Run this before saying backend work is finished.
- `.venv/Scripts/python -m uvicorn app.main:app --reload`: start the API.

## Collaboration workflow

**The developer is the lead architect and the final decision-maker.** Claude accelerates development and helps the developer grow as an engineer, but doesn't own architecture, business rules or major technical choices. Claude writes code (the project is in development mode, not learning-first), and the developer decides what gets built and how it's structured. An agent's recommendation is never approval. Only the developer's explicit "yes" is.

### Approval required BEFORE
- changing the application architecture, folder or module structure, or state libraries
- adding or replacing dependencies
- changing database schemas or choosing a database
- changing public API contracts (endpoints, request/response shapes)
- changing financial business rules or default assumptions (`docs/logic/`)
- introducing external services, or anything with significant cost or security implications
- changing authentication or authorization
- major refactors, or deleting substantial existing functionality
- hard-to-reverse or outward-facing actions: pushing, deleting branches, force operations

Present proposals in this format, then **stop and wait**:

> **Proposed change:** / **Why it is needed:** / **Files affected:** / **Alternatives:** / **Risks/tradeoffs:** / **Testing approach:** / **Approval required: Yes**

Routine work (components, styling, tests, refactors within a file, bug fixes, docs, commits the developer asks for) doesn't need a check-in.

### How work flows
1. Understand the request and read the relevant code, `docs/decisions/` and `docs/logic/`.
2. Decide whether approval is needed. If yes, present the proposal above and stop.
3. Once approved, implement directly for small work, or delegate to a specialist (below) for larger work.
4. Have `qa-engineer` validate meaningful changes (tests plus build/lint).
5. Have `code-reviewer` examine meaningful changes.
6. Report: results, unresolved issues, decisions needing the developer's attention, and **UI test notes** for UI changes.

Use agents only when specialization pays off. Don't launch four agents for a trivial change. Handle routine React/TypeScript work and debugging in the main conversation when that's faster.

### Learning-oriented collaboration
- For nontrivial features, briefly explain the approach before coding and ask the developer to make the important engineering decisions.
- Handle repetitive boilerplate automatically. Don't turn minor tasks into lessons.
- Keep code changes focused. Don't generate large amounts of code unless it's needed or requested.
- After implementing, explain one or two important technical decisions.
- `learning-review` (a teaching-style review) is opt-in. Use it only when asked.

### UI testing and drafts
- After any UI change, tell the developer where to test it: the command, the route, the steps, and what to check (mobile and desktop width, keyboard, reduced motion for animations, loading/error/empty states).
- When deciding a specific UI change or addition with a real design choice, build **two drafts** the developer can test (switchable with `?ui=a` / `?ui=b`), compare them, wait for the choice, then delete the loser. The `ui-draft-options` skill covers how. Skip this for trivial tweaks.

### Testing expectations
- Backend: pytest, mirroring the app layers in `backend/tests/`. Financial functions need positive, negative and boundary tests (zero, negative, rates at 0 and 1, rounding, invalid or missing data) with hand-computed expected values.
- Frontend: `npm run build` and `npm run lint` must pass. There's no test runner yet. Adding one needs approval.
- Never weaken or edit a test to hide a defect. Mock network calls, and never call live RentCast or Gemini from tests.
- Financial calculations are deterministic and live in backend `domain/`. Never let an LLM produce an authoritative number.

Existing `TODO(you)` stubs in the repo are leftovers from learning-first mode. Fill them in when the related feature is approved.

## Agents and delegation

Subagent models come from each agent's `model:` setting. The main conversation model is set in `.claude/settings.json` (`opusplan`: Opus in plan mode, Sonnet otherwise), and the developer switches it by hand with `/model`. Claude Code doesn't switch models automatically based on task complexity.

| Agent | Model | Use for |
|---|---|---|
| `feature-developer` | sonnet | implementing an **approved** multi-file feature (frontend and/or backend) |
| `backend-specialist` | sonnet | FastAPI routes, Pydantic schemas, services, deterministic financial functions |
| `qa-engineer` | sonnet | writing and running tests, finding missing validation, running build/lint/pytest |
| `code-reviewer` | sonnet | read-only review for correctness, security, duplication, architecture consistency |
| `architecture-reviewer` | opus | read-only advice on architecture, security and financial logic (hard-to-reverse decisions) |
| `ui-scaffolder` | sonnet | presentational components, layout and theming (no state or data flow) |
| `chore-runner` | haiku | formatting, docs, renames, repetitive styling |

Claude picks an agent from its `description`, so choose the cheapest one that can do the job reliably.

## Skills

| Skill | Use when |
|---|---|
| `architecture-decision` | the developer is choosing between designs, or Claude must propose one |
| `financial-calculations` | writing or changing a calculation in `backend/app/domain/` |
| `financial-logic-validation` | stress-testing a formula that already exists |
| `fastapi-endpoint` | adding or changing an endpoint (contract changes need approval) |
| `react-component` | building or changing a React component |
| `ui-draft-options` | a real UI choice needs two testable drafts, or any UI change needs test notes |
| `api-integration` | RentCast, Gemini, or the frontend calling our backend |
| `test-planning` | planning edge cases before the implementation exists |
| `test-generator` | writing tests for existing or new code |
| `code-cleanup` | tidying code without changing behavior |
| `learning-review` | opt-in teaching-style review of the developer's own code |
