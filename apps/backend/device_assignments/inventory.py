"""Device assignments CSV inventory reader."""

from __future__ import annotations

import csv
import os
from pathlib import Path
from device_assignments.models import DeviceAssignmentCreate

_DEFAULT_CSV = Path(__file__).parent / "data" / "device_assignments.csv"


def load(csv_path: str | Path | None = None) -> list[DeviceAssignmentCreate]:
    path = Path(csv_path or os.getenv("DEVICE_ASSIGNMENTS_CSV_PATH", _DEFAULT_CSV))
    if not path.exists():
        return []
    records = []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(
                DeviceAssignmentCreate(
                    assignment_id=row["assignment_id"].strip(),
                    patient_id=row["patient_id"].strip(),
                    device_id=row["device_id"].strip(),
                    care_area_id=row["care_area_id"].strip(),
                    bed_label=row.get("bed_label", "UNASSIGNED").strip(),
                    status=row.get("status", "ACTIVE").strip(),
                )
            )
    return records
