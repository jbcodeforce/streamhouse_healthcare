"""PostgreSQL DAO for Devices."""

from __future__ import annotations

import logging
from typing import Sequence
import db
from devices.models import Device, DeviceCreate, DeviceUpdate

logger = logging.getLogger("healthcare.devices.db")

_DDL = """
CREATE TABLE IF NOT EXISTS devices (
    device_id VARCHAR(64) PRIMARY KEY,
    model_id VARCHAR(64) NOT NULL DEFAULT 'MOD-OX-100',
    serial_number VARCHAR(128) NOT NULL,
    firmware_version VARCHAR(32) NOT NULL DEFAULT 'v1.0.0',
    battery_pct INT NOT NULL DEFAULT 100,
    status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_devices_updated_at'
    ) THEN
        CREATE TRIGGER trg_devices_updated_at
        BEFORE UPDATE ON devices
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END;
$$;
"""

_INSERT_SQL = """
INSERT INTO devices (device_id, model_id, serial_number, firmware_version, battery_pct, status)
VALUES (%s, %s, %s, %s, %s, %s)
ON CONFLICT (device_id) DO UPDATE SET
    model_id = EXCLUDED.model_id,
    serial_number = EXCLUDED.serial_number,
    firmware_version = EXCLUDED.firmware_version,
    battery_pct = EXCLUDED.battery_pct,
    status = EXCLUDED.status
"""


def init_db() -> None:
    db.init_schema(_DDL, cdc_table="devices")


def seed_from_rows(rows: Sequence[DeviceCreate]) -> int:
    return db.seed_if_empty(
        "devices",
        rows,
        _INSERT_SQL,
        lambda r: (r.device_id, r.model_id, r.serial_number, r.firmware_version, r.battery_pct, r.status),
        label="devices",
    )


def list_devices() -> list[Device]:
    with db.cursor(dict_rows=True) as cur:
        cur.execute("SELECT * FROM devices ORDER BY device_id ASC")
        return [Device(**row) for row in cur.fetchall()]


def get_device(device_id: str) -> Device | None:
    with db.cursor(dict_rows=True) as cur:
        cur.execute("SELECT * FROM devices WHERE device_id = %s", (device_id,))
        row = cur.fetchone()
        return Device(**row) if row else None


def create_device(data: DeviceCreate) -> Device:
    with db.cursor(dict_rows=True, commit=True) as cur:
        cur.execute(
            """
            INSERT INTO devices (device_id, model_id, serial_number, firmware_version, battery_pct, status)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (data.device_id, data.model_id, data.serial_number, data.firmware_version, data.battery_pct, data.status),
        )
        return Device(**cur.fetchone())


def update_device(device_id: str, data: DeviceUpdate) -> Device | None:
    fields = data.model_dump(exclude_unset=True)
    if not fields:
        return get_device(device_id)
    set_clause = ", ".join(f"{k} = %s" for k in fields.keys())
    values = list(fields.values()) + [device_id]
    with db.cursor(dict_rows=True, commit=True) as cur:
        cur.execute(
            f"UPDATE devices SET {set_clause} WHERE device_id = %s RETURNING *",
            values,
        )
        row = cur.fetchone()
        return Device(**row) if row else None


def delete_device(device_id: str) -> bool:
    with db.cursor(commit=True) as cur:
        cur.execute("DELETE FROM devices WHERE device_id = %s", (device_id,))
        return cur.rowcount > 0
