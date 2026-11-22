"""Expense helpers. Pure functions, no I/O."""

from app.domain.assumptions import (
    MAINTENANCE_BANDS,
    MAINTENANCE_RATE_OLDEST,
    MAINTENANCE_RATE_UNKNOWN_AGE,
)


def property_age(year_built: int, current_year: int) -> int:
    age = current_year - year_built
    if age < 0:
        raise ValueError("year_built cannot be in the future")
    return age


def maintenance_rate(age: int | None) -> float:
    """Maintenance as a fraction of monthly rent, from the property's age in years."""
    if age is None:
        return MAINTENANCE_RATE_UNKNOWN_AGE
    if age < 0:
        raise ValueError("age cannot be negative")
    for highest_age, rate in MAINTENANCE_BANDS:
        if age <= highest_age:
            return rate
    return MAINTENANCE_RATE_OLDEST


def monthly_amount(annual: float) -> float:
    if annual < 0:
        raise ValueError("annual amount cannot be negative")
    return annual / 12
