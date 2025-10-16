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

# BigQuery schema (keep as is)
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


@router.post("/upload", response_model=UploadResult)
async def upload_csvs(files: list[UploadFile] = File(...)):
    """
    Upload 3 CSVs: orders.csv, order_products.csv, products.csv
    Combine by order_id → flatten → upload to BigQuery.
    """

    if len(files) != 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload exactly 3 CSV files: orders, order_products, and products."
        )

    dfs = {}
    try:
        for file in files:
            if not file.filename.endswith(".csv"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid file type for {file.filename}. Only CSVs are allowed."
                )

            content = await file.read()
            df = pd.read_csv(BytesIO(content))

            # Detect which file is which by its columns
            cols = set(df.columns)
            if {"order_id", "user_id", "order_date", "Total cost"} <= cols:
                dfs["orders"] = df
            elif {"order_id", "product_id"} <= cols:
                dfs["order_products"] = df
            elif {"product_id", "product_name"} <= cols:
                dfs["products"] = df
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unknown schema in file {file.filename}"
                )

        # --- Ensure all files present ---
        for key in ["orders", "order_products", "products"]:
            if key not in dfs:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing {key}.csv file."
                )

        # --- Merge ---
        merged = dfs["order_products"].merge(dfs["products"], on="product_id", how="left")
        grouped = merged.groupby("order_id")["product_name"].apply(list).reset_index()

        # Join with orders table
        final_df = dfs["orders"].merge(grouped, on="order_id", how="left")

        # Rename and clean
        final_df.rename(columns={"product_name": "products"}, inplace=True)
        final_df["products"] = final_df["products"].apply(lambda x: x if isinstance(x, list) else [])

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error merging files: {e}")

    # --- Get next dataset_id ---
    try:
        query = f"SELECT MAX(dataset_id) AS last_id FROM `{TABLE_ID}`"
        result = list(bq_client.query(query).result())
        last_id = result[0].last_id or 0
        new_dataset_id = int(last_id) + 1
    except Exception as e:
        raise HTTPException(500, f"Failed to fetch last dataset_id: {e}")

    final_df["dataset_id"] = new_dataset_id

    # Ensure all BigQuery schema fields exist
    for f in SCHEMA:
        if f.name not in final_df.columns:
            final_df[f.name] = None

    # Convert to JSON
    json_data = final_df.to_json(orient="records", lines=True)

    # --- Upload to BigQuery ---
    try:
        job_config = bigquery.LoadJobConfig(
            source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
            schema=SCHEMA,
            write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
        )
        load_job = bq_client.load_table_from_file(
            BytesIO(json_data.encode("utf-8")), TABLE_ID, job_config=job_config
        )
        load_job.result()
    except Exception as e:
        raise HTTPException(500, f"BigQuery upload failed: {e}")

    # Optional local store
    storage.set_baskets(final_df.to_dict(orient="records"))

    return UploadResult(rows=len(final_df), columns=len(final_df.columns))
