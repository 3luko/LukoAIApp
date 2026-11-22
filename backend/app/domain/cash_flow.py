"""Combines rent and expense lines into monthly cash flow. Pure functions, no I/O.

    effective rent = rent - vacancy
    NOI            = effective rent - operating expenses
    cash flow      = NOI - capex reserve - debt service
"""

from app.domain import assumptions
from app.domain.expenses import maintenance_rate, monthly_amount, property_age
from app.domain.models import (
    Assumption,
    CashFlowInputs,
    CashFlowResult,
    Line,
    ResolvedAssumptions,
    Source,
)
from app.domain.mortgage import mortgage_payment
from app.domain.rent import effective_monthly_rent


def _pick(override: float | None, default: float) -> tuple[float, Source]:
    """The investor's override if given, otherwise the default."""
    if override is None:
        return default, "default"
    return override, "investor"


def _annual_line(annual: float | None) -> Line:
    if annual is None:
        return Line(0.0, "missing")
    return Line(monthly_amount(annual), "investor")


def _monthly_line(monthly: float | None, default: float) -> Line:
    if monthly is None:
        return Line(default, "default")
    return Line(monthly, "investor")


def _validate(inputs: CashFlowInputs) -> None:
    if inputs.monthly_rent <= 0:
        raise ValueError("monthly_rent must be greater than 0")
    if inputs.price <= 0:
        raise ValueError("price must be greater than 0")
    if not 0 <= inputs.down_payment <= inputs.price:
        raise ValueError("down_payment must be between 0 and the price")
    # Check every override, even ones that don't apply (e.g. management when self-managed).
    for rate in (
        inputs.vacancy_rate,
        inputs.maintenance_rate,
        inputs.management_rate,
        inputs.capex_rate,
        inputs.interest_rate,
    ):
        if rate is not None and not 0 <= rate <= 1:
            raise ValueError("rates must be between 0 and 1")
    if inputs.loan_term_years is not None and inputs.loan_term_years <= 0:
        raise ValueError("loan_term_years must be greater than 0")
    for amount in (
        inputs.annual_property_tax,
        inputs.annual_insurance,
        inputs.monthly_hoa,
        inputs.monthly_utilities,
    ):
        if amount is not None and amount < 0:
            raise ValueError("amounts cannot be negative")


def calculate_cash_flow(inputs: CashFlowInputs, current_year: int) -> CashFlowResult:
    """Monthly cash flow with a line-by-line breakdown. Raises ValueError on bad input."""
    _validate(inputs)
    rent = inputs.monthly_rent

    vacancy_rate, vacancy_source = _pick(inputs.vacancy_rate, assumptions.DEFAULT_VACANCY_RATE)
    vacancy = Line(rent * vacancy_rate, vacancy_source)
    effective_rent = effective_monthly_rent(rent, vacancy_rate)

    if inputs.maintenance_rate is None:
        age = None if inputs.year_built is None else property_age(inputs.year_built, current_year)
        maintenance_value, maintenance_source = maintenance_rate(age), "estimate"
    else:
        maintenance_value, maintenance_source = inputs.maintenance_rate, "investor"
    maintenance = Line(rent * maintenance_value, maintenance_source)

    management_value, management_source = _pick(
        inputs.management_rate, assumptions.DEFAULT_MANAGEMENT_RATE
    )
    management = (
        Line(rent * management_value, management_source) if inputs.managed else Line(0.0, "default")
    )

    capex_value, capex_source = _pick(inputs.capex_rate, assumptions.DEFAULT_CAPEX_RATE)
    capex = Line(rent * capex_value, capex_source)

    property_tax = _annual_line(inputs.annual_property_tax)
    insurance = _annual_line(inputs.annual_insurance)
    hoa = _monthly_line(inputs.monthly_hoa, 0.0)
    utilities = _monthly_line(inputs.monthly_utilities, assumptions.DEFAULT_UTILITIES_MONTHLY)

    operating_expenses = sum(
        line.monthly
        for line in (property_tax, insurance, hoa, utilities, maintenance, management)
    )
    noi = effective_rent - operating_expenses

    loan = inputs.price - inputs.down_payment
    if inputs.financing == "cash":
        interest = Assumption(None, "default")
        term = Assumption(None, "default")
        debt_service = Line(0.0, "default")
    else:
        rate_value, rate_source = _pick(
            inputs.interest_rate, assumptions.DEFAULT_INTEREST_RATES[inputs.financing]
        )
        term_value, term_source = _pick(
            inputs.loan_term_years, assumptions.DEFAULT_LOAN_TERM_YEARS
        )
        interest = Assumption(rate_value, rate_source)
        term = Assumption(float(term_value), term_source)
        overridden = "investor" in (rate_source, term_source)
        debt_service = (
            Line(mortgage_payment(loan, rate_value, int(term_value)), "investor" if overridden else "default")
            if loan > 0
            else Line(0.0, "default")
        )

    return CashFlowResult(
        assumptions=ResolvedAssumptions(
            vacancy_rate=Assumption(vacancy_rate, vacancy_source),
            maintenance_rate=Assumption(maintenance_value, maintenance_source),
            management_rate=Assumption(management_value, management_source),
            capex_rate=Assumption(capex_value, capex_source),
            interest_rate=interest,
            loan_term_years=term,
            monthly_utilities=Assumption(utilities.monthly, utilities.source),
        ),
        rent=Line(rent, "investor"),
        vacancy=vacancy,
        effective_rent=effective_rent,
        property_tax=property_tax,
        insurance=insurance,
        hoa=hoa,
        utilities=utilities,
        maintenance=maintenance,
        management=management,
        operating_expenses=operating_expenses,
        noi=noi,
        capex=capex,
        debt_service=debt_service,
        cash_flow=noi - capex.monthly - debt_service.monthly,
    )
