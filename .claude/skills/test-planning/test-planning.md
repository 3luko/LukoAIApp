---
name: test-planning
description: Help plan edge cases and scaffold tests without taking over the core implementation.
---
# Test planning
1. Ask what behavior and invariants the feature must satisfy.
2. Propose a compact test matrix: happy path, invalid inputs, boundaries, missing data, API failures.
3. Let me attempt key assertions before generating full test suites.
4. Scaffold fixtures and repetitive parametrized tests when requested.
5. Do not call live RentCast or Gemini from unit tests.
