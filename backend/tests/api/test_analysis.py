import copy
import socket

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import analysis_service

client = TestClient(app)

VALID_BODY = {
    "property": {
        "price": 400_000,
        "yearBuilt": 2000,
        "annualPropertyTax": 4800,
        "annualInsurance": 1800,
    },
    "investor": {
        "downPayment": 80_000,
        "financing": "conventional",
        "monthlyRent": 3000,
        "management": "self",
    },
}


@pytest.fixture(autouse=True)
def fixed_year(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(analysis_service, "_current_year", lambda: 2026)


def body(**changes: dict) -> dict:
    """VALID_BODY with sections merged in, e.g. body(investor={"monthlyRent": 0})."""
    result = copy.deepcopy(VALID_BODY)
    for section, values in changes.items():
        result.setdefault(section, {}).update(values)
    return result


def post(payload: dict):
    return client.post("/analysis/calculate", json=payload)


# --- success -----------------------------------------------------------------


def test_hand_computed_case() -> None:
    response = post(VALID_BODY)

    assert response.status_code == 200
    data = response.json()
    assert data["income"]["grossRent"] == {"monthly": 3000, "annual": 36000, "source": "investor"}
    assert data["income"]["vacancy"] == {"monthly": 150, "annual": 1800, "source": "default"}
    assert data["income"]["effectiveRent"] == {"monthly": 2850, "annual": 34200}
    assert data["expenses"]["propertyTax"] == {"monthly": 400, "annual": 4800, "source": "investor"}
    assert data["expenses"]["insurance"] == {"monthly": 150, "annual": 1800, "source": "investor"}
    assert data["expenses"]["maintenance"] == {"monthly": 300, "annual": 3600, "source": "estimate"}
    assert data["expenses"]["total"] == {"monthly": 850, "annual": 10200}
    assert data["noi"] == {"monthly": 2000, "annual": 24000}
    assert data["capex"] == {"monthly": 150, "annual": 1800, "source": "default"}
    assert data["debtService"] == {"monthly": 2128.97, "annual": 25547.62, "source": "default"}
    assert data["cashFlow"] == {"monthly": -278.97, "annual": -3347.62}
    assert data["warnings"] == []


def test_response_is_camel_case() -> None:
    data = post(VALID_BODY).json()

    assert "debtService" in data and "debt_service" not in data
    assert "grossRent" in data["income"]


def test_annual_comes_from_unrounded_monthly() -> None:
    data = post(VALID_BODY).json()

    # 12 x the rounded monthly payment (2128.97) would give 25547.64.
    assert data["debtService"]["annual"] == 25547.62


def test_defaults_are_echoed_so_the_ui_can_prefill() -> None:
    assumptions = post(VALID_BODY).json()["assumptions"]

    assert assumptions["vacancyRate"] == {"value": 0.05, "source": "default"}
    assert assumptions["maintenanceRate"] == {"value": 0.10, "source": "estimate"}
    assert assumptions["managementRate"] == {"value": 0.08, "source": "default"}
    assert assumptions["capexRate"] == {"value": 0.05, "source": "default"}
    assert assumptions["interestRate"] == {"value": 0.07, "source": "default"}
    assert assumptions["loanTermYears"] == {"value": 30, "source": "default"}
    assert assumptions["monthlyUtilities"] == {"value": 0, "source": "default"}


def test_override_is_applied_and_marked_as_investor() -> None:
    data = post(body(assumptions={"vacancyRate": 0})).json()

    assert data["assumptions"]["vacancyRate"] == {"value": 0, "source": "investor"}
    assert data["income"]["effectiveRent"]["monthly"] == 3000


def test_null_override_means_default() -> None:
    data = post(body(assumptions={"vacancyRate": None})).json()

    assert data["assumptions"]["vacancyRate"]["source"] == "default"


def test_interest_rate_override_changes_debt_service() -> None:
    data = post(body(assumptions={"interestRate": 0.05})).json()

    assert data["debtService"]["source"] == "investor"
    assert data["debtService"]["monthly"] < 2128.97


def test_property_manager_adds_management_cost() -> None:
    data = post(body(investor={"management": "manager"})).json()

    assert data["expenses"]["management"]["monthly"] == 240


def test_all_cash_has_no_debt_and_no_rate_or_term() -> None:
    data = post(body(investor={"financing": "cash", "downPayment": 400_000})).json()

    assert data["debtService"]["monthly"] == 0
    assert data["assumptions"]["interestRate"]["value"] is None
    assert data["assumptions"]["loanTermYears"]["value"] is None
    assert data["cashFlow"]["monthly"] == 1850


def test_missing_tax_and_insurance_produce_warnings() -> None:
    payload = body()
    del payload["property"]["annualPropertyTax"]
    del payload["property"]["annualInsurance"]

    data = post(payload).json()

    assert data["expenses"]["propertyTax"] == {"monthly": 0, "annual": 0, "source": "missing"}
    assert data["warnings"] == [
        "Property tax is missing and counted as $0.",
        "Insurance is missing and counted as $0.",
    ]


def test_assumptions_section_is_optional() -> None:
    assert post(VALID_BODY).status_code == 200


def test_calculation_never_touches_the_network(monkeypatch: pytest.MonkeyPatch) -> None:
    real_connect = socket.socket.connect

    def block_external(self: socket.socket, address: object) -> None:
        # Loopback is allowed: the test client's event loop uses it internally.
        host = address[0] if isinstance(address, tuple) else address
        if host not in ("127.0.0.1", "::1", "localhost"):
            raise AssertionError(f"calculate must not connect to {host}")
        real_connect(self, address)  # type: ignore[arg-type]

    monkeypatch.setattr(socket.socket, "connect", block_external)

    assert post(VALID_BODY).status_code == 200


# --- validation errors (all share FastAPI's 422 shape) ------------------------


@pytest.mark.parametrize(
    "payload",
    [
        body(investor={"monthlyRent": 0}),
        body(investor={"monthlyRent": -5}),
        body(property={"price": 0}),
        body(property={"price": 2_000_000_000}),
        body(investor={"downPayment": -1}),
        body(investor={"downPayment": 400_001}),
        body(investor={"financing": "fha"}),
        body(investor={"management": "someone"}),
        body(assumptions={"vacancyRate": 1.5}),
        body(assumptions={"vacancyRate": -0.1}),
        body(assumptions={"interestRate": 2}),
        body(assumptions={"loanTermYears": 0}),
        body(assumptions={"loanTermYears": 51}),
        body(assumptions={"monthlyUtilities": -1}),
        body(property={"annualPropertyTax": -1}),
        body(property={"yearBuilt": 1500}),
        body(assumptions={"vacancyRat": 0.1}),  # misspelled override must not be ignored
        body(property={"unknown": 1}),
    ],
)
def test_invalid_requests_return_422(payload: dict) -> None:
    response = post(payload)

    assert response.status_code == 422
    assert isinstance(response.json()["detail"], list)


@pytest.mark.parametrize("missing", ["property", "investor"])
def test_missing_required_sections_return_422(missing: str) -> None:
    payload = copy.deepcopy(VALID_BODY)
    del payload[missing]

    assert post(payload).status_code == 422


def test_future_year_built_is_rejected_by_the_domain_with_the_same_shape() -> None:
    response = post(body(property={"yearBuilt": 2027}))

    assert response.status_code == 422
    detail = response.json()["detail"]
    assert detail[0]["type"] == "value_error"
    assert "future" in detail[0]["msg"]


def test_validation_errors_do_not_leak_internals() -> None:
    text = post(body(investor={"monthlyRent": 0})).text

    assert "Traceback" not in text
