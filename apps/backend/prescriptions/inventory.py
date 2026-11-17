"""Prescriptions CSV inventory reader."""

from __future__ import annotations

import csv
import os
from pathlib import Path
from prescriptions.models import PrescriptionCreate

_DEFAULT_CSV = Path(__file__).parent / "data" / "prescriptions.csv"


def load(csv_path: str | Path | None = None) -> list[PrescriptionCreate]:
    path = Path(csv_path or os.getenv("PRESCRIPTIONS_CSV_PATH", _DEFAULT_CSV))
    if not path.exists():
        return []
    records = []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(
                PrescriptionCreate(
                    prescription_id=row["prescription_id"].strip(),
                    patient_id=row["patient_id"].strip(),
                    target_metric=row.get("target_metric", "HEART_RATE").strip(),
                    min_threshold=float(row.get("min_threshold", 60.0)),
                    max_threshold=float(row.get("max_threshold", 100.0)),
                    status=row.get("status", "ACTIVE").strip(),
                )
            )
    return records
