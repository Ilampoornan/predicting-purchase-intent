
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from app.routes.upload import router as upload_router
# from app.routes.process import router as process_router
# from app.routes.powerbi import router as powerbi_router


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

app.include_router(upload_router)
# app.include_router(process_router)
# app.include_router(powerbi_router)