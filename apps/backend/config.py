"""Application settings loaded from environment or .env file."""

from __future__ import annotations

import logging
import os
from functools import lru_cache
from typing import Any

from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("healthcare.config")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.getenv("ENV_CONFIG_FILE", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    database_url: str = "postgresql://dbadmin:localdevonly@localhost:5432/healthcaredb?sslmode=prefer"

    # Confluent Cloud & Kafka
    confluent_environment_id: str = ""
    cloud_region: str = "us-east-1"
    cloud_provider: str = "AWS"
    kafka_cluster_id: str = ""
    kafka_cluster_name: str = ""
    kafka_bootstrap_servers: str = ""
    kafka_rest_endpoint: str = ""
    kafka_api_key: str = ""
    kafka_api_secret: str = ""

    # Schema Registry
    schema_registry_id: str = ""
    schema_registry_url: str = ""
    schema_registry_api_key: str = ""
    schema_registry_api_secret: str = ""

    # Flink
    flink_catalog: str = ""
    flink_database: str = ""
    flink_rest_endpoint: str = "https://flink.us-east-1.AWS.confluent.cloud"
    flink_compute_pool_id: str = ""
    flink_patient_monitoring_compute_pool_id: str = ""
    flink_clinical_alerts_compute_pool_id: str = ""
    flink_device_ops_compute_pool_id: str = ""
    flink_snapshot_compute_pool_id: str = ""
    flink_api_key: str = ""
    flink_api_secret: str = ""

    # RTCE / Lightning & AI Chat
    confluent_global_key: str = ""
    confluent_global_secret: str = ""
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4o-mini"
    chat_produce_conversations: bool = False

    def rtce_mcp_url(self) -> str:
        """Derive the RTCE Context Engine MCP server URL."""
        return f"https://sql.{self.cloud_region.lower()}.{self.cloud_provider.lower()}.confluent.cloud/mcp"

    def lightning_query_url(self) -> str:
        """Derive the Lightning Query API URL."""
        return f"https://sql.{self.cloud_region.lower()}.{self.cloud_provider.lower()}.confluent.cloud/query/v1alpha1"

    def summary(self) -> dict[str, Any]:
        """Return a masked summary of settings for diagnostics."""

        def mask(val: str) -> str:
            if not val:
                return "[NOT SET]"
            if len(val) <= 4:
                return "***"
            return f"{val[:2]}...{val[-2:]}"

        return {
            "database_url": mask(self.database_url),
            "environment_id": self.confluent_environment_id or "[NOT SET]",
            "cloud_region": self.cloud_region,
            "cloud_provider": self.cloud_provider,
            "kafka_cluster_id": self.kafka_cluster_id or "[NOT SET]",
            "kafka_bootstrap_servers": mask(self.kafka_bootstrap_servers),
            "schema_registry_url": self.schema_registry_url or "[NOT SET]",
            "flink_database": self.flink_database or "[NOT SET]",
            "flink_snapshot_pool": self.flink_snapshot_compute_pool_id or "[NOT SET]",
            "confluent_global_key": mask(self.confluent_global_key),
            "openai_model": self.openai_model,
        }

    def log_summary(self) -> None:
        logger.info("Streamhouse Healthcare Settings: %s", self.summary())


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
