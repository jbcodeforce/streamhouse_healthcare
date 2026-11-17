"""Telemetry event service layer."""

from __future__ import annotations

from telemetry_events import db_sink
from telemetry_events.models import TelemetryEvent, TelemetryEventCreate


def list_events(patient_id: str | None = None, limit: int = 100) -> list[TelemetryEvent]:
    return db_sink.list_events(patient_id, limit)


def get_event(event_id: str) -> TelemetryEvent | None:
    return db_sink.get_event(event_id)


def create_event(data: TelemetryEventCreate) -> TelemetryEvent:
    return db_sink.create_event(data)


def create_events_batch(events: list[TelemetryEventCreate]) -> int:
    return db_sink.create_events_batch(events)
