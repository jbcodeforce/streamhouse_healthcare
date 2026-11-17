"""Pytest configuration and test fixtures."""

from __future__ import annotations

import os
import shutil
from pathlib import Path
from typing import Generator
import pytest
from fastapi.testclient import TestClient

from main import app

_BACKEND_DIR = Path(__file__).parent.parent


@pytest.fixture(scope="session", autouse=True)
def isolate_seed_csvs(tmp_path_factory: pytest.TempPathFactory) -> None:
    """Isolate seed CSVs to a temporary directory so tests never mutate repo data."""
    tmp_data = tmp_path_factory.mktemp("data")

    for entity in ("care_areas", "patients", "devices", "device_assignments", "prescriptions", "telemetry_events"):
        src = _BACKEND_DIR / entity / "data" / f"{entity}.csv"
        if src.exists():
            dst = tmp_data / f"{entity}.csv"
            shutil.copy(src, dst)
            os.environ[f"{entity.upper()}_CSV_PATH"] = str(dst)


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c
