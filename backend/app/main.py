from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.routes import analysis

app = FastAPI(title="LukoAI API")
app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """FastAPI's 422 shape, without echoing the rejected input.

    The default handler copies each rejected value into the response. A value like NaN
    can't be encoded as JSON, which turned a 422 into a 500.
    """
    errors = [{key: value for key, value in error.items() if key != "input"} for error in exc.errors()]
    return JSONResponse(status_code=422, content={"detail": jsonable_encoder(errors)})
