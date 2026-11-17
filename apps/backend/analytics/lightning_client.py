"""Confluent Cloud Lightning Query API Client for sub-10ms RTCE point lookups."""

from __future__ import annotations

import logging
from typing import Any
import httpx

from config import get_settings

logger = logging.getLogger("healthcare.analytics.lightning")


class LightningClient:
    def __init__(self) -> None:
        self.settings = get_settings()

    def point_lookup(self, table: str, key_column: str, key_value: str) -> dict[str, Any] | None:
        """Perform a low-latency point lookup on an RTCE-registered materialized table."""
        s = self.settings
        if not s.confluent_global_key or not s.confluent_global_secret:
            logger.warning("Global key not configured for Lightning lookup")
            return None

        url = s.lightning_query_url()
        payload = {
            "query": f"SELECT * FROM `{table}` WHERE `{key_column}` = '{key_value}'",
            "context": {
                "environment_id": s.confluent_environment_id,
                "kafka_cluster_id": s.kafka_cluster_id,
            },
        }

        try:
            with httpx.Client(timeout=5.0) as client:
                res = client.post(
                    url,
                    auth=(s.confluent_global_key, s.confluent_global_secret),
                    json=payload,
                )
                if res.status_code == 200:
                    data = res.json()
                    rows = data.get("rows", [])
                    return rows[0] if rows else None
                logger.warning("Lightning query returned %d: %s", res.status_code, res.text)
                return None
        except Exception as e:
            logger.error("Lightning query error: %s", e)
            return None
