---
paths:
  - "backend/**/*.py"
---
# Backend rules
- Prefer thin FastAPI routes, Pydantic schemas, explicit services, and pure domain functions.
- Keep business rules and calculations independent of HTTP, ORM, and AI provider code.
- For financial logic, propose the formula, default assumptions and boundary cases for my approval first, then implement and test them. The rules are recorded in `docs/logic/`.
- Use typed Python and pytest; mock network calls in tests.
- Avoid implementing large features without a small agreed plan.
