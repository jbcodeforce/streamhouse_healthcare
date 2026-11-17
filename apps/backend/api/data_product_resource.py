"""REST API router for Data Products and Statement Lineage."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, HTTPException, status
from data_products import service

router = APIRouter(prefix="/data-products", tags=["Data Products"])


@router.get("", response_model=list[dict[str, Any]])
def list_products() -> list[dict[str, Any]]:
    return service.list_data_products()


@router.get("/billing/costs", response_model=list[dict[str, Any]])
def get_billing() -> list[dict[str, Any]]:
    return service.get_billing_costs()


@router.get("/{product_id}", response_model=dict[str, Any])
def get_product(product_id: str) -> dict[str, Any]:
    res = service.get_data_product(product_id)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Data product {product_id} not found")
    return res
