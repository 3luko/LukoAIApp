"""Default assumptions, kept as data. Every value here is editable by the investor.

These are starting points approved on 2026-11-21, not market facts. Review them
periodically. See docs/logic/rental-income-and-cash-flow.md.
"""

from typing import Final

DEFAULT_VACANCY_RATE: Final = 0.05
DEFAULT_MANAGEMENT_RATE: Final = 0.08
DEFAULT_CAPEX_RATE: Final = 0.05
DEFAULT_UTILITIES_MONTHLY: Final = 0.0  # tenant pays; room to estimate later
DEFAULT_LOAN_TERM_YEARS: Final = 30

DEFAULT_INTEREST_RATES: Final[dict[str, float]] = {
    "conventional": 0.07,
    "dscr": 0.0775,
}

# Maintenance as a share of monthly rent, by property age.
# Each band is (highest age in years, inclusive; rate).
MAINTENANCE_BANDS: Final[tuple[tuple[int, float], ...]] = (
    (10, 0.05),
    (25, 0.07),
    (50, 0.10),
)
MAINTENANCE_RATE_OLDEST: Final = 0.12  # older than the last band (51+ years)
MAINTENANCE_RATE_UNKNOWN_AGE: Final = 0.10  # conservative when year built is missing
