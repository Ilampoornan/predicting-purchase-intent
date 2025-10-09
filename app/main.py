from fastapi import FastAPI, APIRouter

from app.routes.upload import router as upload_router
from app.routes.intent import router as intent_router
# from app.routes.powerbi import router as powerbi_router

app = FastAPI(title="Basket Intent Demo")

app.include_router(upload_router)
app.include_router(intent_router)
# app.include_router(powerbi_router)