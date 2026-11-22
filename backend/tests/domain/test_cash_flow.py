from dataclasses import replace

import pytest

from app.domain.cash_flow import calculate_cash_flow
from app.domain.models import CashFlowInputs

CURRENT_YEAR = 2026


def make_inputs(**overrides: object) -> CashFlowInputs:
    """A 26-year-old property: $400k, $80k down, conventional loan, self-managed."""
    base = CashFlowInputs(
        price=400_000,
        down_payment=80_000,
        financing="conventional",
        monthly_rent=3000,
        year_built=2000,
        managed=False,
        annual_property_tax=4800,
        annual_insurance=1800,
    )
    return replace(base, **overrides)


def test_hand_computed_financed_case() -> None:
    # rent 3000, vacancy 5% -> effective 2850
    # tax 400 + insurance 150 + maintenance 10% (age 26) = 300 -> operating 850
    # NOI = 2850 - 850 = 2000
    # capex 5% = 150, mortgage on $320k at 7% for 30 years = 2128.97
    result = calculate_cash_flow(make_inputs(), CURRENT_YEAR)

    assert result.effective_rent == pytest.approx(2850)
    assert result.property_tax.monthly == pytest.approx(400)
    assert result.insurance.monthly == pytest.approx(150)
    assert result.maintenance.monthly == pytest.approx(300)
    assert result.operating_expenses == pytest.approx(850)
    assert result.noi == pytest.approx(2000)
    assert result.capex.monthly == pytest.approx(150)
    assert result.debt_service.monthly == pytest.approx(2128.97, abs=0.01)
    assert result.cash_flow == pytest.approx(-278.97, abs=0.01)
    assert result.annual_cash_flow == pytest.approx(-278.97 * 12, abs=0.12)


def test_all_cash_purchase_has_no_debt_service() -> None:
    result = calculate_cash_flow(
        make_inputs(financing="cash", down_payment=400_000), CURRENT_YEAR
    )

    assert result.debt_service.monthly == 0
    assert result.cash_flow == pytest.approx(1850)  # NOI 2000 - capex 150


def test_down_payment_covering_the_price_means_no_debt_service() -> None:
    result = calculate_cash_flow(make_inputs(down_payment=400_000), CURRENT_YEAR)

    assert result.debt_service.monthly == 0


def test_property_manager_adds_eight_percent_of_rent() -> None:
    self_managed = calculate_cash_flow(make_inputs(), CURRENT_YEAR)
    managed = calculate_cash_flow(make_inputs(managed=True), CURRENT_YEAR)

    assert self_managed.management.monthly == 0
    assert managed.management.monthly == pytest.approx(240)
    assert managed.cash_flow == pytest.approx(self_managed.cash_flow - 240)


def test_hoa_and_utilities_reduce_cash_flow() -> None:
    base = calculate_cash_flow(make_inputs(), CURRENT_YEAR)
    result = calculate_cash_flow(
        make_inputs(monthly_hoa=100, monthly_utilities=50), CURRENT_YEAR
    )

    assert result.cash_flow == pytest.approx(base.cash_flow - 150)


def test_dscr_loan_uses_a_higher_default_rate_than_conventional() -> None:
    conventional = calculate_cash_flow(make_inputs(), CURRENT_YEAR)
    dscr = calculate_cash_flow(make_inputs(financing="dscr"), CURRENT_YEAR)

    assert dscr.debt_service.monthly > conventional.debt_service.monthly


# --- overrides ---------------------------------------------------------------


def test_zero_vacancy_override_keeps_full_rent() -> None:
    result = calculate_cash_flow(make_inputs(vacancy_rate=0), CURRENT_YEAR)

    assert result.effective_rent == pytest.approx(3000)
    assert result.vacancy.source == "investor"


def test_override_equal_to_default_matches_no_override() -> None:
    plain = calculate_cash_flow(make_inputs(), CURRENT_YEAR)
    explicit = calculate_cash_flow(
        make_inputs(
            vacancy_rate=0.05,
            capex_rate=0.05,
            interest_rate=0.07,
            loan_term_years=30,
            monthly_utilities=0,
        ),
        CURRENT_YEAR,
    )

    assert explicit.cash_flow == pytest.approx(plain.cash_flow)


def test_interest_rate_override_changes_debt_service() -> None:
    result = calculate_cash_flow(make_inputs(interest_rate=0.05), CURRENT_YEAR)

    assert result.debt_service.source == "investor"
    assert result.debt_service.monthly < 2128.97


def test_maintenance_rate_override_replaces_the_age_band() -> None:
    result = calculate_cash_flow(make_inputs(maintenance_rate=0.2), CURRENT_YEAR)

    assert result.maintenance.monthly == pytest.approx(600)
    assert result.maintenance.source == "investor"


# --- sources -----------------------------------------------------------------


def test_sources_distinguish_investor_default_estimate_and_missing() -> None:
    result = calculate_cash_flow(
        make_inputs(annual_property_tax=None), CURRENT_YEAR
    )

    assert result.rent.source == "investor"
    assert result.vacancy.source == "default"
    assert result.utilities.source == "default"
    assert result.maintenance.source == "estimate"
    assert result.insurance.source == "investor"
    assert result.property_tax.source == "missing"
    assert result.property_tax.monthly == 0


def test_unknown_year_built_uses_conservative_maintenance() -> None:
    result = calculate_cash_flow(make_inputs(year_built=None), CURRENT_YEAR)

    assert result.maintenance.monthly == pytest.approx(300)  # 10% of 3000
    assert result.maintenance.source == "estimate"


# --- invariants --------------------------------------------------------------


def test_more_rent_means_more_cash_flow() -> None:
    low = calculate_cash_flow(make_inputs(monthly_rent=2500), CURRENT_YEAR)
    high = calculate_cash_flow(make_inputs(monthly_rent=3500), CURRENT_YEAR)

    assert high.cash_flow > low.cash_flow


def test_higher_property_tax_means_less_cash_flow() -> None:
    low = calculate_cash_flow(make_inputs(annual_property_tax=3000), CURRENT_YEAR)
    high = calculate_cash_flow(make_inputs(annual_property_tax=6000), CURRENT_YEAR)

    assert high.cash_flow < low.cash_flow


def test_cash_flow_identity() -> None:
    result = calculate_cash_flow(make_inputs(managed=True, monthly_hoa=75), CURRENT_YEAR)

    assert result.noi == pytest.approx(result.effective_rent - result.operating_expenses)
    assert result.cash_flow == pytest.approx(
        result.noi - result.capex.monthly - result.debt_service.monthly
    )


def test_operating_expenses_are_the_sum_of_their_lines() -> None:
    result = calculate_cash_flow(
        make_inputs(managed=True, monthly_hoa=75, monthly_utilities=40), CURRENT_YEAR
    )

    lines = [
        result.property_tax,
        result.insurance,
        result.hoa,
        result.utilities,
        result.maintenance,
        result.management,
    ]
    assert result.operating_expenses == pytest.approx(sum(l.monthly for l in lines))


def test_annual_values_are_twelve_times_monthly() -> None:
    result = calculate_cash_flow(make_inputs(), CURRENT_YEAR)

    assert result.property_tax.annual == pytest.approx(result.property_tax.monthly * 12)


def test_calculation_does_not_change_its_input() -> None:
    inputs = make_inputs()
    snapshot = replace(inputs)

    calculate_cash_flow(inputs, CURRENT_YEAR)

    assert inputs == snapshot


# --- invalid input -----------------------------------------------------------


@pytest.mark.parametrize(
    "overrides",
    [
        {"monthly_rent": 0},
        {"monthly_rent": -1},
        {"price": 0},
        {"price": -5},
        {"down_payment": -1},
        {"down_payment": 400_001},
        {"vacancy_rate": -0.1},
        {"vacancy_rate": 1.5},
        {"interest_rate": 1.5},
        {"loan_term_years": 0},
        {"year_built": CURRENT_YEAR + 1},
        {"annual_property_tax": -1},
        {"annual_insurance": -1},
        {"monthly_hoa": -1},
        {"monthly_utilities": -1},
        {"capex_rate": -0.01},
        {"management_rate": 1.1},
        {"maintenance_rate": -0.01},
    ],
)
def test_invalid_inputs_raise(overrides: dict[str, object]) -> None:
    with pytest.raises(ValueError):
        calculate_cash_flow(make_inputs(**overrides), CURRENT_YEAR)
