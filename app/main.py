from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routes.upload import router as upload_router
# from app.routes.process import router as process_router
# from app.routes.powerbi import router as powerbi_router


app = FastAPI(title="Basket Intent Demo")

# Allow requests from the frontend dev server(s)
origins = [
	"http://localhost:3000",
	"http://127.0.0.1:3000",
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


if __name__ == "__main__":
	# Allow overriding the port with the PORT env var; default to 8080 to match the frontend
	port = int(os.environ.get("PORT", 8080))
	import uvicorn

	uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)