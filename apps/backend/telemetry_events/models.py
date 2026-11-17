"""Pydantic models for Telemetry Events."""

from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class TelemetryEventCreate(BaseModel):
    event_id: str = Field(..., description="Unique event identifier (e.g. EVT-001)")
    device_id: str = Field(..., description="Medical Device ID")
    patient_id: str = Field(..., description="Patient ID")
    event_type: str = Field("VITALS", description="Event type: VITALS, ALERT, LOCATION")
    heart_rate: int = Field(75, ge=20, le=250, description="Heart rate in BPM")
    spo2: float = Field(98.0, ge=50.0, le=100.0, description="Blood oxygen saturation percentage")
    systolic_bp: int = Field(120, description="Systolic blood pressure mmHg")
    diastolic_bp: int = Field(80, description="Diastolic blood pressure mmHg")
    lat: float = Field(41.8781, description="Current device latitude coordinate")
    lng: float = Field(-87.6298, description="Current device longitude coordinate")
    battery_pct: int = Field(100, ge=0, le=100, description="Battery percentage (0-100)")
    button_pressed: bool = Field(False, description="Emergency button press trigger flag")


class TelemetryEvent(TelemetryEventCreate):
    created_at: datetime | None = None
    updated_at: datetime | None = None


class BulkGenerateRequest(BaseModel):
    count: int = Field(50, ge=1, le=500, description="Number of events to generate")
    patient_id: str | None = Field(None, description="Optional target patient ID")
    minutes_interval: int = Field(5, ge=1, le=60, description="Spacing between generated timestamps")
