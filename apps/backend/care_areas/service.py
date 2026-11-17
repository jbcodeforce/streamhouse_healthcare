"""Care Area service layer."""

from __future__ import annotations

from care_areas import db_sink
from care_areas.models import CareArea, CareAreaCreate, CareAreaUpdate


def list_care_areas() -> list[CareArea]:
    return db_sink.list_care_areas()


def get_care_area(care_area_id: str) -> CareArea | None:
    return db_sink.get_care_area(care_area_id)


def create_care_area(data: CareAreaCreate) -> CareArea:
    return db_sink.create_care_area(data)


def update_care_area(care_area_id: str, data: CareAreaUpdate) -> CareArea | None:
    return db_sink.update_care_area(care_area_id, data)


def delete_care_area(care_area_id: str) -> bool:
    return db_sink.delete_care_area(care_area_id)
