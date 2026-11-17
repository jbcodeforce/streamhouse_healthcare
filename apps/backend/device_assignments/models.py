"""Pydantic models for Device Assignments."""

from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class DeviceAssignmentCreate(BaseModel):
    assignment_id: str = Field(..., description="Unique assignment ID (e.g. ASG-001)")
    patient_id: str = Field(..., description="Foreign key to patient")
    device_id: str = Field(..., description="Foreign key to device")
    care_area_id: str = Field(..., description="Foreign key to care area")
    bed_label: str = Field("UNASSIGNED", description="Bed / Room location label")
    status: str = Field("ACTIVE", description="Status: ACTIVE, RELEASED, TRANSFERRED")


class DeviceAssignmentUpdate(BaseModel):
    patient_id: str | None = None
    device_id: str | None = None
    care_area_id: str | None = None
    bed_label: str | None = None
    status: str | None = None


class DeviceAssignment(DeviceAssignmentCreate):
    created_at: datetime | None = None
    updated_at: datetime | None = None
