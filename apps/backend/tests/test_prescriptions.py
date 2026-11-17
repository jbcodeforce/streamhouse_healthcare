"""Test Prescriptions models, inventory, and REST API."""

from __future__ import annotations

from unittest.mock import patch
from fastapi.testclient import TestClient

from prescriptions import inventory
from prescriptions.models import Prescription


def test_prescriptions_inventory_load() -> None:
    records = inventory.load()
    assert len(records) >= 5
    rx = next(r for r in records if r.prescription_id == "RX-P001")
    assert rx.target_metric == "HEART_RATE"
    assert rx.min_threshold == 55.0


def test_prescriptions_api_list(client: TestClient) -> None:
    sample = [
        Prescription(
            prescription_id="RX-P001",
            patient_id="P001",
            target_metric="HEART_RATE",
            min_threshold=55.0,
            max_threshold=95.0,
            status="ACTIVE",
        )
    ]
    with patch("prescriptions.service.list_prescriptions", return_value=sample):
        res = client.get("/api/v1/prescriptions")
        assert res.status_code == 200
        assert res.json()[0]["target_metric"] == "HEART_RATE"
