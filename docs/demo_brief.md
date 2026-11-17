# Streamhouse Healthcare Demonstration Brief

## 1. Domain and User Story

**User Story:**
"As a healthcare clinician, hospital administrator, or clinical engineer, I want changes in patient vital signs, device assignments, and medical prescriptions captured at the operational source (PostgreSQL database & IoT telemetry) and synchronized instantly across analytical, alerting, and operational systems without stale batch copies, so that clinical staff can track patient vitals in real-time, detect prescription drift, triage emergency alerts immediately, and query patient status via low-latency point lookups or natural language AI chat."

---

## 2. Operational Entities & Database Schema

PostgreSQL 17 Database: `healthcaredb`  
Publication: `healthcare_cdc_publication`  
CDC Topics: `cdc.public.<entity>`

### Entity Relationships & Foreign Key Order
1. **`care_areas`**: Hospital zones, wards, and geofence perimeters.
2. **`patients`**: Patient demographics, primary care info, and status.
3. **`devices`**: Medical IoT monitoring devices (pulse oximeters, smart beds, ECG monitors).
4. **`device_assignments`**: Active mapping between patient, device, and care area.
5. **`prescriptions`**: Doctor's target vital metrics (target heart rate, SpO2, systolic/diastolic thresholds).
6. **`telemetry_events`**: High-frequency operational telemetry and button alert presses.

---

## 3. Data Products (Flink SQL via dbt)

Each data product runs in an isolated Confluent Cloud Flink compute pool:

### Product A: `patient_monitoring` (Pool: `sh-hc-flink-pool`)
- `src_patients`, `src_devices`, `src_device_assignments`
- `dim_patients`: Enriched patient dimensions with active device and room assignments.
- `fct_patient_vitals_summary`: Windowed and rolling vital statistics (mean HR, min SpO2).
- `fct_patient_360`: Golden record of patient demographics, current vital readings, and active care team. (Materialized table, upsert, compacted -> served via Lightning/RTCE).

### Product B: `clinical_alerts` (Pool: `sh-hc-alerts-flink-pool`)
- `src_telemetry_events`, `src_prescriptions`
- `dim_prescriptions`: Active clinical guidelines and safety thresholds.
- `fct_prescription_drift`: Real-time comparison of doctor prescription target vs. actual device telemetry.
- `fct_vital_anomaly_streak` (CEP): `MATCH_RECOGNIZE` detecting 3 consecutive abnormal vital readings.
- `fct_emergency_button_routing` (CEP): `MATCH_RECOGNIZE` detecting urgent button presses escalated within 5 minutes.
- `fct_geofence_alerts`: Detection of patient device reporting coordinates outside assigned care area.

### Product C: `device_ops` (Pool: `sh-hc-device-flink-pool`)
- `src_devices`, `src_telemetry_events`
- `fct_device_ota_compliance`: Assessment of device firmware and eligibility for Over-The-Air (OTA) updates.
- `fct_device_battery_drain` (CEP): Detection of rapid battery drain anomalies.

---

## 4. Serving Capabilities

1. **Snapshot Queries**: Ad-hoc analytical queries executed via Flink SQL snapshot pool against `fct_patient_vitals_summary`.
2. **Lightning / RTCE**: Direct sub-10ms key-value point lookup on `fct_patient_360` by `patient_id`.
3. **RTCE AI Chat Assistant**: Agno agent connected to RTCE MCP server allowing clinicians to ask "What is patient Alice Smith's current vitals and risk status?".
4. **CEP Scenarios**: Interactive trigger scripts in the UI that inject telemetry sequences guaranteed to match `fct_vital_anomaly_streak`, `fct_emergency_button_routing`, and `fct_geofence_alerts`.
5. **Statement Lineage & Cost**: Live visual DAG of Flink streaming jobs with message throughput and compute pool CFU costs.

---

## 5. Deployment Architecture

- **Hybrid Path**: Local PostgreSQL 17 + Local Debezium Container -> Confluent Cloud Kafka (SASL_SSL) & Flink SQL.
- **Terraform Stacks**:
  - `IaC/ccloud`: Environment, Kafka Cluster, Schema Registry, 4 Flink compute pools, Service Accounts, API keys.
  - `IaC/rtce`: RTCE Global API Key and topic bindings.
  - `IaC/local`: Container automation for Postgres and Debezium.
