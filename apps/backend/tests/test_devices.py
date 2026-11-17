"""Test Devices models, inventory, and REST API."""

from __future__ import annotations

from unittest.mock import patch
from fastapi.testclient import TestClient

from devices import inventory
from devices.models import Device


def test_devices_inventory_load() -> None:
    records = inventory.load()
    assert len(records) >= 6
    dev = next(r for r in records if r.device_id == "DEV-P001")
    assert dev.model_id == "MOD-OX-100"
    assert dev.battery_pct > 0


def test_devices_api_list(client: TestClient) -> None:
    sample = [
        Device(
            device_id="DEV-P001",
            model_id="MOD-OX-100",
            serial_number="SN-OX-9812",
            firmware_version="v3.2.1",
            battery_pct=88,
            status="ASSIGNED",
        )
    ]
    with patch("devices.service.list_devices", return_value=sample):
        res = client.get("/api/v1/devices")
        assert res.status_code == 200
        assert res.json()[0]["serial_number"] == "SN-OX-9812"
