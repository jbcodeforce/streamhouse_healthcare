"""Device assignment service layer."""

from __future__ import annotations

from device_assignments import db_sink
from device_assignments.models import DeviceAssignment, DeviceAssignmentCreate, DeviceAssignmentUpdate


def list_assignments(patient_id: str | None = None) -> list[DeviceAssignment]:
    return db_sink.list_assignments(patient_id)


def get_assignment(assignment_id: str) -> DeviceAssignment | None:
    return db_sink.get_assignment(assignment_id)


def create_assignment(data: DeviceAssignmentCreate) -> DeviceAssignment:
    return db_sink.create_assignment(data)


def update_assignment(assignment_id: str, data: DeviceAssignmentUpdate) -> DeviceAssignment | None:
    return db_sink.update_assignment(assignment_id, data)


def delete_assignment(assignment_id: str) -> bool:
    return db_sink.delete_assignment(assignment_id)
