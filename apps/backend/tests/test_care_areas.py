"""Test Care Areas models, inventory, and REST API."""

from __future__ import annotations

from unittest.mock import patch
from fastapi.testclient import TestClient

from care_areas import inventory
from care_areas.models import CareArea, CareAreaCreate


def test_care_areas_inventory_load() -> None:
    records = inventory.load()
    assert len(records) >= 4
    assert any(r.care_area_id == "CA-ICU-01" for r in records)


def test_care_areas_api_list(client: TestClient) -> None:
    sample = [
        CareArea(
            care_area_id="CA-ICU-01",
            name="Intensive Care Unit A",
            facility_type="ICU",
            center_lat=41.8781,
            center_lng=-87.6298,
            radius_meters=150.0,
        )
    ]
    with patch("care_areas.service.list_care_areas", return_value=sample):
        res = client.get("/api/v1/care-areas")
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 1
        assert data[0]["care_area_id"] == "CA-ICU-01"


def test_care_areas_api_get_not_found(client: TestClient) -> None:
    with patch("care_areas.service.get_care_area", return_value=None):
        res = client.get("/api/v1/care-areas/CA-UNKNOWN")
        assert res.status_code == 404
