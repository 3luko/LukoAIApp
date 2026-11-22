---
name: test-generator
description: Generate tests for existing or new LukoAI code (pytest for the backend). Use after implementing a function or endpoint, or to add regression tests. For planning edge cases before the implementation exists, use test-planning.
---
# Test generator

1. State the expected behavior in one or two lines per function before writing tests. Read the rules in `docs/logic/` for financial code.
2. Cover three groups: **positive** (a realistic, hand-computed case), **negative** (invalid input raises or returns 422), **boundary** (band edges, 0 and 1 rates, 0 loan, 0% interest, exactly at and just beyond limits).
3. Follow the existing conventions: `backend/tests/` mirrors the app layers (`domain/`, `services/`, `api/`), `pytest.approx` for floats, `@pytest.mark.parametrize` for boundary tables, one behavior per test with a descriptive name.
4. Compute expected values by hand or from a known reference. Never with the function under test.
5. Add invariants for financial code: identities (cash flow = NOI − capex − debt service), direction (more rent means more cash flow), annual = monthly × 12, override equal to default changes nothing, input not mutated.
6. No live RentCast or Gemini calls. Mock network clients.
7. **Don't edit a test to make it pass.** If a test fails, decide whether the test or the code is wrong, say which, and report a code defect to the developer.
8. There's no frontend test runner yet. Adding one is a new dependency and needs approval.
9. Run `python -m pytest` in `backend/` and report the real result.
