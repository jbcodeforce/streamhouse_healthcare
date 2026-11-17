"""REST API router for Care Areas."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from care_areas import service
from care_areas.models import CareArea, CareAreaCreate, CareAreaUpdate

router = APIRouter(prefix="/care-areas", tags=["Care Areas"])


@router.get("", response_model=list[CareArea])
def list_care_areas() -> list[CareArea]:
    return service.list_care_areas()


@router.get("/{care_area_id}", response_model=CareArea)
def get_care_area(care_area_id: str) -> CareArea:
    res = service.get_care_area(care_area_id)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Care area {care_area_id} not found")
    return res


@router.post("", response_model=CareArea, status_code=status.HTTP_201_CREATED)
def create_care_area(data: CareAreaCreate) -> CareArea:
    return service.create_care_area(data)


@router.put("/{care_area_id}", response_model=CareArea)
def update_care_area(care_area_id: str, data: CareAreaUpdate) -> CareArea:
    res = service.update_care_area(care_area_id, data)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Care area {care_area_id} not found")
    return res


@router.delete("/{care_area_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_care_area(care_area_id: str) -> None:
    if not service.delete_care_area(care_area_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Care area {care_area_id} not found")
