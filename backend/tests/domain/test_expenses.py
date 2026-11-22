import pytest

from app.domain.expenses import maintenance_rate, monthly_amount, property_age


@pytest.mark.parametrize(
    ("age", "expected"),
    [
        (0, 0.05),
        (10, 0.05),
        (11, 0.07),
        (25, 0.07),
        (26, 0.10),
        (50, 0.10),
        (51, 0.12),
        (120, 0.12),
    ],
)
def test_maintenance_rate_band_edges(age: int, expected: float) -> None:
    assert maintenance_rate(age) == expected


def test_maintenance_rate_unknown_age_is_conservative() -> None:
    assert maintenance_rate(None) == 0.10


def test_property_age_is_current_year_minus_year_built() -> None:
    assert property_age(year_built=2000, current_year=2026) == 26


def test_property_age_zero_for_new_build() -> None:
    assert property_age(year_built=2026, current_year=2026) == 0


def test_property_age_rejects_future_year_built() -> None:
    with pytest.raises(ValueError):
        property_age(year_built=2027, current_year=2026)


def test_maintenance_rate_rejects_negative_age() -> None:
    with pytest.raises(ValueError):
        maintenance_rate(-1)


def test_monthly_amount_divides_annual_by_twelve() -> None:
    assert monthly_amount(4800) == 400


def test_monthly_amount_rejects_negative() -> None:
    with pytest.raises(ValueError):
        monthly_amount(-1)
