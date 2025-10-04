from fastapi import APIRouter, HTTPException
import time

from app.services import storage, inference
from app.schemas.intent import ProcessResult

router = APIRouter()

@router.post("/process", response_model=ProcessResult)
async def process_baskets():
    baskets = storage.get("baskets")
    if baskets is None:
        raise HTTPException(status_code=400, detail="No basket data uploaded. Please upload a CSV first.")

    start_time = time.time()
    results = inference.infer_intent(baskets)
    storage.save("processed_results", results)
    elapsed = time.time() - start_time

    return ProcessResult(
        baskets_processed=len(results),
        processing_time=elapsed
    )