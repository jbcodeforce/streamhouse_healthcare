"""FastAPI application entrypoint for Streamhouse Healthcare."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import bootstrap
from api.care_area_resource import router as care_areas_router
from api.patient_resource import router as patients_router
from api.device_resource import router as devices_router
from api.device_assignment_resource import router as assignments_router
from api.prescription_resource import router as prescriptions_router
from api.telemetry_event_resource import router as telemetry_router
from api.analytics_resource import router as analytics_router
from api.chat_resource import router as chat_router
from api.scenario_resource import router as scenarios_router
from api.data_product_resource import router as data_products_router
from config import get_settings
from db import close_connection_pool

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("healthcare.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Starting Streamhouse Healthcare Backend...")
    settings = get_settings()
    settings.log_summary()

    try:
        bootstrap.init_and_seed()
    except Exception as e:
        logger.warning("Database bootstrap skipped or failed: %s", e)

    yield

    logger.info("Shutting down Streamhouse Healthcare Backend...")
    close_connection_pool()


app = FastAPI(
    title="Streamhouse Healthcare API",
    description="Real-time Patient Monitoring, Clinical Alerting, and Medical Device Operations API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(care_areas_router, prefix="/api/v1")
app.include_router(patients_router, prefix="/api/v1")
app.include_router(devices_router, prefix="/api/v1")
app.include_router(assignments_router, prefix="/api/v1")
app.include_router(prescriptions_router, prefix="/api/v1")
app.include_router(telemetry_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(scenarios_router, prefix="/api/v1")
app.include_router(data_products_router, prefix="/api/v1")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "streamhouse-healthcare-backend"}
