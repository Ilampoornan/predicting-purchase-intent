from fastapi import APIRouter, Query, HTTPException
from google.cloud import bigquery
import ast, json

router = APIRouter()

ORDERS_TABLE = "pivotal-canto-466205-p6.intent_inference.Orders"

@router.get("/orders")
async def get_orders(dataset_id: int = Query(...)):
    """
    Returns all orders for a given dataset_id, including products and intent fields.
    """
    bq_client = bigquery.Client()
    try:
        query = f"SELECT order_id, products, intent FROM `{ORDERS_TABLE}` WHERE dataset_id = @dataset_id"
        print(f"DEBUG: Running BigQuery: {query} with dataset_id={dataset_id}")
        job_config = bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("dataset_id", "INT64", dataset_id)]
        )
        df = bq_client.query(query, job_config=job_config).to_dataframe()
        
      
        import numpy as np
        def parse_products(val):
            if isinstance(val, np.ndarray):
                return val.tolist()
            if isinstance(val, list):
                return val
            if isinstance(val, str):
                try:
                    parsed = json.loads(val)
                    if isinstance(parsed, list):
                        return parsed
                except Exception:
                    pass
                try:
                    parsed = ast.literal_eval(val)
                    if isinstance(parsed, list):
                        return parsed
                except Exception:
                    pass
                if val.startswith("[") and val.endswith("]"):
                    return [v.strip() for v in val[1:-1].split(",") if v.strip()]
                return [v.strip() for v in val.split(",") if v.strip()]
            return []
        df["products"] = df["products"].apply(parse_products)
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying orders: {str(e)}")
 