"""PostgreSQL DAO for Prescriptions."""

from __future__ import annotations

import logging
from typing import Sequence
import db
from prescriptions.models import Prescription, PrescriptionCreate, PrescriptionUpdate

logger = logging.getLogger("healthcare.prescriptions.db")

_DDL = """
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    target_metric VARCHAR(64) NOT NULL DEFAULT 'HEART_RATE',
    min_threshold DOUBLE PRECISION NOT NULL DEFAULT 60.0,
    max_threshold DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prescriptions_updated_at'
    ) THEN
        CREATE TRIGGER trg_prescriptions_updated_at
        BEFORE UPDATE ON prescriptions
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END;
$$;
"""

_INSERT_SQL = """
INSERT INTO prescriptions (prescription_id, patient_id, target_metric, min_threshold, max_threshold, status)
VALUES (%s, %s, %s, %s, %s, %s)
ON CONFLICT (prescription_id) DO UPDATE SET
    patient_id = EXCLUDED.patient_id,
    target_metric = EXCLUDED.target_metric,
    min_threshold = EXCLUDED.min_threshold,
    max_threshold = EXCLUDED.max_threshold,
    status = EXCLUDED.status
"""


def init_db() -> None:
    db.init_schema(_DDL, cdc_table="prescriptions")


def seed_from_rows(rows: Sequence[PrescriptionCreate]) -> int:
    return db.seed_if_empty(
        "prescriptions",
        rows,
        _INSERT_SQL,
        lambda r: (r.prescription_id, r.patient_id, r.target_metric, r.min_threshold, r.max_threshold, r.status),
        label="prescriptions",
    )


def list_prescriptions(patient_id: str | None = None) -> list[Prescription]:
    with db.cursor(dict_rows=True) as cur:
        if patient_id:
            cur.execute("SELECT * FROM prescriptions WHERE patient_id = %s ORDER BY created_at DESC", (patient_id,))
        else:
            cur.execute("SELECT * FROM prescriptions ORDER BY created_at DESC")
        return [Prescription(**row) for row in cur.fetchall()]


def get_prescription(prescription_id: str) -> Prescription | None:
    with db.cursor(dict_rows=True) as cur:
        cur.execute("SELECT * FROM prescriptions WHERE prescription_id = %s", (prescription_id,))
        row = cur.fetchone()
        return Prescription(**row) if row else None


def create_prescription(data: PrescriptionCreate) -> Prescription:
    with db.cursor(dict_rows=True, commit=True) as cur:
        cur.execute(
            """
            INSERT INTO prescriptions (prescription_id, patient_id, target_metric, min_threshold, max_threshold, status)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (data.prescription_id, data.patient_id, data.target_metric, data.min_threshold, data.max_threshold, data.status),
        )
        return Prescription(**cur.fetchone())


def update_prescription(prescription_id: str, data: PrescriptionUpdate) -> Prescription | None:
    fields = data.model_dump(exclude_unset=True)
    if not fields:
        return get_prescription(prescription_id)
    set_clause = ", ".join(f"{k} = %s" for k in fields.keys())
    values = list(fields.values()) + [prescription_id]
    with db.cursor(dict_rows=True, commit=True) as cur:
        cur.execute(
            f"UPDATE prescriptions SET {set_clause} WHERE prescription_id = %s RETURNING *",
            values,
        )
        row = cur.fetchone()
        return Prescription(**row) if row else None


def delete_prescription(prescription_id: str) -> bool:
    with db.cursor(commit=True) as cur:
        cur.execute("DELETE FROM prescriptions WHERE prescription_id = %s", (prescription_id,))
        return cur.rowcount > 0
