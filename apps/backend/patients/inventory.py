"""Patients CSV inventory reader."""

from __future__ import annotations

import csv
import os
from pathlib import Path
from patients.models import PatientCreate

_DEFAULT_CSV = Path(__file__).parent / "data" / "patients.csv"


def load(csv_path: str | Path | None = None) -> list[PatientCreate]:
    path = Path(csv_path or os.getenv("PATIENTS_CSV_PATH", _DEFAULT_CSV))
    if not path.exists():
        return []
    records = []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(
                PatientCreate(
                    patient_id=row["patient_id"].strip(),
                    full_name=row["full_name"].strip(),
                    gender=row.get("gender", "U").strip(),
                    birth_date=row.get("birth_date", "1980-01-01").strip(),
                    risk_tier=row.get("risk_tier", "LOW").strip(),
                    primary_condition=row.get("primary_condition", "General Observation").strip(),
                    status=row.get("status", "ACTIVE").strip(),
                )
            )
    return records
