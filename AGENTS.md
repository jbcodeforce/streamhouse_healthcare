# AGENTS.md — Developer and Agent Guide for Streamhouse Healthcare

This document defines the conventions, guardrails, and architecture for the **Streamhouse Healthcare Demo** (`streamhouse_healthcare`). Any AI assistant or developer working on this codebase MUST follow these rules.

---

## 1. Project Purpose & Core Architecture

The demonstration illustrates a **Streamhouse** pattern for real-time patient health monitoring, clinical alerts, and medical device management:
1. **Capture (CDC)**: Operational tables in PostgreSQL (`patients`, `care_areas`, `devices`, `device_assignments`, `prescriptions`, `telemetry_events`) are captured via Debezium CDC (`cdc.public.*` topics).
2. **Transport**: Apache Kafka + Schema Registry in Confluent Cloud (Avro format).
3. **Transform**: Flink SQL managed via dbt (`dbt-confluent`), divided across three data products (`patient_monitoring`, `clinical_alerts`, `device_ops`), each isolated on its own Flink compute pool.
4. **Serve**:
   - Snapshot queries for live aggregation (`fct_patient_vitals_summary`, `fct_patient_360`).
   - Confluent Cloud Lightning / RTCE (Real-Time Context Engine) for sub-10ms point lookups.
   - RTCE AI Chat Assistant (Agno + MCP streamable-http) for natural language patient vitals and alert triage.
   - CEP (`MATCH_RECOGNIZE`) for vital anomaly streaks, emergency button escalation, and geofence departures.
5. **Govern**: Data Product catalog, statement lineage graph, and real-time CFU cost tracking.

---

## 2. Infrastructure as Code (IaC) Layout

Terraform stacks are organized into independent root modules under `IaC/`:
- `IaC/ccloud/`: Core Confluent Cloud stack (environment, Kafka cluster, Schema Registry, 4 Flink compute pools: `patient_monitoring`, `clinical_alerts`, `device_ops`, `snapshot_q`, service accounts, API keys, Debezium storage topics).
- `IaC/rtce/`: Applied **after** dbt creates fact topics. Creates Global API key and RTCE topic bindings.
- `IaC/local/`: Local development scripts for PostgreSQL 17 (with `wal_level=logical`) and Debezium container.

### IaC Rules
- Prefix all resources with `${var.prefix}-*` (default: `sh-hc`).
- Never run `terraform apply` without explicit user permission.
- Never commit `*.tfstate`, `*.tfvars`, or credentials.

---

## 3. Local CDC & Database Rules

- PostgreSQL database name: `healthcaredb`, user: `dbadmin`, publication: `healthcare_cdc_publication`.
- The FastAPI backend owns schema DDL, seed data, and publication management in `apps/backend/bootstrap.py`.
- **The backend NEVER produces directly to `cdc.public.*` Kafka topics** — Debezium is the single source of truth for CDC.
- Local containers run via Apple `container` CLI or `docker`.
- Debezium worker storage topics (`my_connect_configs`, `my_connect_offsets`, `my_connect_status`) MUST have replication factor 3 on Confluent Cloud.

---

## 4. Python Tooling & Backend Conventions

- **uv ONLY**: Always use `uv` for package management (`uv add`, `uv run`, `uv sync`). Never use `pip` directly.
- Python version: `>=3.11`.
- Backend architecture: Vertical slices under `apps/backend/` (`patients/`, `care_areas/`, `devices/`, `device_assignments/`, `prescriptions/`, `telemetry_events/`, `analytics/`, `chat/`, `scenarios/`, `data_products/`).
- Service binding: Always bind FastAPI/Uvicorn to `127.0.0.1` (never `0.0.0.0`).
- Testing: TDD with pytest (`cd apps/backend && uv run pytest`). Postgres integration tests auto-skip when `DATABASE_URL` is not set.

---

## 5. Frontend & UI Conventions

- Tech stack: React 19, Vite, TypeScript, React Router 7, `@xyflow/react` + Dagre for graph rendering, Lucide icons, Vitest.
- Layering: UI pages -> `api/<domain>.ts` -> `api/client.ts` (`request<T>()`). Pages NEVER invoke raw `fetch()`.
- API base URL defaults to `http://localhost:8000/api/v1`.

---

## 6. Pipelines (dbt -> Confluent Cloud Flink)

- dbt project root: `pipelines/`.
- Flink SQL queries are structured as `sources/` (envelope deduplication), `dimensions/`, and `facts/`.
- Fact tables requiring Lightning/RTCE serving MUST use `materialized='materialized_table'`, `changelog.mode='upsert'`, and `kafka.cleanup-policy='compact'`.
- Compute pools are defined at the product folder level in `dbt_project.yml`.
