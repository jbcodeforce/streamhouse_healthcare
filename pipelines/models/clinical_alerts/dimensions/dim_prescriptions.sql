-- Dimension model: dim_prescriptions
-- Note: After editing query logic, run dbt run --full-refresh
{{
    config(
        materialized='streaming_table',
        distributed_by={'columns': ['prescription_id'], 'buckets': 1},
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
    prescription_id,
    patient_id,
    target_metric,
    min_threshold,
    max_threshold,
    status,
    event_ts
FROM {{ ref('src_prescriptions') }}
WHERE status = 'ACTIVE'
