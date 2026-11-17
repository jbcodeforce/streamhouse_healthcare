"""PostgreSQL DAO for Device Assignments."""

from __future__ import annotations

import logging
from typing import Sequence
import db
from device_assignments.models import DeviceAssignment, DeviceAssignmentCreate, DeviceAssignmentUpdate

logger = logging.getLogger("healthcare.device_assignments.db")

_DDL = """
CREATE TABLE IF NOT EXISTS device_assignments (
    assignment_id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    device_id VARCHAR(64) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
    care_area_id VARCHAR(64) NOT NULL REFERENCES care_areas(care_area_id) ON DELETE CASCADE,
    bed_label VARCHAR(64) NOT NULL DEFAULT 'UNASSIGNED',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_assignments_patient ON device_assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_device_assignments_device ON device_assignments(device_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_device_assignments_updated_at'
    ) THEN
        CREATE TRIGGER trg_device_assignments_updated_at
        BEFORE UPDATE ON device_assignments
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END;
$$;
"""

_INSERT_SQL = """
INSERT INTO device_assignments (assignment_id, patient_id, device_id, care_area_id, bed_label, status)
VALUES (%s, %s, %s, %s, %s, %s)
ON CONFLICT (assignment_id) DO UPDATE SET
    patient_id = EXCLUDED.patient_id,
    device_id = EXCLUDED.device_id,
    care_area_id = EXCLUDED.care_area_id,
    bed_label = EXCLUDED.bed_label,
    status = EXCLUDED.status
"""


def init_db() -> None:
    db.init_schema(_DDL, cdc_table="device_assignments")


def seed_from_rows(rows: Sequence[DeviceAssignmentCreate]) -> int:
    return db.seed_if_empty(
        "device_assignments",
        rows,
        _INSERT_SQL,
        lambda r: (r.assignment_id, r.patient_id, r.device_id, r.care_area_id, r.bed_label, r.status),
        label="device_assignments",
    )


def list_assignments(patient_id: str | None = None) -> list[DeviceAssignment]:
    with db.cursor(dict_rows=True) as cur:
        if patient_id:
            cur.execute("SELECT * FROM device_assignments WHERE patient_id = %s ORDER BY created_at DESC", (patient_id,))
        else:
            cur.execute("SELECT * FROM device_assignments ORDER BY created_at DESC")
        return [DeviceAssignment(**row) for row in cur.fetchall()]


def get_assignment(assignment_id: str) -> DeviceAssignment | None:
    with db.cursor(dict_rows=True) as cur:
        cur.execute("SELECT * FROM device_assignments WHERE assignment_id = %s", (assignment_id,))
        row = cur.fetchone()
        return DeviceAssignment(**row) if row else None


def create_assignment(data: DeviceAssignmentCreate) -> DeviceAssignment:
    with db.cursor(dict_rows=True, commit=True) as cur:
        cur.execute(
            """
            INSERT INTO device_assignments (assignment_id, patient_id, device_id, care_area_id, bed_label, status)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (data.assignment_id, data.patient_id, data.device_id, data.care_area_id, data.bed_label, data.status),
        )
        return DeviceAssignment(**cur.fetchone())


def update_assignment(assignment_id: str, data: DeviceAssignmentUpdate) -> DeviceAssignment | None:
    fields = data.model_dump(exclude_unset=True)
    if not fields:
        return get_assignment(assignment_id)
    set_clause = ", ".join(f"{k} = %s" for k in fields.keys())
    values = list(fields.values()) + [assignment_id]
    with db.cursor(dict_rows=True, commit=True) as cur:
        cur.execute(
            f"UPDATE device_assignments SET {set_clause} WHERE assignment_id = %s RETURNING *",
            values,
        )
        row = cur.fetchone()
        return DeviceAssignment(**row) if row else None


def delete_assignment(assignment_id: str) -> bool:
    with db.cursor(commit=True) as cur:
        cur.execute("DELETE FROM device_assignments WHERE assignment_id = %s", (assignment_id,))
        return cur.rowcount > 0
