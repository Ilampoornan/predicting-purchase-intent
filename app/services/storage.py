from typing import Dict, Any, List

_data_store: Dict[str, Any] = {}

def save(key: str, value: Any) -> None:
    _data_store[key] = value

def get(key: str) -> Any:
    return _data_store.get(key)

def set_baskets(records: List[Dict[str, Any]]) -> None:
    _data_store["baskets"] = records

def get_baskets() -> Any:
    return _data_store.get("baskets")