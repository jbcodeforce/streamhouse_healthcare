"""REST API router for Telemetry Events."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status
from telemetry_events import generator, service
from telemetry_events.models import BulkGenerateRequest, TelemetryEvent, TelemetryEventCreate

router = APIRouter(prefix="/telemetry-events", tags=["Telemetry Events"])


@router.get("", response_model=list[TelemetryEvent])
def list_events(
    patient_id: str | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
) -> list[TelemetryEvent]:
    return service.list_events(patient_id, limit)


@router.get("/{event_id}", response_model=TelemetryEvent)
def get_event(event_id: str) -> TelemetryEvent:
    res = service.get_event(event_id)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Telemetry event {event_id} not found")
    return res


@router.post("", response_model=TelemetryEvent, status_code=status.HTTP_201_CREATED)
def create_event(data: TelemetryEventCreate) -> TelemetryEvent:
    return service.create_event(data)


@router.post("/generate", response_model=dict[str, int])
def generate_bulk(data: BulkGenerateRequest) -> dict[str, int]:
    return generator.generate_bulk_events(data)
