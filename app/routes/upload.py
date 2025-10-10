from fastapi import APIRouter, UploadFile, File, HTTPException, status
from io import BytesIO
import pandas as pd
from google.cloud import bigquery
import ast

from app.schemas.intent import UploadResult
from app.services import storage

router = APIRouter()

bq_client = bigquery.Client()
TABLE_ID = "pivotal-canto-466205-p6.intent_inference.Orders"


def parse_products_column(value):
    """Convert various 'products' formats to list."""
    if pd.isna(value) or value is None:
        return []
    if isinstance(value, list):
        return value
    value = str(value).strip()
    if not value:
        return []
    if value.startswith("[") and value.endswith("]"):
        try:
            return ast.literal_eval(value)
        except Exception:
            pass
    return [item.strip() for item in value.split(",") if item.strip()]


# ✅ Define schema fields (only these will be kept)
SCHEMA = [
    bigquery.SchemaField("order_id", "INTEGER", mode="NULLABLE"),
    bigquery.SchemaField("user_id", "INTEGER", mode="NULLABLE"),
    bigquery.SchemaField("products", "STRING", mode="REPEATED"),
    bigquery.SchemaField("dataset_id", "INTEGER", mode="NULLABLE"),
    bigquery.SchemaField("intent", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("order_date", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("Total cost", "FLOAT", mode="NULLABLE"),
    bigquery.SchemaField("City", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("payment method", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("User name", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("Store type", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("Customer_Category", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("Season", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("Promotion", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("Total_Items", "STRING", mode="NULLABLE")
]


@router.post("/upload", response_model=UploadResult)
async def upload_csv(file: UploadFile = File(...)):
    # --- Step 1: Validate file type ---
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only CSV files are allowed."
        )

    # --- Step 2: Read file ---
    try:
        content = await file.read()
        df = pd.read_csv(BytesIO(content))

        # ✅ Keep only schema-defined columns
        allowed_columns = [f.name for f in SCHEMA]
        df = df[[c for c in df.columns if c in allowed_columns]]

        # Clean numeric columns
        for col in ["order_id", "user_id"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
                df[col] = df[col].apply(lambda x: int(x) if pd.notnull(x) else None)

        # Convert products column
        if "products" in df.columns:
            df["products"] = df["products"].apply(parse_products_column)

        # Ensure all schema fields exist (even if missing in CSV)
        for col in allowed_columns:
            if col not in df.columns:
                df[col] = None

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not read CSV file: {e}"
        )

    # --- Step 3: Fetch last dataset_id from BigQuery ---
    try:
        query = f"SELECT MAX(dataset_id) AS last_id FROM `{TABLE_ID}`"
        query_job = bq_client.query(query)
        result = query_job.result()
        last_id = next(result).last_id or 0
        new_dataset_id = int(last_id) + 1
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch last dataset_id: {e}"
        )

    # --- Step 4: Assign new dataset_id ---
    df["dataset_id"] = new_dataset_id

    # --- Step 5: Convert to JSON ---
    try:
        json_data = df.to_json(orient="records", lines=True)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to serialize data: {e}"
        )

    # --- Step 6: Upload to BigQuery ---
    try:
        job_config = bigquery.LoadJobConfig(
            source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
            schema=SCHEMA,
            write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
        )

        load_job = bq_client.load_table_from_file(
            BytesIO(json_data.encode("utf-8")),
            TABLE_ID,
            job_config=job_config,
        )
        load_job.result()

        print(f"✅ Uploaded {len(df)} rows to {TABLE_ID} with dataset_id={new_dataset_id}")

    except Exception as e:
        print("❌ BigQuery upload failed:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload to BigQuery: {e}"
        )

    # --- Step 7: Store locally (optional) ---
    records = df.to_dict(orient="records")
    storage.set_baskets(records)

    return UploadResult(rows=len(df), columns=len(df.columns))
