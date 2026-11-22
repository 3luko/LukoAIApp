"""Rent calculations. Pure functions, no I/O."""


def effective_monthly_rent(monthly_rent: float, vacancy_rate: float) -> float:
    """Rent left after vacancy. `vacancy_rate` is a fraction (0.05 = 5%)."""
    if monthly_rent <= 0:
        raise ValueError("monthly_rent must be greater than 0")
    if not 0 <= vacancy_rate <= 1:
        raise ValueError("vacancy_rate must be between 0 and 1")
    return monthly_rent * (1 - vacancy_rate)
