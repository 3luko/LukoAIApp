---
paths:
  - "backend/**/*.py"
---
# Backend rules
- Prefer thin FastAPI routes, Pydantic schemas, explicit services, and pure domain functions.
- Keep business rules and calculations independent of HTTP, ORM, and AI provider code.
- When introducing financial logic, ask me to propose the formula and boundary cases first.
- Use typed Python and pytest; mock network calls in tests.
- Avoid implementing large features without a small agreed plan.
