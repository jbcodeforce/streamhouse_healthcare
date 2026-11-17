"""PostgreSQL DAO for Patients."""

from __future__ import annotations

import logging
from typing import Sequence
import db
from patients.models import Patient, PatientCreate, PatientUpdate

logger = logging.getLogger("healthcare.patients.db")

_DDL = """
CREATE TABLE IF NOT EXISTS patients (
    patient_id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(16) NOT NULL DEFAULT 'U',
    birth_date VARCHAR(32) NOT NULL DEFAULT '1980-01-01',
    risk_tier VARCHAR(32) NOT NULL DEFAULT 'LOW',
    primary_condition VARCHAR(255) NOT NULL DEFAULT 'General Observation',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_patients_updated_at'
    ) THEN
        CREATE TRIGGER trg_patients_updated_at
        BEFORE UPDATE ON patients
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END;
$$;
"""

_INSERT_SQL = """
INSERT INTO patients (patient_id, full_name, gender, birth_date, risk_tier, primary_condition, status)
VALUES (%s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (patient_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    gender = EXCLUDED.gender,
    birth_date = EXCLUDED.birth_date,
    risk_tier = EXCLUDED.risk_tier,
    primary_condition = EXCLUDED.primary_condition,
    status = EXCLUDED.status
"""


def init_db() -> None:
    db.init_schema(_DDL, cdc_table="patients")


def seed_from_rows(rows: Sequence[PatientCreate]) -> int:
    return db.seed_if_empty(
        "patients",
        rows,
        _INSERT_SQL,
        lambda r: (r.patient_id, r.full_name, r.gender, r.birth_date, r.risk_tier, r.primary_condition, r.status),
        label="patients",
    )


def list_patients() -> list[Patient]:
    with db.cursor(dict_rows=True) as cur:
        cur.execute("SELECT * FROM patients ORDER BY patient_id ASC")
        return [Patient(**row) for row in cur.fetchall()]


def get_patient(patient_id: str) -> Patient | None:
    with db.cursor(dict_rows=True) as cur:
        cur.execute("SELECT * FROM patients WHERE patient_id = %s", (patient_id,))
        row = cur.fetchone()
        return Patient(**row) if row else None


def create_patient(data: PatientCreate) -> Patient:
    with db.cursor(dict_rows=True, commit=True) as cur:
        cur.execute(
            """
            INSERT INTO patients (patient_id, full_name, gender, birth_date, risk_tier, primary_condition, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (data.patient_id, data.full_name, data.gender, data.birth_date, data.risk_tier, data.primary_condition, data.status),
        )
        return Patient(**cur.fetchone())


def update_patient(patient_id: str, data: PatientUpdate) -> Patient | None:
    fields = data.model_dump(exclude_unset=True)
    if not fields:
        return get_patient(patient_id)
    set_clause = ", ".join(f"{k} = %s" for k in fields.keys())
    values = list(fields.values()) + [patient_id]
    with db.cursor(dict_rows=True, commit=True) as cur:
        cur.execute(
            f"UPDATE patients SET {set_clause} WHERE patient_id = %s RETURNING *",
            values,
        )
        row = cur.fetchone()
        return Patient(**row) if row else None


def delete_patient(patient_id: str) -> bool:
    with db.cursor(commit=True) as cur:
        cur.execute("DELETE FROM patients WHERE patient_id = %s", (patient_id,))
        return cur.rowcount > 0
