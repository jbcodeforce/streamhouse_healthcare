"""Pydantic models for Medical Devices."""

from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class DeviceCreate(BaseModel):
    device_id: str = Field(..., description="Unique Device ID (e.g. DEV-P001)")
    model_id: str = Field("MOD-OX-100", description="Model ID matching reference models")
    serial_number: str = Field(..., description="Hardware serial number")
    firmware_version: str = Field("v1.0.0", description="Current firmware version")
    battery_pct: int = Field(100, ge=0, le=100, description="Battery percentage (0-100)")
    status: str = Field("AVAILABLE", description="Device status: AVAILABLE, ASSIGNED, MAINTENANCE")


class DeviceUpdate(BaseModel):
    model_id: str | None = None
    serial_number: str | None = None
    firmware_version: str | None = None
    battery_pct: int | None = Field(None, ge=0, le=100)
    status: str | None = None


class Device(DeviceCreate):
    created_at: datetime | None = None
    updated_at: datetime | None = None
