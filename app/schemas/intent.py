from pydantic import BaseModel

class UploadResult(BaseModel):
    rows: int
    columns: int

class ProcessResult(BaseModel):
    processed_baskets: int
    unique_intents: int
    time_ms: float

class AggregateRow(BaseModel):
    intent: str
    count: int