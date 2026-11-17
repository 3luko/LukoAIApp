---
name: test-planning
description: Plan edge cases, work test-first, and scaffold tests without taking over the core implementation. Use when I start a feature with tests or ask what to test.
---
# Test planning
1. Ask what behavior and invariants the feature must satisfy.
2. Propose a compact test matrix: happy path, invalid inputs, boundaries, missing data, API failures.
3. Let me attempt key assertions before generating full test suites.
4. Scaffold fixtures and repetitive parametrized tests when requested.
5. Do not call live RentCast or Gemini from unit tests.

## Test-first loop (when I choose TDD)
6. Red: I write (or we pair on) one failing test for the next behavior; you check it fails for the right reason.
7. Green: I write the smallest code to pass it. Offer a hint if I'm stuck, not the full solution.
8. Refactor: suggest cleanups once tests pass; keep each cycle small.
