# Flink Streaming DSP & dbt Integration

Stream processing in Streamhouse Healthcare is managed declaratively using `dbt-confluent` against Confluent Cloud Apache Flink.

---

## Data Product Compute Pool Isolation

To guarantee compute isolation and cost predictability, each data product runs on its own Flink compute pool configured in `dbt_project.yml`:

```yaml
models:
  streamhouse_healthcare:
    patient_monitoring:
      +compute_pool_id: "{{ env_var('FLINK_PATIENT_MONITORING_COMPUTE_POOL_ID') }}"
    clinical_alerts:
      +compute_pool_id: "{{ env_var('FLINK_CLINICAL_ALERTS_COMPUTE_POOL_ID') }}"
    device_ops:
      +compute_pool_id: "{{ env_var('FLINK_DEVICE_OPS_COMPUTE_POOL_ID') }}"
```

In addition, interactive ad-hoc queries run on a dedicated `${prefix}-snapshot-q-pool` so analytical queries never compete with 24/7 streaming statements.

---

## Model Pipeline Hierarchy

```
pipelines/models/
├── patient_monitoring/
│   ├── sources/        src_patients, src_devices, src_device_assignments
│   ├── dimensions/     dim_patients (LATERAL SNAPSHOT join on ref_vital_guidelines)
│   └── facts/          fct_patient_vitals_summary (upsert), fct_patient_360 (upsert / RTCE)
├── clinical_alerts/
│   ├── sources/        src_telemetry_events, src_prescriptions, src_care_areas
│   ├── dimensions/     dim_prescriptions
│   └── facts/          fct_prescription_drift, fct_vital_anomaly_streak (CEP),
│                       fct_emergency_button_routing (CEP), fct_geofence_alerts
└── device_ops/
    └── facts/          fct_device_ota_compliance, fct_device_battery_drain (CEP)
```

---

## Complex Event Processing (CEP) with MATCH_RECOGNIZE

### 1. Vital Anomaly Streak
Detects 3 consecutive abnormal vital readings (HR > 115 bpm or SpO2 < 91%) within 15 minutes:

```sql
SELECT *
FROM {{ ref('src_telemetry_events') }}
    MATCH_RECOGNIZE (
        PARTITION BY patient_id
        ORDER BY event_ts
        MEASURES
            A.event_id AS first_event_id,
            C.event_id AS trigger_event_id,
            (A.heart_rate + B.heart_rate + C.heart_rate) / 3.0 AS avg_hr_streak,
            LEAST(A.spo2, B.spo2, C.spo2) AS min_spo2_streak,
            C.event_ts AS match_ts
        ONE ROW PER MATCH
        AFTER MATCH SKIP TO NEXT ROW
        PATTERN (A B C)
        WITHIN INTERVAL '15' MINUTE
        DEFINE
            A AS (A.heart_rate > 115 OR A.spo2 < 91.0),
            B AS (B.heart_rate > 115 OR B.spo2 < 91.0),
            C AS (C.heart_rate > 115 OR C.spo2 < 91.0)
    )
```

### 2. Emergency Button Routing
Detects repeated button presses within 5 minutes:

```sql
SELECT *
FROM {{ ref('src_telemetry_events') }}
    MATCH_RECOGNIZE (
        PARTITION BY patient_id
        ORDER BY event_ts
        MEASURES
            A.event_id AS first_event_id,
            B.event_id AS trigger_event_id,
            2 AS press_count,
            B.event_ts AS match_ts
        ONE ROW PER MATCH
        AFTER MATCH SKIP TO NEXT ROW
        PATTERN (A B)
        WITHIN INTERVAL '5' MINUTE
        DEFINE
            A AS A.button_pressed = true,
            B AS B.button_pressed = true
    )
```
