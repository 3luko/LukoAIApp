"""HTTP layer only: validate the request, call a service, return the response."""

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from app.schemas.analysis import CalculateRequest, CalculateResponse
from app.services import analysis_service

router = APIRouter()


@router.post("/calculate", response_model=CalculateResponse)
def calculate(request: CalculateRequest) -> CalculateResponse:
    try:
        return analysis_service.calculate(request)
    except ValidationError:
        # A Pydantic ValidationError is a ValueError, but here it means our own response
        # failed to build. That's a server bug (500), not bad client input.
        raise
    except ValueError as error:
        # Same shape as FastAPI's own validation errors, so clients handle one format.
        raise HTTPException(
            status_code=422,
            detail=[{"loc": ["body"], "msg": str(error), "type": "value_error"}],
        ) from error
