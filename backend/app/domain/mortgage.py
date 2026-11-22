"""Mortgage payment. Pure functions, no I/O."""


def mortgage_payment(loan: float, annual_rate: float, term_years: int) -> float:
    """Monthly principal-and-interest payment for a fixed-rate loan.

    `annual_rate` is a fraction (0.07 = 7%).
    """
    if loan < 0:
        raise ValueError("loan cannot be negative")
    if not 0 <= annual_rate <= 1:
        raise ValueError("annual_rate must be between 0 and 1")
    if term_years <= 0:
        raise ValueError("term_years must be greater than 0")

    if loan == 0:
        return 0.0

    months = term_years * 12
    if annual_rate == 0:
        return loan / months

    monthly_rate = annual_rate / 12
    return loan * monthly_rate / (1 - (1 + monthly_rate) ** -months)
