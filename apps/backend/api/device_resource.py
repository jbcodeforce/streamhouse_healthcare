"""REST API router for Devices."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from devices import service
from devices.models import Device, DeviceCreate, DeviceUpdate

router = APIRouter(prefix="/devices", tags=["Devices"])


@router.get("", response_model=list[Device])
def list_devices() -> list[Device]:
    return service.list_devices()


@router.get("/{device_id}", response_model=Device)
def get_device(device_id: str) -> Device:
    res = service.get_device(device_id)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Device {device_id} not found")
    return res


@router.post("", response_model=Device, status_code=status.HTTP_201_CREATED)
def create_device(data: DeviceCreate) -> Device:
    return service.create_device(data)


@router.put("/{device_id}", response_model=Device)
def update_device(device_id: str, data: DeviceUpdate) -> Device:
    res = service.update_device(device_id, data)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Device {device_id} not found")
    return res


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_device(device_id: str) -> None:
    if not service.delete_device(device_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Device {device_id} not found")
