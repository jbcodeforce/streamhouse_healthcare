"""Test Patients models, inventory, and REST API."""

from __future__ import annotations

from unittest.mock import patch
from fastapi.testclient import TestClient

from patients import inventory
from patients.models import Patient


def test_patients_inventory_load() -> None:
    records = inventory.load()
    assert len(records) >= 5
    p1 = next(r for r in records if r.patient_id == "P001")
    assert p1.full_name == "Alice Smith"
    assert p1.risk_tier == "HIGH"


def test_patients_api_list(client: TestClient) -> None:
    sample = [
        Patient(
            patient_id="P001",
            full_name="Alice Smith",
            gender="F",
            birth_date="1980-05-12",
            risk_tier="HIGH",
            primary_condition="Arrhythmia",
            status="ACTIVE",
        )
    ]
    with patch("patients.service.list_patients", return_value=sample):
        res = client.get("/api/v1/patients")
        assert res.status_code == 200
        assert res.json()[0]["full_name"] == "Alice Smith"


def test_patients_api_create(client: TestClient) -> None:
    payload = {
        "patient_id": "P999",
        "full_name": "Test Patient",
        "gender": "M",
        "birth_date": "1995-01-01",
        "risk_tier": "LOW",
        "primary_condition": "Healthy Checkup",
        "status": "ACTIVE",
    }
    with patch("patients.service.create_patient", return_value=Patient(**payload)):
        res = client.post("/api/v1/patients", json=payload)
        assert res.status_code == 201
        assert res.json()["patient_id"] == "P999"
