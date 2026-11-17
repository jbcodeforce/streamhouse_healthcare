"""Devices CSV inventory reader."""

from __future__ import annotations

import csv
import os
from pathlib import Path
from devices.models import DeviceCreate

_DEFAULT_CSV = Path(__file__).parent / "data" / "devices.csv"


def load(csv_path: str | Path | None = None) -> list[DeviceCreate]:
    path = Path(csv_path or os.getenv("DEVICES_CSV_PATH", _DEFAULT_CSV))
    if not path.exists():
        return []
    records = []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(
                DeviceCreate(
                    device_id=row["device_id"].strip(),
                    model_id=row.get("model_id", "MOD-OX-100").strip(),
                    serial_number=row["serial_number"].strip(),
                    firmware_version=row.get("firmware_version", "v1.0.0").strip(),
                    battery_pct=int(row.get("battery_pct", 100)),
                    status=row.get("status", "AVAILABLE").strip(),
                )
            )
    return records
