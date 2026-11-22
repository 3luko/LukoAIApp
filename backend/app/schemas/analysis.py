"""Pydantic request/response models for POST /analysis/calculate.

This is the API contract (see docs/api/analysis-calculate.md). The wire format is
camelCase to match the frontend types.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator
from pydantic.alias_generators import to_camel

Financing = Literal["conventional", "dscr", "cash"]
Management = Literal["self", "manager"]
Source = Literal["investor", "default", "estimate", "missing"]

MAX_AMOUNT = 1_000_000_000  # rejects absurd values

# Numeric request fields use strict=True: numbers must be JSON numbers, so "400000" is
# rejected instead of converted. (Strict at the model level would also stop nested objects.)


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,  # camelCase only: snake_case keys are unknown fields
        extra="forbid",  # a misspelled override must fail, not be silently ignored
    )


class ResponseModel(ApiModel):
    """Response models are built by field name in the service and serialized as camelCase."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


# --- request -----------------------------------------------------------------


class PropertyInput(ApiModel):
    price: float = Field(gt=0, le=MAX_AMOUNT, strict=True)
    year_built: int | None = Field(default=None, ge=1600, strict=True)
    annual_property_tax: float | None = Field(default=None, ge=0, le=MAX_AMOUNT, strict=True)
    annual_insurance: float | None = Field(default=None, ge=0, le=MAX_AMOUNT, strict=True)
    monthly_hoa: float | None = Field(default=None, ge=0, le=MAX_AMOUNT, strict=True)


class InvestorInput(ApiModel):
    down_payment: float = Field(ge=0, le=MAX_AMOUNT, strict=True)
    financing: Financing
    monthly_rent: float = Field(gt=0, le=MAX_AMOUNT, strict=True)
    management: Management


class AssumptionsInput(ApiModel):
    """Optional overrides. Omitted or null means 'use the default'."""

    vacancy_rate: float | None = Field(default=None, ge=0, le=1, strict=True)
    maintenance_rate: float | None = Field(default=None, ge=0, le=1, strict=True)
    management_rate: float | None = Field(default=None, ge=0, le=1, strict=True)
    capex_rate: float | None = Field(default=None, ge=0, le=1, strict=True)
    interest_rate: float | None = Field(default=None, ge=0, le=1, strict=True)
    loan_term_years: int | None = Field(default=None, ge=1, le=50, strict=True)
    monthly_utilities: float | None = Field(default=None, ge=0, le=MAX_AMOUNT, strict=True)


class CalculateRequest(ApiModel):
    property: PropertyInput
    investor: InvestorInput
    assumptions: AssumptionsInput = Field(default_factory=AssumptionsInput)

    @model_validator(mode="after")
    def down_payment_within_price(self) -> "CalculateRequest":
        if self.investor.down_payment > self.property.price:
            raise ValueError("downPayment cannot be greater than price")
        return self


# --- response ----------------------------------------------------------------


class MoneyAmount(ResponseModel):
    monthly: float
    annual: float


class MoneyLine(MoneyAmount):
    source: Source


class IncomeOut(ResponseModel):
    gross_rent: MoneyLine
    vacancy: MoneyLine
    effective_rent: MoneyAmount


class ExpensesOut(ResponseModel):
    property_tax: MoneyLine
    insurance: MoneyLine
    hoa: MoneyLine
    utilities: MoneyLine
    maintenance: MoneyLine
    management: MoneyLine
    total: MoneyAmount


class AssumptionOut(ResponseModel):
    value: float | None  # null when it doesn't apply (rate and term for all-cash)
    source: Source


class AssumptionsOut(ResponseModel):
    vacancy_rate: AssumptionOut
    maintenance_rate: AssumptionOut
    management_rate: AssumptionOut
    capex_rate: AssumptionOut
    interest_rate: AssumptionOut
    loan_term_years: AssumptionOut
    monthly_utilities: AssumptionOut


class CalculateResponse(ResponseModel):
    income: IncomeOut
    expenses: ExpensesOut
    noi: MoneyAmount
    capex: MoneyLine
    debt_service: MoneyLine
    cash_flow: MoneyAmount
    assumptions: AssumptionsOut
    warnings: list[str]
