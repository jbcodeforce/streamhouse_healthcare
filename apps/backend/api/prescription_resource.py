"""REST API router for Prescriptions."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status
from prescriptions import service
from prescriptions.models import Prescription, PrescriptionCreate, PrescriptionUpdate

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.get("", response_model=list[Prescription])
def list_prescriptions(patient_id: str | None = Query(None)) -> list[Prescription]:
    return service.list_prescriptions(patient_id)


@router.get("/{prescription_id}", response_model=Prescription)
def get_prescription(prescription_id: str) -> Prescription:
    res = service.get_prescription(prescription_id)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prescription {prescription_id} not found")
    return res


@router.post("", response_model=Prescription, status_code=status.HTTP_201_CREATED)
def create_prescription(data: PrescriptionCreate) -> Prescription:
    return service.create_prescription(data)


@router.put("/{prescription_id}", response_model=Prescription)
def update_prescription(prescription_id: str, data: PrescriptionUpdate) -> Prescription:
    res = service.update_prescription(prescription_id, data)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prescription {prescription_id} not found")
    return res


@router.delete("/{prescription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prescription(prescription_id: str) -> None:
    if not service.delete_prescription(prescription_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prescription {prescription_id} not found")
