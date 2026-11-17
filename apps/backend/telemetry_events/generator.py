"""Bulk telemetry generator for realistic simulation of patient vital signs."""

from __future__ import annotations

import random
import uuid
from telemetry_events import service
from telemetry_events.models import BulkGenerateRequest, TelemetryEventCreate

_DEFAULT_PATIENTS = [
    ("P001", "DEV-P001", 72, 98.0, 41.8781, -87.6298),
    ("P002", "DEV-P002", 68, 97.5, 41.8790, -87.6310),
    ("P003", "DEV-P003", 75, 99.0, 41.8805, -87.6280),
    ("P004", "DEV-P004", 82, 95.0, 41.8781, -87.6298),
    ("P005", "DEV-P005", 70, 98.5, 41.8750, -87.6350),
]


def generate_bulk_events(req: BulkGenerateRequest) -> dict[str, int]:
    """Generate realistic vitals telemetry for patients."""
    events: list[TelemetryEventCreate] = []

    for i in range(req.count):
        if req.patient_id:
            matched = [p for p in _DEFAULT_PATIENTS if p[0] == req.patient_id]
            pid, dev_id, base_hr, base_spo2, base_lat, base_lng = matched[0] if matched else (req.patient_id, f"DEV-{req.patient_id}", 75, 98.0, 41.8781, -87.6298)
        else:
            pid, dev_id, base_hr, base_spo2, base_lat, base_lng = random.choice(_DEFAULT_PATIENTS)

        # Small random variation
        hr = int(max(45, min(140, base_hr + random.randint(-8, 10))))
        spo2 = round(max(88.0, min(100.0, base_spo2 + random.uniform(-1.5, 1.0))), 1)
        systolic = int(120 + random.randint(-10, 15))
        diastolic = int(80 + random.randint(-6, 10))
        lat = round(base_lat + random.uniform(-0.001, 0.001), 6)
        lng = round(base_lng + random.uniform(-0.001, 0.001), 6)
        battery = max(10, 100 - (i % 30))

        events.append(
            TelemetryEventCreate(
                event_id=f"EVT-GEN-{uuid.uuid4().hex[:10].upper()}",
                device_id=dev_id,
                patient_id=pid,
                event_type="VITALS",
                heart_rate=hr,
                spo2=spo2,
                systolic_bp=systolic,
                diastolic_bp=diastolic,
                lat=lat,
                lng=lng,
                battery_pct=battery,
                button_pressed=False,
            )
        )

    count = service.create_events_batch(events)
    return {"generated_count": count}
