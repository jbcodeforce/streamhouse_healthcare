"""Test health endpoint and CORS headers."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_health_check(client: TestClient) -> None:
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok", "service": "streamhouse-healthcare-backend"}


def test_cors_headers(client: TestClient) -> None:
    res = client.options(
        "/api/v1/patients",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == "http://localhost:5173"
