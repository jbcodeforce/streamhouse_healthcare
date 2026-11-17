"""PostgreSQL DAO for Telemetry Events."""

from __future__ import annotations

import logging
from typing import Sequence
import db
from telemetry_events.models import TelemetryEvent, TelemetryEventCreate

logger = logging.getLogger("healthcare.telemetry.db")

_DDL = """
CREATE TABLE IF NOT EXISTS telemetry_events (
    event_id VARCHAR(64) PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    event_type VARCHAR(32) NOT NULL DEFAULT 'VITALS',
    heart_rate INT NOT NULL DEFAULT 75,
    spo2 DOUBLE PRECISION NOT NULL DEFAULT 98.0,
    systolic_bp INT NOT NULL DEFAULT 120,
    diastolic_bp INT NOT NULL DEFAULT 80,
    lat DOUBLE PRECISION NOT NULL DEFAULT 41.8781,
    lng DOUBLE PRECISION NOT NULL DEFAULT -87.6298,
    battery_pct INT NOT NULL DEFAULT 100,
    button_pressed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_patient ON telemetry_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_device ON telemetry_events(device_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON telemetry_events(created_at DESC);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_telemetry_events_updated_at'
    ) THEN
        CREATE TRIGGER trg_telemetry_events_updated_at
        BEFORE UPDATE ON telemetry_events
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END;
$$;
"""

_INSERT_SQL = """
INSERT INTO telemetry_events (
    event_id, device_id, patient_id, event_type, heart_rate, spo2,
    systolic_bp, diastolic_bp, lat, lng, battery_pct, button_pressed
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (event_id) DO UPDATE SET
    device_id = EXCLUDED.device_id,
    patient_id = EXCLUDED.patient_id,
    event_type = EXCLUDED.event_type,
    heart_rate = EXCLUDED.heart_rate,
    spo2 = EXCLUDED.spo2,
    systolic_bp = EXCLUDED.systolic_bp,
    diastolic_bp = EXCLUDED.diastolic_bp,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    battery_pct = EXCLUDED.battery_pct,
    button_pressed = EXCLUDED.button_pressed
"""


def init_db() -> None:
    db.init_schema(_DDL, cdc_table="telemetry_events")


def seed_from_rows(rows: Sequence[TelemetryEventCreate]) -> int:
    return db.seed_if_empty(
        "telemetry_events",
        rows,
        _INSERT_SQL,
        lambda r: (
            r.event_id, r.device_id, r.patient_id, r.event_type, r.heart_rate, r.spo2,
            r.systolic_bp, r.diastolic_bp, r.lat, r.lng, r.battery_pct, r.button_pressed
        ),
        label="telemetry_events",
    )


def list_events(patient_id: str | None = None, limit: int = 100) -> list[TelemetryEvent]:
    with db.cursor(dict_rows=True) as cur:
        if patient_id:
            cur.execute(
                "SELECT * FROM telemetry_events WHERE patient_id = %s ORDER BY created_at DESC LIMIT %s",
                (patient_id, limit),
            )
        else:
            cur.execute("SELECT * FROM telemetry_events ORDER BY created_at DESC LIMIT %s", (limit,))
        return [TelemetryEvent(**row) for row in cur.fetchall()]


def get_event(event_id: str) -> TelemetryEvent | None:
    with db.cursor(dict_rows=True) as cur:
        cur.execute("SELECT * FROM telemetry_events WHERE event_id = %s", (event_id,))
        row = cur.fetchone()
        return TelemetryEvent(**row) if row else None


def create_event(data: TelemetryEventCreate) -> TelemetryEvent:
    with db.cursor(dict_rows=True, commit=True) as cur:
        cur.execute(
            """
            INSERT INTO telemetry_events (
                event_id, device_id, patient_id, event_type, heart_rate, spo2,
                systolic_bp, diastolic_bp, lat, lng, battery_pct, button_pressed
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                data.event_id, data.device_id, data.patient_id, data.event_type, data.heart_rate, data.spo2,
                data.systolic_bp, data.diastolic_bp, data.lat, data.lng, data.battery_pct, data.button_pressed
            ),
        )
        return TelemetryEvent(**cur.fetchone())


def create_events_batch(events: Sequence[TelemetryEventCreate]) -> int:
    if not events:
        return 0
    with db.cursor(commit=True) as cur:
        for data in events:
            cur.execute(
                _INSERT_SQL,
                (
                    data.event_id, data.device_id, data.patient_id, data.event_type, data.heart_rate, data.spo2,
                    data.systolic_bp, data.diastolic_bp, data.lat, data.lng, data.battery_pct, data.button_pressed
                ),
            )
        return len(events)
