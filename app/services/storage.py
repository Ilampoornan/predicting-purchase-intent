from typing import Dict, Any

_data_store: Dict[str, Any] = {}

def save(key: str, value: Any) -> None:
    _data_store[key] = value

def get(key: str) -> Any:
    return _data_store.get(key)