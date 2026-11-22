import pytest

from app.domain.rent import effective_monthly_rent


def test_effective_rent_after_vacancy() -> None:
    assert effective_monthly_rent(3000, 0.05) == pytest.approx(2850)


def test_zero_vacancy_keeps_full_rent() -> None:
    assert effective_monthly_rent(3000, 0) == 3000


def test_full_vacancy_leaves_no_income() -> None:
    assert effective_monthly_rent(3000, 1) == 0


@pytest.mark.parametrize("rent", [0, -100])
def test_rent_must_be_positive(rent: float) -> None:
    with pytest.raises(ValueError):
        effective_monthly_rent(rent, 0.05)


@pytest.mark.parametrize("vacancy", [-0.01, 1.01])
def test_vacancy_must_be_between_zero_and_one(vacancy: float) -> None:
    with pytest.raises(ValueError):
        effective_monthly_rent(3000, vacancy)
