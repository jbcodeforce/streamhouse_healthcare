"""Test Device Assignments models, inventory, and REST API."""

from __future__ import annotations

from unittest.mock import patch
from fastapi.testclient import TestClient

from device_assignments import inventory
from device_assignments.models import DeviceAssignment


def test_assignments_inventory_load() -> None:
    records = inventory.load()
    assert len(records) >= 5
    asg = next(r for r in records if r.assignment_id == "ASG-001")
    assert asg.patient_id == "P001"
    assert asg.device_id == "DEV-P001"


def test_assignments_api_list(client: TestClient) -> None:
    sample = [
        DeviceAssignment(
            assignment_id="ASG-001",
            patient_id="P001",
            device_id="DEV-P001",
            care_area_id="CA-ICU-01",
            bed_label="BED-ICU-101",
            status="ACTIVE",
        )
    ]
    with patch("device_assignments.service.list_assignments", return_value=sample):
        res = client.get("/api/v1/device-assignments")
        assert res.status_code == 200
        assert res.json()[0]["bed_label"] == "BED-ICU-101"
