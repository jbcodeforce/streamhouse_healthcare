# Streamhouse Healthcare Demonstration

A demonstration of real-time patient health monitoring, clinical alerting, and medical device operations built on the **Streamhouse** architecture:
**Operational PostgreSQL (CDC) -> Apache Kafka & Schema Registry -> Apache Flink (via dbt) -> Serving (Snapshot queries, Lightning / RTCE, AI Assistant, CEP) -> Governance & Lineage.**

---

## Architecture Overview

```mermaid
flowchart LR
    subgraph Operational ["Operational Store"]
        PG[("PostgreSQL 17\n(healthcaredb)")]
        DEB["Debezium CDC\n(pgoutput)"]
        PG --> DEB
    end

    subgraph ConfluentCloud ["Confluent Cloud"]
        TOPICS[("Kafka Topics\ncdc.public.*")]
        DEB --> TOPICS

        subgraph FlinkPools ["Isolated Flink Compute Pools"]
            P1["Patient Monitoring Pool\n(dim_patients, fct_patient_360)"]
            P2["Clinical Alerts Pool\n(fct_prescription_drift, fct_button_routing)"]
            P3["Device Ops Pool\n(fct_device_ota, fct_battery_drain)"]
            P4["Snapshot Query Pool\n(Ad-hoc SQL)"]
        end

        TOPICS --> P1
        TOPICS --> P2
        TOPICS --> P3
    end

    subgraph Serving ["Serving & Application Layer"]
        APP["FastAPI Backend\n(127.0.0.1:8000)"]
        UI["React 19 Frontend\n(127.0.0.1:5173)"]
        RTCE["Lightning / RTCE\n(Sub-10ms lookup)"]
        CHAT["AI Clinical Assistant\n(Agno + MCP)"]

        P1 --> RTCE
        P2 --> RTCE
        P4 --> APP
        RTCE --> APP
        RTCE --> CHAT
        APP --> UI
        CHAT --> UI
    end
```

---

## Quickstart

### Prerequisites
- Python 3.11+ and `uv`
- Node.js 20+ and `npm`
- Terraform 1.5+
- Apple `container` CLI or `docker`

### 1. Set up Infrastructure
```bash
cd IaC/ccloud
cp terraform.tfvars.example terraform.tfvars
# Fill in your Confluent Cloud credentials
terraform init && terraform apply
```

### 2. Configure Environment
```bash
source scripts/set_env_from_tf.sh
```

### 3. Start Local Database & CDC
```bash
./IaC/local/start_local_pg_server.sh --seed
./IaC/local/start_debezium.sh
```

### 4. Deploy Flink Data Products
```bash
cd pipelines
uv sync
dbt seed
dbt run --select +patient_monitoring.facts
dbt run --select +clinical_alerts.facts
dbt run --select +device_ops.facts
```

### 5. Enable RTCE & Start Web Application
```bash
cd IaC/rtce
terraform init && terraform apply
cd ../..
./scripts/run_dev.sh
```

---

## Documentation
Full documentation and numbered scenario walk-throughs are available in `docs/`:
- `docs/index.md` — Overview & architecture
- `docs/demo_brief.md` — Complete domain brief
- `docs/web_app_design.md` — Backend and frontend design
- `docs/flink_deployment.md` — Flink SQL models and dbt integration
- `docs/local_cdc.md` — PostgreSQL and Debezium CDC setup
- `docs/demo_script.md` — Step-by-step presentation script
