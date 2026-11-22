"""Edge-case QA for POST /analysis/calculate. Expected values are computed by hand."""

import copy

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import analysis_service

client = TestClient(app)
lenient_client = TestClient(app, raise_server_exceptions=False)  # surfaces real 500s

VALID_BODY = {
    "property": {"price": 400_000, "yearBuilt": 2000, "annualPropertyTax": 4800, "annualInsurance": 1800},
    "investor": {"downPayment": 80_000, "financing": "conventional", "monthlyRent": 3000, "management": "self"},
}


@pytest.fixture(autouse=True)
def fixed_year(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(analysis_service, "_current_year", lambda: 2026)


def body(**changes: dict) -> dict:
    result = copy.deepcopy(VALID_BODY)
    for section, values in changes.items():
        result.setdefault(section, {}).update(values)
    return result


def post(payload: dict):
    return client.post("/analysis/calculate", json=payload)


def post_raw(text: str):
    return lenient_client.post("/analysis/calculate", content=text, headers={"content-type": "application/json"})


# --- invalid input: always 422, never 500 --------------------------------------


@pytest.mark.parametrize("token", ["NaN", "Infinity", "-Infinity"])
@pytest.mark.parametrize(
    "field",
    ["price", "downPayment", "monthlyRent", "vacancyRate", "interestRate", "monthlyUtilities", "annualPropertyTax"],
)
def test_non_finite_numbers_rejected(field: str, token: str) -> None:
    values = {
        "price": "400000", "annualPropertyTax": "4800", "downPayment": "80000", "monthlyRent": "3000",
        "vacancyRate": "0.05", "interestRate": "0.07", "monthlyUtilities": "0",
    }
    values[field] = token
    text = (
        '{"property":{"price":%(price)s,"annualPropertyTax":%(annualPropertyTax)s},'
        '"investor":{"downPayment":%(downPayment)s,"financing":"conventional",'
        '"monthlyRent":%(monthlyRent)s,"management":"self"},'
        '"assumptions":{"vacancyRate":%(vacancyRate)s,"interestRate":%(interestRate)s,'
        '"monthlyUtilities":%(monthlyUtilities)s}}'
    ) % values
    assert post_raw(text).status_code == 422


@pytest.mark.parametrize("raw", ["", "{}", "[]", "null", "not json", '{"property":null,"investor":null}'])
def test_empty_or_malformed_body(raw: str) -> None:
    assert post_raw(raw).status_code == 422


@pytest.mark.parametrize(
    "section,field",
    [("property", "price"), ("investor", "downPayment"), ("investor", "financing"),
     ("investor", "monthlyRent"), ("investor", "management")],
)
def test_required_field_null_or_missing(section: str, field: str) -> None:
    nulled = copy.deepcopy(VALID_BODY)
    nulled[section][field] = None
    assert post(nulled).status_code == 422
    missing = copy.deepcopy(VALID_BODY)
    del missing[section][field]
    assert post(missing).status_code == 422


@pytest.mark.parametrize(
    "section,field,value",
    [("property", "price", "abc"), ("property", "price", [1]), ("investor", "monthlyRent", {}),
     ("investor", "financing", "fha"), ("investor", "management", "Self"), ("investor", "financing", 1),
     ("property", "yearBuilt", 2000.5), ("property", "yearBuilt", "abc")],
)
def test_wrong_types_rejected(section: str, field: str, value: object) -> None:
    assert post(body(**{section: {field: value}})).status_code == 422


@pytest.mark.parametrize(
    "section,field,value",
    [("property", "price", "400000"), ("investor", "monthlyRent", "3000"), ("investor", "downPayment", "80000"),
     ("property", "price", True)],
)
def test_numeric_strings_and_bools_not_coerced(section: str, field: str, value: object) -> None:
    # Contract says numbers. Pydantic lax mode silently coerces "3000" and true.
    assert post(body(**{section: {field: value}})).status_code == 422


def test_assumptions_null_section_is_rejected() -> None:
    # Decided 2026-11-21: the section may be omitted or an object, but not null.
    payload = copy.deepcopy(VALID_BODY)
    payload["assumptions"] = None
    assert post(payload).status_code == 422


def test_assumptions_empty_object_uses_defaults() -> None:
    assert post(body(assumptions={})).json() == post(VALID_BODY).json()


@pytest.mark.parametrize(
    "payload",
    [
        {**VALID_BODY, "extra": 1},
        body(property={"zip": "1"}),
        body(investor={"x": 1}),
        body(assumptions={"vacancyRat": 0.1}),
    ],
)
def test_unknown_fields_rejected_at_every_level(payload: dict) -> None:
    assert post(payload).status_code == 422


@pytest.mark.parametrize(
    "section,field,value",
    [("property", "price", 0), ("property", "price", -1), ("property", "price", 1_000_000_001),
     ("investor", "monthlyRent", 0), ("investor", "monthlyRent", -5), ("investor", "monthlyRent", 1_000_000_001),
     ("investor", "downPayment", -0.01), ("investor", "downPayment", 400_000.01),
     ("property", "annualPropertyTax", -1), ("property", "annualInsurance", -1), ("property", "monthlyHoa", -1),
     ("property", "yearBuilt", 1599), ("property", "yearBuilt", 2027), ("property", "yearBuilt", 10_000),
     ("assumptions", "vacancyRate", -0.01), ("assumptions", "vacancyRate", 1.01),
     ("assumptions", "maintenanceRate", 1.01), ("assumptions", "managementRate", -0.01),
     ("assumptions", "capexRate", 1.01), ("assumptions", "interestRate", 1.01),
     ("assumptions", "interestRate", -0.01), ("assumptions", "loanTermYears", 0),
     ("assumptions", "loanTermYears", 51), ("assumptions", "loanTermYears", -1),
     ("assumptions", "loanTermYears", 30.5), ("assumptions", "monthlyUtilities", -1)],
)
def test_out_of_range_rejected(section: str, field: str, value: float) -> None:
    response = post(body(**{section: {field: value}}))
    assert response.status_code == 422
    assert isinstance(response.json()["detail"], list)


def test_future_year_error_shape() -> None:
    detail = post(body(property={"yearBuilt": 2027})).json()["detail"][0]
    assert detail["loc"] == ["body"] and detail["type"] == "value_error"


def test_down_payment_over_price_error_shape() -> None:
    detail = post(body(investor={"downPayment": 400_001})).json()["detail"][0]
    assert detail["type"] == "value_error"
    assert detail["loc"] == ["body"]


# --- boundaries that must succeed ----------------------------------------------


@pytest.mark.parametrize(
    "section,field,value",
    [("property", "price", 1_000_000_000), ("property", "yearBuilt", 1600), ("property", "yearBuilt", 2026),
     ("assumptions", "vacancyRate", 0), ("assumptions", "vacancyRate", 1),
     ("assumptions", "maintenanceRate", 0), ("assumptions", "maintenanceRate", 1),
     ("assumptions", "managementRate", 1), ("assumptions", "capexRate", 0), ("assumptions", "capexRate", 1),
     ("assumptions", "interestRate", 0), ("assumptions", "interestRate", 1),
     ("assumptions", "loanTermYears", 1), ("assumptions", "loanTermYears", 50),
     ("investor", "monthlyRent", 0.01)],
)
def test_boundary_values_accepted(section: str, field: str, value: float) -> None:
    payload = body(**{section: {field: value}})
    if field == "price":
        payload["investor"]["downPayment"] = 1_000_000_000
    assert post(payload).status_code == 200


def test_loan_term_must_be_a_whole_number() -> None:
    # Strict numbers (decided 2026-11-21): 30.0 is a float, so it's rejected.
    assert post(body(assumptions={"loanTermYears": 30.0})).status_code == 422


def test_a_server_side_bug_is_a_500_not_a_422(monkeypatch: pytest.MonkeyPatch) -> None:
    # A Pydantic ValidationError is a ValueError. If our own response fails to build, the
    # client must not be told their input was invalid.
    from app.schemas.analysis import MoneyAmount

    def broken(monthly: float) -> MoneyAmount:
        return MoneyAmount.model_validate({"wrong": 1})

    monkeypatch.setattr(analysis_service, "_amount", broken)

    assert TestClient(app, raise_server_exceptions=False).post(
        "/analysis/calculate", json=VALID_BODY
    ).status_code == 500


def test_down_payment_equals_price_boundary() -> None:
    assert post(body(investor={"downPayment": 400_000})).status_code == 200


# --- hand-computed values -------------------------------------------------------


def test_down_payment_equals_price_financed_has_no_debt() -> None:
    # tax 400 + ins 150 + maint 300 = 850; NOI 2850-850 = 2000; capex 150; cash flow 1850
    data = post(body(investor={"downPayment": 400_000})).json()
    assert data["debtService"]["monthly"] == 0
    assert data["debtService"]["annual"] == 0
    assert data["cashFlow"] == {"monthly": 1850, "annual": 22200}


@pytest.mark.parametrize("down", [0, 100_000, 400_000])
def test_cash_purchase(down: float) -> None:
    data = post(body(investor={"financing": "cash", "downPayment": down})).json()
    assert data["debtService"]["monthly"] == 0
    assert data["cashFlow"] == {"monthly": 1850, "annual": 22200}
    assert data["assumptions"]["interestRate"]["value"] is None
    assert data["assumptions"]["loanTermYears"]["value"] is None


def test_cash_ignores_interest_and_term_overrides() -> None:
    plain = post(body(investor={"financing": "cash"})).json()
    over = post(body(investor={"financing": "cash"}, assumptions={"interestRate": 0.2, "loanTermYears": 10})).json()
    assert over["cashFlow"] == plain["cashFlow"]
    assert over["debtService"] == plain["debtService"]
    assert over["assumptions"]["interestRate"]["value"] is None


def test_zero_interest_payment_is_loan_over_months() -> None:
    # loan 240000 over 20 years at 0% = 240000 / 240 = 1000/month
    data = post(body(investor={"downPayment": 160_000}, assumptions={"interestRate": 0, "loanTermYears": 20})).json()
    assert data["debtService"] == {"monthly": 1000, "annual": 12000, "source": "investor"}
    assert data["cashFlow"]["monthly"] == 2000 - 150 - 1000


def test_one_year_zero_interest() -> None:
    # loan 12000 / 12 months = 1000
    data = post(body(investor={"downPayment": 388_000}, assumptions={"interestRate": 0, "loanTermYears": 1})).json()
    assert data["debtService"]["monthly"] == 1000


def test_hundred_percent_rate_is_finite() -> None:
    data = post(body(assumptions={"interestRate": 1, "loanTermYears": 1})).json()
    assert data["debtService"]["monthly"] > 320_000 / 12


def test_vacancy_100_percent() -> None:
    # effective 0; expenses 400+150+300 = 850; NOI -850; capex 150; no debt -> -1000
    data = post(body(investor={"downPayment": 400_000}, assumptions={"vacancyRate": 1})).json()
    assert data["income"]["effectiveRent"] == {"monthly": 0, "annual": 0}
    assert data["income"]["vacancy"]["monthly"] == 3000
    assert data["noi"] == {"monthly": -850, "annual": -10200}
    assert data["cashFlow"] == {"monthly": -1000, "annual": -12000}


def test_year_built_this_year_uses_lowest_band() -> None:
    data = post(body(property={"yearBuilt": 2026})).json()
    assert data["expenses"]["maintenance"]["monthly"] == 150  # 5% of 3000


@pytest.mark.parametrize(
    "year,rate", [(2016, 0.05), (2015, 0.07), (2001, 0.07), (2000, 0.10), (1976, 0.10), (1975, 0.12)]
)
def test_maintenance_age_bands(year: int, rate: float) -> None:
    data = post(body(property={"yearBuilt": year})).json()
    assert data["assumptions"]["maintenanceRate"]["value"] == rate
    assert data["expenses"]["maintenance"]["monthly"] == pytest.approx(3000 * rate)


def test_missing_year_built_is_ten_percent_estimate() -> None:
    payload = copy.deepcopy(VALID_BODY)
    del payload["property"]["yearBuilt"]
    data = post(payload).json()
    assert data["assumptions"]["maintenanceRate"] == {"value": 0.1, "source": "estimate"}


def test_missing_tax_and_insurance_warn() -> None:
    payload = copy.deepcopy(VALID_BODY)
    del payload["property"]["annualPropertyTax"]
    del payload["property"]["annualInsurance"]
    data = post(payload).json()
    assert data["warnings"] == [
        "Property tax is missing and counted as $0.",
        "Insurance is missing and counted as $0.",
    ]
    assert data["expenses"]["propertyTax"] == {"monthly": 0, "annual": 0, "source": "missing"}


def test_explicit_zero_tax_is_not_missing() -> None:
    data = post(body(property={"annualPropertyTax": 0})).json()
    assert data["expenses"]["propertyTax"]["source"] == "investor"
    assert data["warnings"] == []


def test_hoa_and_utilities_added_to_expenses() -> None:
    # 850 + hoa 100 + utilities 50 = 1000 ; NOI 1850
    data = post(body(property={"monthlyHoa": 100}, assumptions={"monthlyUtilities": 50})).json()
    assert data["expenses"]["total"]["monthly"] == 1000
    assert data["noi"]["monthly"] == 1850
    assert data["assumptions"]["monthlyUtilities"] == {"value": 50, "source": "investor"}


# --- overrides ------------------------------------------------------------------


def test_maintenance_override() -> None:
    data = post(body(assumptions={"maintenanceRate": 0.2})).json()
    assert data["expenses"]["maintenance"] == {"monthly": 600, "annual": 7200, "source": "investor"}
    assert data["assumptions"]["maintenanceRate"] == {"value": 0.2, "source": "investor"}


def test_capex_override() -> None:
    data = post(body(assumptions={"capexRate": 0.1})).json()
    assert data["capex"] == {"monthly": 300, "annual": 3600, "source": "investor"}


def test_management_rate_ignored_when_self_managed_but_echoed() -> None:
    base = post(VALID_BODY).json()
    data = post(body(assumptions={"managementRate": 0.5})).json()
    assert data["cashFlow"] == base["cashFlow"]
    assert data["expenses"]["management"]["monthly"] == 0
    assert data["assumptions"]["managementRate"] == {"value": 0.5, "source": "investor"}


def test_manager_default_and_override() -> None:
    default = post(body(investor={"management": "manager"})).json()
    assert default["expenses"]["management"] == {"monthly": 240, "annual": 2880, "source": "default"}
    over = post(body(investor={"management": "manager"}, assumptions={"managementRate": 0.1})).json()
    assert over["expenses"]["management"] == {"monthly": 300, "annual": 3600, "source": "investor"}


def test_loan_term_override_marks_debt_investor() -> None:
    data = post(body(assumptions={"loanTermYears": 15})).json()
    assert data["debtService"]["source"] == "investor"
    assert data["assumptions"]["loanTermYears"] == {"value": 15, "source": "investor"}
    assert data["assumptions"]["interestRate"]["source"] == "default"


def test_dscr_default_rate() -> None:
    data = post(body(investor={"financing": "dscr"})).json()
    assert data["assumptions"]["interestRate"] == {"value": 0.0775, "source": "default"}


def _strip_sources(x):
    if isinstance(x, dict):
        return {k: _strip_sources(v) for k, v in x.items() if k != "source"}
    return x


def test_overriding_with_default_changes_no_numbers() -> None:
    base = post(VALID_BODY).json()
    explicit = post(
        body(
            assumptions={
                "vacancyRate": 0.05, "maintenanceRate": 0.10, "managementRate": 0.08, "capexRate": 0.05,
                "interestRate": 0.07, "loanTermYears": 30, "monthlyUtilities": 0,
            }
        )
    ).json()
    assert _strip_sources(explicit) == _strip_sources(base)


def test_overriding_with_default_manager_changes_no_numbers() -> None:
    a = post(body(investor={"management": "manager"})).json()
    b = post(body(investor={"management": "manager"}, assumptions={"managementRate": 0.08})).json()
    assert _strip_sources(a) == _strip_sources(b)


# --- rounding / invariants ------------------------------------------------------


def test_annual_comes_from_unrounded_monthly() -> None:
    # tax 1000/yr -> 83.333.../mo -> 83.33 ; annual 1000 (not 83.33*12 = 999.96)
    data = post(body(property={"annualPropertyTax": 1000, "annualInsurance": 1000})).json()
    assert data["expenses"]["propertyTax"] == {"monthly": 83.33, "annual": 1000, "source": "investor"}
    assert data["expenses"]["insurance"]["annual"] == 1000


def test_no_negative_zero_in_output() -> None:
    # rent 0.001, no vacancy/maintenance, capex 100%: cash flow = -0.001 -> rounds to -0.0
    payload = body(
        property={"annualPropertyTax": 0, "annualInsurance": 0},
        investor={"financing": "cash", "downPayment": 0, "monthlyRent": 0.001},
        assumptions={"vacancyRate": 0, "maintenanceRate": 0, "capexRate": 1},
    )
    response = post(payload)
    assert response.status_code == 200
    assert "-0.0," not in response.text and "-0.0}" not in response.text


@pytest.mark.parametrize("rent", [1234.56, 999.99, 3333.33, 0.01, 7777.77])
def test_invariants_within_rounding(rent: float) -> None:
    d = post(body(investor={"monthlyRent": rent, "management": "manager"})).json()
    exp = d["expenses"]
    parts = ["propertyTax", "insurance", "hoa", "utilities", "maintenance", "management"]
    assert exp["total"]["monthly"] == pytest.approx(sum(exp[p]["monthly"] for p in parts), abs=0.03)
    assert d["noi"]["monthly"] == pytest.approx(
        d["income"]["effectiveRent"]["monthly"] - exp["total"]["monthly"], abs=0.03
    )
    assert d["cashFlow"]["monthly"] == pytest.approx(
        d["noi"]["monthly"] - d["capex"]["monthly"] - d["debtService"]["monthly"], abs=0.03
    )
    for line in (d["noi"], d["cashFlow"], d["income"]["effectiveRent"], d["capex"], d["debtService"]):
        assert line["annual"] == pytest.approx(line["monthly"] * 12, abs=0.07)
        assert round(line["annual"], 2) == line["annual"]


def test_response_has_documented_keys() -> None:
    d = post(VALID_BODY).json()
    assert set(d) == {"income", "expenses", "noi", "capex", "debtService", "cashFlow", "assumptions", "warnings"}
    assert set(d["assumptions"]) == {
        "vacancyRate", "maintenanceRate", "managementRate", "capexRate", "interestRate",
        "loanTermYears", "monthlyUtilities",
    }
    assert set(d["income"]) == {"grossRent", "vacancy", "effectiveRent"}
    assert set(d["expenses"]) == {
        "propertyTax", "insurance", "hoa", "utilities", "maintenance", "management", "total",
    }
    assert set(d["capex"]) == {"monthly", "annual", "source"}


def test_snake_case_request_keys_rejected() -> None:
    # Doc: the wire format is camelCase. populate_by_name=True lets snake_case through.
    payload = copy.deepcopy(VALID_BODY)
    payload["investor"] = {
        "down_payment": 80_000, "financing": "conventional", "monthly_rent": 3000, "management": "self",
    }
    assert post(payload).status_code == 422
