"""Data preparation helpers.

We read from BigQuery instead of local CSV to reflect production warehouse access.
Filtering by category/product helps isolate interpretable time series.
"""

from typing import Optional

import pandas as pd

try:
    from google.cloud import bigquery
except Exception:  # pragma: no cover - optional dependency
    bigquery = None


def fetch_data_from_bigquery(category: Optional[str] = None,
                             product: Optional[str] = None,
                             limit: Optional[int] = None,
                             client: Optional[object] = None) -> pd.DataFrame:
    """Fetch data from BigQuery for a given category or product.

    Parameters
    ----------
    category : Optional[str]
        Category value to filter the query. If None, no category filter is applied.
    product : Optional[str]
        Product_Name value to filter the query. If None, no product filter is applied.
    limit : Optional[int]
        Optional LIMIT to reduce returned rows.
    client : Optional[bigquery.Client]
        Optional BigQuery client instance (useful for testing/mocking). If not provided,
        a new client is created using default credentials.

    Returns
    -------
    pd.DataFrame
        DataFrame with columns Date, Category, Product_Name, Quantity, Unit_Price, Total_Price
    """
    if bigquery is None and client is None:
        raise RuntimeError('google-cloud-bigquery is not installed or client not provided')

    if client is None:
        client = bigquery.Client(project="pivotal-canto-466205-p6-g8")

    query = (
        """
        SELECT Date, Category, Product_Name, Quantity, Unit_Price, Total_Price
        FROM `pivotal-canto-466205-p6-g8.inference_dataset.predictive_analysis`
        WHERE 1=1
        """
    )

    if category:
        # Note: for production, prefer parameterized queries to avoid SQL injection.
        query += f" AND Category = '{category}'"
    if product:
        query += f" AND Product_Name = '{product}'"

    query += " ORDER BY Date"
    if limit:
        query += f" LIMIT {int(limit)}"

    df = client.query(query).to_dataframe()
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values("Date")
    return df
