-- Fact model: fct_patient_360
-- Golden record for Patient 360 served via Lightning / RTCE and Chat Assistant
-- Note: After editing query logic, run dbt run --full-refresh
{{
    config(
        materialized='materialized_table',
        distributed_by={'columns': ['patient_id'], 'buckets': 1},
        with={
            'changelog.mode': 'upsert',
            'connector': 'confluent',
            'kafka.cleanup-policy': 'compact',
            'value.format': 'avro-registry'
        }
    )
}}

SELECT
    p.patient_id,
    p.full_name,
    p.gender,
    p.birth_date,
    p.risk_tier,
    p.primary_condition,
    p.status AS patient_status,
    coalesce(v.total_telemetry_events, 0) AS total_telemetry_events,
    coalesce(v.avg_heart_rate, 75.0) AS avg_heart_rate,
    coalesce(v.avg_spo2, 98.0) AS avg_spo2,
    v.last_telemetry_ts,
    p.event_ts AS profile_updated_ts
FROM {{ ref('dim_patients') }} AS p
LEFT JOIN {{ ref('fct_patient_vitals_summary') }} AS v
    ON p.patient_id = v.patient_id
