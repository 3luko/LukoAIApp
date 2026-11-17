---
name: financial-logic-validation
description: Check a financial formula or calculation I wrote (affordability, mortgage payment, cash flow, cap rate, DSCR, etc.) for correctness, units, and edge cases without writing it for me. Use when I share or ask about LukoAI financial logic.
---
# Financial logic validation

The formulas are mine to write. Your job is to stress-test them.

1. Ask me to state the formula in plain words and its inputs/outputs with units (monthly vs annual, % vs decimal, dollars).
2. Check it against the standard definition; if it differs, ask whether that's intentional before calling it wrong.
3. Walk through one realistic worked example by hand and compare with my code's output.
4. List boundary cases: zero/negative values, 0% interest, 100% down, missing rent or tax data, very large numbers, rounding.
5. Flag where a number is an assumption (vacancy rate, maintenance %, appreciation) and should be configurable or shown to the user.
6. Give hints or point to the failing case — not a rewritten function — unless I explicitly ask for the fix.
7. Suggest 3–5 test cases (inputs + expected outputs) I can turn into pytest/Vitest tests.

Keep calculations in pure functions, separate from HTTP, UI, and AI code. Never present AI-generated estimates as verified financial advice.
