"""CEP Scenario Registry definitions."""

from __future__ import annotations

from typing import Any
from pydantic import BaseModel, Field


class ScenarioEventTemplate(BaseModel):
    patient_id: str
    device_id: str
    event_type: str = "VITALS"
    heart_rate: int = 75
    spo2: float = 98.0
    lat: float = 41.8781
    lng: float = -87.6298
    battery_pct: int = 100
    button_pressed: bool = False
    offset_seconds: int = 0


class ScenarioDefinition(BaseModel):
    id: str
    title: str
    description: str
    cep_fact_table: str
    patient_id: str
    events: list[ScenarioEventTemplate]
    explanation: str


SCENARIOS: dict[str, ScenarioDefinition] = {
    "vital_anomaly_streak": ScenarioDefinition(
        id="vital_anomaly_streak",
        title="Vital Anomaly Streak (3 Consecutive Abnormal HR Readings)",
        description="Fires MATCH_RECOGNIZE when 3 consecutive telemetry events for the same patient have HR > 115 bpm within 15 minutes. Includes a negative control event for another patient.",
        cep_fact_table="fct_vital_anomaly_streak",
        patient_id="P001",
        events=[
            ScenarioEventTemplate(patient_id="P001", device_id="DEV-P001", heart_rate=122, spo2=94.0, offset_seconds=0),
            ScenarioEventTemplate(patient_id="P002", device_id="DEV-P002", heart_rate=72, spo2=98.5, offset_seconds=10),  # Negative control
            ScenarioEventTemplate(patient_id="P001", device_id="DEV-P001", heart_rate=126, spo2=93.5, offset_seconds=30),
            ScenarioEventTemplate(patient_id="P001", device_id="DEV-P001", heart_rate=131, spo2=92.0, offset_seconds=60),
        ],
        explanation="The first 3 events for P001 match pattern (A B C) where HR > 115. The negative control event for P002 is isolated by PARTITION BY patient_id.",
    ),
    "emergency_button_routing": ScenarioDefinition(
        id="emergency_button_routing",
        title="Emergency Button Escalation (Repeated Press in 5 Min)",
        description="Fires MATCH_RECOGNIZE when 2 emergency button presses occur for the same patient within a 5-minute window.",
        cep_fact_table="fct_emergency_button_routing",
        patient_id="P004",
        events=[
            ScenarioEventTemplate(patient_id="P004", device_id="DEV-P004", heart_rate=98, button_pressed=True, offset_seconds=0),
            ScenarioEventTemplate(patient_id="P004", device_id="DEV-P004", heart_rate=102, button_pressed=True, offset_seconds=45),
        ],
        explanation="Detects pattern (A B) where button_pressed=true within 5 minutes, routing urgent escalation to the cardiac response team.",
    ),
    "geofence_perimeter_breach": ScenarioDefinition(
        id="geofence_perimeter_breach",
        title="Geofence Perimeter Breach",
        description="Detects telemetry events reporting GPS coordinates outside the assigned care area radius (e.g. wandering patient).",
        cep_fact_table="fct_geofence_alerts",
        patient_id="P005",
        events=[
            ScenarioEventTemplate(patient_id="P005", device_id="DEV-P005", lat=41.8950, lng=-87.6100, offset_seconds=0),
        ],
        explanation="Patient P005 assigned to Rehab Center (41.8750, -87.6350) reports coordinates over 2.5km away, triggering a geofence breach alert.",
    ),
    "device_battery_drain": ScenarioDefinition(
        id="device_battery_drain",
        title="Abnormal Device Battery Drain (>= 15% Drop in 10 Min)",
        description="Fires MATCH_RECOGNIZE when a device's battery drops by 15% or more across 2 consecutive telemetry readings within 10 minutes.",
        cep_fact_table="fct_device_battery_drain",
        patient_id="P003",
        events=[
            ScenarioEventTemplate(patient_id="P003", device_id="DEV-P003", battery_pct=85, offset_seconds=0),
            ScenarioEventTemplate(patient_id="P003", device_id="DEV-P003", battery_pct=62, offset_seconds=30),
        ],
        explanation="Battery drops from 85% to 62% (23% delta) in 30 seconds, flagging hardware defect or short circuit.",
    ),
}


def list_scenarios() -> list[dict[str, Any]]:
    return [s.model_dump() for s in SCENARIOS.values()]


def get_scenario(scenario_id: str) -> ScenarioDefinition | None:
    return SCENARIOS.get(scenario_id)
