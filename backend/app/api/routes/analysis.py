"""HTTP layer only: validate the request, call a service, return the response."""

from fastapi import APIRouter

router = APIRouter()

# TODO(you): add POST /calculate. Keep it thin: take the request schema, call the
# analysis service, return the response schema. No formulas here.
