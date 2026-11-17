"""Test Telemetry Events models, inventory, generator, and REST API."""

from __future__ import annotations

from unittest.mock import patch
from fastapi.testclient import TestClient

from telemetry_events import generator, inventory
from telemetry_events.models import TelemetryEvent, TelemetryEventCreate


def test_telemetry_inventory_load() -> None:
    records = inventory.load()
    assert len(records) >= 5
    evt = records[0]
    assert evt.heart_rate > 0
    assert evt.spo2 > 90.0


def test_telemetry_generator() -> None:
    with patch("telemetry_events.service.create_events_batch", return_value=10):
        res = generator.generate_bulk_events(generator.BulkGenerateRequest(count=10))
        assert res["generated_count"] == 10


def test_telemetry_api_list(client: TestClient) -> None:
    sample = [
        TelemetryEvent(
            event_id="EVT-001",
            device_id="DEV-P001",
            patient_id="P001",
            event_type="VITALS",
            heart_rate=72,
            spo2=98.5,
            systolic_bp=120,
            diastolic_bp=80,
            lat=41.8781,
            lng=-87.6298,
            battery_pct=88,
            button_pressed=False,
        )
    ]
    with patch("telemetry_events.service.list_events", return_value=sample):
        res = client.get("/api/v1/telemetry-events")
        assert res.status_code == 200
        assert res.json()[0]["heart_rate"] == 72
