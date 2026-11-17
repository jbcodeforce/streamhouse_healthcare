"""Care areas CSV inventory reader."""

from __future__ import annotations

import csv
import os
from pathlib import Path
from care_areas.models import CareAreaCreate

_DEFAULT_CSV = Path(__file__).parent / "data" / "care_areas.csv"


def load(csv_path: str | Path | None = None) -> list[CareAreaCreate]:
    path = Path(csv_path or os.getenv("CARE_AREAS_CSV_PATH", _DEFAULT_CSV))
    if not path.exists():
        return []
    records = []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(
                CareAreaCreate(
                    care_area_id=row["care_area_id"].strip(),
                    name=row["name"].strip(),
                    facility_type=row["facility_type"].strip(),
                    center_lat=float(row["center_lat"]),
                    center_lng=float(row["center_lng"]),
                    radius_meters=float(row["radius_meters"]),
                )
            )
    return records
