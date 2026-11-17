"""REST API router for Analytics and Lightning benchmark."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from analytics.service import get_analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/vitals-summary", response_model=list[dict[str, Any]])
def get_vitals_summary() -> list[dict[str, Any]]:
    return get_analytics_service().get_vitals_summary()


@router.get("/benchmark/{patient_id}", response_model=dict[str, Any])
def get_benchmark(patient_id: str) -> dict[str, Any]:
    return get_analytics_service().get_patient_profile_benchmark(patient_id)
