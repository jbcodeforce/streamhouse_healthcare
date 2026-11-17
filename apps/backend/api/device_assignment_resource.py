"""REST API router for Device Assignments."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status
from device_assignments import service
from device_assignments.models import DeviceAssignment, DeviceAssignmentCreate, DeviceAssignmentUpdate

router = APIRouter(prefix="/device-assignments", tags=["Device Assignments"])


@router.get("", response_model=list[DeviceAssignment])
def list_assignments(patient_id: str | None = Query(None)) -> list[DeviceAssignment]:
    return service.list_assignments(patient_id)


@router.get("/{assignment_id}", response_model=DeviceAssignment)
def get_assignment(assignment_id: str) -> DeviceAssignment:
    res = service.get_assignment(assignment_id)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Device assignment {assignment_id} not found")
    return res


@router.post("", response_model=DeviceAssignment, status_code=status.HTTP_201_CREATED)
def create_assignment(data: DeviceAssignmentCreate) -> DeviceAssignment:
    return service.create_assignment(data)


@router.put("/{assignment_id}", response_model=DeviceAssignment)
def update_assignment(assignment_id: str, data: DeviceAssignmentUpdate) -> DeviceAssignment:
    res = service.update_assignment(assignment_id, data)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Device assignment {assignment_id} not found")
    return res


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(assignment_id: str) -> None:
    if not service.delete_assignment(assignment_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Device assignment {assignment_id} not found")
