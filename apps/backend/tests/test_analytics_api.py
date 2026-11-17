"""Test Analytics, Chat, Scenarios, and Data Products APIs."""

from __future__ import annotations

from unittest.mock import patch
from fastapi.testclient import TestClient


def test_analytics_benchmark_api(client: TestClient) -> None:
    res = client.get("/api/v1/analytics/benchmark/P001")
    assert res.status_code == 200
    data = res.json()
    assert data["patient_id"] == "P001"
    assert "timings" in data
    assert "lightning_ms" in data["timings"]
    assert "snapshot_ms" in data["timings"]


def test_analytics_vitals_summary_api(client: TestClient) -> None:
    res = client.get("/api/v1/analytics/vitals-summary")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_chat_welcome_and_message(client: TestClient) -> None:
    w = client.get("/api/v1/chat/welcome")
    assert w.status_code == 200
    assert "Streamhouse" in w.json()["content"]

    msg = client.post("/api/v1/chat", json={"session_id": "test-session-1", "message": "What is P001 status?"})
    assert msg.status_code == 200
    assert "Alice Smith" in msg.json()["message"]


def test_scenarios_list_and_run(client: TestClient) -> None:
    res = client.get("/api/v1/scenarios")
    assert res.status_code == 200
    scenarios = res.json()
    assert len(scenarios) >= 4

    with patch("telemetry_events.service.create_events_batch", return_value=4):
        run_res = client.post("/api/v1/scenarios/vital_anomaly_streak/run")
        assert run_res.status_code == 200
        assert run_res.json()["success"] is True
        assert run_res.json()["cep_fact_table"] == "fct_vital_anomaly_streak"


def test_data_products_api(client: TestClient) -> None:
    res = client.get("/api/v1/data-products")
    assert res.status_code == 200
    products = res.json()
    assert len(products) >= 3

    p1 = client.get("/api/v1/data-products/patient_monitoring")
    assert p1.status_code == 200
    assert p1.json()["product_id"] == "patient_monitoring"

    costs = client.get("/api/v1/data-products/billing/costs")
    assert costs.status_code == 200
    assert len(costs.json()) >= 4
