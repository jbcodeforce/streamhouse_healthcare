-- Fact model: fct_prescription_drift
-- Compares actual patient telemetry vs doctor prescription limits
-- Note: After editing query logic, run dbt run --full-refresh
{{
    config(
        materialized='streaming_table',
        distributed_by={'columns': ['patient_id'], 'buckets': 1},
        with={
            'changelog.mode': 'append',
            'kafka.cleanup-policy': 'delete',
            'scan.bounded.mode': 'unbounded',
            'scan.startup.mode': 'earliest-offset',
            'value.format': 'avro-registry'
        }
    )
}}

SELECT
    t.event_id,
    t.patient_id,
    t.device_id,
    t.heart_rate,
    t.spo2,
    p.prescription_id,
    p.min_threshold AS target_hr_min,
    p.max_threshold AS target_hr_max,
    CASE
        WHEN t.heart_rate > p.max_threshold THEN 'HIGH_HEART_RATE'
        WHEN t.heart_rate < p.min_threshold THEN 'LOW_HEART_RATE'
        WHEN t.spo2 < 92.0 THEN 'LOW_SPO2'
        ELSE 'NORMAL'
    END AS drift_status,
    t.event_ts
FROM {{ ref('src_telemetry_events') }} AS t
JOIN {{ ref('dim_prescriptions') }} AS p
    ON t.patient_id = p.patient_id
WHERE p.target_metric = 'HEART_RATE'
  AND (t.heart_rate > p.max_threshold OR t.heart_rate < p.min_threshold OR t.spo2 < 92.0)
