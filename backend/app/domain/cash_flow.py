"""Combines rent and expense lines into monthly cash flow. Pure functions, no I/O.

    effective rent = rent - vacancy
    NOI            = effective rent - operating expenses
    cash flow      = NOI - capex reserve - debt service
"""

from app.domain import assumptions
from app.domain.expenses import maintenance_rate, monthly_amount, property_age
from app.domain.models import CashFlowInputs, CashFlowResult, Line, Source
from app.domain.mortgage import mortgage_payment
from app.domain.rent import effective_monthly_rent


def _rate_line(rent: float, override: float | None, default: float) -> Line:
    """A line that is a share of monthly rent."""
    rate = default if override is None else override
    if not 0 <= rate <= 1:
        raise ValueError("rates must be between 0 and 1")
    return Line(rent * rate, "default" if override is None else "investor")


def _annual_line(annual: float | None) -> Line:
    if annual is None:
        return Line(0.0, "missing")
    return Line(monthly_amount(annual), "investor")


def _monthly_line(monthly: float | None, default: float, default_source: Source) -> Line:
    if monthly is None:
        return Line(default, default_source)
    if monthly < 0:
        raise ValueError("monthly amounts cannot be negative")
    return Line(monthly, "investor")


def _validate(inputs: CashFlowInputs) -> None:
    if inputs.monthly_rent <= 0:
        raise ValueError("monthly_rent must be greater than 0")
    if inputs.price <= 0:
        raise ValueError("price must be greater than 0")
    if not 0 <= inputs.down_payment <= inputs.price:
        raise ValueError("down_payment must be between 0 and the price")
    # Check every rate override, even ones that don't apply (e.g. management when self-managed).
    for rate in (
        inputs.vacancy_rate,
        inputs.maintenance_rate,
        inputs.management_rate,
        inputs.capex_rate,
    ):
        if rate is not None and not 0 <= rate <= 1:
            raise ValueError("rates must be between 0 and 1")


def _debt_service(inputs: CashFlowInputs) -> Line:
    loan = inputs.price - inputs.down_payment
    if inputs.financing == "cash" or loan == 0:
        return Line(0.0, "default")

    rate = (
        assumptions.DEFAULT_INTEREST_RATES[inputs.financing]
        if inputs.interest_rate is None
        else inputs.interest_rate
    )
    term = (
        assumptions.DEFAULT_LOAN_TERM_YEARS
        if inputs.loan_term_years is None
        else inputs.loan_term_years
    )
    overridden = inputs.interest_rate is not None or inputs.loan_term_years is not None
    return Line(
        mortgage_payment(loan, rate, term), "investor" if overridden else "default"
    )


def calculate_cash_flow(inputs: CashFlowInputs, current_year: int) -> CashFlowResult:
    """Monthly cash flow with a line-by-line breakdown. Raises ValueError on bad input."""
    _validate(inputs)
    rent = inputs.monthly_rent

    vacancy_rate = (
        assumptions.DEFAULT_VACANCY_RATE if inputs.vacancy_rate is None else inputs.vacancy_rate
    )
    vacancy = _rate_line(rent, inputs.vacancy_rate, assumptions.DEFAULT_VACANCY_RATE)
    effective_rent = effective_monthly_rent(rent, vacancy_rate)

    if inputs.maintenance_rate is None:
        age = None if inputs.year_built is None else property_age(inputs.year_built, current_year)
        maintenance = Line(rent * maintenance_rate(age), "estimate")
    else:
        maintenance = _rate_line(rent, inputs.maintenance_rate, 0.0)

    management = (
        _rate_line(rent, inputs.management_rate, assumptions.DEFAULT_MANAGEMENT_RATE)
        if inputs.managed
        else Line(0.0, "default")
    )

    property_tax = _annual_line(inputs.annual_property_tax)
    insurance = _annual_line(inputs.annual_insurance)
    hoa = _monthly_line(inputs.monthly_hoa, 0.0, "default")
    utilities = _monthly_line(
        inputs.monthly_utilities, assumptions.DEFAULT_UTILITIES_MONTHLY, "default"
    )

    operating_expenses = sum(
        line.monthly
        for line in (property_tax, insurance, hoa, utilities, maintenance, management)
    )
    noi = effective_rent - operating_expenses

    capex = _rate_line(rent, inputs.capex_rate, assumptions.DEFAULT_CAPEX_RATE)
    debt_service = _debt_service(inputs)

    return CashFlowResult(
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
