"""Data products catalog and statement lineage service."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

_DESCRIPTORS_DIR = Path(__file__).parent / "descriptors"


def list_data_products() -> list[dict[str, Any]]:
    products = []
    if _DESCRIPTORS_DIR.exists():
        for file in sorted(_DESCRIPTORS_DIR.glob("*.json")):
            try:
                with open(file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    products.append(data)
            except Exception:
                continue
    return products


def get_data_product(product_id: str) -> dict[str, Any] | None:
    path = _DESCRIPTORS_DIR / f"{product_id}.json"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return None


def get_billing_costs() -> list[dict[str, Any]]:
    """Return estimated monthly cost breakdown across compute pools."""
    return [
        {"pool_name": "sh-hc-flink-pool (Patient Monitoring)", "cfu": 10, "monthly_cost_usd": 125.00},
        {"pool_name": "sh-hc-alerts-flink-pool (Clinical Alerts)", "cfu": 10, "monthly_cost_usd": 125.00},
        {"pool_name": "sh-hc-device-flink-pool (Device Ops)", "cfu": 10, "monthly_cost_usd": 125.00},
        {"pool_name": "sh-hc-snapshot-q-pool (Snapshot Query)", "cfu": 10, "monthly_cost_usd": 62.50},
    ]
