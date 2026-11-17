"""Prescription service layer."""

from __future__ import annotations

from prescriptions import db_sink
from prescriptions.models import Prescription, PrescriptionCreate, PrescriptionUpdate


def list_prescriptions(patient_id: str | None = None) -> list[Prescription]:
    return db_sink.list_prescriptions(patient_id)


def get_prescription(prescription_id: str) -> Prescription | None:
    return db_sink.get_prescription(prescription_id)


def create_prescription(data: PrescriptionCreate) -> Prescription:
    return db_sink.create_prescription(data)


def update_prescription(prescription_id: str, data: PrescriptionUpdate) -> Prescription | None:
    return db_sink.update_prescription(prescription_id, data)


def delete_prescription(prescription_id: str) -> bool:
    return db_sink.delete_prescription(prescription_id)
