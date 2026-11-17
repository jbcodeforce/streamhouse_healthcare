"""CEP Scenario execution runner."""

from __future__ import annotations

import logging
import uuid
from scenarios.registry import get_scenario
from telemetry_events import service as telemetry_svc
from telemetry_events.models import TelemetryEventCreate

logger = logging.getLogger("healthcare.scenarios.runner")


def run_scenario(scenario_id: str) -> dict[str, Any]:
    scenario = get_scenario(scenario_id)
    if not scenario:
        return {"success": False, "error": f"Scenario {scenario_id} not found"}

    events_to_insert: list[TelemetryEventCreate] = []
    for evt in scenario.events:
        event_id = f"EVT-CEP-{uuid.uuid4().hex[:10].upper()}"
        events_to_insert.append(
            TelemetryEventCreate(
                event_id=event_id,
                device_id=evt.device_id,
                patient_id=evt.patient_id,
                event_type=evt.event_type,
                heart_rate=evt.heart_rate,
                spo2=evt.spo2,
                systolic_bp=120,
                diastolic_bp=80,
                lat=evt.lat,
                lng=evt.lng,
                battery_pct=evt.battery_pct,
                button_pressed=evt.button_pressed,
            )
        )

    count = telemetry_svc.create_events_batch(events_to_insert)
    logger.info("Executed scenario %s: inserted %d events into PostgreSQL", scenario_id, count)

    return {
        "success": True,
        "scenario_id": scenario_id,
        "title": scenario.title,
        "cep_fact_table": scenario.cep_fact_table,
        "events_injected": count,
        "explanation": scenario.explanation,
    }
