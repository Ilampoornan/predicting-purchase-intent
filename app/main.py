from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.upload import router as upload_router
from app.routes.mining import router as mining_router  # 👈 added this line

app = FastAPI(title="Basket Intent Demo")

# Allow CORS for frontend (adjust origins as needed)
origins = [
    "http://localhost:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register routers
app.include_router(upload_router)
app.include_router(mining_router)  # 👈 added this line too
