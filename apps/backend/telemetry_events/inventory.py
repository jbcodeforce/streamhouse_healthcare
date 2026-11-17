"""Telemetry events CSV inventory reader."""

from __future__ import annotations

import csv
import os
from pathlib import Path
from telemetry_events.models import TelemetryEventCreate

_DEFAULT_CSV = Path(__file__).parent / "data" / "telemetry_events.csv"


def load(csv_path: str | Path | None = None) -> list[TelemetryEventCreate]:
    path = Path(csv_path or os.getenv("TELEMETRY_EVENTS_CSV_PATH", _DEFAULT_CSV))
    if not path.exists():
        return []
    records = []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(
                TelemetryEventCreate(
                    event_id=row["event_id"].strip(),
                    device_id=row["device_id"].strip(),
                    patient_id=row["patient_id"].strip(),
                    event_type=row.get("event_type", "VITALS").strip(),
                    heart_rate=int(row.get("heart_rate", 75)),
                    spo2=float(row.get("spo2", 98.0)),
                    systolic_bp=int(row.get("systolic_bp", 120)),
                    diastolic_bp=int(row.get("diastolic_bp", 80)),
                    lat=float(row.get("lat", 41.8781)),
                    lng=float(row.get("lng", -87.6298)),
                    battery_pct=int(row.get("battery_pct", 100)),
                    button_pressed=row.get("button_pressed", "false").lower() in ("true", "1", "yes"),
                )
            )
    return records
