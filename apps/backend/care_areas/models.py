"""Pydantic models for Care Areas and geofence perimeters."""

from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class CareAreaCreate(BaseModel):
    care_area_id: str = Field(..., description="Unique code or UUID for care area")
    name: str = Field(..., description="Display name of the ward or care area")
    facility_type: str = Field("WARD", description="Facility type: ICU, CARDIOLOGY, GENERAL, REHAB")
    center_lat: float = Field(..., description="Center latitude coordinate")
    center_lng: float = Field(..., description="Center longitude coordinate")
    radius_meters: float = Field(500.0, description="Geofence boundary radius in meters")


class CareAreaUpdate(BaseModel):
    name: str | None = None
    facility_type: str | None = None
    center_lat: float | None = None
    center_lng: float | None = None
    radius_meters: float | None = None


class CareArea(CareAreaCreate):
    created_at: datetime | None = None
    updated_at: datetime | None = None
