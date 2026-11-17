"""REST API router for CEP Scenarios."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, HTTPException, status
from scenarios import registry, runner

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])


@router.get("", response_model=list[dict[str, Any]])
def list_scenarios() -> list[dict[str, Any]]:
    return registry.list_scenarios()


@router.post("/{scenario_id}/run", response_model=dict[str, Any])
def run_scenario(scenario_id: str) -> dict[str, Any]:
    res = runner.run_scenario(scenario_id)
    if not res.get("success"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=res.get("error", "Scenario failed"))
    return res
