"""Bootstrap database schema, logical replication publication, and initial seed data."""

from __future__ import annotations

import logging
from care_areas import db_sink as care_areas_sink, inventory as care_areas_inv
from patients import db_sink as patients_sink, inventory as patients_inv
from devices import db_sink as devices_sink, inventory as devices_inv
from device_assignments import db_sink as assignments_sink, inventory as assignments_inv
from prescriptions import db_sink as prescriptions_sink, inventory as prescriptions_inv
from telemetry_events import db_sink as telemetry_sink, inventory as telemetry_inv

logger = logging.getLogger("healthcare.bootstrap")


def init_and_seed() -> dict[str, int]:
    """Execute schema DDL and load seed records in strict Foreign Key dependency order."""
    logger.info("Starting healthcare database bootstrap...")

    # 1. Care Areas (independent)
    care_areas_sink.init_db()
    c1 = care_areas_sink.seed_from_rows(care_areas_inv.load())

    # 2. Patients (independent)
    patients_sink.init_db()
    c2 = patients_sink.seed_from_rows(patients_inv.load())

    # 3. Devices (independent)
    devices_sink.init_db()
    c3 = devices_sink.seed_from_rows(devices_inv.load())

    # 4. Device Assignments (refs patients, devices, care_areas)
    assignments_sink.init_db()
    c4 = assignments_sink.seed_from_rows(assignments_inv.load())

    # 5. Prescriptions (refs patients)
    prescriptions_sink.init_db()
    c5 = prescriptions_sink.seed_from_rows(prescriptions_inv.load())

    # 6. Telemetry Events (refs devices, patients)
    telemetry_sink.init_db()
    c6 = telemetry_sink.seed_from_rows(telemetry_inv.load())

    results = {
        "care_areas_seeded": c1,
        "patients_seeded": c2,
        "devices_seeded": c3,
        "device_assignments_seeded": c4,
        "prescriptions_seeded": c5,
        "telemetry_events_seeded": c6,
    }
    logger.info("Database bootstrap finished: %s", results)
    return results


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_and_seed()
