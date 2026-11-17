-- Fact model: fct_patient_vitals_summary
-- Materialized table (upsert, compacted) for low-latency RTCE and snapshot queries
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
    patient_id,
    COUNT(*) AS total_telemetry_events,
    CAST(AVG(heart_rate) AS DOUBLE) AS avg_heart_rate,
    MIN(heart_rate) AS min_heart_rate,
    MAX(heart_rate) AS max_heart_rate,
    CAST(AVG(spo2) AS DOUBLE) AS avg_spo2,
    MIN(spo2) AS min_spo2,
    MAX(spo2) AS max_spo2,
    MAX(event_ts) AS last_telemetry_ts
FROM {{ ref('src_telemetry_events') }}
GROUP BY patient_id
