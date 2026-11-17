"""REST API router for Patients."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from patients import service
from patients.models import Patient, PatientCreate, PatientUpdate

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("", response_model=list[Patient])
def list_patients() -> list[Patient]:
    return service.list_patients()


@router.get("/{patient_id}", response_model=Patient)
def get_patient(patient_id: str) -> Patient:
    res = service.get_patient(patient_id)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Patient {patient_id} not found")
    return res


@router.post("", response_model=Patient, status_code=status.HTTP_201_CREATED)
def create_patient(data: PatientCreate) -> Patient:
    return service.create_patient(data)


@router.put("/{patient_id}", response_model=Patient)
def update_patient(patient_id: str, data: PatientUpdate) -> Patient:
    res = service.update_patient(patient_id, data)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Patient {patient_id} not found")
    return res


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: str) -> None:
    if not service.delete_patient(patient_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Patient {patient_id} not found")
