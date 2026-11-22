---
name: code-cleanup
description: Tidy LukoAI code without changing behavior - remove duplication, improve naming and readability, delete dead code. Use after a feature works. A major refactor (moving modules, changing structure) needs the developer's approval first.
---
# Code cleanup

1. Make sure tests pass and the build is green first. That's the baseline.
2. Scope it to the files in the change. Don't wander.
3. Remove duplication only when two places really share logic. Don't add an abstraction for a single use.
4. Improve names, split long functions, delete dead code and leftover debug output (`console.log`, commented-out blocks). Check that code is really unused (grep) before deleting it.
5. Preserve behavior exactly. Don't change formulas, defaults, API shapes or UI behavior as part of a cleanup.
6. **Propose and wait for approval** before: moving or renaming modules across layers, changing folder structure, replacing a pattern project-wide, or deleting substantial functionality.
7. Re-run the tests, `npm run build` and `npm run lint`. Keep the diff small and say what changed.

LukoAI example: after `ResultsPage` receives its data, check whether `PropertySummaryCard` is still used. If nothing imports it, propose deleting it and let the developer decide.
