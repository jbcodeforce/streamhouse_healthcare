"""Pydantic models for Prescriptions."""

from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class PrescriptionCreate(BaseModel):
    prescription_id: str = Field(..., description="Unique prescription ID (e.g. RX-P001)")
    patient_id: str = Field(..., description="Foreign key to patient")
    target_metric: str = Field("HEART_RATE", description="Metric type: HEART_RATE, SPO2, SYSTOLIC_BP")
    min_threshold: float = Field(60.0, description="Minimum acceptable clinical threshold")
    max_threshold: float = Field(100.0, description="Maximum acceptable clinical threshold")
    status: str = Field("ACTIVE", description="Status: ACTIVE, COMPLETED, CANCELLED")


class PrescriptionUpdate(BaseModel):
    patient_id: str | None = None
    target_metric: str | None = None
    min_threshold: float | None = None
    max_threshold: float | None = None
    status: str | None = None


class Prescription(PrescriptionCreate):
    created_at: datetime | None = None
    updated_at: datetime | None = None
