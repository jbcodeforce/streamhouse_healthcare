# Confluent Cloud Infrastructure as Code (IaC)

Infrastructure for the Streamhouse Healthcare demonstration is provisioned across two independent root Terraform modules in `IaC/`:

---

## 1. Core Stack (`IaC/ccloud`)

Provisions:
- Confluent Cloud Environment (`${prefix}-env`)
- Kafka Cluster Standard (`${prefix}-kafka`, Single-Zone)
- Schema Registry Cluster & API Keys
- Four Flink Compute Pools:
  - `${prefix}-flink-pool` (`patient_monitoring` pipeline)
  - `${prefix}-alerts-flink-pool` (`clinical_alerts` pipeline)
  - `${prefix}-device-flink-pool` (`device_ops` pipeline)
  - `${prefix}-snapshot-q-pool` (dedicated ad-hoc SQL queries)
- Service Accounts and API Keys for Kafka Manager and Flink Runner
- Connect Storage Topics (`my_connect_configs`, `my_connect_offsets`, `my_connect_status`) and `agent_conversations` topic.

### Apply Commands
```bash
cd IaC/ccloud
cp terraform.tfvars.example terraform.tfvars
terraform init && terraform apply
```

---

## 2. RTCE Stack (`IaC/rtce`)

Applied **after** dbt creates the compacted upsert fact tables (`fct_patient_360`, `fct_patient_vitals_summary`).

Provisions:
- Global Service Account and Global API Key (`kind = "Global"`)
- Topic bindings (`confluent_rtce_topic`) registering `fct_patient_360` and `fct_patient_vitals_summary` with the Real-Time Context Engine for Lightning Query serving.

### Apply Commands
```bash
cd IaC/rtce
cp terraform.tfvars.example terraform.tfvars
terraform init && terraform apply
```

---

## 3. Environment Wiring

To export all Terraform coordinates into your active shell and `apps/backend/.env`:

```bash
source scripts/set_env_from_tf.sh
```
