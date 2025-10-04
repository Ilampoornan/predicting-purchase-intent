from fastapi import APIRouter, UploadFile, File, HTTPException, status
from io import BytesIO
import pandas as pd

from app.schemas.intent import UploadResult
from app.services import storage

router = APIRouter()

@router.post("/upload", response_model=UploadResult)
async def upload_csv(file: UploadFile = File(...)):
    """
    Uploads a CSV file containing basket data.
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only CSV files are allowed."
        )

    # Read the file content
    content = await file.read()
    
    # Use pandas to read the CSV from the in-memory bytes
    try:
        df = pd.read_csv(BytesIO(content))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read CSV file. Please check the file format."
        )

    # Validate required columns
    required_columns = ["order_id", "name"]
    if not all(col in df.columns for col in required_columns):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing one or more required columns: 'order_id' or 'name'."
        )

    # Convert DataFrame to a list of dictionaries with string keys for storage
    records = [{str(k): v for k, v in row.items()} for row in df.to_dict('records')]
    
    # Save the data to storage
    storage.set_baskets(records)
    
    return UploadResult(rows=len(df), columns=len(df.columns))