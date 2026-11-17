"""Confluent Cloud Flink SQL Client for ad-hoc Snapshot queries."""

from __future__ import annotations

import logging
from typing import Any

from config import get_settings

logger = logging.getLogger("healthcare.analytics.sql")


class ConfluentSqlClient:
    def __init__(self) -> None:
        self.settings = get_settings()

    def query(self, sql: str) -> list[dict[str, Any]]:
        """Run an ad-hoc snapshot query against the dedicated snapshot compute pool."""
        s = self.settings
        if not s.flink_api_key or not s.flink_api_secret or not s.confluent_environment_id:
            logger.warning("Flink credentials not configured, returning empty snapshot result")
            return []

        try:
            import confluent_sql

            pool_id = s.flink_snapshot_compute_pool_id or s.flink_compute_pool_id
            conn = confluent_sql.connect(
                organization_id="",  # Inferred by API key
                environment_id=s.confluent_environment_id,
                cloud_provider=s.cloud_provider,
                cloud_region=s.cloud_region,
                compute_pool_id=pool_id,
                flink_api_key=s.flink_api_key,
                flink_api_secret=s.flink_api_secret,
                database=s.flink_database,
                database_kafka_cluster_id=s.kafka_cluster_id,
            )
            with conn.cursor() as cur:
                cur.execute(sql)
                cols = [desc[0] for desc in cur.description] if cur.description else []
                rows = cur.fetchall()
                return [dict(zip(cols, row)) for row in rows]
        except Exception as e:
            logger.error("Snapshot query error: %s", e)
            return []
