"""Orchestration for POST /analysis/calculate: request -> domain -> response.

This path must not call RentCast or any other external service (see docs/decisions/0002).
Money is rounded to cents here, once, and never inside the domain calculation.
"""

from datetime import date

from app.domain.cash_flow import calculate_cash_flow
from app.domain.models import Assumption, CashFlowInputs, CashFlowResult, Line
from app.schemas.analysis import (
    AssumptionOut,
    AssumptionsOut,
    CalculateRequest,
    CalculateResponse,
    ExpensesOut,
    IncomeOut,
    MoneyAmount,
    MoneyLine,
)

_MISSING_WARNINGS = {
    "property_tax": "Property tax is missing and counted as $0.",
    "insurance": "Insurance is missing and counted as $0.",
}


def _current_year() -> int:
    return date.today().year


def _cents(value: float) -> float:
    return round(value, 2)


def _amount(monthly: float) -> MoneyAmount:
    # Annual comes from the unrounded monthly figure, so cents don't drift.
    return MoneyAmount(monthly=_cents(monthly), annual=_cents(monthly * 12))


def _line(line: Line) -> MoneyLine:
    return MoneyLine(
        monthly=_cents(line.monthly), annual=_cents(line.annual), source=line.source
    )


def _assumption(assumption: Assumption) -> AssumptionOut:
    return AssumptionOut(value=assumption.value, source=assumption.source)


def _to_inputs(request: CalculateRequest) -> CashFlowInputs:
    prop, investor, overrides = request.property, request.investor, request.assumptions
    return CashFlowInputs(
        price=prop.price,
        down_payment=investor.down_payment,
        financing=investor.financing,
        monthly_rent=investor.monthly_rent,
        year_built=prop.year_built,
        managed=investor.management == "manager",
        annual_property_tax=prop.annual_property_tax,
        annual_insurance=prop.annual_insurance,
        monthly_hoa=prop.monthly_hoa,
        monthly_utilities=overrides.monthly_utilities,
        vacancy_rate=overrides.vacancy_rate,
        maintenance_rate=overrides.maintenance_rate,
        management_rate=overrides.management_rate,
        capex_rate=overrides.capex_rate,
        interest_rate=overrides.interest_rate,
        loan_term_years=overrides.loan_term_years,
    )


def _warnings(result: CashFlowResult) -> list[str]:
    return [
        message
        for field, message in _MISSING_WARNINGS.items()
        if getattr(result, field).source == "missing"
    ]


def _to_response(result: CashFlowResult) -> CalculateResponse:
    a = result.assumptions
    return CalculateResponse(
        income=IncomeOut(
            gross_rent=_line(result.rent),
            vacancy=_line(result.vacancy),
            effective_rent=_amount(result.effective_rent),
        ),
        expenses=ExpensesOut(
            property_tax=_line(result.property_tax),
            insurance=_line(result.insurance),
            hoa=_line(result.hoa),
            utilities=_line(result.utilities),
            maintenance=_line(result.maintenance),
            management=_line(result.management),
            total=_amount(result.operating_expenses),
        ),
        noi=_amount(result.noi),
        capex=_line(result.capex),
        debt_service=_line(result.debt_service),
        cash_flow=_amount(result.cash_flow),
        assumptions=AssumptionsOut(
            vacancy_rate=_assumption(a.vacancy_rate),
            maintenance_rate=_assumption(a.maintenance_rate),
            management_rate=_assumption(a.management_rate),
            capex_rate=_assumption(a.capex_rate),
            interest_rate=_assumption(a.interest_rate),
            loan_term_years=_assumption(a.loan_term_years),
            monthly_utilities=_assumption(a.monthly_utilities),
        ),
        warnings=_warnings(result),
    )


def calculate(request: CalculateRequest) -> CalculateResponse:
    """Run the cash flow calculation. Raises ValueError on input the domain rejects."""
    result = calculate_cash_flow(_to_inputs(request), _current_year())
    return _to_response(result)
