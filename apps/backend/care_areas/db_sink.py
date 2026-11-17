"""PostgreSQL DAO for Care Areas."""

from __future__ import annotations

import logging
from typing import Sequence
import psycopg2

import db
from care_areas.models import CareArea, CareAreaCreate, CareAreaUpdate

logger = logging.getLogger("healthcare.care_areas.db")

_DDL = """
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS care_areas (
    care_area_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    facility_type VARCHAR(64) NOT NULL DEFAULT 'WARD',
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    radius_meters DOUBLE PRECISION NOT NULL DEFAULT 500.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_care_areas_updated_at'
    ) THEN
        CREATE TRIGGER trg_care_areas_updated_at
        BEFORE UPDATE ON care_areas
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END;
$$;
"""

_INSERT_SQL = """
INSERT INTO care_areas (care_area_id, name, facility_type, center_lat, center_lng, radius_meters)
VALUES (%s, %s, %s, %s, %s, %s)
ON CONFLICT (care_area_id) DO UPDATE SET
    name = EXCLUDED.name,
    facility_type = EXCLUDED.facility_type,
    center_lat = EXCLUDED.center_lat,
    center_lng = EXCLUDED.center_lng,
    radius_meters = EXCLUDED.radius_meters
"""


def init_db() -> None:
    db.init_schema(_DDL, cdc_table="care_areas")


def seed_from_rows(rows: Sequence[CareAreaCreate]) -> int:
    return db.seed_if_empty(
        "care_areas",
        rows,
        _INSERT_SQL,
        lambda r: (r.care_area_id, r.name, r.facility_type, r.center_lat, r.center_lng, r.radius_meters),
        label="care_areas",
    )


def list_care_areas() -> list[CareArea]:
    with db.cursor(dict_rows=True) as cur:
        cur.execute("SELECT * FROM care_areas ORDER BY name ASC")
        return [CareArea(**row) for row in cur.fetchall()]


def get_care_area(care_area_id: str) -> CareArea | None:
    with db.cursor(dict_rows=True) as cur:
        cur.execute("SELECT * FROM care_areas WHERE care_area_id = %s", (care_area_id,))
        row = cur.fetchone()
        return CareArea(**row) if row else None


def create_care_area(data: CareAreaCreate) -> CareArea:
    with db.cursor(dict_rows=True, commit=True) as cur:
        cur.execute(
            """
            INSERT INTO care_areas (care_area_id, name, facility_type, center_lat, center_lng, radius_meters)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (data.care_area_id, data.name, data.facility_type, data.center_lat, data.center_lng, data.radius_meters),
        )
        return CareArea(**cur.fetchone())


def update_care_area(care_area_id: str, data: CareAreaUpdate) -> CareArea | None:
    fields = data.model_dump(exclude_unset=True)
    if not fields:
        return get_care_area(care_area_id)
    set_clause = ", ".join(f"{k} = %s" for k in fields.keys())
    values = list(fields.values()) + [care_area_id]
    with db.cursor(dict_rows=True, commit=True) as cur:
        cur.execute(
            f"UPDATE care_areas SET {set_clause} WHERE care_area_id = %s RETURNING *",
            values,
        )
        row = cur.fetchone()
        return CareArea(**row) if row else None


def delete_care_area(care_area_id: str) -> bool:
    with db.cursor(commit=True) as cur:
        cur.execute("DELETE FROM care_areas WHERE care_area_id = %s", (care_area_id,))
        return cur.rowcount > 0
