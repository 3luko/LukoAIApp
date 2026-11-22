"""Plain data types for the cash flow calculation. No HTTP or database imports."""

from dataclasses import dataclass
from typing import Literal

Financing = Literal["conventional", "dscr", "cash"]

# Where a number came from, so the UI can label it:
#   investor: entered or overridden by the investor
#   default:  one of our default assumptions
#   estimate: derived by a rule from other data (e.g. maintenance from age)
#   missing:  no data; counted as 0 and should be flagged
Source = Literal["investor", "default", "estimate", "missing"]


@dataclass(frozen=True)
class CashFlowInputs:
    """Everything the calculation needs. `None` on an optional field means 'no override'."""

    price: float
    down_payment: float
    financing: Financing
    monthly_rent: float
    year_built: int | None
    managed: bool  # True when a property manager is used

    annual_property_tax: float | None = None
    annual_insurance: float | None = None
    monthly_hoa: float | None = None
    monthly_utilities: float | None = None

    vacancy_rate: float | None = None
    maintenance_rate: float | None = None
    management_rate: float | None = None
    capex_rate: float | None = None
    interest_rate: float | None = None
    loan_term_years: int | None = None


@dataclass(frozen=True)
class Line:
    """One monthly amount and where it came from."""

    monthly: float
    source: Source

    @property
    def annual(self) -> float:
        return self.monthly * 12


@dataclass(frozen=True)
class Assumption:
    """An assumption's resolved value and where it came from. `value` is None when it
    doesn't apply (interest rate and term for an all-cash purchase)."""

    value: float | None
    source: Source


@dataclass(frozen=True)
class ResolvedAssumptions:
    """Every assumption after defaults and overrides are applied, so a UI can show them."""

    vacancy_rate: Assumption
    maintenance_rate: Assumption
    management_rate: Assumption
    capex_rate: Assumption
    interest_rate: Assumption
    loan_term_years: Assumption
    monthly_utilities: Assumption


@dataclass(frozen=True)
class CashFlowResult:
    assumptions: ResolvedAssumptions
    rent: Line
    vacancy: Line  # the income lost to vacancy, as a positive amount
    effective_rent: float

    property_tax: Line
    insurance: Line
    hoa: Line
    utilities: Line
    maintenance: Line
    management: Line
    operating_expenses: float

    noi: float  # net operating income: effective rent minus operating expenses
    capex: Line
    debt_service: Line
    cash_flow: float  # monthly

    @property
    def annual_cash_flow(self) -> float:
        return self.cash_flow * 12
