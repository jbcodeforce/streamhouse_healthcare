"""Device service layer."""

from __future__ import annotations

from devices import db_sink
from devices.models import Device, DeviceCreate, DeviceUpdate


def list_devices() -> list[Device]:
    return db_sink.list_devices()


def get_device(device_id: str) -> Device | None:
    return db_sink.get_device(device_id)


def create_device(data: DeviceCreate) -> Device:
    return db_sink.create_device(data)


def update_device(device_id: str, data: DeviceUpdate) -> Device | None:
    return db_sink.update_device(device_id, data)


def delete_device(device_id: str) -> bool:
    return db_sink.delete_device(device_id)
