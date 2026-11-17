"""Patient service layer."""

from __future__ import annotations

from patients import db_sink
from patients.models import Patient, PatientCreate, PatientUpdate


def list_patients() -> list[Patient]:
    return db_sink.list_patients()


def get_patient(patient_id: str) -> Patient | None:
    return db_sink.get_patient(patient_id)


def create_patient(data: PatientCreate) -> Patient:
    return db_sink.create_patient(data)


def update_patient(patient_id: str, data: PatientUpdate) -> Patient | None:
    return db_sink.update_patient(patient_id, data)


def delete_patient(patient_id: str) -> bool:
    return db_sink.delete_patient(patient_id)
