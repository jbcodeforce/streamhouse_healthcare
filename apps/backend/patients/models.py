"""Pydantic models for Patient entity."""

from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class PatientCreate(BaseModel):
    patient_id: str = Field(..., description="Unique Patient Identifier (e.g. P001)")
    full_name: str = Field(..., description="Full Name of the patient")
    gender: str = Field("U", description="Gender: M, F, U")
    birth_date: str = Field("1980-01-01", description="Date of birth YYYY-MM-DD")
    risk_tier: str = Field("LOW", description="Risk tier: LOW, MEDIUM, HIGH, CRITICAL")
    primary_condition: str = Field("General Observation", description="Primary medical condition")
    status: str = Field("ACTIVE", description="Status: ACTIVE, DISCHARGED, TRANSFERRED")


class PatientUpdate(BaseModel):
    full_name: str | None = None
    gender: str | None = None
    birth_date: str | None = None
    risk_tier: str | None = None
    primary_condition: str | None = None
    status: str | None = None


class Patient(PatientCreate):
    created_at: datetime | None = None
    updated_at: datetime | None = None
