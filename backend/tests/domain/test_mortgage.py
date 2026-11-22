import pytest

from app.domain.mortgage import mortgage_payment


def test_known_payment() -> None:
    # $320,000 at 7% over 30 years is about $2,128.97 a month.
    assert mortgage_payment(320_000, 0.07, 30) == pytest.approx(2128.97, abs=0.01)


def test_zero_interest_splits_the_loan_evenly() -> None:
    assert mortgage_payment(120_000, 0, 10) == pytest.approx(1000)


def test_no_loan_means_no_payment() -> None:
    assert mortgage_payment(0, 0.07, 30) == 0


def test_payments_over_the_term_exceed_the_loan_when_interest_is_positive() -> None:
    assert mortgage_payment(100_000, 0.07, 30) * 360 > 100_000


@pytest.mark.parametrize(
    ("loan", "rate", "term"),
    [(-1, 0.07, 30), (100_000, -0.01, 30), (100_000, 1.01, 30), (100_000, 0.07, 0)],
)
def test_invalid_inputs_raise(loan: float, rate: float, term: int) -> None:
    with pytest.raises(ValueError):
        mortgage_payment(loan, rate, term)
