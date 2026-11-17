# Demonstration Presentation Script

This script provides an ordered, step-by-step walk-through for presenting the Streamhouse Healthcare demonstration.

---

## Scenario 1: Operational Ingestion & Zero-Latency Synchronization

1. **Open the Web UI** at `http://127.0.0.1:5173/`.
2. Navigate to **Patients** (`/patients`).
   - Notice seeded patient records: `P001` (Alice Smith, High Risk), `P002` (Bob Jones, Medium Risk), `P004` (Lindsay Lee, Critical Cardiac ICU).
3. Click **New Patient** (`/patients/new`).
   - Enter: ID `P006`, Name `David Clark`, Risk Tier `HIGH`, Condition `Post-Op Valve Replacement`.
   - Click **Create Patient**.
4. **Explain**:
   - The record was written to operational PostgreSQL.
   - Debezium CDC instantly streamed the row change into Kafka topic `cdc.public.patients`.
   - Flink streaming model `src_patients` &rarr; `dim_patients` enriched the record in real-time.

---

## Scenario 2: Lightning (RTCE) vs. Snapshot Query Benchmark

1. Navigate to **Analytics & Lightning** (`/analytics`).
2. In the **Patient 360 Point Lookup Latency Benchmark** box:
   - Enter Patient ID: `P001`.
   - Click **Execute Benchmark**.
3. **Observe**:
   - **Lightning (RTCE) Serving**: `~8.4 ms` (Sub-10ms key-value point lookup).
   - **Flink Snapshot Query**: `~4,820 ms` (Ad-hoc SQL query spinning up a Flink statement).
   - **Speedup Factor**: **~570x faster** on Lightning serving.
4. **Explain**:
   - For interactive clinician dashboards and mobile point lookups, waiting 5 seconds for a SQL scan is unacceptable. Lightning allows direct sub-10ms retrieval on compacted Streamhouse golden records.

---

## Scenario 3: Complex Event Processing (CEP) Alerts

1. Navigate to **CEP Scenarios** (`/cep`).
2. Locate the **Vital Anomaly Streak** card:
   - Read the pattern explanation: Detects 3 consecutive abnormal vital events (HR > 115 bpm or SpO2 < 91%) within 15 minutes for the same patient.
   - Click **Trigger CEP Scenario**.
3. **Observe**:
   - 4 events are injected into PostgreSQL (3 high HR events for `P001` and 1 negative control for `P002`).
   - The green success notification confirms the pattern match fired in `fct_vital_anomaly_streak`.
4. Trigger the **Emergency Button Escalation** scenario for `P004`.
   - Notice rapid escalation routing to the cardiac crash cart team.

---

## Scenario 4: Natural Language AI Clinical Assistant

1. Navigate to **AI Clinical Assistant** (`/chat`).
2. Click the quick prompt pill: `"Status for P001 Alice Smith"`.
3. **Observe**:
   - The assistant answers immediately with Patient 360 demographics, current vital readings, assigned ward/bed, and active prescription compliance.
4. Ask: `"Are there any active clinical alerts or emergency button presses?"`
   - The assistant analyzes real-time alert streams and reports active triage status with zero hallucination.

---

## Scenario 5: Data Products & Statement Lineage Governance

1. Navigate to **Data Products & Lineage** (`/data-products`).
2. Review the **Compute Pool Governance & Monthly Cost** breakdown across the 4 isolated Flink compute pools.
3. Click **View Statement Lineage Graph** on **Patient Monitoring**.
4. **Observe**:
   - Live visual DAG showing CDC source topics feeding `src_*` models, `dim_patients`, and materialized tables `fct_patient_vitals_summary` and `fct_patient_360`.
   - Click on any statement node to inspect the deployed Flink SQL definition.
