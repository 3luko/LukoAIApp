from fastapi import FastAPI

from app.api.routes import analysis

app = FastAPI(title="LukoAI API")
app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
