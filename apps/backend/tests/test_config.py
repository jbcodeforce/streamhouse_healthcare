"""Test configuration masking and MCP URL derivations."""

from __future__ import annotations

from config import Settings


def test_config_defaults() -> None:
    s = Settings()
    assert s.cloud_region == "us-east-1"
    assert s.cloud_provider == "AWS"
    assert "us-east-1.aws.confluent.cloud" in s.rtce_mcp_url()
    assert "query/v1alpha1" in s.lightning_query_url()


def test_config_summary_masks_secrets() -> None:
    s = Settings(
        database_url="postgresql://dbadmin:secretpw123@localhost:5432/healthcaredb",
        kafka_api_key="AKIA1234567890",
        confluent_global_key="GLOBALKEY123",
    )
    summary = s.summary()
    assert "secretpw123" not in str(summary)
    assert summary["confluent_global_key"] != "GLOBALKEY123"
    assert summary["confluent_global_key"].startswith("GL...")
